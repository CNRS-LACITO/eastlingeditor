import React, { Component } from "react";
import Container from '@material-ui/core/Container';

//import Metadata from './Components/Metadata';
import DisplayOptions from './player/DisplayOptions';
import Player from './player/Player';
import Annotations from './player/Annotations';

//import './App.css';


export default class DocumentPreview extends Component {
  
  /*
  ** Convert the annotations to fit with the Pangloss Player
  */
  convertToPlayerFormat(annotationsEditor){

    var annotationsPlayer = {};
    var timeList = [];
    var isWordList = (annotationsEditor.children_annotations && annotationsEditor.children_annotations[0].type === "W");

    annotationsPlayer.WORDLIST = {};

    annotationsPlayer.TEXT = {};
    annotationsPlayer.TEXT.FORM = annotationsEditor.forms;
    annotationsPlayer.TEXT.TRANSL = [];

    annotationsEditor.translations.forEach((t)=>{
      annotationsPlayer.TEXT.TRANSL.push({
        'xml:lang':t.lang,
        text:t.text
      });
    });

    annotationsPlayer.WORDLIST.W = [];
    annotationsPlayer.TEXT.S = [];

    !isWordList && annotationsEditor.children_annotations.forEach((s)=>{
      var sentence = {};
      sentence.AUDIO = {};
      sentence.FORM = s.forms;
      sentence.TRANSL = [];

      s.translations.forEach((t)=>{
        sentence.TRANSL.push({
          'xml:lang':t.lang,
          text:t.text
        });
      });

      sentence.id = s.type+s.rank;

      if(s.areaCoords!==null){
        sentence.AREA = {};
        sentence.AREA.image = "image"+s.image_id;
        sentence.AREA.shape = "rect";
        sentence.AREA.coords = s.areaCoords;
      }
      
      sentence.AUDIO.start = s.audioStart;
      sentence.AUDIO.end = s.audioEnd;

      timeList.push({
        start:s.audioStart,
        end:s.audioEnd,
        sentence:sentence.id,
        word:null,
        morpheme:null,
        type:'S'
      });

      if(s.children_annotations.length > 0){
              sentence.W = [];

              s.children_annotations.forEach((w)=>{
                      var word = {};
                      word.AUDIO = {};
                      word.FORM = w.forms;
                      word.TRANSL = [];

                      w.translations.forEach((t)=>{
                        word.TRANSL.push({
                          'xml:lang':t.lang,
                          text:t.text
                        });
                      });

                      word.id = sentence.id+w.type+w.rank;

                      if(w.areaCoords!==null){
                        word.AREA = {};
                        word.AREA.image = "image"+w.image_id;
                        word.AREA.shape = "rect";
                        word.AREA.coords = w.areaCoords;
                      }
                      

                      word.AUDIO.start = w.audioStart;
                      word.AUDIO.end = w.audioEnd;

                      timeList.push({
                        start:w.audioStart,
                        end:w.audioEnd,
                        sentence:sentence.id,
                        word:word.id,
                        morpheme:null,
                        type:'W'
                      });

                      if(w.children_annotations.length > 0){
                          word.M = [];

                          w.children_annotations.forEach((m)=>{
                                  var morph = {};
                                  morph.AUDIO = {};
                                  morph.FORM = m.forms;
                                  morph.TRANSL = [];

                                  m.translations.forEach((t)=>{
                                    morph.TRANSL.push({
                                      'xml:lang':t.lang,
                                      text:t.text
                                    });
                                  });

                                  morph.id = word.id+m.type+m.rank;
                                  if(m.areaCoords!==null){
                                    morph.AREA = {};
                                    morph.AREA.image = "image" + m.image_id;
                                    morph.AREA.shape = "rect";
                                    morph.AREA.coords = m.areaCoords;
                                  }

                                  morph.AUDIO.start = m.audioStart;
                                  morph.AUDIO.end = m.audioEnd;

                                  timeList.push({
                                    start:m.audioStart,
                                    end:m.audioEnd,
                                    sentence:sentence.id,
                                    word:word.id,
                                    morpheme:morph,
                                    type:'M'
                                  });

                                  word.M.push(morph);
                          });
                      }
                      
                      sentence.W.push(word);
              });
      }

      annotationsPlayer.TEXT.S.push(sentence);

    });

    isWordList && annotationsEditor.children_annotations.forEach((w)=>{

        var word = {};
        word.AUDIO = {};
        word.FORM = w.forms;
        word.TRANSL = [];

        w.translations.forEach((t)=>{
          word.TRANSL.push({
            'xml:lang':t.lang,
            text:t.text
          });
        });

        word.id = w.type+w.rank;

        if(w.areaCoords!==null){
          word.AREA = {};
          word.AREA.image = "image"+w.image_id;
          word.AREA.shape = "rect";
          word.AREA.coords = w.areaCoords;
        }
        

        word.AUDIO.start = w.audioStart;
        word.AUDIO.end = w.audioEnd;

        timeList.push({
          start:w.audioStart,
          end:w.audioEnd,
          sentence:null,
          word:word.id,
          morpheme:null,
          type:'W'
        });

        if(w.children_annotations.length > 0){
            word.M = [];
            w.children_annotations.forEach((m)=>{
                var morph = {};
                morph.AUDIO = {};
                morph.FORM = m.forms;
                morph.TRANSL = [];

                m.translations.forEach((t)=>{
                  morph.TRANSL.push({
                    'xml:lang':t.lang,
                    text:t.text
                  });
                });

                morph.id = word.id+m.type+m.rank;
                if(m.areaCoords!==null){
                  morph.AREA = {};
                  morph.AREA.image = "image" + m.image_id;
                  morph.AREA.shape = "rect";
                  morph.AREA.coords = m.areaCoords;
                }

                morph.AUDIO.start = m.audioStart;
                morph.AUDIO.end = m.audioEnd;

                timeList.push({
                  start:m.audioStart,
                  end:m.audioEnd,
                  sentence:null,
                  word:word.id,
                  morpheme:morph,
                  type:'M'
                });

                word.M.push(morph);
            });
        }
        
        annotationsPlayer.WORDLIST.W.push(word);

    });

    console.log(annotationsPlayer);

    return {
      annotations:annotationsPlayer,
      timeList:timeList
    };

  }

