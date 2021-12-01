 import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import DocumentService from "../services/document.service";
import { withRouter } from 'react-router-dom';

class DocumentAnnotationsImport extends Component {

  constructor(props){
    super(props);
    this.state = {
      message: "",
      loading: false,
      openImportDialog: false,
      importedData: {"TEXT":"nothing"},
      progress:0
    };

    this.handleImport = this.handleImport.bind(this);

  }

  componentDidMount(){

  }

  handleCloseImportDialog = (event) => {
    this.setState({
        openImportDialog: false
      });
  };

  handleOpenImportDialog = (event) => {
    document.getElementsByName('xmlInputFile')[0].files.length > 0 &&
    this.setState({
        openImportDialog: true
      });
  };

  handleImport(e) {
    e.preventDefault();

    this.setState({
      message: "",
      loading: true,
      progress:0
    });

    var that = this;

    function increaseProgress(percentUnit){
      that.setState({
        progress:(that.state.progress + percentUnit)>100 ? 100 : (that.state.progress + percentUnit)
      });
    }
    
    //Ratio observé sur 3 imports :
    // - wordlist crdo-MTQ_TUPHONG_VOC.xml : 1825 W, 1480 Ko, 480 secondes
    // - wordlist crdo-TOU_VOC1.xml : 367 W, 303 Ko, 96 secondes
    // - text crdo-TWH_T19.xml : 13 S et 154 W, 71 Ko, 30 secondes

    var ratio = ((480/1480)+(96/303)+(30/71))/3;

    var estimatedDelay = ratio * document.getElementsByName('xmlInputFile')[0].files[0].size / 1000;
    var percentUnit = 100 / estimatedDelay;

    setInterval(increaseProgress,1000, percentUnit);

    DocumentService.import(document.getElementsByName('xmlInputFile')[0].files[0],this.props.documentId).then(
        response => {
          this.setState({
            importedData:response.data,
            openImportDialog:false
          });
          this.props.refreshAnnotations();
        },
        error => {
          this.setState({
            importedData:
              (error.response && error.response.data) ||
              error.message ||
              error.toString(),
              openImportDialog:false
          });
          if(error.response.status===401) this.props.history.push('/login');

        });
    
  }

  render() {

    return (
      <Container>

        <Input
            type="file"
            accept="text/xml"
            name="xmlInputFile"
          />
          <Button onClick={this.handleOpenImportDialog} color="primary">
            Import
          </Button>
          {this.state.importedData && this.state.importedData.TEXT && this.state.importedData.TEXT['xml:lang']}
          {this.state.importedData && this.state.importedData.WORDLIST && this.state.importedData.WORDLIST['xml:lang']}

        <Dialog open={this.state.openImportDialog} onClose={this.handleCloseImportDialog} aria-labelledby="form-createdialog-title">
          <DialogTitle id="form-importdialog-title">Import annotations from XML file</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Importing annotations from a XML file (DTD Pangloss) will delete all annotations for this document. Confirm ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseImportDialog} color="primary">
              Cancel
            </Button>
            {!this.state.loading && <Button onClick={this.handleImport} color="primary">Import</Button>}
            {this.state.loading && 
              <Box position="relative" display="inline-flex">
                <CircularProgress variant="determinate" value={this.state.progress}/>
                <Box
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  position="absolute"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="caption" component="div" color="textSecondary">
                  {Math.round(this.state.progress)}%
                  </Typography>
                </Box>
              </Box>
            }

          </DialogActions>
        </Dialog>

      </Container>


    );
  }
};

export default withRouter(DocumentAnnotationsImport);