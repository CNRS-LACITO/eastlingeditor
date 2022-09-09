import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import DocumentService from "../services/document.service";
import CircularProgress from '@material-ui/core/CircularProgress';
import { withRouter } from 'react-router-dom';


class AvailableLanguageCreateForm extends Component {

  constructor(props){
    super(props);
    this.state = {
      loading:false,
      lang:""
    };

  }

  onChange = (e) => {
    this.setState({
      lang:e.target.value
    });
  }

  componentDidMount(){

  }

  handleSubmit = () => {
    var list = (this.props.list) === null ? [] : this.props.list;

    list.indexOf(this.state.lang) >0 && list.splice(list.indexOf(this.state.lang),1);
    list.push(this.state.lang);

    this.setState({
      loading:true
    });

    var data = {};
    
    this.props.type === "lang" ? data.available_lang = list : data.available_kindOf = list;

    DocumentService.update(this.props.documentId,data).then(
      (response) => {
          this.setState({
            loading:false,
            lang:""
          });
          this.props.updateLanguages(this.props.type,list);
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
      {this.state.loading && <CircularProgress />}

        <TextField
          id="lang"
          label="ISO 639‑1 Code"
          placeholder="ISO 639‑1 Code"
          size="medium"
          value={this.state.lang}
          onChange={this.onChange}
          inputProps={(this.props.type === "lang")?{maxLength:2}:{}}
        />
      
        
        <IconButton color="primary" title="Save" aria-label="Save" onClick={this.handleSubmit} hidden={!this.state.lang.length >=1}>
            <SaveIcon />
        </IconButton>
      </Container>

    );
  }
};

export default withRouter(AvailableLanguageCreateForm);