  constructor(props) {

      super(props);
      this.state = {
        hasPrimaryId : false,
        hasSecondaryId : false,
        isLoaded : false,
        isAnnotationsLoaded : false,
        hasMediaError : false,
        mediaError : {},
      hasAnnotationsError : false,
        annotationsError : {},
          MEDIAFILE : {},
      annotations : {},
      doi : '',
      images : [],
      /*displayOptions: this.props.displayOptions,*/
      langOptions : {
        transcriptions:[],translations:[]
      },
      /*options : this.props.typeOf,*/
      isWordList : false,
      timeList : [],
      urlFile : '',
      extensionFile : '',
      playerLoaded : false
      };
    }

     playerIsLoaded() {
      this.setState({
        playerLoaded: true
      })
    }


  componentDidMount(){

      this.setState({
        //langOptions: result.langues,
        //options: result.typeOf,
        //timeList: result.timeList,
          isAnnotationsLoaded: true,
          annotations : this.convertToPlayerFormat(this.props.annotations[0]).annotations,
          //doi : result.doi,
          isWordList : (this.props.annotations[0].children_annotations[0].type === "W"),
          urlFile : '',
          extensionFile : '',
          MEDIAFILE : {"type":"audio","url":'',"content":this.props.recording?this.props.recording['TO_BASE64(content)']:null},
          //images : result.images
          displayOptions: this.props.displayOptions,
            isLoaded: true
      });

      //Adaptation 18/09/2021 pour use case Image Only
      //Mise en lumière du mot sur l'image
      window.highlight=function highlight(id,type){

        if(type!=="S"){

          document.querySelectorAll('canvas:not([wordid=""]').forEach(e => { 
                    e.style.border='none'; 
                  });
          document.querySelectorAll('[wordid="'+id+'"]').forEach(e => { 
                    e.style.border='solid'; 
                  });

          document.querySelectorAll('.WORD').forEach(e => { 
                    e.style.border='none'; 
                  });

          document.querySelector('#'+id).style.border='solid';
        }

      };

    }

    render(){

      var convertedAnnotations = this.convertToPlayerFormat(this.props.annotations[0]);
      var annotationsPlayer = convertedAnnotations.annotations;
      var timeList = convertedAnnotations.timeList;
      var images = [];

      this.props.images.forEach((i)=>{
        images.push({
          id:"image" + i.id,
          name:i.name,
          rank:i.rank,
          /*content:i["TO_BASE64(content)"]*/
        });
      });


      return (
        <div className="AppPlayer" key="AppPlayer"> 
            <Container>
              {this.props.recording && <Player file={{"type":"audio","url":'',"content":this.props.recording['TO_BASE64(content)']}} playerIsLoaded = {this.playerIsLoaded.bind(this)} />
}
              <DisplayOptions displayOptions={this.props.displayOptions} options={this.props.typeOf} isWordList={this.state.isWordList} />
              {
              this.props.recording && this.state.playerLoaded && 
              <Annotations 
                annotations={annotationsPlayer} 
                timeList={timeList} 
                urlFile={this.state.urlFile} 
                extensionFile={this.state.extensionFile} 
                doi={this.state.doi} 
                availableOptions={this.props.typeOf} 
                displayOptions={this.props.displayOptions} 
                images={images} 
                video={this.state.MEDIAFILE.type==="video"} 
              />
              }

              {
              !this.props.recording && 
              <Annotations 
                annotations={annotationsPlayer} 
                timeList={timeList} 
                urlFile={this.state.urlFile} 
                extensionFile={this.state.extensionFile} 
                doi={this.state.doi} 
                availableOptions={this.props.typeOf} 
                displayOptions={this.props.displayOptions} 
                images={images} 
                video={this.state.MEDIAFILE.type==="video"} />
              }
              </Container>
          </div>

      );
    }
  
}
