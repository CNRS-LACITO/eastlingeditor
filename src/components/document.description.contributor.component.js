import React, { Component } from "react";
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import ContributorService from "../services/contributor.service";
import { withRouter } from 'react-router-dom';


class Contributor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:false
    };
  }

  componentDidMount() {
      
  }

  handleDelete = () => {

    this.setState({
      loading:true
    });

    ContributorService.delete(this.props.contributor.id).then(
      (response) => {
          this.setState({
            loading:false
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

  }


  render() {

    return(
      
        <Chip
          label={this.props.contributor.type + " : " + this.props.contributor.firstName + " " + this.props.contributor.lastName} 
          onDelete={this.handleDelete}
          color="primary"
          variant="outlined"
        />

    );
  }
}

export default withRouter(Contributor);
