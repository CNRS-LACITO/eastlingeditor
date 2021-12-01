import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
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
import FormService from "../services/form.service";
import TranslationService from "../services/translation.service";
import { withRouter } from 'react-router-dom';

class TextItem extends Component {

  constructor(props){
    super(props);
    this.state = {
      text:props.text,
      lang:props.lang,
      originalText:props.text,
      originalLang:props.lang,
      expanded: false,
      inputEnabled: false,
      loading:false
    };

  }

  handleExpand = (panel) => (event, isExpanded) => {
    this.setState({expanded: isExpanded ? panel : false});
  };

  handleEdit = () => {
    this.setState({inputEnabled:!this.state.inputEnabled});
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

  componentDidMount(){

  }

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

  };


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
          <Chip label={this.state.lang} size="small" color="secondary" />
          {this.state.text.substring(0,50)}{this.state.text.length>50?"...":""}
          </AccordionSummary>
          <AccordionDetails>
              <FormControl>
                <InputLabel htmlFor="select-lang">
                  {this.props.type === "translation"?"Language":"Kind of form"}
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
              <TextField
                id={this.props.type+this.props.id}
                label={this.props.type === "translation"?"Translation text":"Form text"}
                placeholder={this.props.type === "translation"?"Translation text":"Form text"}
                multiline
                disabled={!this.state.inputEnabled}
                fullWidth
                rowsMax={4}
                value={this.state.text}
                onChange={this.onTextChange}
              />
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

              
          </AccordionDetails>
        </Accordion>

      </Container>

    );
  }
};

export default withRouter(TextItem);