import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import OkIcon from '@material-ui/icons/Check';
import TextField from '@material-ui/core/TextField';
import FormService from "../services/form.service";
import AnnotationService from "../services/annotation.service";
import CircularProgress from '@material-ui/core/CircularProgress';

import { FormControl, FormControlLabel, Switch, InputLabel } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import { withRouter } from 'react-router-dom';

class SplitForm extends Component {

  constructor(props){
    super(props);

    var splittedForms = [];
    this.props.formToSplit.forEach((f) => {
      splittedForms.push({
        kindOf:f.kindOf,
        text:f.text.split(" ").join(' / ')
        });
    });
    
    this.state = {
      nbSegments:this.props.nbSegments,
      splitChar:" ",
      loading:false,
      verticalImageSplit:false,
      /*splittedForm:this.props.formToSplit.split(" ").join(' / '),*/
      splittedForms:splittedForms
    };

  }

    static getDerivedStateFromProps(nextProps, prevState) {

        var splittedForms = [];
        nextProps.formToSplit.forEach((f) => {
          splittedForms.push({
            kindOf:f.kindOf,
            text:f.text.split(" ").join(' / ')
            });
        });

          return{
            splittedForms:splittedForms
          };

    }

  onTextChange = (event) => {
    this.setState({nbSegments:event.target.value});
  }

  onSplitCharChange = (event) => {
    var splittedForms = [];
    this.props.formToSplit.forEach((f) => {
      splittedForms.push({
        kindOf:f.kindOf,
        text:f.text.split(event.target.value).join(' / ')
        });
    });

    event.target.value.length < 2 && this.setState({
      splitChar:event.target.value,
      //splittedForm:this.props.formToSplit.split(event.target.value).join(' / '),
      splittedForms: splittedForms,
      nbSegments:this.props.formToSplit[0].text.split(event.target.value).length
    });
  }

  componentDidMount(){

  }

  handleVerticalImageSplit = () => {
    this.setState({
      verticalImageSplit:!this.state.verticalImageSplit
    });
  }

