/*
https://medium.com/trackstack/simple-audio-waveform-with-wavesurfer-js-and-react-ae6c0653b240
https://github.com/katspaugh/window.wavesurfer.js/blob/master/example/annotation/app.js
*/
import React, { Component } from 'react';
//import Grid from '@material-ui/core/Grid';

import { Button } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import AnnotationService from "../services/annotation.service";
import CircularProgress from '@material-ui/core/CircularProgress';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import Tree from "react-animated-tree-v2";
import { withRouter } from 'react-router-dom';


window.wavesurfer = null;

class DocumentAnnotationsTree extends React.Component {

  constructor(props){

    super(props);
    this.state = {
      selectedTreeAnnotations:[],
      loading:false,
      openDeleteDialog:false,
    }
  }



  handleCheckTree = (e) => {
    
    var array = this.state.selectedTreeAnnotations;
    var annotation = e.target.value.split('_');

    if(e.target.checked){
      array.push({
        id:annotation[0],
        type:annotation[1].substr(0,1),
        label:annotation[1]
      });
    }else{
      array = array.filter(item => (item.id !== annotation[0] || item.type !== annotation[1].substr(0,1)));
    }
    
    this.setState({
      selectedTreeAnnotations:array
    });
  }


  sortTree = (annotation) =>{
    var that = this;

    var children = this.props.parentAnnotations.filter((a)=>a.parent_id === annotation.id);
    children && children.sort((a, b) =>  a.rank - b.rank);


    return (
        <Tree 
          itemId={"tree_"+annotation.id}
          key={annotation.id}
          canHide
          content=""
          type={<FormControlLabel
            label={annotation.label}
            control={
              <Checkbox
                onChange={that.handleCheckTree}
                value={annotation.id+'_'+annotation.type+annotation.rank}
                name="checkedTree"
                color="primary"
                disabled={annotation.label ==='TEXT'}
              />
            }
        />
        }
          onClick={() => this.props.showAnnotation(this.props.documentId,annotation.id)}
          open
          style={{overflow:"initial"}}
          >

          {children.length >=0 && children.map((c)=>that.sortTree(c))}
        </Tree>
      );
  }

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

  handleDeleteAnnotation = (event) => {
    //todo
    this.setState({
      loading: true
    });

    var checkToDel = this.state.selectedTreeAnnotations.length;
    var countDeleted = 0;

    this.state.selectedTreeAnnotations.forEach((a)=>{

      AnnotationService.delete(a.id).then(
      (response) => {
          countDeleted++;

          if(countDeleted === checkToDel){
            this.setState({
              loading: false,
              openDeleteDialog:false
            });

            this.props.refreshAnnotations();
          }
            
          
        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
          if(error.response.status===404) this.setState({
              loading: false,
              openDeleteDialog:false
            });

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

    });
  };

  render = () => {
    this.props.parentAnnotations.sort((a, b) =>  a.label < b.label ? -1 : a.label > b.label ? 1 : 0);

    for (var i = 0; i < this.props.parentAnnotations.length; ++i) {
      if (this.props.parentAnnotations[i].label === 'TEXT') {
         var temp = this.props.parentAnnotations[i];
         this.props.parentAnnotations.splice(i, 1);
         this.props.parentAnnotations.unshift(temp);
         break;
      }
   }


    return (
      <div key={this.props.key}>

          <Dialog open={this.state.openDeleteDialog} onClose={this.handleCloseDeleteDialog} aria-labelledby="form-deletedialog-title">
            <DialogTitle id="form-deletedialog-title">Delete annotation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Delete annotation(s) ?
                {
                  this.state.selectedTreeAnnotations.map((a) => (
                  ' '+a.label
                ))}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleCloseDeleteDialog} color="primary">
                Cancel
              </Button>
              {!this.state.loading && <Button onClick={this.handleDeleteAnnotation} color="primary">
                Delete annotation
              </Button>
              }
              {this.state.loading && <CircularProgress />}
            </DialogActions>
          </Dialog>

          <Chip
            icon={<DeleteIcon />}
            label="Delete selected annotation(s)"
            clickable
            size="small"
            color="primary"
            onClick={this.handleOpenDeleteDialog}
            style={{width:"fit-content",display:((this.state.selectedTreeAnnotations.length===0)?'none':'inline-flex')}}
          />
          {this.props.parentAnnotations.length>0 && this.sortTree(this.props.parentAnnotations[0])}

      </div>
    );
  }
};

export default withRouter(DocumentAnnotationsTree);