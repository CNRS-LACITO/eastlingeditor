//Same component used for Form/Translation/Note

import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddCircle';
import RemoveIcon from '@material-ui/icons/RemoveCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextItemCreateForm from './document.annotation.text.item.createform.component';

import Note from './document.annotation.note.component';

import FormService from "../services/form.service";
import TranslationService from "../services/translation.service";
import NoteService from "../services/note.service";
import { withRouter } from 'react-router-dom';

export default class TextItem extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      text:this.props.text,
      lang:this.props.lang,
      originalText:this.props.text,
      originalLang:this.props.lang,
      expanded: false,
      inputEnabled: false,
      loading:false,
      openNewNote:false,
      notes:this.props.notes
    };

  }

  handleExpand = (panel) => (event, isExpanded) => {
    this.setState({expanded: isExpanded ? panel : false});
  };

  handleEdit = () => {
    this.setState({
      inputEnabled:!this.state.inputEnabled,
      text:this.props.text,
      lang:this.props.lang
    });
  };

  onLangChange = (event) => {
    this.setState({lang:event.target.value});
  }

  onTextChange = (event) => {
    this.setState({text:event.target.value});
  }

  handleCancel = () => {
    this.setState({inputEnabled:!this.state.inputEnabled,lang:this.state.originalLang,text:this.state.originalText});
  };


  handleDelete = () => {
    this.setState({
      loading:true,
      inputEnabled:false
    });

    this.props.type==='form' && FormService.delete(this.props.id).then(
      (response) => {
          this.props.refresh('form');
        },
        error => {
          this.setState({
            inputEnabled:true,
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

    this.props.type==='translation' && TranslationService.delete(this.props.id).then(
      (response) => {
          this.props.refresh('translation');
        },
        error => {
          this.setState({
            inputEnabled:true,
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

    this.props.type==='note' && NoteService.delete(this.props.id).then(
      (response) => {

          this.setState({
            inputEnabled:false,
            loading:false
          },this.props.refreshNotesParent());
          
        },
        error => {
          this.setState({
            inputEnabled:true,
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

  };


  handleSubmit = () => {

    this.setState({
      loading:true,
      inputEnabled:false
    });


    this.props.type==='form' && FormService.update(this.props.id,this.state.lang,this.state.text).then(
      (response) => {
          this.setState({
            inputEnabled:false,
            originalLang:this.state.lang,
            originalText:this.state.text,
            expanded:false,
            loading:false
          });
          this.props.refresh('form');
        },
        error => {
          this.setState({
            inputEnabled:true,
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

    this.props.type==='translation' && TranslationService.update(this.props.id,this.state.lang,this.state.text).then(
      (response) => {
          this.setState({
            inputEnabled:false,
            originalLang:this.state.lang,
            originalText:this.state.text,
            expanded:false,
            loading:false
          });
          this.props.refresh('translation');
        },
        error => {
          this.setState({
            inputEnabled:true,
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

    this.props.type==='note' && NoteService.update(this.props.id,this.state.lang,this.state.text).then(
      (response) => {
            this.setState({
              inputEnabled:false,
              loading:false
            },this.props.refreshNotesParent());
          },
        error => {
          this.setState({
            inputEnabled:true,
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

  };

  openNewNoteForm = () => {
    this.setState({openNewNote:!this.state.openNewNote});
  }

  componentDidMount = () => {
    this.refreshNotes();
  }

  componentDidUpdate(prevProps){
    //console.log('compdidupdate',prevProps.text,this.state.text);
    (prevProps.id !== this.props.id) && 
      this.setState({
        text:this.props.text,
        lang:this.props.lang,
        originalText:this.props.text,
        originalLang:this.props.lang,
        inputEnabled: false,
        loading:false,
      },this.refreshNotes());

  }

  refreshNotes = () => {
    //rafraîchit le contenu de l'annotation
      this.props.type === 'translation' && TranslationService.get(this.props.id).then(
        (response) => {
          this.setState({
            notes:response.data.notes
          });
        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');

          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          alert(resMessage);
        });

      this.props.type === 'form' && FormService.get(this.props.id).then(
        (response) => {
          this.setState({
            notes:response.data.notes
          });
        },
        error => {
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
   
    return (
       
      <Container>

        <Accordion 
         expanded={this.state.expanded === 'panel1'} 
         onChange={this.handleExpand('panel1')}
         >
           <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
          <Chip label={this.props.type} size="small" />

          <Chip label={this.props.lang} size="small" color="primary" variant="outlined" />

          {this.props.text.substring(0,50)}{this.props.text.length>50?"...":""}

          </AccordionSummary>
          <AccordionDetails>

            <Grid container>
              <Grid item  xs={2}>
                  <FormControl>
                    <InputLabel htmlFor="select-lang">
                      {this.props.type === "form"?"Kind of form":"Language"}
                    </InputLabel>
                    <Select
                      native
                      value={this.state.lang}
                      inputProps={{
                        id: 'select-lang',
                      }}
                      onChange={this.onLangChange}
                    >
                      {this.props.available_lang.map((a) => (
                        <option value={a}>
                          {a}
                        </option>
                      ))}

                    </Select>
                  </FormControl>
              </Grid>


                <Grid item  xs={10}>
                  <TextField
                    id={this.props.type+this.props.id}
                    label={this.props.type === "form"?"Form text":"Text"}
                    placeholder={this.props.type === "form"?"Form text":"Text"}
                    multiline
                    disabled={!this.state.inputEnabled}
                    fullWidth
                    rowsMax={4}
                    value={this.state.text}
                    onChange={this.onTextChange}
                    onMouseDown={(e) => {e.stopPropagation()}}
                  />
                </Grid>
              </Grid>

              {
                this.state.loading ? <CircularProgress size="1.5rem" />
              :
              (
                !this.state.inputEnabled ?
                <div>
                  <IconButton color="primary" aria-label="Edit" onClick={this.handleEdit}>
                      <EditIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="Delete" onClick={this.handleDelete}>
                    <DeleteIcon />
                  </IconButton>
                </div>
                :
                <div>
                  <IconButton color="primary" aria-label="Save" onClick={this.handleSubmit}>
                      <SaveIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="Cancel" onClick={this.handleCancel}>
                      <CancelIcon />
                  </IconButton>
                </div>
                
                )
              }

              {this.props.type !== 'note' && 
              <Grid container>
                <Grid item xs={12}>
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
                  parentId={this.props.id}
                  parentType={this.props.type} 
                  refresh={this.props.refresh}
                  refreshNotesParent={this.refreshNotes} 
                  hidden={!this.state.openNewNote}
                  available_lang={this.props.note_available_lang}
                  />
                {this.state.notes && this.state.notes.length > 0 && this.state.notes.map((note) => (
                    <Note
                      data={note}
                      refresh={this.props.refresh}
                      refreshNotesParent={this.refreshNotes}
                      available_lang={this.props.note_available_lang}
                      parent_type={this.props.type}
                    />
                  ))}
                </Grid>
              </Grid>
            }
           
          </AccordionDetails>
        </Accordion>

      </Container>

    );
  }
};

/*export default withRouter(TextItem);*/