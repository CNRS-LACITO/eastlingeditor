import React, { Component } from "react";
import AuthService from "../services/auth.service";
import DocumentService from "../services/document.service";
import AnnotationService from "../services/annotation.service";
import CocoonService from "../services/cocoon.service";
import RecordingService from "../services/recording.service";
import ImageService from "../services/image.service";
import TitleService from "../services/title.service";
import ContributorService from "../services/contributor.service";

import { withRouter } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import ImportIcon from '@material-ui/icons/CloudDownload';
import OpenIcon from '@material-ui/icons/CloudDownload';
import Alert from '@material-ui/lab/Alert';

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
          response => {
            if(response.data.subject === null){
              //OAI not valid
              this.setState({
                userFeedback:{status:"error",message:"The primary OAI doesn't exist. End of the importing process."},
                loading:false,
                oaiPrimaryData:response.data
              });

            }else{
              //OAI valid, get the Secondary 
              oaiPrimaryData = response.data;
              CocoonService.getOai(oaiSecondary,"secondary").then(
                  response => {
                    if(response.data === null){
                      //OAI not valid
                      this.setState({
                        userFeedback:{status:"error",message:"The secondary OAI doesn't exist. End of the importing process."},
                        loading:false
                      });

                    }else{

                      //OAI valid
                      oaiSecondaryData = response.data;
                      DocumentService.create(oaiPrimaryData.subject[0].code + " / " + oaiPrimaryData.subject[0].name,oaiSecondaryData.type,oaiPrimary,oaiSecondary).then(
                        responseDocumentCreate => {
                          importStatus++; // 1
                          
                          createdDocumentData = responseDocumentCreate.data;

                          //Mise à jour des metadonnées
/*
                          DocumentService.update(createdDocumentData.id,data).then(
                            responseDocumentUpdate => {

                            },
                            error => {

                            });
*/

                          //0. ajout des titres

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
                                error => {

                                });

                            }

                            
/*
                            
                                */

                          




                          //1. on crée les ressources liées au document
                          //1.1 Enregistrement
                          RecordingService.create(null, (oaiPrimaryData.audio !== null)?"AUDIO":"VIDEO",oaiPrimaryData.audio, responseDocumentCreate.data.id,oaiPrimaryData.audio).then(
                              (responseRecordingCreate) => {
                                  importStatus++; // 2
                                },
                                error => {
                                  if(error.responseRecordingCreate.status===401) this.props.history.push('/login');
                                  console.log(error.responseRecordingCreate);
                                  const resMessage =
                                    (error.responseRecordingCreate &&
                                      error.responseRecordingCreate.data &&
                                      error.responseRecordingCreate.data.message) ||
                                    error.message ||
                                    error.toString();

                                  this.setState({
                                    loading: false,
                                    errorMessage: resMessage,
                                    openAddDialog:false
                                  });
                            });
                            

                            //1.2 Images
                            if(oaiPrimaryData.images.length > 0){
                              for(var imageRank = 0; imageRank < oaiPrimaryData.images.length; imageRank++){
                                console.log(imageRank);
                                ImageService.create(null, imageRank+1, oaiPrimaryData.images[imageRank].id,oaiPrimaryData.images[imageRank].id, responseDocumentCreate.data.id,oaiPrimaryData.images[imageRank].url).then(
                                  (responseImageCreate) => {
                                      importStatus++;
                                    },
                                    error => {
                                      if(error.response.status===401) this.props.history.push('/login');
                                      const resMessage =
                                        (error.response &&
                                          error.response.data &&
                                          error.response.data.message) ||
                                        error.message ||
                                        error.toString();

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

                            (responseCreateAnnotation) => {
                              
                              DocumentService.importAnnotations(oaiSecondaryData.urlFile,responseDocumentCreate.data.id).then(
                                
                                responseDocumentImport => {
                                  importStatus++; // 3
                                  console.log(responseDocumentImport);
                                },
                                error => {
                                  const resMessage =
                                    (error.response &&
                                      error.response.data &&
                                      error.response.data.message) ||
                                    error.message ||
                                    error.toString();
                                    
                                  this.setState({
                                    loading: false,
                                    userFeedback:{status:"error",message:resMessage}
                                  });

                                  if(error.response.status===401) this.props.history.push('/login');

                                });
                            },
                            error => {
                              const resMessage =
                                (error.response &&
                                  error.response.data &&
                                  error.response.data.message) ||
                                error.message ||
                                error.toString();

                              this.setState({
                                loading: false,
                                userFeedback:{status:"error",message:resMessage}
                              });

                            }
                          );
                        },
                        error => {

                        }
                      );

                      this.setState({
                        userFeedback:{status:"success",message:"Import succeded. Creating document ..."},
                        loading:false,
                        oaiSecondaryData:response.data
                      });

                      console.log(oaiPrimaryData,oaiSecondaryData);

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

      return (
        <Container>
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
