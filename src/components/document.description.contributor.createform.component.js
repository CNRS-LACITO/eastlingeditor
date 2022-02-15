import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import ContributorService from "../services/contributor.service";
import CircularProgress from '@material-ui/core/CircularProgress';
import { withRouter } from 'react-router-dom';


class ContributorCreateForm extends Component {

  constructor(props){
    super(props);
    this.state = {
      loading:false,
      firstname:"",
      lastname:"",
      typeOfContributor:"annotator"
    };

  }

  onContributorFirstNameChange = (event) => {
    this.setState({firstname:event.target.value});
  }

  onContributorLastNameChange = (event) => {
    this.setState({lastname:event.target.value});
  }

  onContributorTypeChange = (event) => {
    this.setState({typeOfContributor:event.target.value});
  }

  componentDidMount(){

  }

  handleSubmit = () => {

    this.setState({
      loading:true,
      inputEnabled:false
    });

    var data = {
      firstName:this.state.firstname,
      lastName:this.state.lastname,
      type:this.state.typeOfContributor,
      document_id:this.props.documentId
    };

    ContributorService.create(data).then(
      (response) => {
          this.setState({
            loading:false,
            firstname:"",
            lastname:""
          });
          this.props.getContributors();
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
          label="First Name"
          placeholder="First Name"
          size="small"
          value={this.state.firstname}
          onChange={this.onContributorFirstNameChange}
        />
        <TextField
          label="Last Name"
          placeholder="Last Name"
          size="small"
          value={this.state.lastname}
          onChange={this.onContributorLastNameChange}
        />
        <FormControl>
          <InputLabel id="select-type-label">Type of contributor</InputLabel>
          <Select
            labelId="select-type-label"
            id="type"
            value={this.state.typeOfContributor}
            onChange={this.onContributorTypeChange}
          >
            <MenuItem value={"speaker"}>Speaker</MenuItem>
            <MenuItem value={"researcher"}>Researcher</MenuItem>
            <MenuItem value={"annotator"}>Annotator</MenuItem>
          </Select>
        </FormControl>
        <IconButton color="primary" aria-label="Save" onClick={this.handleSubmit} hidden={!(this.state.firstname.length >=1 && this.state.lastname.length >=1)}>
            <SaveIcon />
        </IconButton>
      </Container>

    );
  }
};

export default withRouter(ContributorCreateForm);