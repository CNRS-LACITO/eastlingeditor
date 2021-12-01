import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddCircle';
import RemoveIcon from '@material-ui/icons/RemoveCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import Chip from '@material-ui/core/Chip';
import Audio from './document.annotation.audio.component';
import Image from './document.annotation.image.component';
import Form from './document.annotation.form.component';
import Translation from './document.annotation.translation.component';
import TextItemCreateForm from './document.annotation.text.item.createform.component';
import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormService from "../services/form.service";
import TranslationService from "../services/translation.service";
import AnnotationService from "../services/annotation.service";
import CircularProgress from '@material-ui/core/CircularProgress';

import { withRouter } from 'react-router-dom';

class DocumentAnnotationRecursive extends Component {

  constructor(props){
    super(props);
    this.state = {
      loading:false,
      expanded: (this.props.data.type === 'T' || (window.currentAnnotationEdition && this.props.data.id ===window.currentAnnotationEdition.id))?'panel1':false,
      forms:this.props.data.forms,
      translations:this.props.data.translations,
      children:this.props.data.children_annotations,
      audioStart:this.props.data.audioStart,
      audioEnd:this.props.data.audioEnd,
      openNewForm:false,
      openNewTranslation:false,
      nextChildRank:0,
      openDeleteDialog:false
    };

  }

  handleExpand = (panel) => (event, isExpanded) => {
    this.setState({expanded: isExpanded ? panel : false});
  };

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
    AnnotationService.delete(this.props.data.id).then(
      (response) => {
          //window.location.reload();
          this.props.annotationHasChanged();
          this.handleCloseDeleteDialog();
          this.setState({
            loading: false
          });
          this.props.toggleAnnotationsDrawer(true,false);
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
    var childType = childTypes[this.props.data.type];

    var data={
      document_id:this.props.data.document_id,
      type:childType,
      rank:this.state.nextChildRank,
      parent_id:this.props.data.id
    };


    AnnotationService.create(data).then(
        (response) => {
          this.setState({
            nextChildRank:this.state.nextChildRank+1
          });
          this.refresh("children");
          this.props.annotationHasChanged();
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

  openNewTranslationForm = () => {
    this.setState({openNewTranslation:!this.state.openNewTranslation});
  }

  openNewFormForm = () => {
    this.setState({openNewForm:!this.state.openNewForm});
  }

  refresh = (type) => {
    //rafraîchit le contenu de l'annotation
    this.props.annotationHasChanged();
    
    type==="form" && this.setState({openNewForm:false});
    type==="translation" && this.setState({openNewTranslation:false});

    type==="form" && FormService.getAnnotationForms(this.props.data.id).then(
      (response) => {
          this.setState({
            forms:response.data
          });
        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
          this.setState({
            loading:false
          });
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          alert(resMessage);
        });

    type==="translation" && TranslationService.getAnnotationTranslations(this.props.data.id).then(
      (response) => {
          this.setState({
            translations:response.data
          });
        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
          this.setState({
            loading:false
          });
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          alert(resMessage);
        });

    type==="children" && AnnotationService.getAnnotationChildren(this.props.data.id).then(
      (response) => {
          this.setState({
            children:response.data
          });
        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
          this.setState({
            loading:false
          });
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          alert(resMessage);
        });

  }

  componentDidMount(){
    var lastRank = (this.state.children && this.state.children.length > 0)
    ?
    Math.max.apply(Math, this.state.children.map(function(a) { return a.rank; }))
    :
    0
    ;
    this.setState({nextChildRank:lastRank+1});
  }

  render() {
    //console.log('render Annotation '+this.props.data.type+this.props.data.id);
    const hasChildren = this.state.children && this.state.children.length > 0;

    const typeLabels = [
      {key:"T",label:"text",childrenLabel:"sentence"},
      {key:"S",label:"sentence",childrenLabel:"word"},
      {key:"W",label:"word",childrenLabel:"morph"},
      {key:"M",label:"morph",childrenLabel:""}
    ];

    var typeLabel = typeLabels.filter((type) => type.key===this.props.data.type)[0];
    
    return (
       <Accordion 
         expanded={this.state.expanded === 'panel1'} 
         onChange={this.handleExpand('panel1')}
         className={"block block"+this.props.data.type}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          {
            this.props.data.type !== 'T'?
            (<Container>
            <Chip label={typeLabel.label} size="small"/>

            <Chip label={this.props.data.type+this.props.data.rank} size="small" color="secondary" />
            {(this.state.forms && this.state.forms.length)?this.state.forms[0].text.substring(0,50)+(this.state.forms[0].text>50?"...":""):''}

            </Container>
            )
            :
            (<Container>
              <Chip label={typeLabel.label} size="small"/>
            </Container>
            )
          }
          {this.props.data.type !== 'T' && 
            <IconButton color="primary" aria-label="Delete" onClick={this.handleOpenDeleteDialog}>
              <DeleteIcon />
            </IconButton>
          }
        </AccordionSummary>
        <AccordionDetails>
          <Container container spacing={2}>

            <Container item xs={6}>
              {
                (this.props.data.type !== 'T') && (window.wavesurfer !== null) &&
                <Audio 
                  annotationHasChanged={this.props.annotationHasChanged} 
                  handleEditionState={this.props.handleEditionState} 
                  audioStart={this.state.audioStart} 
                  audioEnd={this.state.audioEnd} 
                  annotationId={this.props.data.id} 
                  annotationLabel={this.props.data.type+this.props.data.rank} 
                />
              }
            </Container>

            <Container item xs={6}>
                  {
                  (this.props.data.type !== 'T') && 
                  <Image 
                    imageId={this.props.data["image_id"]} 
                    areaCoords={this.props.data.areaCoords} 
                    handleEditionState={this.props.handleEditionState}
                    annotationId={this.props.data.id} 
                    annotationLabel={this.props.data.type+this.props.data.rank} 
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
                <TextItemCreateForm type="form" annotationId={this.props.data.id} refresh={this.refresh} hidden={!this.state.openNewForm}/>
                {this.state.forms && this.state.forms.length > 0 && this.state.forms.map((form) => (
                  <Form data={form} refresh={this.refresh} />
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
                <TextItemCreateForm type="translation" annotationId={this.props.data.id} refresh={this.refresh} hidden={!this.state.openNewTranslation} />
                {this.state.translations && this.state.translations.length >0 && this.state.translations.map((translation) => (
                  <Translation data={translation} refresh={this.refresh}/>
                ))}

              </Container>
            </Container>
            
            <Container item xs={6}>
              
              {hasChildren && this.state.children.map((annotation) => (
              <DocumentAnnotationRecursive 
                data={annotation} 
                documentType={this.props.documentType} 
                annotationHasChanged={this.props.annotationHasChanged} 
                handleEditionState={this.props.handleEditionState}
                toggleAnnotationsDrawer={this.props.toggleAnnotationsDrawer}
              />
            ))}
              <Chip
                    icon={ <AddIcon /> }
                    label={typeLabel.childrenLabel}
                    clickable
                    size="small"
                    color="primary"
                    onClick={this.handleAddChild}
                  />
                
            </Container>
          </Container>

          <Dialog open={this.state.openDeleteDialog} onClose={this.handleCloseDeleteDialog} aria-labelledby="form-createdialog-title">
            <DialogTitle id="form-deletedialog-title">Delete annotation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Delete annotation {this.props.data.type+this.props.data.rank} ?
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

        </AccordionDetails>
      </Accordion>

    );
  }
};

export default withRouter(DocumentAnnotationRecursive);