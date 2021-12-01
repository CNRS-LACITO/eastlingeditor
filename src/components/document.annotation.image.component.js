import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';

export default class Image extends Component {

  constructor(props){
    super(props);
    this.state = {
      inputEnabled:false,
      areaCoords:this.props.areaCoords,
      originalAreaCoords:this.props.areaCoords
    };

  }

  componentDidMount(){

  }

  handleEdit = () => {
    this.setState({inputEnabled:!this.state.inputEnabled});
    window.currentAnnotationEdition = {};
    window.currentAnnotationEdition.annotationId = this.props.annotationId;
    window.currentAnnotationEdition.annotationLabel = this.props.annotationLabel;
        //Fire Error: handleEditionState(true,"image",data);

    this.props.handleEditionState(true,"image",{annotationLabel:this.props.annotationLabel,annotationId:this.props.annotationId,areaCoords:this.state.areaCoords});

  };

  handleCancel = () => {
    this.setState({inputEnabled:!this.state.inputEnabled,areaCoords:this.state.originalAreaCoords});
    window.currentAnnotationEditionId = null;
  };

  handleSubmit = () => {
    this.setState({
      loading:true,
      inputEnabled:false
    });
  }

  render() {

    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;

    if(this.state.areaCoords && this.state.areaCoords !==null){
      var splitCoords = this.state.areaCoords.split(",");
      x1 = splitCoords[0];
      y1 = splitCoords[1];
      x2 = splitCoords[2];
      y2 = splitCoords[3];
    }

      var width = x2 - x1;
      var height = y2 - y1;

    return (
       
      <Container>
        {this.state.loading && <CircularProgress size="1.5rem" />}
        <Chip label="image" size="small" />
            {!this.state.inputEnabled?
                <IconButton color="primary" aria-label="Edit" onClick={this.handleEdit}>
                    <EditIcon />
                </IconButton>
                :
                <span>
                  <IconButton color="primary" aria-label="Save" onClick={this.handleSubmit}>
                      <SaveIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="Cancel" onClick={this.handleCancel}>
                      <CancelIcon />
                  </IconButton>
                </span>
            }
          {(this.state.areaCoords && this.state.areaCoords !==null)?
          <div style={{overflow:"hidden",width:width,height:height}}>
            <img alt={"image"+this.props.imageId} style={{margin:"-"+y1+"px 0px 0px -"+x1+"px"}} src={"data:image/png;base64,"+localStorage.getItem("image"+this.props.imageId)} />
          </div>
          :<div></div>
        }
        
      </Container>

    );
  }
};