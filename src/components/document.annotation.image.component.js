import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';

import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import AddIcon from '@material-ui/icons/Add';

export default class Image extends Component {

  constructor(props){
    super(props);
    this.state = {
      inputEnabled:false,
      imageCoords:this.props.imageCoords,
      originalImageCoords:this.props.imageCoords
    };

  }

  componentDidMount(){

  }

  handleEdit = () => {
    //this.setState({inputEnabled:!this.state.inputEnabled});
    window.currentAnnotationEdition = {};
    window.currentAnnotationEdition.annotationId = this.props.annotationId;
    window.currentAnnotationEdition.annotationLabel = this.props.annotationLabel;
    window.currentAnnotationEdition.imageAddition = false;
    window.currentAnnotationEdition.imageCoords = this.props.imageCoords;
    this.props.handleEditionState(true,"image",{annotationLabel:this.props.annotationLabel,annotationId:this.props.annotationId,imageCoords:this.state.imageCoords});
  };

  handleEditImageAddition = () => {
    //this.setState({inputEnabled:!this.state.inputEnabled});
    window.currentAnnotationEdition = {};
    window.currentAnnotationEdition.annotationId = this.props.annotationId;
    window.currentAnnotationEdition.annotationLabel = this.props.annotationLabel;
    window.currentAnnotationEdition.imageAddition = true;
    window.currentAnnotationEdition.imageCoords = this.props.imageCoords;
    this.props.handleEditionState(true,"image",{annotationLabel:this.props.annotationLabel,annotationId:this.props.annotationId,imageCoords:this.state.imageCoords});
  };

/*no need
  handleCancel = () => {
    this.setState({inputEnabled:!this.state.inputEnabled,imageCoords:this.state.originalImageCoords});
    window.currentAnnotationEditionId = null;
  };
*/

  render() {

    var imageElements = [];

    this.props.imageCoords && this.props.imageCoords.forEach((i)=>{

      var splitCoords = i.areaCoords.split(",");
      var x1 = 0;
      var y1 = 0;
      var x2 = 0;
      var y2 = 0;
      var ratio = 1;

      ratio = 1/splitCoords[4];
      x1 = splitCoords[0];
      y1 = splitCoords[1];
      x2 = splitCoords[2];
      y2 = splitCoords[3];
      
/*
      var width = x2 - x1;
      var height = y2 - y1;
*/
      var width = (splitCoords[2] - splitCoords[0]);
      var height = (splitCoords[3] - splitCoords[1]);

      //const img = new Image(); //BUG conflit nom de classe courante avec javascript
      /*
      var img = document.createElement('img');
      img.src = "data:image/png;base64,"+window.imagesMap.filter((image)=>image.id === i.image_id)[0].content;
*/
      var cssBGPosition = '-' + splitCoords[0] + 'px -' + splitCoords[1] + 'px';  

      const imgStyle = {
        backgroundPosition: cssBGPosition,
        'width': width + 'px',
        'height': height + 'px',
        'padding': '0px',
        'border': '0px',
        objectFit: 'none',
        objectPosition:cssBGPosition,
        maxWidth : 'inherit !important',
        transform: 'scale('+ratio+')',
        transformOrigin: 'left top',
      };

      (window.imagesMap.filter((image)=>image.id === i.image_id).length > 0) && imageElements.push(
          //<div style={{position:'relative',textAlign:'initial'}}>
          //<div style={{overflow:"hidden",width:width,height:height}}>
          <div>
            <img 
              alt={"image"+i.image_id}
              //style={{margin:"-"+y1+"px 0px 0px -"+x1+"px",maxWidth:width}}
              style={imgStyle} 
              width={width} 
              height={height} 
              /*src={image.src}*/
              src={"data:image/png;base64,"+window.imagesMap.filter((image)=>image.id === i.image_id)[0].content}
            />
          </div>
        );

      });
    

    return (
       
      <Container>
        {this.state.loading && <CircularProgress size="1.5rem" />}
        <Chip label="image" size="small" />
                <IconButton color="primary" aria-label="Edit" onClick={this.handleEdit}>
                    <EditIcon />
                </IconButton>
            <div>{imageElements}</div>
            {(imageElements.length > 0)?
                <IconButton color="primary" aria-label="Edit" onClick={this.handleEditImageAddition}>
                    <AddIcon />
                </IconButton>
                :
                <span></span>
            }
        
      </Container>

    );
  }
};