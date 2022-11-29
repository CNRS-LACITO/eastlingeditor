import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayCircleFilledWhite';
import PauseIcon from '@material-ui/icons/PauseCircleFilled';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import CircularProgress from '@material-ui/core/CircularProgress';

import TextField from '@material-ui/core/TextField';

import AnnotationService from "../services/annotation.service";

import { withRouter } from 'react-router-dom';

class Rank extends Component {

  constructor(props){
    super(props);
    this.state = {
      inputEnabled:false,
      originalRank:props.rank,
      rank:props.rank
    };

  }

  componentDidMount(){
  }

  handleEdit = () => {
    this.setState({inputEnabled:!this.state.inputEnabled});
    window.currentAnnotationEdition = {id:this.props.annotationId,label:this.props.annotationLabel};
  };


  handleCancel = () => {
    this.setState({inputEnabled:!this.state.inputEnabled,start:this.state.originalStart,end:this.state.originalEnd});
    window.currentAnnotationEdition = null;
  };

  onRankChange = (event) => {
    this.setState({rank:event.target.value});
  }


  handleSubmit = () => {
    this.setState({
      loading:true,
      inputEnabled:false,
      originalRank:this.state.rank,
    });

    AnnotationService.update(this.props.annotationId,{rank:this.state.rank}).then(
      (response) => {
          this.setState({
            loading:false
          });
          this.props.annotationHasChanged(this.props.annotationId);
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

  componentDidUpdate(prevProps){

    if(prevProps.annotationId !== this.props.annotationId)
      this.setState({
        originalRank:this.props.rank,
        rank:this.props.rank
      });
  }

  render() {

    return (
      <Container style={{padding:0}}>
        {this.state.loading && <CircularProgress size="1.5rem" />}

          <TextField
            id={"rank"+this.props.id}
            label="Rank"
            disabled={!this.state.inputEnabled}
            value={this.state.rank || ''}
            onChange={this.onRankChange}
            size="small"
            style = {{width: "2rem"}}
            onMouseDown={(e) => {e.stopPropagation()}}
          />
          

            {!this.state.inputEnabled?
            <IconButton title="Edit" color="primary" aria-label="Edit" onClick={this.handleEdit}>
                <EditIcon />
            </IconButton>
            :
            <span>
              <IconButton title="Save" color="primary" aria-label="Save" onClick={this.handleSubmit}>
                  <SaveIcon />
              </IconButton>
              <IconButton title="Cancel" color="primary" aria-label="Cancel" onClick={this.handleCancel}>
                  <CancelIcon />
              </IconButton>
            </span>
            }


      </Container>

    );
  }
};

export default withRouter(Rank);