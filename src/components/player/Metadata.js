import React from 'react';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, IconButton, Link } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LocationOnIcon from '@material-ui/icons/LocationOn';


class Metadata extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metadataObject: {},
      isLoaded: false,
      items: []
    };
  }

//parse metadata to the right format
  parseData(result){

    var metadata = {};
    var metadataRes = result["OAI-PMH"].GetRecord.record.metadata["crdo_dcq:dcq"];
    metadata.language = "";
    metadata.location = "";
    metadata.contributor = "";

    metadata.title = metadataRes["dc:title"].text;

    metadataRes["dc:subject"].forEach((m)=>{
      metadata.language += m.text + "/";
    });

    
    var contributors = [];
    if(metadataRes["dc:contributor"]){
      metadataRes["dc:contributor"].forEach((c)=>{
        contributors.push(c.text);
      });
      metadata.contributor = contributors.join(' / ');
    }
    

    metadata.creationDate = metadataRes["dcterms:created"].text;

    if(metadataRes["dcterms:spatial"])
    metadataRes["dcterms:spatial"].forEach((s)=>{
      
      if(s.text.indexOf("east=")>=0){
        var coords = s.text.split(";");
        var lng = coords[0].split("=");
        var lat = coords[1].split("=");

        metadata.lnglat = "http://www.google.com/maps/place/"+lat[1]+","+lng[1];
      }else{
        metadata.location += s.text + "/";
      }

    });

    metadata.license = metadataRes["dcterms:license"].text;
    metadata.available = metadataRes["dcterms:available"].text;

    return metadata;
  }

  componentDidMount() {
    if(this.props.file.data){
      this.setState({
            isLoaded: true,
            metadataObject : this.parseData(this.props.file.data)
          });
      
    }else{
      fetch(this.props.file.url)
      .then(res => res.json())
      .then(
        (result) => {

          this.setState({
            isLoaded: true,
            metadataObject : this.parseData(result)
          });

        },
        // Remarque : il est important de traiter les erreurs ici
        // au lieu d'utiliser un bloc catch(), pour ne pas passer à la trappe
        // des exceptions provenant de réels bugs du composant.
        (error) => {
          console.log(error);
        }
      )
    }
    
  }


  render() {
    
    const { isLoaded, metadataObject } = this.state;
    const panelStyle = {
      'display' : 'block',
      'text-align' : 'left'
    }
    return (
      <div>
        <h1>
          {metadataObject.title}
        </h1>
        <ExpansionPanel>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>About this resource</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={panelStyle}>
          <Typography component="p">
            Language : {metadataObject.language}
          </Typography>
          <Typography component="p">
            Contributor(s) : {metadataObject.contributor}
          </Typography>
          <Typography component="p">
            Date of recording : {metadataObject.creationDate}
          </Typography>
          <Typography component="p">
            Place : {metadataObject.location}
            <IconButton title="Open in Google Maps" color="primary" aria-label="play" href={metadataObject.lnglat} target="_blank">
              <LocationOnIcon />
            </IconButton>
          </Typography>
          <Typography component="p">
            License : {metadataObject.license}
          </Typography>
          <Typography component="p">
            Available online : {metadataObject.available}
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      </div>
    );
  }
}


export default Metadata;