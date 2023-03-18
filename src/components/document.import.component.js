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
      userFeedback:{
        status:"",
        message:""
      },
      oaiPrimaryData:null,
      oaiSecondaryData:null,
      createdDocumentId:0
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

  importDocument = (oaiPrimary,oaiSecondary) => {

    var oaiPrimaryData = null;
    var oaiSecondaryData = null;
    var createdDocumentData = null;

    var importStatus = 0;


    this.setState({
      userFeedback:{status:"info",message:"Beginning the import..."},
      loading:true
    });

    CocoonService.getOai(oaiPrimary,"primary").then(
          responseGetOaiPrimary => {
            if(responseGetOaiPrimary.data.subject === null){
              //OAI not valid
              this.setState({
                userFeedback:{status:"error",message:"The primary OAI doesn't exist. End of the importing process."},
                loading:false,
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
                        userFeedback:{status:"error",message:"The secondary OAI doesn't exist. End of the importing process."},
                        loading:false
                      });

                    }else{

                      //OAI valid
                      oaiSecondaryData = responseGetOaiSecondary.data;
                      DocumentService.create(oaiPrimaryData.subject[0].code + " / " + oaiPrimaryData.subject[0].name,oaiSecondaryData.type,oaiPrimary,oaiSecondary).then(
                        responseDocumentCreate => {
                          importStatus++; // 1
                          
                          createdDocumentData = responseDocumentCreate.data;

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
                                  
                                },
                                errorTitleCreate => {

                                });
                            }
                          //
                          //0.2 Contributors
                          console.log(oaiPrimaryData.contributors);

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
                                    
                                  },
                                  errorContributorCreate => {

                                  });

                              });


                            }
                          //

                            
                          
                          //1. on crée les ressources liées au document
                          //1.1 Enregistrement
                          RecordingService.create(null, (oaiPrimaryData.audio !== null)?"AUDIO":"VIDEO",oaiPrimaryData.audio, responseDocumentCreate.data.id,oaiPrimaryData.audio).then(
                              responseRecordingCreate => {
                                  importStatus++; // 2
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

                                  this.setState({
                                    loading: false,
                                    errorMessage: resMessage,
                                    openAddDialog:false
                                  });
                            });
                          //
                            

                            //1.2 Images
                            if(oaiPrimaryData.images.length > 0){
                              for(var imageRank = 0; imageRank < oaiPrimaryData.images.length; imageRank++){
                                console.log(imageRank);
                                ImageService.create(null, imageRank+1, oaiPrimaryData.images[imageRank].id,oaiPrimaryData.images[imageRank].id, responseDocumentCreate.data.id,oaiPrimaryData.images[imageRank].url).then(
                                  responseImageCreate => {
                                      importStatus++;
                                    },
                                  errorImageCreate => {
                                      if(errorImageCreate.response.status===401) this.props.history.push('/login');
                                      const resMessage =
                                        (errorImageCreate.response &&
                                          errorImageCreate.response.data &&
                                          errorImageCreate.response.data.message) ||
                                        errorImageCreate.message ||
                                        errorImageCreate.toString();

                                      this.setState({
                                        loading: false,
                                        errorMessage: resMessage,
                                        openAddDialog:false
                                      });
                                  });
                                }
                            }
                            
                          //2. on crée l'annotation racine (niveau TEXTE) et on importe les annotations depuis le fichier XML
                          var data={
                            document_id:responseDocumentCreate.data.id,
                            type:'T',
                            rank:1
                          };

                          AnnotationService.create(data).then(

                            responseCreateAnnotation => {
                              
                              DocumentService.importAnnotations(oaiSecondaryData.urlFile,responseDocumentCreate.data.id).then(
                                
                                responseAnnotationsImport => {
                                  importStatus++; // 3
                                  //console.log(responseAnnotationsImport);
                                },
                                errorAnnotationsImport => {
                                  const resMessage =
                                    (errorAnnotationsImport.response &&
                                      errorAnnotationsImport.response.data &&
                                      errorAnnotationsImport.response.data.message) ||
                                    errorAnnotationsImport.message ||
                                    errorAnnotationsImport.toString();
                                    
                                  this.setState({
                                    loading: false,
                                    userFeedback:{status:"error",message:resMessage}
                                  });

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
                                userFeedback:{status:"error",message:resMessage}
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

                          console.log(unique_available_kindOf,unique_available_lang);

                          var updateDocumentData = {
                            recording_date:oaiPrimaryData.recording_date,
                            //recording_place:oaiPrimaryData.recording_place,
                            available_lang:unique_available_lang,
                            available_kindOf:unique_available_kindOf
                          };

                          DocumentService.update(createdDocumentData.id,updateDocumentData).then(
                            (responseDocumentUpdate) => {
                            
                            },
                            errorDocumentUpdate => {

                          });

                        },
                        errorDocumentCreate => {

                        }
                      );

                      this.setState({
                        userFeedback:{status:"success",message:"Import succeded. Creating document ..."},
                        loading:false,
                        oaiSecondaryData:responseGetOaiSecondary.data
                      });

                      this.props.history.push('/documents/'+createdDocumentData.id+'?tab=0');
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
                documentFound:true,
                loading:false
              });

            }else if(response.status === 204){
              //document has not yet been imported
              this.importDocument(this.state.oaiPrimary,this.state.oaiSecondary);
              this.setState({
                documentFound:false,
                loading:false
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
                  error.toString(),
                  loading:false
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
            {this.state.loading ?
                <CircularProgress />
              :
                <Alert severity={this.state.userFeedback.status}>{this.state.userFeedback.message}</Alert>
            }
            
          </p>
          <p>
          {this.state.documentFound && (
            <div>
            <Chip
            icon={<ImportIcon />}
            label="Import again"
            clickable
            size="small"
            color="primary"
            onClick={this.handleImport}
          />
          <Chip
            icon={<OpenIcon />}
            label="Open document"
            clickable
            size="small"
            color="primary"
            onClick={this.handleOpen}
          />
          </div>)
          }

          {!this.state.documentFound && <Chip
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