  handleSubmit = () => {

    this.setState({
      loading:true,
      inputEnabled:false
    });

    var types = [];
    types['T']='S';types['S']='W';types['W']='M';
    var separators = [];
    separators['S']=' ';
    separators['W']='-';

    //const splittedForm = this.props.formToSplit.split(separators[this.props.parentType]);
    //const splittedForm = this.props.formToSplit.split(this.state.splitChar);
    var audioStep = 0;
    var imageStep = 0;
    var imageWidth = 0;
    var imageHeight = 0;
    var audioPadding = 0.1;
    var imagePadding = 2;

    var firstX1 = 0;
    var firstX2 = 0;


    if(this.props.audioStart && this.props.audioEnd && (this.props.audioEnd - this.props.audioStart) > 0){

      audioStep = (this.props.audioEnd - this.props.audioStart) / this.state.nbSegments;

    }

    if(this.props.imageCoords.length > 0){

      var firstImage = true;

      this.props.imageCoords.forEach((i) => {

        var coords = i.areaCoords.split(',');
        imageWidth += (coords[2]-coords[0]);
        imageHeight = Math.max(imageHeight,(coords[3]-coords[1]));
        var imagePaddingRelative = 0.008*imageWidth;

        imagePadding = (imagePaddingRelative > imagePadding)?imagePaddingRelative:imagePadding;

        if(firstImage){
          firstX1 = coords[0];
          firstX2 = coords[2];
          firstImage = false;
        }
      });

      imageStep = (this.state.verticalImageSplit)?(imageHeight / this.state.nbSegments):(imageWidth / this.state.nbSegments);
    
    }

    var isOnFirstImage = true;
    var imageToSplit;
    var j = 0;


    for(var k = 0; k < this.state.nbSegments ;k++){

      var splittedCoords = "";
      var audioSplitStart = 0;
      var audioSplitEnd = 0;

      if(this.props.imageCoords.length > 0){

        imageToSplit = (isOnFirstImage)?this.props.imageCoords[0]:this.props.imageCoords[1];
        var imageCoords = imageToSplit.areaCoords.split(',');
        var x1 = ((k-j) * imageStep) + imagePadding + parseFloat(imageCoords[0]);
        var x2 = ((k-j+1) * imageStep) - imagePadding + parseFloat(imageCoords[0]);

        if(this.state.verticalImageSplit){

          if(x1 > imageCoords[3]){
            j = k;
            isOnFirstImage = false;
          }

          var y1 = x1;
          var y2 = x2;

          splittedCoords = (parseFloat(imageCoords[0])+imagePadding)+","+y1+","+(parseFloat(imageCoords[2])-imagePadding)+","+y2+","+imageCoords[4];

        }else{

          if(x1 > imageCoords[2]){
            j = k;
            isOnFirstImage = false;
          }

          splittedCoords = x1+","+(parseFloat(imageCoords[1])+imagePadding)+","+x2+","+(parseFloat(imageCoords[3])-imagePadding)+","+imageCoords[4];

        }
      }
      
      if(this.props.audioStart && this.props.audioEnd && (this.props.audioEnd - this.props.audioStart) > 0){
        audioSplitStart = ((k * audioStep) + audioPadding) + parseFloat(this.props.audioStart);
        audioSplitEnd = (((k+1) * audioStep) - audioPadding) + parseFloat(this.props.audioStart);
      }


      var data={
        document_id:this.props.documentId,
        type:types[this.props.parentType],
        rank:(k+1),
        parent_id:this.props.parentId,
        imageCoords:[{
            "image_id":(imageToSplit!==undefined)?imageToSplit.image_id:null,
            "areaCoords":splittedCoords
          }],
        audioStart:parseFloat(audioSplitStart.toFixed(2)),
        audioEnd:parseFloat(audioSplitEnd.toFixed(2))
      };

      var checkToCreate = this.state.nbSegments;
      var countCreated = 0;
      
      AnnotationService.create(data).then(
      (response) => {

          if(this.props.formToSplit.length > 0){
            this.props.formToSplit.forEach((f) => {

              var splittedForm = f.text.split(this.state.splitChar);

              FormService.create(f.kindOf,splittedForm[response.data.rank-1] || '',response.data.id).then(
                (responseFormCreate) => {
                  countCreated++;
                  if(countCreated === (k*this.props.formToSplit.length)){
                    this.setState({
                      loading:false
                    });
                    this.props.refreshAnnotations(false,this.props.parentId);
                  }
                },
                error => {
                  this.setState({
                    loading:false
                  });

                  if(error.response.status===401) this.props.history.push('/login');

                  const resMessage =
                    (error.response &&
                      error.response.data &&
                      error.response.data.message) ||
                    error.message ||
                    error.toString();

                  alert(resMessage);
                }
              );

            });

            
          }else{//case if no transcription
            countCreated++;
            if(countCreated === k){
              this.setState({
                loading:false
              });
              this.props.refreshAnnotations(false,this.props.parentId);
            }
          }

          
        },
        error => {
          this.setState({
            loading:false
          });

          if(error.response.status===401) this.props.history.push('/login');

          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          alert(resMessage);
        });
        
    }


  };


  render() {
    
    var visibility = (this.props.hidden)?"none":"";

    return (
       
      <Container style={{display:visibility}}>

              <TextField
                label="Splitting character"
                placeholder="Splitting character"
                value={this.state.splitChar}
                onChange={this.onSplitCharChange}
              />
              <TextField
                label="Number of segments"
                placeholder="Number of segments"
                value={this.state.nbSegments}
                onChange={this.onTextChange}
              />
              <FormControlLabel
                  control={<Switch checked={this.state.verticalImageSplit} onChange={this.handleVerticalImageSplit} name="verticalImageSplit" />}
                  label={(this.state.verticalImageSplit)?"Vertical image split":"Horizontal image split"}
              />
                {
                  this.state.loading ? <CircularProgress size="1.5rem" /> :
                  <IconButton color="primary" aria-label="Save" onClick={this.handleSubmit} hidden={!this.state.nbSegments.length}>
                      <OkIcon />
                  </IconButton>
                }

                {this.state.splittedForms && this.state.splittedForms.length > 0 && this.state.splittedForms.map((form) => (
                     <p>
                      <small>{form.kindOf}: {form.text}</small>
                    </p>
                  ))}
               
      </Container>

    );
  }
};

export default withRouter(SplitForm);