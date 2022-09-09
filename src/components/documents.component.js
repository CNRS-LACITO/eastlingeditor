import React, { Component } from "react";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import DocumentService from "../services/document.service";
import AnnotationService from "../services/annotation.service";

import { DataGrid } from '@material-ui/data-grid';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withRouter } from 'react-router-dom';

class Documents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: AuthService.getCurrentUser(),
      currentUserDocuments:[],
      openCreateDialog: false,
      openDeleteDialog: false,
      typeOfDocument: "TEXT",
      langCorpus: "",
      loading: false,
      documentToDelete: null
    };

    if(AuthService.getCurrentUser() === null)
      this.props.history.push('/login');
  }

  handleCloseCreateDialog = (event) => {
    this.setState({
        openCreateDialog: false
      });
  };

  handleOpenCreateDialog = (event) => {
    this.setState({
        openCreateDialog: true
      });
  };

  handleCloseDeleteDialog = (event) => {
    this.setState({
        openDeleteDialog: false
      });
  };

  handleOpenDeleteDialog = (event) => {
    this.setState({
        openDeleteDialog: true
      });
  };

  handleLangChange = (event) => {
    this.setState({
        langCorpus: event.target.value
      });
  };

  handleTypeChange = (event) => {
    this.setState({
        typeOfDocument: event.target.value
      });
  };

  handleCreateDocument = (event) => {
    event.preventDefault();

    this.setState({
      loading: true
    });

      DocumentService.create(this.state.langCorpus, this.state.typeOfDocument).then(
        (responseDoc) => {
          //When the document is successfully created, we automatically create the top level node annotation (TEXT)
          var data={
            document_id:responseDoc.data.id,
            type:'T',
            rank:1
          };
          AnnotationService.create(data).then(
            (responseAnnotation) => {
              this.props.history.push("/documents/"+responseDoc.data.id+"?tab=0");
            },
            error => {
              const resMessage =
                (error.responseAnnotation &&
                  error.responseAnnotation.data &&
                  error.responseAnnotation.data.message) ||
                error.message ||
                error.toString();

              this.setState({
                loading: false,
                message: resMessage
              });
            }
          );

        },
        error => {
          const resMessage =
            (error.responseDoc &&
              error.responseDoc.data &&
              error.responseDoc.data.message) ||
            error.message ||
            error.toString();

          this.setState({
            loading: false,
            message: resMessage
          });
        }
      );
  };

  handleDeleteDocument = (event) => {
    this.setState({
      loading: true,
    });
    DocumentService.delete(this.state.documentToDelete).then(
      (response) => {
          window.location.reload();
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
            message: resMessage
          });
        });
  };


  componentDidMount() {

      this.setState({
        loading: true,
      });

      if(this.state.currentUser !== null)
        {
          UserService.getUserDocuments().then(
            response => {
              this.setState({
                currentUserDocuments:response.data,
                loading:false
              });
            },
            error => {
              if(error.response.status===401) this.props.history.push('/login');
              this.setState({
                currentUserDocuments:
                  (error.response && error.response.data) ||
                  error.message ||
                  error.toString(),
                  loading:false
              });
            }
          );
        }

  }

  render() {
    if(this.state.currentUser !== null){

      const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
          field: 'titles',
          headerName: 'Title(s)',
          width: 300,
          renderCell: (params) => (
            <Container
              variant="contained"
              color="primary"
              size="small"
              component="div"
            >
            {params.value.map(
              (item) => <Chip
                key={item.id}
                avatar={<Avatar>{item.lang.toUpperCase()}</Avatar>}
                label={item.title} 
                color="secondary"
                />
              )
            }
            </Container>
        )
        },
        {
          field: 'lang',
          headerName: 'Language',
          width: 120,
          editable: true,
          renderCell: (params) => (
            <Container
              variant="contained"
              color="primary"
              size="small"
              component="div"
            >
            <Chip
              key={params.id}
              label={params.value} 
              color="secondary"
            />

            </Container>
        )
        },
        {
          field: 'type',
          headerName: 'Type',
          width: 120,
          editable: true,
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 200,
          editable: false,

          renderCell: (params) => {
            const onClick = () => {
              this.setState({
                openDeleteDialog: true,
                documentToDelete: params.id
              });
            };

            return(
            <div id={"actionsDocument_"+params.id}>
            <IconButton color="primary" title="Edit document" aria-label="Edit document" onClick={()=>this.props.history.push("/documents/" + params.id + "?tab=0")}>
                <EditIcon />
            </IconButton>
            <IconButton color="primary" title="Download document" aria-label="Download document">
              <CloudDownloadIcon />
            </IconButton>
            <IconButton color="primary" title="Send document for deposit" aria-label="Send document for deposit">
              <SendIcon />
            </IconButton>
            <IconButton color="primary" title="Delete document" aria-label="Delete document" onClick={onClick}>
              <DeleteIcon />
            </IconButton>
            </div>
            );
            }
        }
      ];

      var docs = [];
      
      if(typeof this.state.currentUserDocuments !== 'string' && this.state.currentUserDocuments.length > 0){
        this.state.currentUserDocuments.forEach((d) => {
           docs.push({key:d.id,id:d.id,titles:d.titles,lang:d.lang,type:d.type,actions:d.id}
              );

        });
      }

      return (
        <Container>
          <header className="jumbotron">
            <h3>
             My documents
            </h3>
          </header>
          <div>
            <div style={{ height: 600, width: '80%' }}>
              <IconButton color="primary" title="Create a new document" aria-label="Create a new document" onClick={this.handleOpenCreateDialog}>
                  <AddIcon />
              </IconButton>
              <Dialog open={this.state.openCreateDialog} onClose={this.handleCloseCreateDialog} aria-labelledby="form-createdialog-title">
                <DialogTitle id="form-createdialog-title">Create a new document</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Please refer to the <a target="_blank" rel="noreferrer" href="https://iso639-3.sil.org/code_tables/639/data/all">ISO 639-3 code tables</a>.
                  </DialogContentText>
                    <form noValidate>
                      <div>
                        <TextField
                          autoFocus
                          margin="dense"
                          id="name"
                          label="Language ISO 639-3 Code"
                          type="text"
                          fullWidth
                          onChange={this.handleLangChange}
                        />
                      </div>
                      <FormControl>
                        <InputLabel id="select-type-label">Type of document</InputLabel>
                        <Select
                          labelId="select-type-label"
                          id="type"
                          value={this.state.typeOfDocument}
                          onChange={this.handleTypeChange}
                        >
                          <MenuItem value={"TEXT"}>Text</MenuItem>
                          <MenuItem value={"WORDLIST"}>Wordlist</MenuItem>
                        </Select>
                      </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseCreateDialog} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={this.handleCreateDocument} color="primary">
                    Create document
                  </Button>
                </DialogActions>
              </Dialog>

              <Dialog open={this.state.openDeleteDialog} onClose={this.handleCloseDeleteDialog} aria-labelledby="form-createdialog-title">
                <DialogTitle id="form-deletedialog-title">Delete a document</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Delete document {this.state.documentToDelete} ?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseDeleteDialog} color="primary">
                    Cancel
                  </Button>
                  {
                    !this.state.loading && <Button onClick={this.handleDeleteDocument} color="primary">
                  Delete document
                  </Button>
                  }
                  {this.state.loading && <CircularProgress />}
                </DialogActions>
              </Dialog>
              {this.state.loading ? <CircularProgress size="1.5rem" /> : 
                <DataGrid
                  rows={docs}
                  columns={columns}
                  pageSize={10}
                  checkboxSelection
                  disableSelectionOnClick
                />
              }
            </div>
          </div>

        </Container>
      );
    }else{
      return (<div></div>);
    }
  }
}

export default withRouter(Documents);