import React, { Component } from "react";
import AuthService from "../services/auth.service";
import DocumentService from "../services/document.service";
import AnnotationService from "../services/annotation.service";
import CocoonService from "../services/cocoon.service";
import RecordingService from "../services/recording.service";
import ImageService from "../services/image.service";
import TitleService from "../services/title.service";
import ContributorService from "../services/contributor.service";
import { Translate } from 'react-translated';
import { withRouter } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import ImportIcon from '@material-ui/icons/CloudDownload';
import OpenIcon from '@material-ui/icons/CloudDownload';
import Alert from '@material-ui/lab/Alert';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';

class DocumentImport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: AuthService.getCurrentUser(),
      currentUserDocuments:[],
      oaiPrimary:null,
      oaiSecondary:null,
      documentFound:false,
      loading:false,
      documentId:null,
      userFeedback:[],
      oaiPrimaryData:null,
      oaiSecondaryData:null,
      createdDocumentId:0,
      progress:0
    };
  }

  getUrlParameter (sVar) {
    return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  handleChange = (e) => {
    this.setState({
      [e.target.id] : e.target.value
    });
    
  }

  checkImport = () => {

  }

  importDocument = (oaiPrimary,oaiSecondary) => {

    var oaiPrimaryData = null;
    var oaiSecondaryData = null;
    var createdDocumentData = null;

    var importStatus = 0;


    this.setState({
      userFeedback:[{step:"Import",status:"info",message:"Process started, please wait..."}],
      loading:true
    });

    CocoonService.getOai(oaiPrimary,"primary").then(
          responseGetOaiPrimary => {
            if(responseGetOaiPrimary.data.subject === null){
              //OAI not valid

              this.setState({
                userFeedback:[...this.state.userFeedback,{step:"Primary OAI check",status:"error",message:"The primary OAI doesn't exist. End of the import process."}],                loading:false,
                oaiPrimaryData:responseGetOaiPrimary.data
              });

            }else{
              //OAI valid, get the Secondary 
              oaiPrimaryData = responseGetOaiPrimary.data;
              CocoonService.getOai(oaiSecondary,"secondary").then(
                  responseGetOaiSecondary => {
                    if(responseGetOaiSecondary.data === null){
                      //OAI not valid
                      this.setState({
                        userFeedback:[...this.state.userFeedback,{step:"Secondary OAI check",status:"error",message:"The secondary OAI doesn't exist. End of the import process."}]
                      });

                    }else{

                      //OAI valid
                      oaiSecondaryData = responseGetOaiSecondary.data;

                      this.setState({
                        userFeedback:[...this.state.userFeedback,{step:"Document creation",status:"info",message:"In progress..."}],
                        loading:true,
                        expectedDocumentCreation:1,
                        actualDocumentCreation:0
                      });

                      ////Progression feedback
                      var that = this;

                      function increaseProgress(percentUnit){
                        that.setState({
                          progress:(that.state.progress + percentUnit)>100 ? 100 : (that.state.progress + percentUnit)
                        });
                      }
                      //Ratio observé sur 3 imports :
                      // - wordlist crdo-MTQ_TUPHONG_VOC.xml : 1825 W, 1480 Ko, 480 secondes
                      // - wordlist crdo-TOU_VOC1.xml : 367 W, 303 Ko, 100 secondes
                      // - text crdo-TWH_T19.xml : 13 S et 154 W, size 75735, 60 sec en DEV, 30 secondes
                      var ratio = ((500/1480)+(100/303)+(50/70))/3;

                      var estimatedDelay = ratio * responseGetOaiSecondary.data.size / 1000;
                      var percentUnit = 100 / estimatedDelay;

                      setInterval(increaseProgress,1000, percentUnit);
                  ////////////////////////////////////////////////////

                      DocumentService.create(oaiPrimaryData.subject[0].code + " / " + oaiPrimaryData.subject[0].name,oaiSecondaryData.type,oaiPrimary,oaiSecondary).then(
                        responseDocumentCreate => {

                          this.setState(state => ({
                            userFeedback: state.userFeedback.map(item => {
                                if (item.step === 'Document creation') {
                                  console.log(item);
                                    return {
                                        ...item,
                                        status:"success",message:"Document successfully created."
                                    }
                                }
                                return item
                            }),
                            actualDocumentCreation:1,
                            documentId:responseDocumentCreate.data.id
                          }));

                          createdDocumentData = responseDocumentCreate.data;

                          this.setState({
                            userFeedback:[...this.state.userFeedback,{step:"Titles",status:"info",message:"Importing..."}],
                            loading:true,
                          });

                          var expectedTitlesCreation = Object.keys(oaiPrimaryData.title).length;
                          var actualTitlesCreation = 0;

                          //0.1 Titres
                            for (const [key, value] of Object.entries(oaiPrimaryData.title)) {
                              console.log(`${key}: ${value}`,createdDocumentData);
                              var dataTitle = {
                                lang:`${key}`,
                                title:`${value}`,
                                document_id:createdDocumentData.id
                              };

                              TitleService.create(dataTitle).then(
                              (responseTitleCreate) => {

                                  actualTitlesCreation++;
                                  console.log(expectedTitlesCreation,actualTitlesCreation);
                                  if(expectedTitlesCreation === actualTitlesCreation){
                                      this.setState(state => ({
                                        userFeedback: state.userFeedback.map(item => {
                                            if (item.step === 'Titles') {
                                              console.log(item);
                                                return {
                                                    ...item,
                                                    status:"success",message:expectedTitlesCreation+" item(s) successfully imported."
                                                }
                                            }
                                            return item
                                        }),
                                      }));
                                    }

                                },
                                errorTitleCreate => {

                                });
                            }

                          //
                          //0.2 Contributors

                          this.setState({
                            userFeedback:[...this.state.userFeedback,{step:"Contributors",status:"info",message:"Importing..."}],
                            loading:true
                          });

                          var expectedContributorsCreation = Object.keys(oaiPrimaryData.contributors).length;
                          var actualContributorsCreation = 0;

                            for (const [key, value] of Object.entries(oaiPrimaryData.contributors)) {
                              console.log(`${key}: ${value}`);

                              if(value.length > 0) value.forEach((c)=>{
                                var name = c.name.split(',');

                                var dataContributor = {
                                  type:`${key}`,
                                  firstName:name[1] || '',
                                  lastName:name[0] || '',
                                  document_id:createdDocumentData.id
                                };

                                ContributorService.create(dataContributor).then(
                                (responseContributorCreate) => {
                                    actualContributorsCreation++;

                                    if(expectedContributorsCreation === actualContributorsCreation){
                                        this.setState(state => ({
                                          userFeedback: state.userFeedback.map(item => {
                                              if (item.step === 'Contributors') {
                                                console.log(item);
                                                  return {
                                                      ...item,
                                                      status:"success",message:expectedContributorsCreation+" item(s) successfully imported."
                                                  }
                                              }
                                              return item
                                          }),
                                        }));
                                      }
                                  },
                                  errorContributorCreate => {
                                    console.log(errorContributorCreate);
                                  });

                              });


                            }
                          //

                            
                          
                          //1. on crée les ressources liées au document
                          //1.1 Enregistrement
                          this.setState({
                            userFeedback:[...this.state.userFeedback,{step:"Recording",status:"info",message:"Importing..."}],
                            loading:true
                          });

                          RecordingService.create(null, (oaiPrimaryData.audio !== null)?"AUDIO":"VIDEO",oaiPrimaryData.audio, responseDocumentCreate.data.id,oaiPrimaryData.audio).then(
                              responseRecordingCreate => {

                                  this.setState(state => ({
                                    userFeedback: state.userFeedback.map(item => {
                                        if (item.step === 'Recording') {
                                          console.log(item);
                                            return {
                                                ...item,
                                                status:"success",message:"successfully imported."
                                            }
                                        }
                                        return item
                                    }),
                                  }));
                                },
                                errorRecordingCreate => {
                                  if(errorRecordingCreate.responseRecordingCreate.status===401) this.props.history.push('/login');
                                  console.log(errorRecordingCreate.responseRecordingCreate);
                                  const resMessage =
                                    (errorRecordingCreate.responseRecordingCreate &&
                                      errorRecordingCreate.responseRecordingCreate.data &&
                                      errorRecordingCreate.responseRecordingCreate.data.message) ||
                                    errorRecordingCreate.message ||
                                    errorRecordingCreate.toString();

                                  this.setState(state => ({
                                    userFeedback: state.userFeedback.map(item => {
                                        if (item.step === 'Recording') {
                                          console.log(item);
                                            return {
                                                ...item,
                                                status:"error",message:resMessage
                                            }
                                        }
                                        return item
                                    }),
                                  }));
                            });
                          //
                            
                            this.setState({
                              expectedImagesCreation:0,
                              actualImagesCreation:0
                            });


                            //1.2 Images
                            if(oaiPrimaryData.images.length > 0){
                                this.setState({
                                  userFeedback:[...this.state.userFeedback,{step:"Images",status:"info",message:"Importing..."}],
                                  loading:true
                                });

                                var expectedImagesCreation = oaiPrimaryData.images.length;
                                var actualImagesCreation = 0;

                              for(var imageRank = 0; imageRank < oaiPrimaryData.images.length; imageRank++){

                                ImageService.create(null, imageRank+1, oaiPrimaryData.images[imageRank].id,oaiPrimaryData.images[imageRank].id, responseDocumentCreate.data.id,oaiPrimaryData.images[imageRank].url).then(
                                  responseImageCreate => {
                                      actualImagesCreation++;

                                      if(expectedImagesCreation === actualImagesCreation){
                                        this.setState(state => ({
                                          userFeedback: state.userFeedback.map(item => {
                                              if (item.step === 'Images') {
                                                console.log(item);
                                                  return {
                                                      ...item,
                                                      status:"success",message:expectedImagesCreation+" item(s) successfully imported."
                                                  }
                                              }
                                              return item
                                          }),
                                        }));
                                      }

                                    },
                                  errorImageCreate => {
                                      if(errorImageCreate.response.status===401) this.props.history.push('/login');
                                      
                                      console.log(errorImageCreate);
                                      const resMessage =
                                        (errorImageCreate.response &&
                                          errorImageCreate.response.data &&
                                          errorImageCreate.response.data.message) ||
                                        errorImageCreate.message ||
                                        errorImageCreate.toString();

                                      this.setState(state => ({
                                        userFeedback: state.userFeedback.map(item => {
                                            if (item.step === 'Images') {
                                              console.log(item);
                                                return {
                                                    ...item,
                                                    status:"error",message:resMessage
                                                }
                                            }
                                            return item
                                        }),
                                      }));
                                  });
                                }
                            }
                            
                          //2. on crée l'annotation racine (niveau TEXTE) et on importe les annotations depuis le fichier XML
                          var data={
                            document_id:responseDocumentCreate.data.id,
                            type:'T',
                            rank:1
                          };

                          this.setState({
                            userFeedback:[...this.state.userFeedback,{step:"Annotations",status:"info",message:"Importing..."}],
                            loading:true,
                            expectedAnnotationsCreation:1,
                            actualAnnotationsCreation:0
                          });

                          AnnotationService.create(data).then(

                            responseCreateAnnotation => {
                              
                              DocumentService.importAnnotations(oaiSecondaryData.urlFile,responseDocumentCreate.data.id).then(
                                
                                responseAnnotationsImport => {
                                  this.setState(state => ({
                                    userFeedback: state.userFeedback.map(item => {
                                        if (item.step === 'Annotations') {
                                          console.log(item);
                                            return {
                                                ...item,
                                                status:"success",message:"successfully imported."
                                            }
                                        }
                                        return item
                                    }),
                                  }));
                                },
                                errorAnnotationsImport => {
                                  const resMessage =
                                    (errorAnnotationsImport.response &&
                                      errorAnnotationsImport.response.data &&
                                      errorAnnotationsImport.response.data.message) ||
                                    errorAnnotationsImport.message ||
                                    errorAnnotationsImport.toString();

                                  this.setState(state => ({
                                    userFeedback: state.userFeedback.map(item => {
                                        if (item.step === 'Annotations') {
                                          console.log(item);
                                            return {
                                                ...item,
                                                status:"error",message:resMessage
                                            }
                                        }
                                        return item
                                    }),
                                  }));

                                  if(errorAnnotationsImport.response.status===401) this.props.history.push('/login');

                                });
                            },
                            errorCreateAnnotation => {
                              const resMessage =
                                (errorCreateAnnotation.response &&
                                  errorCreateAnnotation.response.data &&
                                  errorCreateAnnotation.response.data.message) ||
                                errorCreateAnnotation.message ||
                                errorCreateAnnotation.toString();

                              this.setState({
                                loading: false,
                                userFeedback:[...this.state.userFeedback,{status:"error",message:resMessage}]
                              });

                            }
                          );

                          //Mise à jour des metadonnées
                          //0.0 ajout des metadata

                          //0.3 Langues et KindOf
                          var available_kindOf = [];
                          oaiSecondaryData.typeOf.text.transcriptions.forEach((item)=>{
                            available_kindOf.push(item);
                          });
                          oaiSecondaryData.typeOf.sentence.transcriptions.forEach((item)=>{
                            available_kindOf.push(item);
                          });
                          oaiSecondaryData.typeOf.word.transcriptions.forEach((item)=>{
                            available_kindOf.push(item);
                          });
                          oaiSecondaryData.typeOf.morpheme.transcriptions.forEach((item)=>{
                            available_kindOf.push(item);
                          });

                          var available_lang = [];
                          oaiSecondaryData.typeOf.text.translations.forEach((item)=>{
                            available_lang.push(item);
                          });
                          oaiSecondaryData.typeOf.sentence.translations.forEach((item)=>{
                            available_lang.push(item);
                          });
                          oaiSecondaryData.typeOf.word.translations.forEach((item)=>{
                            available_lang.push(item);
                          });
                          oaiSecondaryData.typeOf.morpheme.translations.forEach((item)=>{
                            available_lang.push(item);
                          });

                          const unique_available_kindOf = available_kindOf.filter(function(ele , pos){
                              return available_kindOf.indexOf(ele) == pos;
                          });

                          const unique_available_lang = available_lang.filter(function(ele , pos){
                              return available_lang.indexOf(ele) == pos;
                          });

                          var formatedDate = (oaiPrimaryData.recording_date.length>0)?oaiPrimaryData.recording_date:null;
                          //#45 BF date format
                          if(formatedDate.length === 4){
                            formatedDate+='-01-01';
                          }else if(formatedDate.length === 7){
                            formatedDate+='-01';
                          }

                          var updateDocumentData = {
                            recording_date:formatedDate,
                            //recording_place:oaiPrimaryData.recording_place,
                            available_lang:unique_available_lang,
                            available_kindOf:unique_available_kindOf
                          };

                          this.setState({
                            userFeedback:[...this.state.userFeedback,{step:"Description",status:"info",message:"Importing..."}],
                            loading:true
                          });
                          DocumentService.update(createdDocumentData.id,updateDocumentData).then(
                            (responseDocumentUpdate) => {
                              this.setState(state => ({
                                userFeedback: state.userFeedback.map(item => {
                                    if (item.step === 'Description') {
                                      console.log(item);
                                        return {
                                            ...item,
                                            status:"success",message:"successfully imported."
                                        }
                                    }
                                    return item
                                }),
                              }));

                            },
                            errorDocumentUpdate => {
                              const resMessage =
                                (errorDocumentUpdate.response &&
                                  errorDocumentUpdate.response.data &&
                                  errorDocumentUpdate.response.data.message) ||
                                errorDocumentUpdate.message ||
                                errorDocumentUpdate.toString();
                                
                              this.setState(state => ({
                                userFeedback: state.userFeedback.map(item => {
                                    if (item.step === 'Description') {
                                      console.log(item);
                                        return {
                                            ...item,
                                            status:"error",message:resMessage
                                        }
                                    }
                                    return item
                                }),
                              }));
                              console.log(errorDocumentUpdate);
                          });

                        },
                        errorDocumentCreate => {
                          this.setState({
                            userFeedback:[...this.state.userFeedback,{status:"error",message:"Error creating document."}],
                            loading:false,
                          });
                          console.log(errorDocumentCreate);
                        }
                      );
                    }

                  },
                  error => {
                    if(error.response.status===401){
                      this.props.history.push('/login');
                    }else{
                      this.setState({
                        currentDocument:
                          (error.response && error.response.data) ||
                          error.message ||
                          error.toString(),
                          loading:false
                      });
                    }

                  }
                );
            }

          },
          errorGetOai => {
            if(errorGetOai.response && errorGetOai.response.status===401){
              this.props.history.push('/login');
            }else{
              this.setState({
                currentDocument:
                  (errorGetOai.response && errorGetOai.response.data) ||
                  errorGetOai.message ||
                  errorGetOai.toString(),
                  loading:false
              });
              console.log(errorGetOai);
            }

          }
        );
  }

  handleImport = (e) => {

      if(this.state.oaiPrimary && this.state.oaiSecondary){

        this.setState({
          loading:true
        });


        //check first if document exists
        DocumentService.getByOAI(this.state.oaiPrimary,this.state.oaiSecondary).then(
          response => {

            if(typeof response.data === 'object'){
              //document exists already
              if(window.confirm("Document has already been imported. Import again ?")){
                DocumentService.delete(response.data.id);
                this.importDocument(this.state.oaiPrimary,this.state.oaiSecondary);
              }else{
                this.props.history.push("/documents/"+response.data.id+"?tab=0");
              }

              this.setState({
                documentId:response.data.id,
                documentFound:true
              });

            }else if(response.status === 204){
              //document has not yet been imported
              this.importDocument(this.state.oaiPrimary,this.state.oaiSecondary);
              this.setState({
                documentFound:false
              });
            }

          },
          error => {
            if(error.response.status===401){
              this.props.history.push('/login');
            }else{
              this.setState({
                currentDocument:
                  (error.response && error.response.data) ||
                  error.message ||
                  error.toString()
              });
            }

          }
        );

      }else{
        this.setState({
          loading:false
        });
      }


  }

  handleOpen = (e) => {
    this.props.history.push("/documents/"+this.state.documentId+"?tab=0");
  }

  componentDidMount() {
    if(AuthService.getCurrentUser() === null){
      this.props.history.push('/login');
    }

    var oaiPrimary = this.getUrlParameter("oai_primary") || null;
    var oaiSecondary = this.getUrlParameter("oai_secondary") || null;

    this.setState({
      oaiPrimary: oaiPrimary,
      oaiSecondary:oaiSecondary
    });


  }

  render() {
    if(this.state.currentUser !== null){

      const handleClick = (e) => {
        console.log(e);
      }

      const feedback = this.state.userFeedback.map((f) =>
        <Alert variant="outlined" severity={f.status}>{f.step} : {f.message} {(f.step === 'Annotations') && (f.status === 'info') && ((Math.round(this.state.progress * 100) / 100)+"%")}</Alert>
      );

      return (
        <Container>

          <Breadcrumbs aria-label="breadcrumb" style={{fontSize:"0.875rem",margin:"20px"}}>
            <Link color="primary" href="/editor" onClick={handleClick}>
              Home
            </Link>
            <Link color="primary" href="/editor/documents/" onClick={handleClick}>
              My documents
            </Link>
            <a color="default">Import from Pangloss</a>
          </Breadcrumbs>

          <header className="jumbotron">
            <h3>
             Import Document from Pangloss
            </h3>
          </header>
          <p>
            <TextField id="oaiPrimary" label="Primary OAI" value={this.state.oaiPrimary} onChange={this.handleChange} />
          </p>
          <p>
            <TextField id="oaiSecondary" label="Secondary OAI" value={this.state.oaiSecondary} onChange={this.handleChange} />
          </p>
          <p>
          {feedback}
            {(this.state.userFeedback.filter(f => f.status === "success").length > 0) && (this.state.userFeedback.filter(f => f.step !== "Import" && f.status === "info").length === 0) && this.state.documentId && (<Chip
            icon={<OpenIcon />}
            label="Open imported document"
            clickable
            size="small"
            color="primary"
            onClick={this.handleOpen}
          />)}
          </p>
          <p>

          {!this.state.loading && <Chip
            icon={<ImportIcon />}
            label="Import document"
            clickable
            size="small"
            color="primary"
            onClick={this.handleImport}
          />
          }
          </p>
        </Container>
      );
    }else{
      return (<div></div>);
    }
  }
}

export default withRouter(DocumentImport);
