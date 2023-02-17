import React from 'react';
import Sentence from './Sentence';
import Word from './Word';
import Morpheme from './Morpheme';
import { Container } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

class Annotations extends React.Component {
  constructor(props) {
    super(props);

    var displayOptions = {
        textTranscriptions: (this.props.displayOptions.textTranscriptions.length > 0) ? this.props.displayOptions.textTranscriptions:[],
        textTranslations: (this.props.displayOptions.textTranslations.length > 0) ? this.props.displayOptions.textTranslations:[],
        sentenceTranscriptions: (this.props.displayOptions.sentenceTranscriptions.length > 0) ? this.props.displayOptions.sentenceTranscriptions:[this.props.availableOptions.sentence.transcriptions[0]],
        sentenceTranslations: (this.props.displayOptions.sentenceTranslations.length > 0) ? this.props.displayOptions.sentenceTranslations:[this.props.availableOptions.sentence.translations[0]],
        wordTranscriptions: (this.props.displayOptions.wordTranscriptions.length > 0) ? this.props.displayOptions.wordTranscriptions:[],
        wordTranslations: (this.props.displayOptions.wordTranslations.length > 0) ? this.props.displayOptions.wordTranslations:[],
        morphemeTranscriptions: (this.props.displayOptions.morphemeTranscriptions.length > 0) ? this.props.displayOptions.morphemeTranscriptions:[],
        morphemeTranslations: (this.props.displayOptions.morphemeTranslations.length > 0) ? this.props.displayOptions.morphemeTranslations:[],
        displayNotes: this.props.displayOptions.notes,
        notes: this.props.displayOptions.notes,
        lang:this.props.displayOptions.lang,
        mode:this.props.displayOptions.mode,
        continuousPlay:this.props.displayOptions.continuousPlay,
    };


    this.state = {
      isLoaded: false,
      annotationData: [],
      displayOptions: displayOptions,
      availableOptions: this.props.availableOptions,
      isWordList: false
    };


  }

  shouldComponentUpdate() {
    //console.log('Annotations - shouldComponentUpdate lifecycle');
    return false;
  }

  componentDidMount() {
    
        window.timeList = this.props.timeList;
  }

