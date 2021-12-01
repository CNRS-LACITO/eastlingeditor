import React from 'react';
import { FormGroup, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch } from '@material-ui/core';
import Annotations from './Annotations';
import Images from './Images';

class Options extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        //selectedFile: props.selectedFile,
        checkedTranscriptionBySentence: true,
        checkedTranslationBySentence: true,
        checkedWholeTranscription: false,
        checkedWholeTranslation: false,
        checkedWords : true,
        displayTranscription:[],
        displayTranslation:[]
    };
  }

/*
  updateState(event) {
    this.setState({ selectedFile: event.target.value});
  }
*/

  handleChecked(event){
    //this.setState({checkedTranscriptionBySentence: event.target.checked});
    this.setState({[event.target.name]: event.target.checked});
  }



  render() {

    return (
      <div>
        <h2>Options</h2>
        {

        <FormGroup row>

        <FormControlLabel
            control={
              <Switch
                checked={this.state.checkedTranscriptionBySentence}
                onChange={this.handleChecked.bind(this)}
                name="checkedTranscriptionBySentence"
                color="primary"
              />
            }
            label="Transcription by sentence"
          />

          <FormControlLabel
            control={
              <Switch
                checked={this.state.checkedTranslationBySentence}
                onChange={this.handleChecked.bind(this)}
                name="checkedTranslationBySentence"
                color="primary"
              />
            }
            label="Translation by sentence"
          />

          <FormControlLabel
            control={
              <Switch
                disabled 
                checked={this.state.checkedWholeTranscription}
                onChange={this.handleChecked.bind(this)}
                name="checkedWholeTranscription"
                color="primary"
              />
            }
            label="Whole text transcription"
          />

          <FormControlLabel
            control={
              <Switch
                disabled 
                checked={this.state.checkedWholeTranslation}
                onChange={this.handleChecked.bind(this)}
                name="checkedWholeTranslation"
                color="primary"
              />
            }
            label="Whole text translation"
          />

          <FormControlLabel
            control={
              <Switch
                checked={this.state.checkedWords}
                onChange={this.handleChecked.bind(this)}
                name="checkedWords"
                color="primary"
              />
            }
            label="Words"
          />

          </FormGroup>

          }


          { 
          this.props.annotations
          ?
          <Annotations displayOptions={this.state} annotations={this.props.annotations} images={this.props.images} />
          :
          <div></div>
          }
      </div>
    );
  }
}

export default Options;