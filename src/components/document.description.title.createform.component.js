import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import TitleService from "../services/title.service";
import CircularProgress from '@material-ui/core/CircularProgress';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { withRouter } from 'react-router-dom';

class TitleCreateForm extends Component {

  constructor(props){
    console.log(props.available_lang);
    super(props);
    this.state = {
      loading:false,
      lang:(props.available_lang!==null && props.available_lang.length > 0) ? props.available_lang[0]:"",
      title:""
    };

  }

  onChange = (e) => {
    this.setState({
      [e.target.id]:e.target.value
    });
  }

  componentDidMount(){

  }

  handleSubmit = () => {

    this.setState({
      loading:true,
      inputEnabled:false
    });

    var data = {
      lang:this.state.lang,
      title:this.state.title,
      document_id:this.props.documentId
    };

    TitleService.create(data).then(
      (response) => {
          this.setState({
            loading:false,
            lang:"",
            title:""
          });
          this.props.getTitles();
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
        <FormControl>
          <InputLabel htmlFor="lang">
            Language
          </InputLabel>
          <Select
            native
            value={this.state.lang}
            inputProps={{
              id: 'lang',
            }}
            onChange={this.onChange}
          >
            {this.props.available_lang && this.props.available_lang.map((a) => (
              <option value={a}>
                {a}
              </option>
            ))}

          </Select>
        </FormControl>
        
        <TextField
          id="title"
          label="Title"
          placeholder="Title"
          size="small"
          value={this.state.title}
          onChange={this.onChange}
        />
        <IconButton color="primary" aria-label="Save" onClick={this.handleSubmit} hidden={!(this.state.lang.length >=1 && this.state.title.length >=1)}>
            <SaveIcon />
        </IconButton>
      </Container>

    );
  }
};

export default withRouter(TitleCreateForm);