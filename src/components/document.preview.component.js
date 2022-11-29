import React, { Component } from "react";
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
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

    annotationsEditor.children_annotations.sort((a, b) => a.rank - b.rank);

    var annotationsPlayer = {};
    var timeList = [];
    var typeOf = {
      'text':{
        'transcriptions':[],
        'translations':[]
      },
      'sentence':{
        'transcriptions':[],
        'translations':[]
      },
      'word':{
        'transcriptions':[],
        'translations':[]
      },
      'morpheme':{
        'transcriptions':[],
        'translations':[]
      },
      'note':{
        'translations':[]
      },
    };

    var isWordList = (annotationsEditor.children_annotations && annotationsEditor.children_annotations[0].type === "W");

    annotationsPlayer.WORDLIST = {};

    annotationsPlayer.TEXT = {};
    annotationsPlayer.TEXT.FORM = annotationsEditor.forms;

    annotationsEditor.forms.forEach((f)=>{
      (typeOf.text.forms && !typeOf.text.forms.includes(f.kindOf)) && typeOf.text.forms.push(f.kindOf);
    });

    annotationsPlayer.TEXT.TRANSL = [];
    annotationsEditor.translations.forEach((t)=>{
      (typeOf.text.translations && !typeOf.text.translations.includes(t.lang)) && typeOf.text.translations.push(t.lang);
      annotationsPlayer.TEXT.TRANSL.push({
        'xml:lang':t.lang,
        text:t.text
      });
    });

    annotationsPlayer.TEXT.NOTE = [];
    annotationsEditor.notes.forEach((n)=>{
      (typeOf.note.translations && !typeOf.note.translations.includes(n.lang)) && typeOf.note.translations.push(n.lang);
      annotationsPlayer.TEXT.NOTE.push({
        'xml:lang':n.lang,
        message:n.text,
        text:'',
      });
    });

    annotationsPlayer.WORDLIST.W = [];
    annotationsPlayer.TEXT.S = [];

    !isWordList && annotationsEditor.children_annotations.forEach((s)=>{
      var sentence = {};
      sentence.AUDIO = {};
      sentence.FORM = s.forms;

      s.forms.forEach((f)=>{
        (!typeOf.sentence.transcriptions.includes(f.kindOf)) && typeOf.sentence.transcriptions.push(f.kindOf);
      });

      sentence.TRANSL = [];
      s.translations.forEach((t)=>{
        (!typeOf.sentence.translations.includes(t.lang)) && typeOf.sentence.translations.push(t.lang);

        sentence.TRANSL.push({
          'xml:lang':t.lang,
          text:t.text
        });

        t.notes.forEach((n)=>{
          (!typeOf.note.translations.includes(n.lang)) && typeOf.note.translations.push(n.lang);
        });
      

      });

      sentence.NOTE = [];
      s.notes.forEach((n)=>{
        (!typeOf.note.translations.includes(n.lang)) && typeOf.note.translations.push(n.lang);
        sentence.NOTE.push({
          'xml:lang':n.lang,
          message:n.text,
          text:'',
        });
      });

      sentence.id = s.type+s.rank;
      sentence.realId = s.id;

      //14/07/2022 Adapt pour multi selection image
      if(s.imageCoords!==null){
        sentence.AREA = [];
        s.imageCoords.forEach((i)=>{
          sentence.AREA.push({
            image:"image"+i.image_id,
            shape:"rect",
            coords:i.areaCoords
          });
        });
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
              s.children_annotations.sort((a, b) => a.rank - b.rank);

              sentence.W = [];

              s.children_annotations.forEach((w)=>{
                      var word = {};
                      word.AUDIO = {};
                      word.FORM = w.forms;

                      w.forms.forEach((f)=>{
                        (!typeOf.word.transcriptions.includes(f.kindOf)) && typeOf.word.transcriptions.push(f.kindOf);
                      });

                      word.TRANSL = [];
                      w.translations.forEach((t)=>{

                        (!typeOf.word.translations.includes(t.lang)) && typeOf.word.translations.push(t.lang);

                        word.TRANSL.push({
                          'xml:lang':t.lang,
                          text:t.text
                        });

                        t.notes.forEach((n)=>{
                          (!typeOf.note.translations.includes(n.lang)) && typeOf.note.translations.push(n.lang);
                        });

                      });

                      word.NOTE = [];
                      w.notes.forEach((n)=>{
                        (!typeOf.note.translations.includes(n.lang)) && typeOf.note.translations.push(n.lang);
                        word.NOTE.push({
                          'xml:lang':n.lang,
                          message:n.text,
                          text:'',
                        });
                      });

                      word.id = sentence.id+w.type+w.rank;

                      if(w.imageCoords!==null && w.imageCoords[0]!==undefined){
                        //15/07/2022 : multi image : par convention on n'a qu'une boîte pour un mot
                        word.AREA = {};
                        word.AREA.image = "image"+w.imageCoords[0].image_id;
                        word.AREA.shape = "rect";
                        word.AREA.coords = w.imageCoords[0].areaCoords;
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
                        
                          w.children_annotations.sort((a, b) => a.rank - b.rank);

                          word.M = [];

                          w.children_annotations.forEach((m)=>{
                                  var morph = {};
                                  morph.AUDIO = {};
                                  morph.FORM = m.forms;

                                  m.forms.forEach((f)=>{
                                    (!typeOf.morpheme.transcriptions.includes(f.kindOf)) && typeOf.morpheme.transcriptions.push(f.kindOf);
                                  });

                                  morph.TRANSL = [];
                                  m.translations.forEach((t)=>{

                                    (!typeOf.morpheme.translations.includes(t.lang)) && typeOf.morpheme.translations.push(t.lang);
                                    
                                    morph.TRANSL.push({
                                      'xml:lang':t.lang,
                                      text:t.text
                                    });

                                    t.notes.forEach((n)=>{
                                      (!typeOf.note.translations.includes(n.lang)) && typeOf.note.translations.push(n.lang);
                                    });
                                  });

                                  morph.NOTE = [];
                                  m.notes.forEach((n)=>{
                                    (!typeOf.note.translations.includes(n.lang)) && typeOf.note.translations.push(n.lang);
                                    morph.NOTE.push({
                                      'xml:lang':n.lang,
                                      message:n.text,
                                      text:'',
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

    console.log(annotationsEditor,annotationsPlayer);

    return {
      annotations:annotationsPlayer,
      timeList:timeList,
      typeOf:typeOf
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
        displayOptions: this.props.displayOptions,
        langOptions : {
          transcriptions:[],translations:[]
        },
        /*options : this.props.typeOf,*/
        typeOf:this.props.typeOf,
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
/*
    openAnnotation = (id) => {
      console.log(id);
    }
*/
    render(){

      var convertedAnnotations = this.convertToPlayerFormat(this.props.annotations[0]);
      var annotationsPlayer = convertedAnnotations.annotations;
      var timeList = convertedAnnotations.timeList;
      var typeOf = convertedAnnotations.typeOf;
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
              <Box display="flex" bgcolor="info.default" color="info.contrastText" p={2}>
                This is a document preview as it would be displayed in <Link href="https://pangloss.cnrs.fr" target="_blank"> Pangloss </Link> player
              </Box>
              {this.props.recording && <Player file={{"type":"audio","url":'',"content":this.props.recording['TO_BASE64(content)']}} playerIsLoaded = {this.playerIsLoaded.bind(this)} />
}
              <DisplayOptions displayOptions={this.props.displayOptions} options={typeOf} isWordList={this.state.isWordList} />
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
                openAnnotation={this.props.openAnnotation}
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
                video={this.state.MEDIAFILE.type==="video"}
                openAnnotation={this.props.openAnnotation}
                />
              }
              </Container>
          </div>

      );
    }
  
}
