import React, { Component } from "react";
import Container from '@material-ui/core/Container';
import DocumentService from "../services/document.service";
import Chip from '@material-ui/core/Chip';
import ImportIcon from '@material-ui/icons/CloudDownload';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class DocumentExport extends Component {
  
  constructor(props) {
      super(props);
      this.state = {
        loading:false
      }
    }

  getAnnotationsXML = () => {
    this.setState({
      loading:true
    });

    DocumentService.getAnnotationsXML(this.props.documentId).then(
        response => {
          //window.open('data:Application/octet-stream,' + encodeURIComponent(response.data));
          var uri = 'data:Application/octet-stream,' + encodeURIComponent(response.data);

          var downloadLink = document.createElement("a");
          downloadLink.href = uri;
          downloadLink.download = this.props.documentExportTitle+".xml";

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          this.setState({
            loading:false
          });

        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
          this.setState({
            currentDocument:
              (error.response && error.response.data) ||
              error.message ||
              error.toString(),
              loading:false
          });
        }
      );
  }

  getAnnotationsYAML = () => {
    this.setState({
      loading:true
    });

    DocumentService.getAnnotationsYAML(this.props.documentId).then(
        response => {
          var uri = 'data:Application/octet-stream,' + encodeURIComponent(response.data);

          var downloadLink = document.createElement("a");
          downloadLink.href = uri;
          downloadLink.download = this.props.documentExportTitle+".yml";

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          this.setState({
            loading:false
          });

        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
          this.setState({
            currentDocument:
              (error.response && error.response.data) ||
              error.message ||
              error.toString(),
              loading:false
          });
        }
      );
  }

  getMetadataXML = () => {
    console.log('metadata file');
  }



    render(){
      return (
        <div> 
          <Container>
            Export options<br/>
            {this.state.loading && <CircularProgress />}
            {!this.state.loading && <div>
             <Chip
                icon={<ImportIcon />}
                label="XML Annotations"
                clickable
                size="small"
                color="primary"
                onClick={this.getAnnotationsXML}
              />
              <Chip
                icon={<ImportIcon />}
                label="XML Metadata"
                clickable
                size="small"
                color="primary"
                onClick={this.getMetadataXML}
                disabled
              />
              <Chip
                icon={<ImportIcon />}
                label="LateX"
                clickable
                size="small"
                color="primary"
                onClick={this.getAnnotationsYAML}
              />
              </div>
         }
          </Container>
        </div>
      );
    }
  
}
