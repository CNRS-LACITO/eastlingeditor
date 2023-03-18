import React, { Component } from "react";
import AuthService from "../services/auth.service";
import {Typography} from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircle';
import RemoveIcon from '@material-ui/icons/RemoveCircle';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Contributor from './document.description.contributor.component';
import ContributorCreateForm from './document.description.contributor.createform.component';
import Title from './document.description.title.component';
import AvailableLanguage from './document.description.availablelang.component';
import TitleCreateForm from './document.description.title.createform.component';
import AvailableLanguageCreateForm from './document.description.availablelang.createform.component';
import CircularProgress from '@material-ui/core/CircularProgress';
import Autocomplete from '@material-ui/lab/Autocomplete';

import DocumentService from "../services/document.service";
import ContributorService from "../services/contributor.service";
import TitleService from "../services/title.service";
import HelperService from "../services/helper.service";
import { withRouter } from 'react-router-dom';

import { Translate } from 'react-translated';

class DocumentDescription extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:false,
      currentUser: AuthService.getCurrentUser(),
      titles:props.document.titles,
      contributors:props.document.contributors,
      affiliation:props.document.affiliation,
      recording_date:props.document.recording_date,
      recording_place:props.document.recording_place,
      lang:props.document.lang,
      available_lang:props.document.available_lang,
      available_kindOf:props.document.available_kindOf,
      document:props.document,
      langISOCodes:[]
    };
  }

  componentDidMount() {
      
  }

  getContributors = () => {

    this.setState({
      loading:true
    });

    ContributorService.getDocumentContributors(this.props.document.id).then(
      (response) => {
        
          this.setState({
            loading:false,
            contributors:response.data,
            openNewContributor:false
          });

          this.props.refreshDocumentMetadata("contributors",response.data);

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

  getTitles = () => {

    this.setState({
      loading:true
    });

    TitleService.getDocumentTitles(this.props.document.id).then(
      (response) => {
        
          this.setState({
            loading:false,
            titles:response.data,
            openNewTitle:false
          });

          this.props.refreshDocumentMetadata("titles",response.data);

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

  updateLanguages = (type,list) => {
    type === "lang" ? this.setState({available_lang: list}) : this.setState({available_kindOf: list});
  }

  handleDeleteTitle = (e) => {
    this.setState({
      loading:true
    });

    TitleService.delete(e.target.id).then(
      (response) => {
          this.setState({
            loading:false
          });
          this.getTitles();
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

  onBlur = (e) => {

    this.setState({
      loading:true
    });

    this.props.refreshDocumentMetadata(e.target.id,e.target.value);

    console.log(this.props.document);

    DocumentService.update(this.props.document.id,{[e.target.id]:e.target.value}).then(
      (response) => {
          this.setState({
            loading:false
          });
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

  onChange = (e) => {
    this.setState({
      [e.target.id]:e.target.value
    });
  }

  onCorpusChange = (e) => {

    (e!=null) && (e.target.value.length >=2) && (e.target.value.length <=3) && HelperService.getLangISOCodes(e.target.value).then(
      (response) => {

          this.setState({
            langISOCodes:response.data
          });

        },
        error => {
          this.setState({
            loading:false
          });

          console.log(error);

          //if(error.response.status===401) this.props.history.push('/login');

          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          if(error.response.status!==404) alert(resMessage);
        });

  }

  openNewContributorForm = () => {
    this.setState({openNewContributor:!this.state.openNewContributor});
  }

  openNewTitleForm = () => {
    this.setState({openNewTitle:!this.state.openNewTitle});
  }

  openNewAvailableLanguageForm = () => {
    this.setState({openNewAvailableLanguage:!this.state.openNewAvailableLanguage});
  }

  openNewAvailableKindOfForm = () => {
    this.setState({openNewAvailableKindOf:!this.state.openNewAvailableKindOf});
  }


  render() {

    var titles = [];
    var contributors = [];
    var available_lang = [];
    var available_kindOf = [];


    if(this.state.titles){
      this.state.titles.forEach((t)=>{
        titles.push(<Title key={t.id} getTitles={this.getTitles} title={t} />);
      });
    }

    if(this.state.contributors){
      this.state.contributors.forEach((c)=>{
        contributors.push(<Contributor key={c.id} getContributors={this.getContributors} contributor={c} />);
      });
    }

    if(this.state.available_lang){
      this.state.available_lang.forEach((l)=>{
        available_lang.push(
          <AvailableLanguage 
            key={l}
            type="lang"
            updateLanguages={this.updateLanguages}
            lang={l}
            list={this.state.available_lang}
            documentId={this.props.document.id}
          />
        );
      });
    }

    if(this.state.available_kindOf){
      this.state.available_kindOf.forEach((l)=>{
        available_kindOf.push(
          <AvailableLanguage
            key={l}
            type="kindOf"
            updateLanguages={this.updateLanguages}
            lang={l}
            list={this.state.available_kindOf}
            documentId={this.props.document.id}
          />
        );
      });
    }
      

    return(

      <div>
        {this.state.loading && <CircularProgress />}
       <div>
        
         <div>
            <Autocomplete
              id="lang"
              freeSolo="true"
              options={this.state.langISOCodes.map((lang) => lang.code_langue_sujet + " / "+ lang.sujet)}
              onInputChange={this.onCorpusChange}
              onChange={this.onChange}
              defaultValue={this.props.document.lang}
              renderInput={(params) => (
                <TextField {...params} label="Corpus" margin="normal" variant="outlined" onBlur={this.onBlur}/>
              )}
            />

          </div>
          <div>
            <Typography component="h3"><Translate text='Recording' /></Typography>
            <TextField 
                id="recording_date" 
                label="Date" 
                type="date" 
                InputLabelProps={{ shrink: true}}
                value={this.state.recording_date && this.state.recording_date.split(' ')[0]} 
                onChange={this.onChange}
                onBlur={this.onBlur}
                />
            
            <TextField 
                id="recording_place" 
                label=<Translate text='Place' /> 
                placeholder={<Translate text='Place of recording' />}
                type="text"
                value={this.state.recording_place}
                onChange={this.onChange}
                onBlur={this.onBlur}
                />
          </div>

          <div id="available_kindOf">
              <Typography component="h3"><Translate text='Available kind of transcription' /></Typography>
              {available_kindOf} 
              <Chip
                icon={this.state.openNewAvailableKindOf ? <RemoveIcon /> : <AddIcon /> }
                label="kindOf"
                clickable
                size="small"
                color="primary"
                onClick={this.openNewAvailableKindOfForm}
              />
              <AvailableLanguageCreateForm 
                type="kindOf"
                list={this.state.available_kindOf}
                getLanguages={this.getKindOf} 
                documentId={this.state.document.id} 
                hidden={!this.state.openNewAvailableKindOf}
                updateLanguages={this.updateLanguages}
              />
          </div>

          <div id="available_lang">
              <Typography component="h3"><Translate text='Available translation languages' /></Typography>
              {available_lang} 
              <Chip
                icon={this.state.openNewAvailableLanguage ? <RemoveIcon /> : <AddIcon /> }
                label="language"
                clickable
                size="small"
                color="primary"
                onClick={this.openNewAvailableLanguageForm}
              />
              <AvailableLanguageCreateForm 
                type="lang"
                list={this.state.available_lang}
                getLanguages={this.getLanguages} 
                documentId={this.state.document.id} 
                hidden={!this.state.openNewAvailableLanguage}
                updateLanguages={this.updateLanguages}
              />
          </div>

          <div id="titles">
              <Typography component="h3"><Translate text='Titles' /></Typography>
              {titles} 

              <Chip
                icon={this.state.openNewTitle ? <RemoveIcon /> : <AddIcon /> }
                label="title"
                clickable
                size="small"
                color="primary"
                onClick={this.openNewTitleForm}
              />
              <TitleCreateForm 
                getTitles={this.getTitles}
                documentId={this.state.document.id}
                hidden={!this.state.openNewTitle}
                available_lang={this.state.available_lang}
              />
          </div>

          <div id="contributors">
              <Typography component="h3"><Translate text='Contributors' /></Typography>
              {contributors} 

              <Chip
                icon={this.state.openNewContributor ? <RemoveIcon /> : <AddIcon /> }
                label="contributor"
                clickable
                size="small"
                color="primary"
                onClick={this.openNewContributorForm}
              />
              <ContributorCreateForm getContributors={this.getContributors} documentId={this.state.document.id} hidden={!this.state.openNewContributor} />
          </div>
          
          <div>
              <TextField 
                id="depositorAffiliation" 
                label="Depositor's affiliation" 
                placeholder="Depositor's affiliation"
                type="text"
                onChange={this.onChange}
                />
          </div>

        </div>

      </div>
    );
  }
}

export default withRouter(DocumentDescription);