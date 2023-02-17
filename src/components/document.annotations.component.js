 /*
https://medium.com/trackstack/simple-audio-waveform-with-wavesurfer-js-and-react-ae6c0653b240
https://github.com/katspaugh/window.wavesurfer.js/blob/master/example/annotation/app.js
*/
import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';

import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.minimap.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.js';
import MarkersPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.markers.js';

import { AppBar, Button, Drawer, Tabs, Tab, Typography, Box, Switch } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';

import AddIcon from '@material-ui/icons/AddCircle';
import ImportIcon from '@material-ui/icons/CloudDownload';
import IconButton from '@material-ui/core/IconButton';
import PlayIcon from '@material-ui/icons/PlayCircleFilledWhite';
import PauseIcon from '@material-ui/icons/PauseCircleFilled';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import MicOffIcon from '@material-ui/icons/MicOff';
import ZoomIn from '@material-ui/icons/ZoomIn';
import ZoomOut from '@material-ui/icons/ZoomOut';
import OpenWithIcon from '@material-ui/icons/OpenWith';

import Slider from '@material-ui/core/Slider';

import ImageMultiSelector from './imageMultiSelector.component';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import DocumentAnnotation from './document.annotation.component';
import DocumentAnnotationsImport from './document.annotations.import.component';
import DocumentAnnotationsTree from './document.annotations.tree.component';
import AnnotationService from "../services/annotation.service";
import CircularProgress from '@material-ui/core/CircularProgress';

import Snackbar from '@material-ui/core/Snackbar';
//import Tree from 'react-animated-tree';
import Tree from "react-animated-tree-v2";
import { withRouter } from 'react-router-dom';
import Draggable from 'react-draggable';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


window.wavesurfer = null;

class DocumentAnnotations extends React.Component {

  constructor(props){

    window.annotationPanelPosition = window.annotationPanelPosition?window.annotationPanelPosition:{x:0,y:0};
    window.hasScrolled=false;
    window.audioSelection = {start:0,end:0};

    super(props);
    this.state = {
      playing: false,
      currentTime:0,
      zoom: window.zoom,
      tabValue:window.tabValue?window.tabValue:0,
      crop:null,
      annotationsPanel: false,
      annotationPanel: false,
      importPanel: false,
      annotations: null,
      openEditionNotification:window.currentAnnotationEdition && window.currentAnnotationEdition!==null,
      editionNotification:"",
      editionType:"audio",
      editionData:{},
      audioSelection:false,
      imageSelection:false,
      openCreateDialog:false,
      newAnnotationType:null,
      parentAnnotations:[],
      parentAnnotationId:0,
      nextChildRank:0,
      selectedAnnotation: {},
      imageCanvas:[],
      showImageCanvas:true,
      showRegions:true,
      hasAudioSelection:false,
      activeAnnotationId:this.getUrlParameter('annotationId')?this.getUrlParameter('annotationId'):0,
      speed:window.speed?window.speed:1,
      expanded:false,
      anchorRef: React.createRef(),
      annotationPanelPositionX:window.annotationPanelPosition.x,
      annotationPanelPositionY:window.annotationPanelPosition.y,
      treeKey:Date.now()
    };
    this.previewCanvasRef = React.createRef();


  }

  componentWillUnmount(){
    //attention boucle infinie avec le render depuis composnat parent
    //this.props.refreshDocumentAnnotations();

  }

  static getDerivedStateFromProps(props, state) {
    if(props.annotations !== state.annotations){
        //Change in props
        return{
            annotations: props.annotations
        };
    }
    return null; // No change to state
  }


  handleSliderZoomChange = (event, newValue) => {
    window.zoom = newValue;
    window.wavesurfer && window.wavesurfer.zoom(newValue*10);

    this.setState({
      zoom:newValue,
      crop:window.crop,
      openEditionNotification:this.state.openEditionNotification
    });

  };

  handleSliderSpeedChange = (event, newValue) => {
    window.speed = newValue;
    window.wavesurfer && window.wavesurfer.setPlaybackRate(newValue);
    this.setState({
      speed:newValue
    });

  };

  handleShowImageCanvas = (event) => {
    document.querySelectorAll('canvas.imageCanvas').forEach(e => e.style.display = (event.target.checked)?"block":"none");
    this.setState({
      showImageCanvas:event.target.checked,
    });

  };

  handleShowRegions = (event) => {

    document.querySelectorAll('.wavesurfer-region').forEach(e => e.style.display = (event.target.checked)?"block":"none");
    document.querySelectorAll('.wavesurfer-marker').forEach(e => e.style.display = (event.target.checked)?"flex":"none");
    
    this.setState({
      showRegions:event.target.checked
    });

  };

  handleNewAnnotationTypeChange = (event, newValue) => {

    var selectParentAnnotationElement = document.getElementById("select-parent-annotation");
    this.setState({
      newAnnotationType:event.target.value,
      parentAnnotationId:selectParentAnnotationElement.selectedOptions[0] && selectParentAnnotationElement.value,
      nextChildRank:selectParentAnnotationElement.selectedOptions[0] && selectParentAnnotationElement.selectedOptions[0].attributes["nextChildRank"].value
    });
    
    //document.querySelectorAll("#select-parent-annotation option:not([hidden=''])")[0].selected=true;
  }

