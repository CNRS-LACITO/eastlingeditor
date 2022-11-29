import React, { Component } from "react";
import Chip from '@material-ui/core/Chip';

import DocumentService from "../services/document.service";
import { withRouter } from 'react-router-dom';

class AvailableLanguage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:false
    };
  }

  componentDidMount() {

  }

  handleDelete = () => {

    var list = this.props.list;

    list.splice(list.indexOf(this.props.lang),1);

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

  }


  render() {

    return(
        <Chip
          label={this.props.lang} 
          onDelete={this.handleDelete}
          color="primary"
          variant="outlined"
        />
    );
  }
}

export default withRouter(AvailableLanguage);
