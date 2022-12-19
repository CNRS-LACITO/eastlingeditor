import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import AddIcon from '@material-ui/icons/AddCircle';
import RemoveIcon from '@material-ui/icons/RemoveCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import CancelIcon from '@material-ui/icons/Cancel';
import SplitIcon from '@material-ui/icons/PowerInput';
import BeforeIcon from '@material-ui/icons/ArrowBack';
import NextIcon from '@material-ui/icons/ArrowForward';

import Chip from '@material-ui/core/Chip';
import Rank from './document.annotation.rank.component';
import Audio from './document.annotation.audio.component';
import Image from './document.annotation.image.component';
import Form from './document.annotation.form.component';
import Translation from './document.annotation.translation.component';
import Note from './document.annotation.note.component';

import TextItemCreateForm from './document.annotation.text.item.createform.component';
import SplitForm from './document.annotation.splitform.component';
import Button from '@material-ui/core/Button';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import FormService from "../services/form.service";
import TranslationService from "../services/translation.service";
import NoteService from "../services/note.service";
import AnnotationService from "../services/annotation.service";
import CircularProgress from '@material-ui/core/CircularProgress';

/*import { withRouter } from 'react-router-dom';*/

export default class DocumentAnnotation extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      //data:props.data,
      loading:false,
      expanded: (this.props.data.type === 'T' || (window.currentAnnotationEdition && this.props.data.id ===window.currentAnnotationEdition.id))?'panel1':false,
      //forms:this.props.data.forms,
      //translations:this.props.data.translations,
      //children:this.props.data.children_annotations,
      openNewForm:false,
      openNewTranslation:false,
      openNewNote:false,
      openSplit:false,
      nextChildRank:0,
      openDeleteDialog:false,
      audioKey:Date.now()
      //notes:this.props.data.notes
    };

  }

  static getDerivedStateFromProps(props, state) {
        if(props.data !== state.data){
            //Change in props
            return{
                data: props.data
            };
        }
        return null; // No change to state
  }

  handleDataChange = ()=>{

    this.refresh();

  };

  getUrlParameter (sVar) {
    return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  buildUrl(id = null){
      var params = new URLSearchParams(window.location.search);
      params.set('tab',this.getUrlParameter("tab"));
      //params.set('expanded',this.getUrlParameter("expanded"));
      params.set('annotationId',(id === null)?this.props.annotationId:id);
      var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString();
      window.history.pushState('test','',newUrl);
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
    this.setState({
      loading: true
    });

    window.coordinates = undefined;

    AnnotationService.delete(this.state.data.id).then(
      (response) => {
          this.props.refreshAnnotations();
          this.handleCloseDeleteDialog();
          this.setState({
            loading: false
          });
          this.refresh("children");
        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
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
  };


  handleAddChild = ()=>{
    var childTypes = {"T":"S","S":"W","W":"M"};
    var childType = childTypes[this.state.data.type];

    var data={
      document_id:this.state.data.document_id,
      type:childType,
      rank:this.state.nextChildRank,
      parent_id:this.state.data.id
    };


    AnnotationService.create(data).then(
        (response) => {
          this.setState({
            nextChildRank:this.state.nextChildRank+1
          });
          this.refresh("children");
          this.props.annotationHasChanged();
          window.coordinates = undefined;
        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
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
        }
      );

  }

  openNewFormForm = () => {
    this.setState({openNewForm:!this.state.openNewForm});
  }

  openNewTranslationForm = () => {
    this.setState({openNewTranslation:!this.state.openNewTranslation});
  }

  openNewNoteForm = () => {
    this.setState({openNewNote:!this.state.openNewNote});
  }

  openSplitForm = () => {
    this.setState({openSplit:!this.state.openSplit});
  }

  refresh = (type) => {
    //rafraîchit le contenu de l'annotation
    this.buildUrl();
    this.props.showAnnotation(this.state.data["document_id"],this.state.data.id,true);
  }

  componentDidMount(){

    var lastRank = (this.state.data.children_annotations && this.state.data.children_annotations.length > 0)
    ?
    Math.max.apply(Math, this.state.data.children_annotations.map(function(a) { return a.rank; }))
    :
    0
    ;
    this.setState({nextChildRank:lastRank+1});

  }


  navigatePrevNext = (direction) => {
    //this.setState({data:this.props.parentAnnotations})
    
    var annotationParent = this.props.parentAnnotations.filter(annotationParent => annotationParent.id === this.state.data.parent_id)[0];
    var annotationPrevNext = this.props.parentAnnotations.filter(annotation => (annotation.parent_id === annotationParent.id && annotation.type === this.state.data.type && annotation.rank === (this.state.data.rank + direction)));

    var annotationPrevNext = this.props.parentAnnotations.filter(annotation => (annotation.parent_id === annotationParent.id && annotation.type === this.state.data.type));
    annotationPrevNext = (direction === 1)?annotationPrevNext.filter(annotation => annotation.rank >= (this.state.data.rank + direction)).sort((a, b) => a.rank - b.rank):annotationPrevNext.filter(annotation => annotation.rank <= (this.state.data.rank + direction)).sort((a, b) => b.rank - a.rank);

    if(annotationPrevNext.length > 0){
      var idPrevNext = annotationPrevNext[0].id;

      this.buildUrl(idPrevNext);
      this.props.showAnnotation(this.state.data["document_id"],idPrevNext);

    }
  }

  render() {

    console.log(this.state.data);

    var parentAnnotationLabel = this.props.parentAnnotations.filter((p)=>p.id === this.state.data.parent_id);

    var parentLabel = (this.state.data.type !== 'T' && parentAnnotationLabel.length===1)?parentAnnotationLabel[0].label:'';

    return (
      <div>
          <Grid container>
            <Grid item xs={1}>
              <Container>
                <Chip
                    label={this.state.data.type+this.state.data.rank}
                    size="small"
                    color="default"
                  />
              </Container>

              <Container>

                <Chip
                  size="small"
                  color="primary"
                  label={parentLabel}
                  onClick={()=>this.props.showAnnotation(this.state.data.document_id,this.state.data.parent_id)}
                />


              </Container>

              <Container>
                <Rank
                  annotationId={this.state.data.id}
                  rank={this.state.data.rank}
                  annotationHasChanged={this.props.annotationHasChanged}
                >
                </Rank>
              </Container>

              {(1===1) && <Container style={{display:"inline-flex"}}>
                  <IconButton title="Previous" aria-label="Previous" onClick={() => this.navigatePrevNext(-1)}>
                    <BeforeIcon />
                  </IconButton>
                  <IconButton title="Next" aria-label="Next" onClick={() => this.navigatePrevNext(1)}>
                    <NextIcon />
                  </IconButton>
                </Container>
              }

            </Grid>

            <Grid item xs={10}>
              <Container item xs={6}>
                {
                  (this.state.data.type !== 'T') && (window.wavesurfer !== null) &&
                  <Audio
                    key={this.state.audioKey}
                    handleDataChange={this.handleDataChange} 
                    handleEditionState={this.props.handleEditionState} 
                    audioStart={this.state.data.audioStart} 
                    audioEnd={this.state.data.audioEnd} 
                    annotationId={this.state.data.id} 
                    annotationLabel={this.state.data.type+this.state.data.rank}
                  />
                }
              </Container>

              <Container item xs={6}>
                    {
                      (this.state.data.type !== 'T') && 
                      <Image 
                        imageCoords={this.state.data.imageCoords} 
                        handleEditionState={this.props.handleEditionState}
                        annotationId={this.state.data.id} 
                        annotationLabel={this.state.data.type+this.state.data.rank} 
                      />
                    }
              </Container>

              <Container item xs={6}>
                <Container item  xs={12}>
                  
                  <Chip
                    icon={this.state.openNewForm ? <RemoveIcon /> : <AddIcon /> }
                    label="form"
                    clickable
                    size="small"
                    color="primary"
                    onClick={this.openNewFormForm}
                  />
                  <TextItemCreateForm 
                  type="form" 
                  parentId={this.state.data.id} 
                  refresh={this.refresh} 
                  hidden={!this.state.openNewForm}
                  available_lang={this.props.available_kindOf}
                  />
                  
                  {/*this.state.forms && this.state.forms.length > 0 && this.state.forms.map((form) => (*/}
                  {this.state.data.forms && this.state.data.forms.length > 0 && this.state.data.forms.map((form) => (
                    <Form
                      data={form}
                      refresh={this.refresh}
                      available_lang={this.props.available_kindOf}
                      note_available_lang={this.props.available_lang}
                    />
                  ))}

                </Container>

                <Container item xs={12}>
                  <Typography variant="h5" gutterBottom>
                  </Typography>
                  
                  <Chip
                    icon={this.state.openNewTranslation ? <RemoveIcon /> : <AddIcon /> }
                    label="translation"
                    clickable
                    size="small"
                    color="primary"
                    onClick={this.openNewTranslationForm}
                  />
                  <TextItemCreateForm 
                  type="translation" 
                  parentId={this.state.data.id} 
                  refresh={this.refresh} 
                  hidden={!this.state.openNewTranslation} 
                  available_lang={this.props.available_lang}
                  />
                  {this.state.data.translations && this.state.data.translations.length >0 && this.state.data.translations.map((translation) => (
                    <Translation
                      data={translation}
                      refresh={this.refresh}
                      available_lang={this.props.available_lang}
                      note_available_lang={this.props.available_lang}
                    />
                  ))}

                </Container>

                <Container item xs={12}>
                  <Chip
                      icon={this.state.openNewNote ? <RemoveIcon /> : <AddIcon /> }
                      label="note"
                      clickable
                      size="small"
                      color="primary"
                      onClick={this.openNewNoteForm}
                    />
                    <TextItemCreateForm 
                    type="note" 
                    parentId={this.state.data.id}
                    parentType="annotation" 
                    refreshNotesParent={() => this.refresh('note')} 
                    hidden={!this.state.openNewNote}
                    available_lang={this.props.available_lang}
                    />
                  {this.state.data.notes && this.state.data.notes.length > 0 && this.state.data.notes.map((note) => (
                      <Note
                        data={note}
                        refreshNotesParent={() => this.refresh('note')}
                        available_lang={this.props.available_lang}
                        parent_type={this.props.type}
                      />
                    ))}
                </Container>

              {(this.state.data.type !== 'M' && this.state.data.children_annotations && this.state.data.children_annotations.length===0) && <Container item xs={12}>
                  <Typography variant="h5" gutterBottom>
                  </Typography>
                  <Chip
                  clickable
                    icon=<SplitIcon />
                    label="auto-split"
                    size="small"
                    color="primary"
                    onClick={this.openSplitForm}
                  />
                  <SplitForm 
                  parentId={this.state.data.id}
                  parentType={this.state.data.type}
                  refreshAnnotations={this.props.refreshAnnotations} 
                  hidden={!this.state.openSplit}
                  nbSegments={(this.state.data.forms.length>0)?this.state.data.forms[0].text.split(' ').length:2}
                  audioStart={this.state.data.audioStart}
                  audioEnd={this.state.data.audioEnd}
                  imageCoords={this.state.data.imageCoords}
                  formToSplit = {(this.state.data.forms.length>0)?this.state.data.forms[0].text:""}
                  kindOf = {(this.state.data.forms.length>0)?this.state.data.forms[0].kindOf:""}
                  documentId = {this.state.data["document_id"]}
                  />
              </Container>
              }

              <Container>
              <Chip label="children" size="small" color="primary"
              />
              {(this.state.data.type !== 'M' && this.state.data.children_annotations && this.state.data.children_annotations.length>0) && 
                  this.state.data.children_annotations.sort((a, b) => a.rank - b.rank).map((item,i)=>{
                    return <Chip
                       key={item.id}
                       clickable
                         label={item.type+item.rank}
                         size="small"
                         color="primary"
                         onClick={() => this.props.showAnnotation(this.state.data.document_id,item.id)}
                       />
                  })
              }
              </Container>

                {this.state.data.type !== 'T' && 
                  <IconButton color="primary" title="Delete" aria-label="Delete" onClick={this.handleOpenDeleteDialog} title="Delete annotation">
                    <DeleteIcon />
                  </IconButton>
                }
              </Container>
            </Grid>

            <Grid item xs={1}>
              <Container>
                <IconButton title="Close" aria-label="Close" onClick={this.props.onClose}>
                  <CancelIcon />
                </IconButton>
              </Container>
            </Grid>
 
          </Grid>

          <Dialog open={this.state.openDeleteDialog} onClose={this.handleCloseDeleteDialog} aria-labelledby="form-deletedialog-title">
            <DialogTitle id="form-deletedialog-title">Delete annotation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Delete annotation {this.state.data.type+this.state.data.rank} ?
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

        </div>
    );
  }
};

/*export default withRouter(DocumentAnnotation);*/