  render() {

    var annotationItems = [];
    var wholeTranscriptions = [];
    var wholeTranslations = [];
    var notes = [];
    var isWordList = false;

    var imageSrc = "";
    var doi = this.props.doi;
    var sID = 0;

    var player = document.querySelector('#player');

	var trackTest;
    var trackTranscription;
    var trackTranslation;

    if(player !== null){
		trackTest = player.textTracks.getTrackById('test');
    	trackTranscription = player.textTracks.getTrackById('trackTranscription');
    	trackTranslation = player.textTracks.getTrackById('trackTranslation');

    	trackTest.mode="showing";
    	trackTranscription.mode="showing";
    	trackTranslation.mode="showing";
    }
    
   //if(player.textTracks.length === 1){     
      //var trackTranscription = player.addTextTrack("subtitles","transcription");
      //var trackTranslation = player.addTextTrack("subtitles","translation");
      
   // }

    if(this.props.annotations.TEXT !== undefined && this.props.annotations.TEXT !== null)
      var sentences = this.props.annotations.TEXT.S;

    if(this.props.annotations.WORDLIST !== undefined && this.props.annotations.WORDLIST !== null)
      var wordlist = this.props.annotations.WORDLIST.W;

    //this.state.annotationData.forEach((a) => {
    if(sentences !== null && sentences !== undefined){
      sentences.forEach((a) => {

        if(a.AREA !== undefined && a.AREA[0] !== undefined && a.AREA[0].image !== undefined){
          this.props.images.forEach((i) =>{
            //var idImage = i.id.split('.version');

            //if(idImage[0] === a.AREA.image)
             // {
                //imageSrc=i.url;
                //imageSrc = "data:image/png;base64,"+localStorage[a.AREA.image];
                
             // }
          });
          //console.log(a.AREA[0].image.split('image'));
          if(window.imagesMap.filter((i)=>i.id === parseInt(a.AREA[0].image.split('image')[1])).length > 0)
            imageSrc = "data:image/png;base64,"+window.imagesMap.filter((i)=>i.id === parseInt(a.AREA[0].image.split('image')[1]))[0].content;
        }
        
        sID++;
        //#3
        //var doiSentenceUrl = doiUrl + doi + "&sentence=S" + sID;
        var doiSentenceUrl = doi + "#" + a.id;
        //TEST VTT
	   if(player !== null){
	        if(trackTranscription.cues.length < sentences.length){
	          
	          var transcSubtitle = "";
	          var translSubtitle = "";

	          if(typeof(a.FORM) === "object"){
	            if(a.FORM !== null)
	            transcSubtitle = a.FORM.text;
	          }else{
	            if(a.FORM[0].text !== null)
	            transcSubtitle = a.FORM[0].text;
	          }

	          if(a.TRANSL !== null){
	            if(typeof(a.TRANSL) === "object"){
	              if(a.TRANSL !== null)
	              translSubtitle = a.TRANSL.text;
	            }else{
	              if(a.TRANSL[0].text !== null)
	              translSubtitle = a.TRANSL[0].text;
	            }
	          }

	          var cueStart = (a.AUDIO !== undefined)?a.AUDIO.start:0;
	          var cueEnd = (a.AUDIO !== undefined)?a.AUDIO.end:0;

	          const cueTransc = new VTTCue(cueStart, cueEnd, transcSubtitle);
	          const cueTransl = new VTTCue(cueStart, cueEnd, translSubtitle);

	          cueTransc.size = 99;
	          cueTransl.size = 99;
	          cueTransc.line = 12;
	          cueTransl.line = 14;

	          
	          	trackTest.addCue(cueTransc);
	          	trackTest.addCue(cueTransl);
	          	trackTranscription.addCue(cueTransc);
	          	trackTranslation.addCue(cueTransl);
	          
	          
	        }
	    }
        
        annotationItems.push(
            <Sentence 
              doi={doiSentenceUrl} 
              sID={sID} 
              s={a} 
              imageSrc={imageSrc} 
              displayOptions={this.state.displayOptions} 
              openAnnotation={this.props.openAnnotation}
            />
          );

      });
    }

    if(wordlist !== null && wordlist !== undefined && Array.isArray(wordlist)){
    //Si c'est une liste de mots
      isWordList = true;
      this.setState({isWordList:true});

          //W can be an array or an object depending on the number of children in the XML
          //Object if only one Word, Array if more than 1 word

          //if(Array.isArray(wordlist)){
            //get words of the sentence
              wordlist.forEach((w) => {

                if(w.M !== undefined && w.M !== null){

                  if(w.M.length>0){
                    w.M.forEach((m) =>{
                      annotationItems.push(
                            <Morpheme w={m} wID={++sID} displayOptions={this.state.displayOptions} isWordList={true} />
                        );
                    });
                  }else{
                    annotationItems.push(
                            <Morpheme w={w.M} wID={++sID} displayOptions={this.state.displayOptions} isWordList={true} />
                        );
                  }


                }else{
                  ++sID;
                  var doiWordUrl = doi + "#W" + sID;
                  annotationItems.push(
                    <Word w={w} wID={sID} displayOptions={this.state.displayOptions} availableOptions={this.props.availableOptions} isWordList={true} doi={doiWordUrl} />
                  );
                } 
                
              });

          //} 
          

    }
    

    // Get whole transcription(s) of the doc
    if(this.props.annotations.TEXT.FORM !== undefined && this.props.annotations.TEXT.FORM !== null){
      if(this.props.annotations.TEXT.FORM.length === undefined){
        wholeTranscriptions.push(
                <Typography hidden={(!this.state.displayOptions.textTranscriptions) || (!this.state.displayOptions.textTranscriptions.includes(this.props.annotations.TEXT.FORM.kindOf))} variant="body2" component="p" className={"text-"+this.props.annotations.TEXT.FORM.kindOf + " transcription"}>
                  {this.props.annotations.TEXT.FORM.text}
                </Typography>
              );
      }else{
        this.props.annotations.TEXT.FORM.forEach((f) => {
            wholeTranscriptions.push(
                <Typography key={"textForm"+f.kindOf} hidden={(!this.state.displayOptions.textTranscriptions) || (!this.state.displayOptions.textTranscriptions.includes(f.kindOf))} variant="body2" component="p" className={"text-" + f.kindOf + " transcription"}>
                  {f.text}
                </Typography>
              );
          });
      }
    }
//// 
    // Get whole translation(s) of the doc
    if(this.props.annotations.TEXT.TRANSL !== null && this.props.annotations.TEXT.TRANSL !== undefined){
      if(this.props.annotations.TEXT.TRANSL.length === undefined){

        wholeTranslations.push(
                <Typography hidden={!this.state.displayOptions.textTranslations.includes(this.props.annotations.TEXT.TRANSL["xml:lang"])} variant="body2" component="p" className={`translation text-${this.props.annotations.TEXT.TRANSL['xml:lang']}`}>
                  {this.props.annotations.TEXT.TRANSL.text}
                </Typography>
              );
      }else{
        this.props.annotations.TEXT.TRANSL.forEach((t) => {
            wholeTranslations.push(
                <Typography hidden={!this.state.displayOptions.textTranslations.includes(t["xml:lang"])} variant="body2" component="p" className={`translation text-${t['xml:lang']}`}>
                  {t.text}
                </Typography>
              );
          });
      }
    }

    // Get note(s) of the doc
    if(this.props.annotations.TEXT.NOTE !== undefined && this.props.annotations.TEXT.NOTE !== null){
      if(this.props.annotations.TEXT.NOTE.length === undefined){
        notes.push(
                <Typography hidden={!this.state.displayOptions.notes.includes(this.props.annotations.TEXT.NOTE["xml:lang"])} variant="body2" component="p" className={`note ${this.props.annotations.TEXT.NOTE['xml:lang']}`}>
                  {this.props.annotations.TEXT.NOTE.message}
                </Typography>
              );
      }else{
        this.props.annotations.TEXT.NOTE.forEach((t) => {
            notes.push(
                <Typography hidden={!this.state.displayOptions.notes.includes(t["xml:lang"])} variant="body2" component="p" className={`note ${t['xml:lang']}`}>
                  {t.message}
                </Typography>
              );
          });
      }
    }

//

    return (
      <div ref={el => (this.instance = el)}>
        <div className="TEXT">
          <Container fixed id="documentTranscriptionsBlock">
                 {wholeTranscriptions}
          </Container>
          <Container fixed id="documentTranslationsBlock">
                 {wholeTranslations}
          </Container>
          <Container fixed id="documentNotesBlock">
                 {notes}
          </Container>
        </div>
        <Container fixed id="documentAnnotationsBlock">
          {
            isWordList
              ?
              <table>
                {annotationItems}
              </table>
              :
              annotationItems
          }
              
        </Container>
        {
          this.props.extensionFile==='pdf' 
            ?
            <Container>
              <object data={this.props.urlFile.replace('http:','https:')} type="application/pdf" width="100%" height="500px">
                <embed src={this.props.urlFile.replace('http:','https:')} type='application/pdf'/>
              </object>

            </Container>
            :
            <div></div>
          }
      </div>
    );
  }
}

export default Annotations;