  handleParentAnnotationChange = (event) => {
    event.target.selectedOptions[0] && this.setState({
      parentAnnotationId:event.target.value,
      nextChildRank: event.target.selectedOptions[0].attributes["nextChildRank"].value
    });
  }

  handleCloseCreateDrawer = (event) => {
    var params = new URLSearchParams(window.location.search);
    params.delete('annotationId');

    var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString();
    window.history.pushState('test','',newUrl);

    this.setState({
        annotationPanel: false,
        activeAnnotationId:0
      });
    if(this.state.change > 0)
    this.refreshAnnotations();
  };

  handleCloseCreateDialog = (event) => {
    this.setState({
        openCreateDialog: false,
        newAnnotationType:null,
        parentAnnotationId:null
      });
    window.coordinates = undefined;
  };

  handleOpenCreateDialog = (event) => {

    if((window.coordinates === undefined || window.coordinates.length === 0) && (isNaN(parseFloat(window.audioSelection.end)))){
      alert("No selection in audio or image");
      return;
    }
    

    // Autoselection of the right parent annotation
    var that = this;

    that.setState({
      parentAnnotationId:this.state.parentAnnotations[0].id,
      newAnnotationType:this.state.parentAnnotations[0].childrenType,
      nextChildRank: this.state.parentAnnotations[0].nextChildRank,
      parentAnnotations:this.refreshParentAnnotationsList(this.state.annotations)
    });

    this.state.parentAnnotations.forEach(function(p){
      //if((parseFloat(that.state.audioSelection.end) <= parseFloat(p.audioEnd) ) && (parseFloat(that.state.audioSelection.start) >= parseFloat(p.audioStart))){

        if((parseFloat(window.audioSelection.end) <= parseFloat(p.audioEnd) ) && (parseFloat(window.audioSelection.start) >= parseFloat(p.audioStart))){
          that.setState({
            parentAnnotationId:p.id,
            newAnnotationType:p.childrenType,
            nextChildRank: p.nextChildRank
          });
        }
      
      
    });

    this.setState({
      openCreateDialog: true
    });

  };

  getUrlParameter (sVar) {
    return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }

  buildUrl(id = null){
      var params = new URLSearchParams(window.location.search);
      params.set('tab',this.getUrlParameter('tab'));
      //params.set('expanded',this.getUrlParameter('expanded'));
      (id !== null) && params.set('annotationId',id);
      var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + params.toString();
      window.history.pushState('test','',newUrl);
  }

  handleEditionState = (show,type,data) => {

    this.buildUrl();

    var message = (type==="audio")
    ?
    "Editing "+data.annotationLabel+" Start: "+data.start+"/End: "+data.end
    :
    "Editing "+window.currentAnnotationEdition.annotationLabel+" Image";

    var coordinates = [];

    (type==="image") && window.currentAnnotationEdition.imageCoords.forEach((i) => {
      var areaCoords = i.areaCoords.split(",");

      coordinates.push({
        image_id: i.image_id,
        x: parseFloat(areaCoords[0]) / parseFloat(areaCoords[4]),
        y: parseFloat(areaCoords[1]) / parseFloat(areaCoords[4]),
        width: (parseFloat(areaCoords[2]) - parseFloat(areaCoords[0])) / parseFloat(areaCoords[4]),
        height: (parseFloat(areaCoords[3]) - parseFloat(areaCoords[1])) / parseFloat(areaCoords[4]),
      });
    });

    if(window.currentAnnotationEdition !== null) window.currentAnnotationEdition.data = coordinates;

    (type==="audio") && (data.start>=0) && window.wavesurfer.seekAndCenter(data.start/window.wavesurfer.getDuration());
    //window.wavesurfer.setCurrentTime(data.start);
    window.coordinates = coordinates;

    this.setState({
      annotationsPanel:false,
      annotationPanel:false,
      openEditionNotification:show,
      editionType:type,
      editionData:data,
      editionNotification:message,
      imageSelection:data,
      coordinates:coordinates,
      showImageCanvas:(type ==="image")?false:this.state.showImageCanvas,
    });
  };

