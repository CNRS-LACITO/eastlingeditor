import React, { Component } from "react";
import AuthService from "../services/auth.service";
import DocumentService from "../services/document.service";
import { Container, Grid, AppBar, Tabs, Tab, Typography, Box, Breadcrumbs, Link } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import DocumentDescription from "./document.description.component";
import DocumentResources from "./document.resources.component";
import DocumentAnnotations from "./document.annotations.component";
import DocumentPreview from "./document.preview.component";
import DocumentExport from "./document.export.component";
import { withRouter } from 'react-router-dom';
import { Translate } from 'react-translated';

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
      expanded:false,
      title:""
    };

    window.imagesMap = [];
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
    //URL requested stored if not logged in for redirection after login
    window.intendedUrl = this.props.match.url.replace(window.location.origin+"/editor","");

    var tabId = parseInt(this.getUrlParameter("tab"));
    var expanded = this.getUrlParameter("expanded");
    //var activeAnnotationId = this.getUrlParameter("annotationId");

    this.setState({loading:true});

      for (var i = 0; i < localStorage.length; i++) {
        if(localStorage.key(i).indexOf('image')===0) localStorage.removeItem(localStorage.key(i));
      }

      //cas du document créé dans Eastling
      (this.props.match.params.docId) && DocumentService.get(this.props.match.params.docId).then(
        response => {
          if(typeof response.data === 'object'){

            var typeOf = {};
            typeOf.text = {}; typeOf.text.transcriptions = []; typeOf.text.translations = [];
            typeOf.sentence = {}; typeOf.sentence.transcriptions = []; typeOf.sentence.translations = [];
            typeOf.word = {}; typeOf.word.transcriptions = []; typeOf.word.translations = [];
            typeOf.morpheme = {}; typeOf.morpheme.transcriptions = []; typeOf.morpheme.translations = [];
            typeOf.note = {}; typeOf.note.translations = [];

            this.parseTypeOf(response.data.annotations[0],typeOf);

            response.data.typeOf = typeOf;

            response.data.images.forEach(function(image,index){
                //window.imagesMap["image"+image.id] = image["TO_BASE64(content)"];
                window.imagesMap.push({
                  id:image.id,
                  content:image["TO_BASE64(content)"],
                  filename:image.rank+'_'+image.filename,
                  url:image.url
                });

            });

            this.setState({
              currentDocument:response.data,
              typeOf:typeOf,
              loading:false,
              value:tabId,
              expanded:(expanded==='true'),
              //activeAnnotationId:activeAnnotationId,
              title:response.data.titles[0]!==undefined?response.data.titles[0].title:""
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

  refreshDocumentAnnotations = () => {

    this.setState({
      loading:true
    });


    DocumentService.getAnnotations(this.props.match.params.docId).then(
      response => {
        var currentDocument = this.state.currentDocument;
        var typeOf = {};
        typeOf.text = {}; typeOf.text.transcriptions = []; typeOf.text.translations = [];
        typeOf.sentence = {}; typeOf.sentence.transcriptions = []; typeOf.sentence.translations = [];
        typeOf.word = {}; typeOf.word.transcriptions = []; typeOf.word.translations = [];
        typeOf.morpheme = {}; typeOf.morpheme.transcriptions = []; typeOf.morpheme.translations = [];
        typeOf.note = {}; typeOf.note.translations = [];

        currentDocument.annotations = response.data.annotations;

        this.parseTypeOf(response.data.annotations[0],typeOf);
        currentDocument.typeOf = typeOf;

        this.setState({
          currentDocument: currentDocument,
          loading:false
        });

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

  refreshDocumentMetadata = (key,value) => {
    var currentDocument = this.state.currentDocument;

    currentDocument[key] = value;

    this.setState({
      currentDocument: currentDocument
    });
  }

  componentDidMount() {
    this.refreshDocument();
  }

  openAnnotation = (id) => {
      this.setState({
        value:2,
        //activeAnnotationId:id
      }, function() {this.buildUrl();});
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

    const handleClick = (e) => {
      console.log(e);
    }


    function a11yProps(index) {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    return (
      
      <Container>

        <Breadcrumbs aria-label="breadcrumb" style={{fontSize:"0.875rem",margin:"20px"}}>
          <Link color="primary" href="/editor" onClick={handleClick}>
            <Translate text='Home'/>
          </Link>
          <Link color="primary" href="/editor/documents/" onClick={handleClick}>
            <Translate text='My documents'/>
          </Link>
          <a color="default">{this.state.title}</a>
        </Breadcrumbs>

        {this.state.loading && <Grid container><Grid item xs={12} style={{textAlign:"center",minHeight:"200px"}} /><Grid item xs={12} style={{textAlign:"center"}}><CircularProgress /></Grid></Grid>}
          {!this.state.loading && <AppBar color="default" position="static">
            <Tabs 
              centered 
              indicatorColor="primary"
              textColor="primary"
              value={this.state.value}
              onChange={handleChangeTab}
              aria-label="tabs"
            >
              <Tab label="Description" {...a11yProps(0)} />
              <Tab label=<Translate text='Resources'/> {...a11yProps(1)} />
              <Tab label="Annotations" {...a11yProps(2)} />
              <Tab label=<Translate text='Preview'/> {...a11yProps(3)} />
              <Tab label="Export" {...a11yProps(4)} />
            </Tabs>
          </AppBar>}
          {!this.state.loading && <TabPanel value={this.state.value} index={0}>
            <DocumentDescription 
              document={this.state.currentDocument}
              refreshDocumentMetadata={this.refreshDocumentMetadata}
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
              /*activeAnnotationId={this.state.activeAnnotationId}*/
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
              openAnnotation={this.openAnnotation}
            />
          </TabPanel>
          <TabPanel value={this.state.value} index={4}>
            <DocumentExport
              documentId={this.state.currentDocument.id}
              annotations={this.state.currentDocument.annotations}
              recording={this.state.currentDocument.recording}
              documentExportTitle={'eastling-'+this.state.currentDocument.lang+'_'+this.state.currentDocument.type+'-'+this.state.currentDocument.id}
             />
          </TabPanel>
      </Container>
    
    );
  }
}

export default withRouter(Document);