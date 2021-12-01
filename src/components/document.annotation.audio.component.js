import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayCircleFilledWhite';
import PauseIcon from '@material-ui/icons/PauseCircleFilled';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import MouseIcon from '@material-ui/icons/Mouse';
import CancelIcon from '@material-ui/icons/Cancel';
import CircularProgress from '@material-ui/core/CircularProgress';

import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';

import AnnotationService from "../services/annotation.service";

import { withRouter } from 'react-router-dom';

class Audio extends Component {

  constructor(props){
    super(props);
    this.state = {
      playing: false,
      inputEnabled:false,
      originalStart:props.audioStart,
      originalEnd:props.audioEnd,
      start:props.audioStart,
      end:props.audioEnd
    };

  }

  componentDidMount(){
  }

  handleEdit = () => {
    this.setState({inputEnabled:!this.state.inputEnabled});
    window.currentAnnotationEdition = {id:this.props.annotationId,label:this.props.annotationLabel};
    //window.wavesurfer.disableDragSelection();
    window.wavesurfer.regions.list[this.props.annotationId] && window.wavesurfer.regions.list[this.props.annotationId].remove();
           window.wavesurfer.addRegion({
            id:this.props.annotationId,
            start: this.state.start,
            end: this.state.end,
            drag: true,
            resize: true,
            color:"rgba(0,0,0,0.2)",

          });

  };

  handleMouseSelection = () => {
    this.props.handleEditionState(true,"audio",{annotationLabel:this.props.annotationLabel,annotationId:this.props.annotationId,start:this.state.start,end:this.state.end});
    //this.props.handleExpand('panel1');
  };

  handleCancel = () => {
    this.setState({inputEnabled:!this.state.inputEnabled,start:this.state.originalStart,end:this.state.originalEnd});
    window.currentAnnotationEdition = null;
  };

  handlePlay = () => {
    this.setState({ playing: !this.state.playing });
    window.wavesurfer.isPlaying()?window.wavesurfer.pause():window.wavesurfer.play(this.state.start,this.state.end);
    window.wavesurfer.on('pause',()=>{this.setState({ playing: false });})
  };

  onStartChange = (event) => {
    this.setState({start:event.target.value});
  }

  onEndChange = (event) => {
    this.setState({end:event.target.value});
  }


  handleSubmit = () => {
    this.setState({
      loading:true,
      inputEnabled:false,
      originalStart:this.state.start,
      originalEnd:this.state.end,
    });

    AnnotationService.update(this.props.annotationId,{audioStart:this.state.start,audioEnd:this.state.end}).then(
      (response) => {
          this.setState({
            loading:false
          });
          //this.props.annotationHasChanged();
          window.currentAnnotationEdition=null;
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

  render() {

       window.wavesurfer.regions.list[this.props.annotationId] && window.wavesurfer.regions.list[this.props.annotationId].remove();
           window.wavesurfer.addRegion({
            id:this.props.annotationId,
            start: this.state.start,
            end: this.state.end,
            drag: false,
            resize: false,
            color:"rgba(0,0,0,0.2)",
          });

      window.wavesurfer.markers.markers
      .filter((m)=>m.label ===this.props.annotationLabel)
      .forEach((marker,index)=>{window.wavesurfer.markers.remove(index);});

      //window.wavesurfer.markers.remove
      this.props.annotationLabel &&
        window.wavesurfer.addMarker({
          time: this.state.start,
          label: this.props.annotationLabel,
          color: (this.props.annotationLabel.substring(0,1)==="S")?"red":"blue",
          position: (this.props.annotationLabel.substring(0,1)==="S")?"bottom":"top"
        });
    

    return (
      <Container>
        {this.state.loading && <CircularProgress size="1.5rem" />}
        <Chip label="audio" size="small" />
          <IconButton color="primary" aria-label="Play" onClick={this.handlePlay}>
            {!this.state.playing ? <PlayIcon /> : <PauseIcon /> }
          </IconButton>
          <TextField
            id={"start"+this.props.id}
            label="Start"
            disabled={!this.state.inputEnabled}
            value={this.state.start}
            onChange={this.onStartChange}
            size="small"
            style = {{width: "5rem"}}
          />
          
          <TextField
            id={"end"+this.props.id}
            label="End"
            disabled={!this.state.inputEnabled}
            value={this.state.end}
            onChange={this.onEndChange}
            size="small"
            style = {{width: "5rem"}}
          />
            {!this.state.inputEnabled?
            <IconButton title="Edit" color="primary" aria-label="Edit" onClick={this.handleEdit}>
                <EditIcon />
            </IconButton>
            :
            <span>
              <IconButton title="Select on waveform" color="primary" aria-label="Save" onClick={this.handleMouseSelection}>
                  <MouseIcon />
              </IconButton>
              <IconButton title="Save" color="primary" aria-label="Save" onClick={this.handleSubmit}>
                  <SaveIcon />
              </IconButton>
              <IconButton title="Cancel" color="primary" aria-label="Cancel" onClick={this.handleCancel}>
                  <CancelIcon />
              </IconButton>
            </span>
            }
          <IconButton title="Delete" color="primary" aria-label="Delete">
              <DeleteIcon />
          </IconButton>

      </Container>

    );
  }
};

export default withRouter(Audio);