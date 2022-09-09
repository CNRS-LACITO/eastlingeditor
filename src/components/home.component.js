import React, { Component } from "react";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";
import { withRouter } from 'react-router-dom';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: AuthService.getCurrentUser(),
    };

    if(AuthService.getCurrentUser() === null){
      this.props.history.push('/login');
    }else{
      this.props.history.push('/documents');
    }
  }

  componentDidMount() {
    
  }

  render() {
    return (
      <div className="container">
        <header className="jumbotron">
          <h3>{this.state.content}</h3>
        </header>
      </div>
    );
  }
}

export default withRouter(Home);
