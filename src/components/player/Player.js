import React from 'react';


class Player extends React.Component {

    componentDidMount() {

	    const s = document.createElement('script');
	    
	    s.type = 'text/javascript';

	    var scriptStr = "var wordidList=[];var startTimeList=[];var endTimeList=[];var timeList=[];"
		scriptStr +="document.getElementById('player').ontimeupdate=function(){updatePosition(this.currentTime)};";

	    s.innerHTML = scriptStr;
	    this.instance.appendChild(s);

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


	    window.updatePosition=function updatePosition(time){

		    var t = window.timeList.find((e)=>(e.start < time && e.end > time));

		    if(t !== undefined){
		    	var currentAnchor = (!window.isWordList)?t.sentence:t.word;

	            if(window.currentSentence !== currentAnchor){ 
	              if(window.currentSentence !== undefined) 
	                document.getElementById(window.currentSentence).classList.remove("currentSentence");
	              
	              if(currentAnchor){
	                document.getElementById(currentAnchor).classList.add("currentSentence");
	                window.currentSentence = currentAnchor;
	                let event = new Event("sentence-changed");
	                document.dispatchEvent(event);
	                //window.scrollTo(0,document.getElementById(currentAnchor).offsetTop - 150);
	                document.getElementById(currentAnchor).scrollIntoView({block: "center"});
	              }
	            }
		    }

		    var w = window.timeList.find((e)=>(e.start < time && e.end > time && e.type !== "S"));
		    
	            if((w !== undefined) && !window.isWordList){
	                //console.log("highlight");
	              	window.highlight(w.morpheme ?? w.word,w.type);  
	         }

		};

		this.props.playerIsLoaded();
	}
	
  render(){
    const audioStyle = {
          'width': '80%',
        };
    var mediaElement;


    if(this.props.file.type === "audio"){
      mediaElement = <audio ref={audio => (this.audio = audio)} id="player" controls preload='auto' style={audioStyle}>
          <source src={"data:audio/mpeg;base64,"+this.props.file.content} type="audio/mpeg" />
          <track label="Transcription & Translation" id="test" />
          <track label="Transcription" id="trackTranscription" />
          <track label="Translation" id="trackTranslation" />
          

        Your browser does not support the
            <code>audio</code> element.</audio>;
    }else{
      mediaElement = <video ref={video => (this.video = video)} id="player" controls preload='auto' style={audioStyle}>
          <source src={this.props.file.url} type="video/mp4" />
          <track label="Transcription & Translation" id="test" />
          <track label="Transcription" id="trackTranscription" />
          <track label="Translation" id="trackTranslation" />
          
           
        Your browser does not support the
            <code>video</code> element.</video>;
    }
    return (
      <div ref={el => (this.instance = el)}>
        {mediaElement}
      </div>
        
    );
  }
}


export default Player;