  handleCreateAnnotation = () => {

    this.setState({
      loading: true,
    });

    var imageCoords = [];

    window.imageSelectionData && window.imageSelectionData.forEach((c)=>{
        var coords=[];
        coords.push(c.x*window.imageRatio);
        coords.push(c.y*window.imageRatio);
        coords.push((c.x + c.width)*window.imageRatio);
        coords.push((c.y + c.height)*window.imageRatio);
        coords.push(window.imageRatio);

        imageCoords.push({
          "image_id":c.image_id,
          "areaCoords":coords.join(',')
        });
      });

    var data={
      document_id:this.props.documentId,
      type:this.state.newAnnotationType,
      rank:this.state.nextChildRank,
      parent_id:this.state.parentAnnotationId,
      //image_id:window.imageSelectionData?window.imageSelectionData.image_id:null,
      //areaCoords:window.imageSelectionData?(window.imageSelectionData.x*window.imageRatio)+","+(window.imageSelectionData.y*window.imageRatio)+","+((window.imageSelectionData.x+window.imageSelectionData.width)*window.imageRatio)+","+((window.imageSelectionData.y+window.imageSelectionData.height)*window.imageRatio)+","+window.imageRatio:null,
      imageCoords:imageCoords,
      audioStart:parseFloat(window.audioSelection.start),
      audioEnd:parseFloat(window.audioSelection.end)
      //audioStart:parseFloat(this.state.audioSelection.start),
      //audioEnd:parseFloat(this.state.audioSelection.end)
    };

    (this.state.parentAnnotationId && this.state.parentAnnotationId !== 0) && AnnotationService.create(data).then(
        (response) => {
          
          this.refreshAnnotations();
          this.setState({
            editionData:response.data,
            annotationPanel:true,
            loading: false,
            openCreateDialog:false
          });

          window.wavesurfer && window.wavesurfer.seekAndCenter(response.data.audioStart/window.wavesurfer.getDuration());

          
        },
        error => {
          if(error.response.status===401) this.props.history.push('/login');
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          this.setState({
            loading: false,
            message: resMessage
          });
        }
      );
  }

