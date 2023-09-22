import React, { Component } from "react";
import Container from '@material-ui/core/Container';
import DocumentService from "../services/document.service";
import Chip from '@material-ui/core/Chip';
import ImportIcon from '@material-ui/icons/GetApp';
import CircularProgress from '@material-ui/core/CircularProgress';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

export default class DocumentExport extends Component {
  
  constructor(props) {
      super(props);
      this.state = {
        loading:false
      }
    }

  getZipFile = () => {

    var that=this;
    const zip = new JSZip();
    
    var exportFilename = (this.props.documentExportTitle !== null)?this.props.documentExportTitle.replace("/","").replace(" ",""):window.prompt("Name of the document for export (please keep the XML extension)",".xml");

    if(exportFilename.indexOf('.xml')===-1) exportFilename+='.xml';

    if(exportFilename!==null){

      DocumentService.getAnnotationsXML(this.props.documentId,exportFilename).then(
        response => {

            zip.file(exportFilename, response.data);
            
            if(this.props.recording) 
              zip.file(this.props.recording.filename.split('/').reverse()[0], this.props.recording['TO_BASE64(content)'],{base64: true});
            //ajout audio zip.file(this.props.documentExportTitle+".xml", response.data);
            const img = zip.folder("images");

            window.imagesMap.forEach(function(image){
              img.file("eastling-image"+image.id+"_"+image.filename, image.content, {base64: true});
            });
            
            zip.generateAsync({type:"blob"}).then(function(content) {
                FileSaver.saveAs(content,exportFilename+".zip");
            });

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

  }

  getAnnotationsXML = () => {
    this.setState({
      loading:true
    });

    var exportFilename = (this.props.documentExportTitle !== null)?this.props.documentExportTitle.replace("/","").replace(" ",""):window.prompt("Name of the document for export (please keep the XML extension)",".xml");
    if(exportFilename.indexOf('.xml')===-1) exportFilename+='.xml';

    if(exportFilename!==null){
      DocumentService.getAnnotationsXML(this.props.documentId,exportFilename).then(
        response => {
          //window.open('data:Application/octet-stream,' + encodeURIComponent(response.data));
          var uri = 'data:Application/octet-stream,' + encodeURIComponent(response.data);

          var downloadLink = document.createElement("a");
          downloadLink.href = uri;
          downloadLink.download = exportFilename;

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
    
  }

  getAnnotationsJSON = () => {
    var uri = 'data:Application/octet-stream,' + encodeURIComponent(JSON.stringify(this.props.annotations));

    var downloadLink = document.createElement("a");
    downloadLink.href = uri;
    downloadLink.download = this.props.documentExportTitle+".json";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  getAnnotationsJSON4LATEX = () => {
    this.setState({
      loading:true
    });

    DocumentService.getAnnotationsJSON4LATEX(this.props.documentId).then(
        response => {
          var uri = 'data:Application/octet-stream,' + encodeURIComponent(JSON.stringify(response.data));

          var downloadLink = document.createElement("a");
          downloadLink.href = uri;
          downloadLink.download = this.props.documentExportTitle+".json";

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
                label="ZIP Archive"
                clickable
                size="small"
                color="primary"
                onClick={this.getZipFile}
              />
              <Chip
                icon={<ImportIcon />}
                label="JSON Annotations"
                clickable
                size="small"
                color="primary"
                onClick={this.getAnnotationsJSON}
              />
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
                color="default"
                onClick={this.getMetadataXML}
                disabled
              />
              <Chip
                icon={<ImportIcon />}
                label="LateX"
                clickable
                size="small"
                color="primary"
                onClick={this.getAnnotationsJSON4LATEX}
              />
              </div>
         }
          </Container>
        </div>
      );
    }
  
}
