import React, { Component } from "react";
import AuthService from "../services/auth.service";
import RecordingService from "../services/recording.service";
import ImageService from "../services/image.service";

import {Container, Button, IconButton} from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';

import {FormControl,Input, FormHelperText, TextField} from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import Snackbar from '@material-ui/core/Snackbar';
import { withRouter } from 'react-router-dom';

class DocumentResources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: AuthService.getCurrentUser(),
      resources: [],
      openAddDialog:false,
      maxImageRank:0,
      nameInDocument:null,
      openDeleteDialog:false,
      selectedResourceId:null,
      images:this.props.images,
      recording:this.props.recording
    };

  }

  handleOpenAddDialog = () => {
    this.setState({openAddDialog:true});
  };

  handleCloseAddDialog = () => {
    this.setState({openAddDialog:false});
  };

  handleCloseDeleteDialog = (event) => {
    this.setState({
        openDeleteDialog: false
      });
  };

  handleOpenDeleteDialog = (resourceId) => {
    this.setState({
        openDeleteDialog: true,
        selectedResourceId : resourceId
      });
    alert(resourceId);
  };

  onNameChange = (event) => {
    this.setState({nameInDocument:event.target.value});
  }

  readUploadedFile = (inputFile) => {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        var img = new Image();
        img.src = temporaryFileReader.result;
        img.onload = function () {
          resolve(this.width);
        }
      };

      temporaryFileReader.readAsDataURL(inputFile);
    });
  }

  handleUpload = () => {
    this.setState({
      loading: true
    });

    var type = 'AUDIO';

    if(document.getElementById('resourceFile').files[0].type === 'video/mp4') type='VIDEO';
    if(document.getElementById('resourceFile').files[0].type === 'audio/mpeg' || document.getElementById('resourceFile').files[0].type === 'audio/wav') type='AUDIO';
    if(document.getElementById('resourceFile').files[0].type === 'image/jpeg' || document.getElementById('resourceFile').files[0].type === 'image/png') type='IMAGE';

    
    (type === 'AUDIO' || type === 'VIDEO') && !this.state.hasRecording && RecordingService.create(document.getElementById('resourceFile').files[0], type, this.state.nameInDocument || document.getElementById('resourceFile').files[0].name, this.props.documentId).then(
        (response) => {

            this.setState({
              recording:response.data,
              loading: false,
              openAddDialog:false
            });

            window.location.reload();
          },
          error => {
            if(error.response.status===401) this.props.history.push('/login');
            console.log(error.response);
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


      if(type === 'IMAGE'){
                var file  = document.getElementById('resourceFile').files[0];
                var imageWidth = 1000;

                try {
                  this.readUploadedFile(file).then(
                    (imageWidth) => {
                          ImageService.create(document.getElementById('resourceFile').files[0], this.state.maxImageRank+1, document.getElementById('resourceFile').files[0].name,this.state.nameInDocument || document.getElementById('resourceFile').files[0].name, this.props.documentId,null,imageWidth/1000).then(
                            (response) => {

                                var images = this.state.images;
                                images.push(response.data);

                                this.setState({
                                  images:images,
                                  loading: false,
                                  openAddDialog:false
                                });

                                window.location.reload();

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
                    },
                    (error)=>{

                    });

                  
                } catch (e) {
                  console.warn(e.message)
                }
            
            
      }
     


      if ((type === 'AUDIO' || type === 'VIDEO') && this.state.hasRecording){
        alert("You can attach only one recording to the document");
        this.setState({
          loading:false,
          openAddDialog:false
        });
      }
      
  };


  handleCloseSnackBar = (event) => {
    this.setState({errorMessage:null});
  }

  handleDeleteResource = () => {
    this.setState({
      loading: true
    });

    var type = this.state.selectedResourceType;
    
    (type === 'AUDIO' || type === 'VIDEO') && RecordingService.delete(this.state.selectedResourceId).then(
        (response) => {
            window.location.reload();
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
              errorMessage: resMessage
            });
      });

      type === 'IMAGE' && ImageService.delete(this.state.selectedResourceId).then(
        (response) => {
            window.location.reload();
            //this.refreshResources();
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
              errorMessage: resMessage
            });
      });


      this.setState({openDeleteDialog:false});
  
  }

  refreshResources = () => {
    var resources = [];

    if(this.state.images){
      var maxImageRank = 0;
      this.state.images.forEach((i) => {
        maxImageRank = (maxImageRank<i.rank)?i.rank:maxImageRank;

         resources.push({
          id:"IMAGE"+i.id,
          filename:i.filename,
          name:i.name,
          type:"IMAGE",
          rank:i.rank,
          preview:{type:"IMAGE",content:i["TO_BASE64(content)"]},
          actions:i.id
        });
         this.setState({
          maxImageRank:maxImageRank,
          resources:resources
        });
      });
      
    }

    if(this.state.recording){
      resources.push({
        id:this.state.recording.type+this.state.recording.id,
        filename:this.state.recording.filename,
        name:this.state.recording.name,
        type:this.state.recording.type,
        rank:1,
        preview:{type:this.state.recording.type,content:this.state.recording["TO_BASE64(content)"]},
        actions:this.state.recording.id
      });
      this.setState({
        hasRecording:true,
        resources:resources
      });
    }
  }

  componentDidMount() {

    this.refreshResources();

  }

  render() {

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 50 },
        {
          field: 'filename',
          headerName: 'Original file name',
          width: 200,
          editable: true,
        },
        {
          field: 'name',
          headerName: 'Name in document',
          width: 200,
          editable: true,
        },
        {
          field: 'type',
          headerName: 'Type',
          width: 110,
          editable: true,
        },
        {
          field: 'rank',
          headerName: 'Rank',
          width: 110,
          editable: true,
        },
        {
          field: 'preview',
          headerName: 'Preview',
          width: 150,
          editable: true,
          renderCell: (params) => (
            (params.value.type === "IMAGE") ?
            <img alt={params.value.filename} src={"data:image/png;base64,"+params.value.content} width="100px" height="100px"/>
            :
            <audio controls="controls" src={"data:audio/mpeg;base64,"+params.value.content} type="audio/mp3"></audio>
          )
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 200,
          editable: false,
          renderCell: (params) => {
            const onClick = () => {
              console.log(params.row.type);
              this.setState({
                openDeleteDialog: true,
                selectedResourceId: params.value,
                selectedResourceType : params.row.type
              });
            };

            return(
            <div>
              <IconButton color="primary" title="Delete resource" aria-label="Delete resource" onClick={onClick} >
                <DeleteIcon />
              </IconButton>
            </div>
            );
            }
        }
      ];
      
    return(
    <Container>

          <div>
            <div style={{ height: 300, width: '80%' }}>
              <IconButton color="primary" title="Add a resource" aria-label="Add a resource" onClick={this.handleOpenAddDialog}>
                  <AddIcon />
              </IconButton>
              <DataGrid
                rows={this.state.resources}
                columns={columns}
                pageSize={10}
                checkboxSelection
                disableSelectionOnClick
              />
            </div>
          </div>

          <div>
            <Dialog open={this.state.openAddDialog} onClose={this.handleCloseAddDialog} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Add a resource</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  1 audio or 1 video maximum, if multiple images, please define a rank for each one.
                </DialogContentText>
                <FormControl>
                  <Input
                    id="resourceFile"
                    type="file"
                    aria-describedby="standard-weight-helper-text"
                    inputProps={{
                      accept: 'image/png, image/jpeg, audio/wav, audio/mpeg, video/mp4',
                    }}
                  />
                  <FormHelperText id="standard-weight-helper-text">Accepted formats : JPG, PNG, WAV, MP3, MP4</FormHelperText>
                </FormControl>
                <FormControl>
                  <TextField
                    label="Name in document"
                    placeholder="Name in document"
                    fullWidth
                    value={this.state.nameInDocument}
                    onChange={this.onNameChange}
                  />
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleCloseAddDialog} color="primary">
                  Cancel
                </Button>
                {this.state.loading ?
                   <CircularProgress />
                   :
                  <Button onClick={this.handleUpload} color="primary">
                    Upload
                  </Button>
                }
              </DialogActions>
            </Dialog>

            <Dialog open={this.state.openDeleteDialog} onClose={this.handleCloseDeleteDialog} aria-labelledby="form-deletedialog-title">
            <DialogTitle id="form-deletedialog-title">Delete resource</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Delete resource {this.state.selectedResourceId} ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleCloseDeleteDialog} color="primary">
                Cancel
              </Button>
              {!this.state.loading && <Button onClick={this.handleDeleteResource} color="primary">
                Delete resource
              </Button>
              }
              {this.state.loading && <CircularProgress />}
            </DialogActions>
          </Dialog>

          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={this.state.errorMessage}
            autoHideDuration={null}
            message={this.state.errorMessage}
            action={
              <React.Fragment>
                <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleCloseSnackBar}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </React.Fragment>
            }
          />
          </div>
        </Container>
    );
  }
}

export default withRouter(DocumentResources);