  updateAnnotation = () => {
    var annotationId = this.state.editionData.annotationId;

    this.setState({
      loading:true
    });

    this.state.editionType==='audio' && AnnotationService.update(annotationId,{audioStart:this.state.editionData.start,audioEnd:this.state.editionData.end}).then(
      (response) => {

          window.wavesurfer.seekAndCenter(response.data.audioStart/window.wavesurfer.getDuration());

           window.wavesurfer.markers.markers
          .filter((m)=>m.label === this.state.editionData.annotationLabel)
          .forEach((marker,index)=>{window.wavesurfer.markers.remove(index);});
          //this.refreshAnnotations();
          //window.wavesurfer.clearMarkers();

          var annotations = this.state.annotations;
          var newAnnotations = this.replaceAnnotation(annotations,response.data,'audio');
          var newSelectedAnnotation = this.state.selectedAnnotation;
          newSelectedAnnotation.audioStart = response.data.audioStart;
          newSelectedAnnotation.audioEnd = response.data.audioEnd;
          

          this.setState({
            loading:false,
            editionData:response.data,
            annotationPanel:true,
            annotations:newAnnotations,
            selectedAnnotation:newSelectedAnnotation
          });

          this.loadRegions([response.data]);
          this.handleCloseEdition();

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

    //Multi image crops feature
    
    var image_coords = [];

    // #21 window.imageRatio
    //TODO si multi image
    if(this.state.editionType==='image'){
      
      if(window.coordinates.length > 0){

        if(window.currentAnnotationEdition.imageAddition){
          image_coords = window.currentAnnotationEdition.imageCoords;
        }

        window.currentAnnotationEdition.data && window.currentAnnotationEdition.data.forEach((c)=>{
          var coords=[];
          coords.push(c.x*window.imageRatio);
          coords.push(c.y*window.imageRatio);
          coords.push((c.x + c.width)*window.imageRatio);
          coords.push((c.y + c.height)*window.imageRatio);
          coords.push(window.imageRatio);

          image_coords.push({
            "image_id":c.image_id,
            "areaCoords":coords.join(',')
          });
        });

      }
      
      AnnotationService.update(annotationId,{imageCoords:image_coords}).then(
      (response) => {

           window.wavesurfer &&  window.wavesurfer.markers.markers
          .filter((m)=>m.label === this.state.editionData.annotationLabel)
          .forEach((marker,index)=>{window.wavesurfer.markers.remove(index);});
          //this.refreshAnnotations();

          var annotations = this.state.annotations;
          var newAnnotations = this.replaceAnnotation(annotations,response.data,'image');
          var newSelectedAnnotation = this.state.selectedAnnotation;
          newSelectedAnnotation.imageCoords = response.data.imageCoords;

          this.setState({
            loading:false,
            editionData:response.data,
            annotationPanel:true,
            annotations:newAnnotations,
            selectedAnnotation:newSelectedAnnotation
          });

          var canvasList = [];
          this.loadCanvas(newAnnotations[0],canvasList);
          this.setState({imageCanvas:canvasList});

          this.handleCloseEdition();

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

  }

  handleCloseEdition = (event) => {
    this.setState({
      openEditionNotification:false,
      editionNotification:"",
      editionData:{}
    });
    window.currentAnnotationEdition = null;
    window.imageSelectionData = [];
  }

      /**
   * Save annotations to localStorage.
   */
   saveRegions() {
      localStorage.regions = JSON.stringify(
          Object.keys(window.wavesurfer.regions.list).map(function(id) {
              let region = window.wavesurfer.regions.list[id];
              return {
                  start: region.start,
                  end: region.end,
                  attributes: region.attributes,
                  data: region.data
              };
          })
      );
  }

  refreshParentAnnotationsList = (annotations) => {
    var list = [];
    var that = this;

    annotations.forEach(function(t){
      list.push({
        'id':t.id,
        'rank':0,
        'parent_id':null,
        'label':that.props.documentType,
        'childrenType':that.props.documentType==="TEXT"?'S':'W',
        'audioStart':t.audioStart,
        'audioEnd':t.audioEnd
      });
      var nextSentenceRank = 0;

      t.children_annotations.forEach(function(s){
        list.push({
          'id':s.id,
          'rank':s.rank,
          'type':s.type,
          'parent_id':t.id,
          'label':((that.props.documentType==="TEXT"?'S':'W')+s.rank),
          'childrenType':that.props.documentType==="TEXT"?'W':'M',
          'audioStart':s.audioStart,
          'audioEnd':s.audioEnd
        });
        var nextWordRank = 0;

        s.children_annotations.forEach(function(w){
          list.push({
            'id':w.id,
            'rank':w.rank,
            'type':w.type,
            'parent_id':s.id,
            'label':('S'+s.rank+'>W'+w.rank),
            'childrenType':'M',
            'audioStart':w.audioStart,
            'audioEnd':w.audioEnd
          });
          var nextMorphemeRank = 0;

          w.children_annotations.forEach(function(m){
            list.push({
              'id':m.id,
              'rank':m.rank,
              'type':m.type,
              'parent_id':w.id,
              'label':('S'+s.rank+'>W'+w.rank+'>M'+m.rank),
              'childrenType':'NONE',
              'audioStart':m.audioStart,
              'audioEnd':m.audioEnd
            });

            nextMorphemeRank = (nextMorphemeRank < m.rank) ? (m.rank) : nextMorphemeRank;

          });

          var w_list = list.filter(a => a.id === w.id)[0];
          w_list.nextChildRank = nextMorphemeRank+1;

          nextWordRank = (nextWordRank < w.rank) ? (w.rank) : nextWordRank;
        });

        var s_list = list.filter(a => a.id === s.id)[0];
        s_list.nextChildRank = nextWordRank+1;

        nextSentenceRank = (nextSentenceRank < s.rank) ? (s.rank) : nextSentenceRank;
      });

      var t_list = list.filter(a => a.id === t.id)[0];
      t_list.nextChildRank = nextSentenceRank+1;
    });

    return list;
    
  }

  loadCanvas = (annotation,array) => {
    annotation.imageCoords && annotation.imageCoords.forEach((imageCoord)=>{
      array.push({
        image_id:imageCoord.image_id,
        id:annotation.id,
        type:annotation.type,
        rank:annotation.rank,
        areaCoords:imageCoord.areaCoords,
        hasForm:annotation.forms.length,
        hasTranslation:annotation.translations.length
      });
    });

    if(annotation.children_annotations) annotation.children_annotations.forEach((a)=>{
      this.loadCanvas(a,array);
    });

  }

  handleCheckTree = (e) => {
    
    var array = this.state.selectedTreeAnnotations;
    var annotation = e.target.value.split('_');

    if(e.target.checked){
      array.push({
        id:annotation[0],
        type:annotation[1].substr(0,1),
        label:annotation[1]
      });
    }else{
      array = array.filter(item => (item.id !== annotation[0] || item.type !== annotation[1].substr(0,1)));
    }
    
    this.setState({
      selectedTreeAnnotations:array
    });
  }

  /**
   * Get all document annotations from database and refresh the page content
   */
  refreshAnnotations = (onlyTree = false,annotationId = null) => {

    var canvasList = [];

    AnnotationService.getDocumentAnnotations(this.props.documentId).then(
      (response) => {
          this.loadCanvas(response.data.annotations[0],canvasList);
          this.setState({
            annotations:response.data.annotations,
            change:0,
            imageCanvas:canvasList,
            treeKey:Date.now(),
            parentAnnotations:this.refreshParentAnnotationsList(response.data.annotations)
          });

          if(!onlyTree){
            window.wavesurfer && window.wavesurfer.clearMarkers();
            this.loadRegions(response.data.annotations);
            

            window.coordinates = undefined;
          }

          if(annotationId>0) this.showAnnotation(this.props.documentId,annotationId,true);
        },
        error => {
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

  /**
   * refresh 
   */
  replaceAnnotation = (annotations,annotation,type) => {

    annotations.forEach((a,index) => {
      if(a.id === annotation.id){
        if(type==="audio"){
          annotations[index].audioStart = annotation.audioStart;
          annotations[index].audioEnd = annotation.audioEnd;
        }else if(type==="image"){
          annotations[index].imageCoords = annotation.imageCoords;
        }
      }else{
        this.replaceAnnotation(a.children_annotations,annotation,type);
      }
    });

    return annotations;
  }


  /*
   * Load regions.
   */

   loadRegions(annotations){

      var that = this;

      //Adapt to the recursive structure of annotation --> children annotations
      window.wavesurfer && annotations.forEach(function(annotation) {

        if(annotation.type!=="T"){

          var annotationLabel = annotation.id+"_"+annotation.type+annotation.rank;



         if ((annotationLabel.indexOf("_")>=0) && ((parseFloat(annotation.audioStart) + parseFloat(annotation.audioEnd))>0)){

            window.wavesurfer.regions.list[annotation.id] && window.wavesurfer.regions.list[annotation.id].remove();
            document.querySelectorAll('region[data-id="'+annotation.id+'"]').forEach((region)=>region.remove());

            window.wavesurfer.addRegion({
              id:annotation.id,
              start: annotation.audioStart,
              end: annotation.audioEnd,
              drag: false,
              resize: false,
              color:"rgba(0,0,0,0.2)",
              showTooltip:true,
              attributes: {
                  title: 'Region',
                }
            });

            window.wavesurfer.markers.markers
            .map((item, index) => ({ item, index }))
            .filter((m)=>m.item.label===annotationLabel)
            .forEach(({ item, index}) => window.wavesurfer.markers.remove(index));


            window.wavesurfer.addMarker({
              time: annotation.audioStart,
              label: annotationLabel,
              color: (annotation.type==="S")?"red":"blue",
              position: (annotation.type==="S")?"bottom":"top",
            });
         }
          
        }

        annotation.children_annotations && annotation.children_annotations.length > 0 && that.loadRegions(annotation.children_annotations);
        
      });
  }

  showAnnotation = (documentId,annotationId,forceRefresh = false) => {

    this.buildUrl(annotationId);

    ((annotationId!==this.state.activeAnnotationId) || forceRefresh) && AnnotationService.get(documentId,annotationId).then(
        (response) => {
            this.setState({
              annotationPanel:true,
              selectedAnnotation:response,
              activeAnnotationId:annotationId
            });
            
            if(window.wavesurfer && window.wavesurfer.getDuration()>0 && response.audioStart!==null && response.audioEnd!==undefined && response.audioEnd>0){
              //window.wavesurfer.play(parseFloat(response.audioStart),parseFloat(response.audioEnd));
              window.wavesurfer.seekAndCenter(parseFloat(response.audioStart)/window.wavesurfer.getDuration());

            }

            if(window.hasScrolled || (window.annotationPanelPosition.x === 0 && window.annotationPanelPosition.y === 0)){

              window.annotationPanelPosition.x = (document.getElementById('root').offsetWidth/3);
              //window.annotationPanelPosition.y = (document.getElementById('root').offsetHeight-document.getElementById('audioBlock').offsetTop) * (-1);
              window.annotationPanelPosition.y = (document.querySelector('.react-draggable').offsetTop - window.scrollY) * (-1);
              
              this.setState({
                annotationPanelPositionX:window.annotationPanelPosition.x,
                annotationPanelPositionY:window.annotationPanelPosition.y,
              });

              window.hasScrolled = false;
            }
            

          },
          error => {
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


  componentDidMount(){



    if(this.props.recording !== null){


      const track = document.querySelector('#track');
      var that = this;

      window.audioSelection = {};

      window.wavesurfer = WaveSurfer.create({
        /*barWidth: 1,*/
        cursorWidth: 1,
        container: '#waveform',
        progressColor: '#2D5BFF',
        responsive: true,
        waveColor: '#999999',
        cursorColor: 'transparent',
        height: 100,
        pixelRatio: 1,
        scrollParent: true,
        normalize: true,
        minimap: true,
        backend: 'MediaElement',
        plugins: [
              RegionsPlugin.create({
                container: '#wave-regions',
                preventContextMenu: false
              }),
              MinimapPlugin.create({
                height: 30,
                waveColor: '#ddd',
                progressColor: '#999',
                cursorColor: '#999'
              }),
              TimelinePlugin.create({
                container: '#wave-timeline'
              }),
              MarkersPlugin.create({
                markers: []
            })
          ]
      });

      (window.zoom) && window.wavesurfer.zoom(window.zoom*10);

      /* Regions */

      window.wavesurfer.on('ready', function() {

          window.wavesurfer.enableDragSelection({
              color: "rbga(0,150,90,0.5)"
          });
          //window.wavesurfer.setCurrentTime(window.currentTime?window.currentTime:0);

          (window.currentTime) && window.wavesurfer.seekAndCenter(window.currentTime/window.wavesurfer.getDuration());


          //Adapt the annotations props to fit with the Wavesurfer API
          if(that.state.annotations){
            that.state.annotations.forEach((a) => {
              a.start = a.audioStart;
              a.end = a.audioEnd;
              a.data = {};
              a.attributes = {
                label : a.type === 'W' ? a.type+a.rank : ''
              };

            });
          }

         
      });

      window.wavesurfer.on('pause', function() {
        /*
         that.setState({
          playing:false,
          currentTime: window.wavesurfer.getCurrentTime()
        });
        */
      });

      window.wavesurfer.on('seek', function() {
        window.currentTime = window.wavesurfer.getCurrentTime();
      });

      window.wavesurfer.on('region-dblclick', function(region, e){
        //region.remove();
        //e.stopPropagation();
      });

      window.wavesurfer.on('region-click', function(region, e) {
/*
          that.setState({
            playing:true,
          });
 */         

          e.stopPropagation();
          // Play on click, loop on shift click

          if(region.id>0){
            that.showAnnotation(that.props.documentId,region.id);
          }else{
            //e.shiftKey ? region.playLoop() : region.playPause();
            //region.play();
          }
          region.play();

      });
     // window.wavesurfer.on('region-click', that.editAnnotation);
      window.wavesurfer.on('region-update-end', function(region){       

        document.querySelectorAll('region').forEach(function(r){
          var rID = r.getAttribute("data-id");
          if(window.wavesurfer && rID.indexOf("wavesurfer_") >= 0) window.wavesurfer.regions.list[rID].remove();

        });

        window.wavesurfer.addRegion(region);

        if(region.element !== null) region.element.style['z-index']=10;

        window.currentAnnotationEdition && that.handleEditionState(true,"audio",{annotationLabel:window.currentAnnotationEdition.label,annotationId:window.currentAnnotationEdition.id,start:region.start.toFixed(2),end:region.end.toFixed(2)});
        
        window.audioSelection.start = region.start.toFixed(2);
        window.audioSelection.end = region.end.toFixed(2);
/*
        that.setState({
          audioSelection:{
            start:region.start.toFixed(2),
            end:region.end.toFixed(2)
          },
          hasAudioSelection:true
        });
*/

      });


      window.wavesurfer.on('marker-click', function(region, e){
        that.showAnnotation(that.props.documentId,region.label.split("_")[0]);
        e.stopPropagation();
      });

      window.wavesurfer.on('region-play', function(region) {
          region.once('out', function() {
              //console.log('region play event');
              //window.wavesurfer.play(region.start);
              window.wavesurfer.pause();
          });
      });

      window.wavesurfer.load(track);
      this.handleSliderZoomChange(100,(window.zoom?window.zoom:0));
      
    }

    var canvasList = [];
    this.loadCanvas(this.state.annotations[0],canvasList);
    this.setState({
      parentAnnotations:this.refreshParentAnnotationsList(this.state.annotations),
      imageCanvas:canvasList
    });

    if(window.wavesurfer){
      window.wavesurfer.clearMarkers();
      this.loadRegions(this.state.annotations);
    }


    if(this.state.activeAnnotationId>0){
      this.showAnnotation(this.props.documentId,this.state.activeAnnotationId);
    }
    
  }


  handlePlay = () => {
    this.setState({ 
      playing: !this.state.playing,
      currentTime: window.wavesurfer.getCurrentTime()
      //crop: window.crop 
    });
    window.currentTime= window.wavesurfer.getCurrentTime();
    window.wavesurfer.playPause();
  };

  toggleAnnotationsDrawer = (open) => (event) => {
    this.setState({annotationsPanel: open });
  };

  toggleImportDrawer = (anchor, open) => (event) => {
    this.setState({importPanel: open });
  };

  selectionExists = (exist) => {
    this.setState({hasImageSelection:exist});
  }

  annotationHasChanged = (annotationId = null) => {

    this.refreshAnnotations(true);
    (annotationId!==null) && this.showAnnotation(this.props.documentId,annotationId);
  }

  render = () => {

  console.log();

    var docType = this.props.documentType;

    var badgeStyleCommon = {
        //position: "absolute",
        top:"0px",
        width: "15px",
        height: "15px",
        borderRadius: "50%",
        color: "white",
        fontSize: "0.6rem",
        fontWeight: "bold",
        textAlign: "center",
        padding:"4px"
      };

    var badgeStyleForm = {
        position: badgeStyleCommon.position,
        top:badgeStyleCommon.top,
        width: badgeStyleCommon.width,
        height: badgeStyleCommon.height,
        borderRadius: badgeStyleCommon.borderRadius,
        color: badgeStyleCommon.color,
        fontSize: badgeStyleCommon.fontSize,
        fontWeight: badgeStyleCommon.fontWeight,
        textAlign: badgeStyleCommon.textAlign,
        paddingLeft:badgeStyleCommon.padding,
        paddingRight:badgeStyleCommon.padding
      };

    var badgeStyleTranslation = {
        position: badgeStyleCommon.position,
        top:badgeStyleCommon.top,
        width: badgeStyleCommon.width,
        height: badgeStyleCommon.height,
        borderRadius: badgeStyleCommon.borderRadius,
        color: badgeStyleCommon.color,
        fontSize: badgeStyleCommon.fontSize,
        fontWeight: badgeStyleCommon.fontWeight,
        textAlign: badgeStyleCommon.textAlign,
        paddingLeft:badgeStyleCommon.padding,
        paddingRight:badgeStyleCommon.padding
      };

      badgeStyleForm.right = "10px";
      badgeStyleTranslation.right = "0px";

      //badgeStyleForm.backgroundColor = (annotation.forms.length > 0) ? "green":"red";
      //badgeStyleTranslation.backgroundColor = (annotation.translations.length > 0) ? "green":"red";

    function TabPanel(props) {

      const { children, value, index, id,...other } = props;

      return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`image-tabpanel-${id}`}
          aria-labelledby={`image-tab-${index}`}
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

    const handleChange = (event, newValue) => {
      this.setState({tabValue:newValue});
      window.tabValue = newValue;
    };

    function a11yProps(index) {
      return {
        id: `image-tab-${index}`,
        'aria-controls': `image-tabpanel-${index}`,
      };
    }

    var imagesTabs = [];
    var imagesTabContents = [];

    var that = this;

    this.props.images.forEach(function(image,index){

      var imageCanvas = that.state.imageCanvas.filter((area) => area.image_id === image.id);

      imagesTabs.push(<Tab wrapped label={image.name} {...a11yProps(image.name)} />)
      imagesTabContents.push(
        <TabPanel key={image.id} value={that.state.tabValue} index={index} id={image.id}>
          <ImageMultiSelector
            key={image.id}
            image={image}
            annotations={that.state.annotations}
            canvas={imageCanvas}
            coordinates={(that.state.coordinates===undefined)?[]:that.state.coordinates.filter(coords => coords.image_id === image.id)}
            //coordinates={(window.coordinates===undefined)?[]:window.coordinates.filter(coords => coords.image_id === image.id)}
            showAnnotation={that.showAnnotation}
            showImageCanvas={that.state.showImageCanvas}
            selectionExists={that.selectionExists}
            children={0}
            documentId={that.props.documentId}
          />
        </TabPanel>);
    });

    const marks = [
      {
        value: 0,
        label: '-',
      },
      {
        value: 100,
        label: '+',
      }
    ];

    window.addEventListener('scroll', function(){window.hasScrolled=true});

    return (
      <div>
        <span>
          <Chip
            icon={<ImportIcon />}
            label="Import Annotations"
            clickable
            size="small"
            color="primary"
            onClick={this.toggleImportDrawer(this.state.importPanel, true)}
          />
          <Drawer anchor="right" open={this.state.importPanel} onClose={this.toggleImportDrawer(this.state.importPanel, false)}>
            <div
              role="presentation"
            >
            <DocumentAnnotationsImport 
              documentId={this.props.documentId} 
              refreshAnnotations={this.refreshAnnotations} 
             />
            </div>
          </Drawer>
        </span>

        <span>
            <Chip
              icon={<AddIcon />}
              label="Create Annotation"
              clickable
              size="small"
              color="primary"
              onClick={this.handleOpenCreateDialog}
            />
        </span>
        <span>
          <Chip
            icon={<ImportIcon />}
            label="View Annotations"
            clickable
            size="small"
            color="primary"
            onClick={this.toggleAnnotationsDrawer(true)}
          />
          <Drawer
            variant="persistent"
            anchor="left"
            open={this.state.annotationsPanel}
            onClose={this.toggleAnnotationsDrawer(false)}
          >  
            <div>
              <IconButton onClick={this.toggleAnnotationsDrawer(false)}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <DocumentAnnotationsTree
              parentAnnotations={this.state.parentAnnotations}
              key={this.state.treeKey}
              documentId={this.props.documentId}
              annotations={this.state.annotations}
              refreshAnnotations={this.refreshAnnotations}
              hasAudio={this.props.recording!==null}
              hasImage={this.props.images.length > 0}
              showAnnotation={this.showAnnotation}
            />
          </Drawer>
        </span>
        
        {this.props.recording === null ? <Chip id="audioBlock" icon={<MicOffIcon />} label="No audio recording" size="small"/> : 
          <div id="audioBlock">

            {(1===2) && <FormControlLabel
                          control={<Switch color="primary" checked={this.state.showRegions} onChange={this.handleShowRegions} name="showRegions" />}
                          label="Show regions"
                        />}

            <Grid container spacing={4}>
              <Grid item xs={1}>
                <IconButton color="primary" title="Play audio" aria-label="Play audio" onClick={this.handlePlay}>
                  {!this.state.playing ? <PlayIcon /> : <PauseIcon /> }
                </IconButton>
              </Grid>

              <Grid item xs={4}>
                <Typography id="continuous-slider" gutterBottom>
                  Playback speed
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    slow
                  </Grid>
                  <Grid item xs>
                    <Slider 
                      orientation="horizontal"
                      aria-labelledby="speed-slider"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={this.state.speed}
                      onChange={this.handleSliderSpeedChange}
                    />
                  </Grid>
                  <Grid item>
                    normal
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={4}>
                <Typography id="continuous-slider" gutterBottom>
                  Zoom
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <ZoomOut />
                  </Grid>
                  <Grid item xs>
                  <Slider 
                      orientation="horizontal"
                      value={this.state.zoom}
                      onChange={this.handleSliderZoomChange}
                      aria-labelledby="zoom-slider"
                      marks={marks}
                    />
                    </Grid>
                  <Grid item>
                    <ZoomIn />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <div hidden={this.props.recording === null} >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <div id="wave-timeline"></div>
                  <div id="wave-minimap"></div>
                  <div id="wave-regions"></div>
                  <div id="waveform">
                    <audio id="track" src={"data:audio/mpeg;base64,"+this.props.recording["TO_BASE64(content)"]} type="audio/mp3" />
                  </div>
                </Grid>
              </Grid>
            </div>
          </div>
        }

        {this.props.images.length > 0 ? 
          (
            <div>
              <AppBar position="static">
                <Tabs 
                  value={this.state.tabValue}
                  onChange={handleChange}
                  aria-label="simple tabs example"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {imagesTabs}
                </Tabs>
               </AppBar>
               <FormControlLabel
                  control={<Switch color="primary" checked={this.state.showImageCanvas} onChange={this.handleShowImageCanvas} name="showImageCanvas" />}
                  label="Show image selections"
                />
              {imagesTabContents}
            </div>
          )
        :
        <Chip icon={<MicOffIcon />} label="No image" size="small"/> 
      }
        
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.openEditionNotification}
          autoHideDuration={null}
          message={this.state.editionNotification}
          action={
            <React.Fragment>
            {this.state.loading ?
              <CircularProgress />
              :
              <Button color="secondary" size="small" onClick={this.updateAnnotation}>
                Update
              </Button>
            }
              <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleCloseEdition}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />

        <Dialog open={this.state.openCreateDialog} onClose={this.handleCloseCreateDialog} aria-labelledby="form-createdialog-title">
            <DialogTitle id="form-createdialog-title">Create annotation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Level</FormLabel>
                  <RadioGroup 
                    row
                    aria-label="position"
                    name="newAnnotationType"
                    onChange={this.handleNewAnnotationTypeChange}
                    value={this.state.newAnnotationType}
                  >
                    {this.props.documentType === "TEXT" && <FormControlLabel
                      value="S"
                      control={<Radio color="primary" />}
                      label="Sentence"
                      labelPlacement="top"
                    />}
                    <FormControlLabel
                      value="W"
                      control={<Radio color="primary" />}
                      label="Word"
                      labelPlacement="top"
                    />
                    <FormControlLabel
                      value="M"
                      control={<Radio color="primary" />}
                      label="Morpheme"
                      labelPlacement="top"
                    />
                  </RadioGroup>
                </FormControl>
                <FormControl>
                  <InputLabel shrink htmlFor="select-multiple-native">
                    Parent annotation
                  </InputLabel>
                  <Select
                    native
                    value={this.state.parentAnnotationId}
                    onChange={this.handleParentAnnotationChange}
                    inputProps={{
                      id: 'select-parent-annotation',
                    }}
                  >
                    {this.state.parentAnnotations.map((a) => (
                      <option
                        key={a.id}
                        value={a.id}
                        childrenType={a.childrenType}
                        nextChildRank={a.nextChildRank}
                        disabled={this.state.newAnnotationType!==a.childrenType}
                        hidden={this.state.newAnnotationType!==a.childrenType}
                        audioStart={a.audioStart}
                        audioEnd={a.audioEnd}
                        selected={this.state.newAnnotationType===a.childrenType && a.audioStart<=window.audioSelection.start && a.audioEnd>=window.audioSelection.end}
                        >
                        {a.label}
                      </option>
                    ))}

                  </Select>
                </FormControl>

              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleCloseCreateDialog} color="primary">
                Cancel
              </Button>
              {!this.state.loading && (this.state.parentAnnotationId>0) && (this.state.newAnnotationType) && <Button onClick={this.handleCreateAnnotation} color="primary">
                Create annotation
              </Button>
              }
              {this.state.loading && <CircularProgress />}
            </DialogActions>
          </Dialog>


          <Draggable
            onStop={(e: Event, data: DraggableData) => {window.annotationPanelPosition=data;this.setState({annotationPanelPositionX:data.x,annotationPanelPositionY:data.y})}}
            position={{x:this.state.annotationPanelPositionX,y:this.state.annotationPanelPositionY}}
          >

            <Accordion
              expanded={this.state.annotationPanel}
              onChange={(event) => this.setState({annotationPanel:!this.state.annotationPanel})}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              > 
                <Grid container>
                  <Grid item xs={1} onClick={(event) => event.stopPropagation()}>
                    <OpenWithIcon />
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>Annotation panel</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>

              <AccordionDetails style={{display:"contents"}}>
                <DocumentAnnotation 
                      data={this.state.selectedAnnotation}
                      documentType={docType}
                      refreshAnnotations={this.refreshAnnotations}
                      handleEditionState={this.handleEditionState}
                      parentAnnotations={this.state.parentAnnotations}
                      available_lang={this.props.available_lang}
                      available_kindOf={this.props.available_kindOf}
                      annotationHasChanged={this.annotationHasChanged}
                      onClose={this.handleCloseCreateDrawer}
                      showAnnotation={this.showAnnotation}
                 />
              </AccordionDetails>

            </Accordion>
          </Draggable>

          <div style={{minHeight:"90px"}}></div>
      </div>
    );
  }
};

export default withRouter(DocumentAnnotations);