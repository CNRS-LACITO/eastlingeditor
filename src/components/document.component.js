import React, { Component } from "react";
import AuthService from "../services/auth.service";
import DocumentService from "../services/document.service";
import { Container, AppBar, Tabs, Tab, Typography, Box } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import DocumentDescription from "./document.description.component";
import DocumentResources from "./document.resources.component";
import DocumentAnnotations from "./document.annotations.component";
import DocumentPreview from "./document.preview.component";
import { withRouter } from 'react-router-dom';

var displayOptions = {};

displayOptions = {
  textTranscriptions : [],
  textTranslations : [],
  sentenceTranscriptions : [],
  sentenceTranslations : [],
  wordTranscriptions : [],
  wordTranslations : [],
  morphemeTranscriptions : [],
  morphemeTranslations :[],
  notes : [],
  lang : "fr",
  mode : "normal",
  continuousPlay : true,
};

class Document extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentUser: AuthService.getCurrentUser(),
      currentDocument: {},
      value:0,
      loading: true,
      expanded:false
    }
  }

  getUrlParameter (sVar) {
    return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  buildUrl(){
      var params = new URLSearchParams(window.location.search);
      params.set('tab',this.state.value);
      params.set('expanded',this.state.expanded);
      var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString();
      window.history.pushState('test','',newUrl);
  }

  parseTypeOf(annotation,typeOf){
    var types = {
      'T':'text',
      'S':'sentence',
      'W':'word',
      'M':'morpheme'
    };

    annotation.forms.forEach((f)=>{
      !typeOf[types[annotation.type]].transcriptions.includes(f.kindOf) && typeOf[types[annotation.type]].transcriptions.push(f.kindOf);
    });

    annotation.translations.forEach((t)=>{
      !typeOf[types[annotation.type]].translations.includes(t.lang) && typeOf[types[annotation.type]].translations.push(t.lang);
    });

    annotation.children_annotations.forEach((a)=>{
      this.parseTypeOf(a,typeOf);
    });

    return typeOf;
  }

  refreshDocument = () => {
    var tabId = parseInt(this.getUrlParameter("tab"));
    var expanded = this.getUrlParameter("expanded");

    this.setState({loading:true});

      for (var i = 0; i < localStorage.length; i++) {
        if(localStorage.key(i).indexOf('image')===0) localStorage.removeItem(localStorage.key(i));
      }

      DocumentService.get(this.props.match.params.docId).then(
        response => {
          if(typeof response === 'object'){

            var typeOf = {};
            typeOf.text = {}; typeOf.text.transcriptions = []; typeOf.text.translations = [];
            typeOf.sentence = {}; typeOf.sentence.transcriptions = []; typeOf.sentence.translations = [];
            typeOf.word = {}; typeOf.word.transcriptions = []; typeOf.word.translations = [];
            typeOf.morpheme = {}; typeOf.morpheme.transcriptions = []; typeOf.morpheme.translations = [];
            typeOf.note = {}; typeOf.note.translations = [];

            this.parseTypeOf(response.annotations[0],typeOf);

            response.typeOf = typeOf;

            this.setState({
              currentDocument:response,
              typeOf:typeOf,
              loading:false,
              value:tabId,
              expanded:(expanded==='true')
            });

          }

        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
          this.setState({
            currentDocument:
              (error.response && error.response.data) ||
              error.message ||
              error.toString(),
              loading:false
          });
        }
      );
  }

  refreshDocumentAnnotations = (annotations) => {
    var currentDocument = this.state.currentDocument;
    currentDocument.annotations = annotations;

    var typeOf = {};
    typeOf.text = {}; typeOf.text.transcriptions = []; typeOf.text.translations = [];
    typeOf.sentence = {}; typeOf.sentence.transcriptions = []; typeOf.sentence.translations = [];
    typeOf.word = {}; typeOf.word.transcriptions = []; typeOf.word.translations = [];
    typeOf.morpheme = {}; typeOf.morpheme.transcriptions = []; typeOf.morpheme.translations = [];
    typeOf.note = {}; typeOf.note.translations = [];

    this.parseTypeOf(annotations[0],typeOf);

    currentDocument.typeOf = typeOf;

    this.setState({
      currentDocument: currentDocument
    });

  }

  componentDidMount() {
    this.refreshDocument();
  }

  
  render() {

    function TabPanel(props) {

      const { children, value, index, ...other } = props;

      return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
        >
          {value === index && (
            <Box div={3}>
              <Typography component="div">{children}</Typography>
            </Box>
          )}
        </div>
      );
    }

    const handleChangeTab = (event, newValue) => {
      this.setState({value:newValue}, function() {this.buildUrl();});
    };

    function a11yProps(index) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    return (
      
      <Container>
        {this.state.loading && <CircularProgress />}
          {!this.state.loading && <AppBar position="static">
            <Tabs value={this.state.value} onChange={handleChangeTab} aria-label="tabs">
              <Tab label="Description" {...a11yProps(0)} />
              <Tab label="Resources" {...a11yProps(1)} />
              <Tab label="Annotations" {...a11yProps(2)} />
              <Tab label="Preview" {...a11yProps(3)} />
              <Tab label="Export" {...a11yProps(4)} />
            </Tabs>
          </AppBar>}
          {!this.state.loading && <TabPanel value={this.state.value} index={0}>
            <DocumentDescription 
              document={this.state.currentDocument} 
            />
          </TabPanel>}
          <TabPanel value={this.state.value} index={1}>
            <DocumentResources 
              documentId={this.state.currentDocument.id} 
              recording={this.state.currentDocument.recording} 
              images={this.state.currentDocument.images} 
            />
          </TabPanel>
          <TabPanel value={this.state.value} index={2}>
            <DocumentAnnotations 
              documentId={this.state.currentDocument.id} 
              documentType={this.state.currentDocument.type} 
              recording={this.state.currentDocument.recording} 
              images={this.state.currentDocument.images} 
              annotations={this.state.currentDocument.annotations}
              available_kindOf={this.state.currentDocument.available_kindOf}
              available_lang={this.state.currentDocument.available_lang}
              refreshDocumentAnnotations={this.refreshDocumentAnnotations}
              expanded={this.state.expanded}
            />
          </TabPanel>
          <TabPanel value={this.state.value} index={3}>
            <DocumentPreview  
              documentId={this.state.currentDocument.id} 
              documentType={this.state.currentDocument.type} 
              recording={this.state.currentDocument.recording} 
              images={this.state.currentDocument.images} 
              annotations={this.state.currentDocument.annotations}
              typeOf={this.state.currentDocument.typeOf}
              displayOptions={displayOptions}
            />
          </TabPanel>
          <TabPanel value={this.state.value} index={4}>
            Export
          </TabPanel>
      </Container>
    
    );
  }
}

export default withRouter(Document);