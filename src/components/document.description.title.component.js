import React, { Component } from "react";
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import TitleService from "../services/title.service";
import { withRouter } from 'react-router-dom';


class Title extends Component {
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

    TitleService.delete(this.props.title.id).then(
      (response) => {
          this.setState({
            loading:false
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

  }


  render() {

    return(
        <Chip
          avatar={<Avatar>{this.props.title.lang.toUpperCase()}</Avatar>}
          label={this.props.title.title} 
          onDelete={this.handleDelete}
          color="secondary"
        />
    );
  }
}

export default withRouter(Title);