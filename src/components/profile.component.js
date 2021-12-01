import React, { Component } from "react";
import AuthService from "../services/auth.service";
import { withRouter } from 'react-router-dom';

import Container from '@material-ui/core/Container';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUser: AuthService.getCurrentUser(),
      currentUserDocuments:[]
    };
  }



  componentDidMount() {
    if(AuthService.getCurrentUser() === null){
      this.props.history.push('/login');
    }
  }

  render() {
    if(this.state.currentUser !== null){

      return (
        <Container>
          <header className="jumbotron">
            <h3>
             Profile
            </h3>
          </header>
          <p>
            <strong>Username:</strong>{" "}
            {this.state.currentUser.username}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {this.state.currentUser.email}
          </p>
          <p>
            <strong>Organization:</strong>{" "}
            {this.state.currentUser.organization}
          </p>
        </Container>
      );
    }else{
      return (<div></div>);
    }
  }
}

export default withRouter(Profile);
