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

import DocumentAnnotation from './document.annotation.component';
import DocumentAnnotationsImport from './document.annotations.import.component';
import AnnotationService from "../services/annotation.service";
import CircularProgress from '@material-ui/core/CircularProgress';

import Snackbar from '@material-ui/core/Snackbar';
import Tree from 'react-animated-tree';
import { withRouter } from 'react-router-dom';

window.wavesurfer = null;

class DocumentAnnotations extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      playing: false,
      zoom: 10,
      tabValue:window.tabValue?window.tabValue:0,
      crop:null,
      annotationsPanel: false,
      annotationPanel: false,
      importPanel: false,
      annotations: this.props.annotations,
      change:0,
      openEditionNotification:window.currentAnnotationEdition && window.currentAnnotationEdition!==null,
      editionNotification:"",
      editionType:"audio",
      editionData:{},
      audioSelection:false,
      imageSelection:false,
      openCreateDialog:false,
      openDeleteDialog:false,
      newAnnotationType:null,
      parentAnnotations:[],
      parentAnnotationId:0,
      nextChildRank:0,
      selectedAnnotation: {},
      imageCanvas:[],
      showImageCanvas:true,
      hasAudioSelection:false,
      activeAnnotationId:this.props.activeAnnotationId?this.props.activeAnnotationId:0,
      selectedTreeAnnotations:[]
    };
    this.previewCanvasRef = React.createRef();
  }

  handleSliderChange = (event, newValue) => {

    window.wavesurfer && window.wavesurfer.zoom(newValue*10);
    this.setState({
      zoom:newValue,
      crop:window.crop,
      openEditionNotification:this.state.openEditionNotification
    });

  };

  handleShowImageCanvas = (event) => {

    document.querySelectorAll('canvas.imageCanvas').forEach(e => e.style.display = (event.target.checked)?"block":"none");
    
    this.setState({
      showImageCanvas:event.target.checked,
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
    params.delete('annotation');

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

    if((window.coordinates === undefined || window.coordinates.length === 0) && !this.state.hasAudioSelection){
      alert("No selection in audio or image");
      return;
    }
    this.refreshParentAnnotationsList();

    // Autoselection of the right parent annotation
    var that = this;

    console.log(this.state.parentAnnotations);

    that.setState({
      parentAnnotationId:this.state.parentAnnotations[0].id,
      newAnnotationType:this.state.parentAnnotations[0].childrenType,
      nextChildRank: this.state.parentAnnotations[0].nextChildRank
    });

    this.state.parentAnnotations.forEach(function(p){
      if((parseFloat(that.state.audioSelection.end) <= parseFloat(p.audioEnd) ) && (parseFloat(that.state.audioSelection.start) >= parseFloat(p.audioStart))){
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

  handleEditionState = (show,type,data) => {

    var message = (type==="audio")
    ?
    "Editing "+data.annotationLabel+" Start: "+data.start+"/End: "+data.end
    :
    "Editing "+window.currentAnnotationEdition.annotationLabel+" Image";

    var coordinates = [];

    window.currentAnnotationEdition.imageCoords.forEach((i) => {
      var areaCoords = i.areaCoords.split(",");
      coordinates.push({
        x: parseFloat(areaCoords[0]) / parseFloat(areaCoords[4]),
        y: parseFloat(areaCoords[1]) / parseFloat(areaCoords[4]),
        width: (parseFloat(areaCoords[2]) - parseFloat(areaCoords[0])) / parseFloat(areaCoords[4]),
        height: (parseFloat(areaCoords[3]) - parseFloat(areaCoords[1])) / parseFloat(areaCoords[4]),
      });
    });

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
          "image_id":c.imageId,
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
      audioStart:parseFloat(this.state.audioSelection.start),
      audioEnd:parseFloat(this.state.audioSelection.end)
    };

    (this.state.parentAnnotationId && this.state.parentAnnotationId !== 0) && AnnotationService.create(data).then(
        (response) => {
          
          this.refreshAnnotations();
          this.setState({
            editionData:response.data,
            annotationPanel:true
          });
          
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
    this.setState({
      loading:true
    });

    this.state.editionType==='audio' && AnnotationService.update(this.state.editionData.annotationId,{audioStart:this.state.editionData.start,audioEnd:this.state.editionData.end}).then(
      (response) => {
          this.setState({
            loading:false
          });
           window.wavesurfer.markers.markers
          .filter((m)=>m.label === this.state.editionData.annotationLabel)
          .forEach((marker,index)=>{window.wavesurfer.markers.remove(index);});
          this.refreshAnnotations();
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
      
      if(window.currentAnnotationEdition.imageAddition){
        image_coords = window.currentAnnotationEdition.imageCoords;
      }

      console.log(window.currentAnnotationEdition);

      // buggingwindow.currentAnnotationEdition.data.forEach((c)=>{
      window.imageSelectionData.forEach((c)=>{
        var coords=[];
        coords.push(c.x*window.imageRatio);
        coords.push(c.y*window.imageRatio);
        coords.push((c.x + c.width)*window.imageRatio);
        coords.push((c.y + c.height)*window.imageRatio);
        coords.push(window.imageRatio);

        image_coords.push({
          "image_id":c.imageId,
          "areaCoords":coords.join(',')
        });
      });

    }

    this.state.editionType==='image' && AnnotationService.update(this.state.editionData.annotationId,{imageCoords:image_coords}).then(
      (response) => {
          this.setState({
            loading:false
          });
           window.wavesurfer &&  window.wavesurfer.markers.markers
          .filter((m)=>m.label === this.state.editionData.annotationLabel)
          .forEach((marker,index)=>{window.wavesurfer.markers.remove(index);});
          this.refreshAnnotations();
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

  handleCloseEdition = (event) => {
    this.setState({openEditionNotification:false,editionNotification:"",editionData:{}});
    window.currentAnnotationEdition = null;
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

  refreshParentAnnotationsList = () => {
    var list = [];
    var that = this;

    this.state.annotations.forEach(function(t){
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


    this.setState({parentAnnotations:list});
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

    annotation.children_annotations.forEach((a)=>{
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

  convertAnnotationsToTree = (annotation) => {

    annotation.children_annotations.sort((a, b) => a.rank - b.rank);

    var that = this;
    var childTypes = {
      'T':'sentence','S':'word','W':'morpheme',
    };

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
        padding:"3px"
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

      var badgeStyleAudio = {
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

    var badgeStyleImage = {
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

      var formInfo = "";var translationInfo = "";var audioInfo = "";var imageInfo = "";
      //FORM INFO
      if(annotation.forms.length > 0){
        badgeStyleForm.backgroundColor = "green";
        formInfo = "At least one form exists";
      }else{
        badgeStyleForm.backgroundColor = "red";
        formInfo = "No form";
      }
      //TRANSL INFO
      if(annotation.translations.length > 0){
        badgeStyleTranslation.backgroundColor = "green";
        translationInfo = "At least one translation exists";
      }else{
        badgeStyleTranslation.backgroundColor = "red";
        translationInfo = "No translation";
      }
      //AUDIO INFO
      if( (parseFloat(annotation.audioStart) + parseFloat(annotation.audioEnd)) > 0){
        badgeStyleAudio.backgroundColor = "green";
        audioInfo = "Audio selection exists";
      }else{
        badgeStyleAudio.backgroundColor = "red";
        audioInfo = "No audio selection";
      }
      //IMAGE INFO
      if(annotation.imageCoords && annotation.imageCoords.length > 0){
        badgeStyleImage.backgroundColor = "green";
        imageInfo = "Image selection exists";
      }else{
        badgeStyleImage.backgroundColor = "red";
        imageInfo = "No image selection";
      }


      return (
        <Tree 
          key={annotation.id}
          canHide = {annotation.type !== 'T'}
          content={annotation.type !== 'T' && (<React.Fragment>
        {annotation.forms && annotation.forms.length > 0 && annotation.forms[0].text}
        <span>  </span>
        <span class="infoBadge" style={badgeStyleForm} title={formInfo} >F</span>
        <span class="infoBadge" style={badgeStyleTranslation} title={translationInfo} >T</span>
        {this.props.recording !== null && <span class="infoBadge" style={badgeStyleAudio} title={audioInfo} >A</span>}
        {this.props.images.length > 0 && <span class="infoBadge" style={badgeStyleImage} title={imageInfo} >I</span>}
      </React.Fragment>)} 
          type={annotation.type === 'T' ? 'Annotations' : (<FormControlLabel
          control={
            <Checkbox
              onChange={that.handleCheckTree}
              value={annotation.id+'_'+annotation.type+annotation.rank}
              name="checkedTree"
              color="primary"
            />
          }
          label={annotation.type+annotation.rank}
        />)}
          onClick={() => this.showAnnotation(this.props.documentId,annotation.id)}
          open={this.props.expanded}
          >
          {
            annotation.children_annotations && annotation.children_annotations.map((children_annotation) => this.convertAnnotationsToTree(children_annotation))
          }
        </Tree>
      );

  }

  /**
   * Get all document annotations from database and refresh the page content
   */
  refreshAnnotations = () => {

    var canvasList = [];

    AnnotationService.getDocumentAnnotations(this.props.documentId).then(
      (response) => {
          this.setState({
            annotations:response.data.annotations,
            change:0
          });
          this.refreshParentAnnotationsList();
          this.props.refreshDocumentAnnotations(response.data.annotations);
          this.loadRegions(response.data.annotations);
          this.loadCanvas(response.data.annotations[0],canvasList);
          this.setState({
            imageCanvas:canvasList
          });
          window.coordinates = undefined;
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
   * Load regions from localStorage.
   */
   loadRegions(regions) {
      var that = this;

      //Adapt to the recursive structure of annotation --> children annotations
      window.wavesurfer && regions.forEach(function(region) {
        var annotationLabel = region.id+"_"+region.type+region.rank;
        window.wavesurfer.regions.list[region.id] && window.wavesurfer.regions.list[region.id].remove();
             
        if(region.type!=="T"){
          window.wavesurfer.addRegion({
              id:region.id,
              start: region.audioStart,
              end: region.audioEnd,
              drag: false,
              resize: false,
              color:"rgba(0,0,0,0.2)",
              showTooltip:true,
              attributes: {
                  title: 'Region',
                }
            });

          window.wavesurfer.markers.markers
          .filter((m)=>m.label === annotationLabel)
          .forEach((marker,index)=>{window.wavesurfer.markers.remove(index);});

          //window.wavesurfer.markers.remove
          window.wavesurfer.addMarker({
            time: region.audioStart,
            label: annotationLabel,
            color: (region.type==="S")?"red":"blue",
            position: (region.type==="S")?"bottom":"top",
          });

        }

        region.children_annotations.length > 0 && that.loadRegions(region.children_annotations);
        
      });
  }

  showAnnotation = (documentId,annotationId) => {
    AnnotationService.get(documentId,annotationId).then(
        (response) => {
            this.setState({
              annotationPanel:true,
              selectedAnnotation:response
            });
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

  handleCloseDeleteDialog = (event) => {
    this.setState({
        openDeleteDialog: false
      });
  };

  handleOpenDeleteDialog = (event) => {
    this.setState({
        openDeleteDialog: true
      });
  };

  handleDeleteAnnotation = (event) => {
    //todo
    this.setState({
      loading: true
    });

    var checkToDel = this.state.selectedTreeAnnotations.length;
    var countDeleted = 0;

    this.state.selectedTreeAnnotations.forEach((a)=>{

      AnnotationService.delete(a.id).then(
      (response) => {
          countDeleted++;
          console.log(checkToDel,countDeleted);

          if(countDeleted === checkToDel){
            this.setState({
              loading: false
            });
            this.handleCloseDeleteDialog();
            this.refreshAnnotations();
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

          this.setState({
            loading: false,
            message: resMessage
          });
        });

    });
  };

  

  componentDidMount(){

    this.refreshParentAnnotationsList();

    if(this.props.recording !== null){
      const track = document.querySelector('#track');
      var that = this;

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

      /* Regions */

      window.wavesurfer.on('ready', function() {
          window.wavesurfer.enableDragSelection({
              color: "rbga(0,150,90,0.5)"
          });

          //Adapt the annotations props to fit with the Wavesurfer API
          if (that.state.annotations){
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
         that.setState({playing:false});

      });

      window.wavesurfer.on('region-click', function(region, e) {
          that.setState({playing:true});
          e.stopPropagation();
          // Play on click, loop on shift click
          e.shiftKey ? region.playLoop() : region.play();
      });
     // window.wavesurfer.on('region-click', that.editAnnotation);
      window.wavesurfer.on('region-updated', function(region){
          var regions = region.wavesurfer.regions.list;
          var keys = Object.keys(regions).filter((key)=>key.indexOf("wavesurfer")>=0);

          if(keys.length > 1){
            regions[keys[0]].remove();
          }

          region.element.style['z-index']=10;

          window.currentAnnotationEdition && that.handleEditionState(true,"audio",{annotationLabel:window.currentAnnotationEdition.label,annotationId:window.currentAnnotationEdition.id,start:region.start.toFixed(2),end:region.end.toFixed(2)});
          
          that.setState({
            audioSelection:{
              start:region.start.toFixed(2),
              end:region.end.toFixed(2)
            },
            hasAudioSelection:true
          });
      });

      window.wavesurfer.on('region-dblclick', function(region, e){
        window.wavesurfer.pause();
        e.stopPropagation();
      });

      window.wavesurfer.on('marker-click', function(region, e){

        that.showAnnotation(that.props.documentId,region.label.split("_")[0]);
        e.stopPropagation();
      });

      window.wavesurfer.on('region-play', function(region) {
          region.once('out', function() {
              window.wavesurfer.play(region.start);
              window.wavesurfer.pause();
          });
      });

      window.wavesurfer.load(track);
    }

    this.handleSliderChange(100,10);

    var canvasList = [];
    this.loadCanvas(this.state.annotations[0],canvasList);
    this.setState({imageCanvas:canvasList});

    window.addEventListener('wheel', (e) => {  
      if(e.target.tagName === 'WAVE' || e.target.tagName === 'REGION'){
        e.preventDefault();
        e.stopPropagation();
        var newValue = this.state.zoom+Math.round(e.deltaY/50);
        if(newValue >= 0 && newValue <= 100) this.handleSliderChange(100,newValue);

        return false;}
    },{passive: false});

    if(this.state.activeAnnotationId>0){
      this.showAnnotation(this.props.documentId,this.state.activeAnnotationId);
    }
    
  }


  handlePlay = () => {
    this.setState({ 
      playing: !this.state.playing, 
      //crop: window.crop 
    });
    window.wavesurfer.playPause();
  };

  toggleAnnotationsDrawer = (anchor, open) => (event) => {
    if(this.state.change > 0) this.refreshAnnotations();
    this.setState({annotationsPanel: open });
  };

  toggleImportDrawer = (anchor, open) => (event) => {
    this.setState({importPanel: open });
  };

  selectionExists = (exist) => {
    this.setState({hasImageSelection:exist});
  }

  annotationHasChanged = () => {
    this.setState({change:this.state.change+1});
  }

  render = () => {

    this.loadRegions(this.state.annotations);

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

      if(localStorage["image"+image.id]!==undefined){
        localStorage["image"+image.id]=image["TO_BASE64(content)"];
      }else{
        localStorage.setItem("image"+image.id, image["TO_BASE64(content)"]);
      }

      var imageCanvas = that.state.imageCanvas.filter((area) => area.image_id === image.id);


      imagesTabs.push(<Tab label={image.name} {...a11yProps(image.name)} />)
      imagesTabContents.push(
        <TabPanel key={image.id} value={that.state.tabValue} index={index} id={image.id}>
        <ImageMultiSelector
          key={image.id}
          image={image}
          annotations={that.state.annotations}
          canvas={imageCanvas}
          coordinates={that.state.coordinates}
          showAnnotation={that.showAnnotation}
          showImageCanvas={that.state.showImageCanvas}
          selectionExists={that.selectionExists}
          children={0}
          documentId={that.props.documentId}
        />


        

        </TabPanel>);
    });

    return (
      <React.Fragment>
        
        {this.props.recording === null ? <Chip icon={<MicOffIcon />} label="No audio recording" size="small"/> : 
          <div>
            <IconButton color="primary" title="Play audio" aria-label="Play audio" onClick={this.handlePlay}>
              {!this.state.playing ? <PlayIcon /> : <PauseIcon /> }
            </IconButton>

            <Grid container spacing={2}>
              <Grid item>
                  <ZoomOut />
              </Grid>
              <Grid item xs>
              <Slider value={this.state.zoom} onChange={this.handleSliderChange} aria-labelledby="zoom-slider" />
              </Grid>
              <Grid item>
                  <ZoomIn />
              </Grid>
            </Grid>

            <div hidden={this.props.recording === null} >
              <div id="wave-timeline"></div>
              <div id="wave-minimap"></div>
              <div id="wave-regions"></div>
              <div id="waveform">
                <audio id="track" src={"data:audio/mpeg;base64,"+this.props.recording["TO_BASE64(content)"]} type="audio/mp3" />
              </div>
            </div>
          </div>
        }

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

          <Drawer anchor="bottom" open={this.state.annotationPanel} onClose={this.handleCloseCreateDrawer}>
            <div
              role="presentation"
            >
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
              />
            </div>
          </Drawer>
        </span>

        <Chip
              icon={<DeleteIcon />}
              label="Delete selected annotation(s)"
              clickable
              size="small"
              color="primary"
              onClick={this.handleOpenDeleteDialog}
              style={{display:((this.state.selectedTreeAnnotations.length===0)?'none':'inline-flex')}}
            />

        {this.convertAnnotationsToTree(this.state.annotations[0])}

        <Dialog open={this.state.openDeleteDialog} onClose={this.handleCloseDeleteDialog} aria-labelledby="form-deletedialog-title">
            <DialogTitle id="form-deletedialog-title">Delete annotation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Delete annotation(s) ?
                {
                  this.state.selectedTreeAnnotations.map((a) => (
                  ' '+a.label
                ))}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleCloseDeleteDialog} color="primary">
                Cancel
              </Button>
              {!this.state.loading && <Button onClick={this.handleDeleteAnnotation} color="primary">
                Delete annotation
              </Button>
              }
              {this.state.loading && <CircularProgress />}
            </DialogActions>
          </Dialog>

        {this.props.images.length > 0 ? 
          (
            <div>
              <AppBar position="static">
                <Tabs value={this.state.tabValue} onChange={handleChange} aria-label="simple tabs example">
                  {imagesTabs}
                </Tabs>
               </AppBar>
               <FormControlLabel
                  control={<Switch checked={this.state.showImageCanvas} onChange={this.handleShowImageCanvas} name="showImageCanvas" />}
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
                        selected={this.state.newAnnotationType===a.childrenType && a.audioStart<=this.state.audioSelection.start && a.audioEnd>=this.state.audioSelection.end}
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
          <div style={{minHeight:"90px"}}></div>
      </React.Fragment>
    );
  }
};

export default withRouter(DocumentAnnotations);