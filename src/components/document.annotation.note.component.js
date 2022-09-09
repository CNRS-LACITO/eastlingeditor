import TextItem from './document.annotation.text.item.component';
import React, { Component } from 'react';

export default class Note extends Component {


  render() {
    return (
      <TextItem 
      type="note" 
      id={this.props.data.id} 
      lang={this.props.data.lang} 
      text={this.props.data.text}
      refresh={this.props.refresh} 
      refreshNotesParent={this.props.refreshNotesParent} 
      available_lang={this.props.available_lang}
      note_available_lang={this.props.note_available_lang}
      parent_type={this.props.parent_type}
      />
    );
  }
};