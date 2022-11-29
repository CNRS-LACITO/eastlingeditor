import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import FormService from "../services/form.service";
import TranslationService from "../services/translation.service";
import NoteService from "../services/note.service";
import CircularProgress from '@material-ui/core/CircularProgress';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { withRouter } from 'react-router-dom';

class TextItemCreateForm extends Component {

  constructor(props){
    super(props);
    this.state = {
      text:"",
      lang:(this.props.available_lang != null && this.props.available_lang.length > 0) ? this.props.available_lang[0]:"",
      open: props.open,
      loading:false
    };

  }

  onLangChange = (event) => {
    this.setState({lang:event.target.value});
  }

  onTextChange = (event) => {
    this.setState({text:event.target.value});
  }

  componentDidMount(){

  }

  handleSubmit = () => {

    this.setState({
      loading:true,
      inputEnabled:false
    });


    this.props.type==='form' && FormService.create(this.state.lang,this.state.text,this.props.parentId).then(
      (response) => {
          this.setState({
            loading:false,
            text:""
          });
          this.props.refresh('form');
        },
        error => {
          this.setState({
            loading:false,
            text:""
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

    this.props.type==='translation' && TranslationService.create(this.state.lang,this.state.text,this.props.parentId).then(
      (response) => {
          this.setState({
            loading:false,
            text:""
          });
          this.props.refresh('translation');
        },
        error => {
          this.setState({
            inputEnabled:true,
            loading:false,
            text:""
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

    this.props.type==='note' && NoteService.create(this.state.lang,this.state.text,this.props.parentType,this.props.parentId).then(
      (response) => {
          this.setState({
            loading:false
          });
          this.props.refreshNotesParent();
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

  };


  render() {
    var visibility = (this.props.hidden)?"none":"";

    return (
       
      <Container style={{display:visibility}}>
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
                  {(this.props.available_lang!=null) && this.props.available_lang.map((a) => (
                    <option value={a}>
                      {a}
                    </option>
                  ))}

                </Select>
              </FormControl>

              <TextField
                label={this.props.type === "translation"?"Translation text":"Form text"}
                placeholder={this.props.type === "translation"?"Translation text":"Form text"}
                multiline
                fullWidth
                rowsMax={4}
                value={this.state.text}
                onChange={this.onTextChange}
                onMouseDown={(e) => {e.stopPropagation()}}
              />
                {
                  this.state.loading ? <CircularProgress size="1.5rem" /> :
                  <IconButton color="primary" title="Save" aria-label="Save" onClick={this.handleSubmit} hidden={!(this.state.lang.length >=2 && this.state.text.length >=1)}>
                      <SaveIcon />
                  </IconButton>
                }
      </Container>

    );
  }
};

export default withRouter(TextItemCreateForm);