import React from 'react';
import {Typography} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { PlayArrow, Pause } from '@material-ui/icons';
import Note from './Note';


class Morpheme extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {
	      anchorEl: null,
          open: false
	    };
      this.idNote = this.props.idNote - 1 ?? 1;
	}

  playSentence(){
    document.getElementById('player').currentTime = this.props.w.AUDIO.start;
    document.getElementById('player').play();
  }

  pauseSentence(){
    document.getElementById('player').pause();
  }

  handleClick = (event) => {
    //console.log(event.currentTarget);
    this.setState({
      anchorEl: event.currentTarget,
      open: true
    });

    if(event.currentTarget.id.length>0){
      document.querySelectorAll('canvas').forEach((c)=>c.style.border="none");
      document.querySelector('[wordid="'+event.currentTarget.id+'"]').style.border='solid';
    }
      };

  handleClose = () => {
    this.setState({
      anchorEl: null,
      open: false
    });
    document.querySelectorAll('canvas').forEach((c)=>c.style.border="none");
  };

  getNotes(node,notesJSON){
    if(node.NOTE !== undefined && node.NOTE !== null){
      if(node.NOTE.length === undefined){
          notesJSON.push({"id":this.idNote,"note": node.NOTE.message + node.NOTE.text,"hidden" : !this.props.displayOptions.notes.includes(node.NOTE['xml:lang']),lang:node.NOTE["xml:lang"]});
          this.idNote++;
      }else{
        node.NOTE.forEach((f) => {
            notesJSON.push({"id":this.idNote,"note": f.message + f.text,"hidden" :!this.props.displayOptions.notes.includes(f['xml:lang']), lang:f["xml:lang"]});
            this.idNote++;
          });
      }
    }
  }

  render() {

  	//let word = "";
    const transcriptions = [];
  	const translations = [];
    const notes = [];
    const notesJSON = [];



    //cas où une seule balise FORM est trouvé=>converti en objet et pas en tableau
    //<div style={{display:'table-cell'}}>
    var isGlossIncluded = false;
    var thisClassName = '';

    if(this.props.w.TRANSL !== undefined && this.props.w.TRANSL !== null){
	    if(this.props.w.TRANSL.length === undefined){
        isGlossIncluded = this.props.displayOptions.morphemeTranslations.includes(this.props.w.TRANSL["xml:lang"]);
        thisClassName = (this.props.isWordList === true)?'wordlistWord':'morpheme';

	      translations.push(
	              <Typography variant="body2" component={this.props.isWordList === true ? 'div':'p'} style={!isGlossIncluded?{display:'none'}:{visibility:'inherit'}} className={`translation ${thisClassName} morpheme-${this.props.w.TRANSL['xml:lang']}`}>
	                {this.props.w.TRANSL.text}
	              </Typography>
	            );
	    }else{
	      this.props.w.TRANSL.forEach((t) => {
            isGlossIncluded = this.props.displayOptions.morphemeTranslations.includes(t["xml:lang"]);
            thisClassName = (this.props.isWordList === true)?'wordlistWord':'morpheme';

	          translations.push(
	              <Typography variant="body2" component={this.props.isWordList === true ? 'div':'p'} style={!isGlossIncluded?{display:'none'}:{visibility:'inherit'}}  className={`translation ${thisClassName} morpheme-${t['xml:lang']}`}>
	                {t.text}
	              </Typography>
	            );
	        });
	    }
    }

  // Get note(s) of the sentence
  /*
  if(this.props.w.NOTE != undefined && this.props.w.NOTE !== null){
    if(this.props.w.NOTE.length == undefined){
      notes.push(
              <Typography variant="body2" component="p" className={`note ${this.props.w.NOTE['xml:lang']}`}>
                {this.props.w.NOTE.message} {this.props.w.NOTE.text}
              </Typography>
            );
    }else{
      this.props.w.NOTE.forEach((f) => {
          notes.push(
              <Typography variant="body2" component="p" className={`note ${f['xml:lang']}`}>
                {f.message} {f.text}
              </Typography>
            );
        });
    }
  }
*/

  // Get note(s) of the morpheme
  this.getNotes(this.props.w,notesJSON);

  notesJSON.forEach((n)=>{
    notes.push(<Note id={n.id} note={n.note} hidden={n.hidden} lang={n.lang}></Note>);
   });
    
  //
  if(this.props.w.FORM !== undefined && this.props.w.FORM !== null){
      if(this.props.w.FORM.length === undefined){
        isGlossIncluded = this.props.displayOptions.morphemeTranscriptions.includes(this.props.w.FORM.kindOf);
        thisClassName = (this.props.isWordList === true)?'wordlistWord':'morpheme';

        transcriptions.push(
                  <Typography variant="body2" component="p" style={!isGlossIncluded?{display:'none'}:{visibility:'inherit'}} className={`transcription ${thisClassName} morpheme-${this.props.w.FORM.kindOf}`}>
                    {this.props.w.FORM.text}{notesJSON.map(n=><sup class={"circle note "+n.lang}>{n.id}</sup>)}
                  </Typography>
                );
                //word = this.props.w.FORM.text;
        }else{
          this.props.w.FORM.forEach((f) => {
            isGlossIncluded = this.props.displayOptions.morphemeTranscriptions.includes(f.kindOf);
            thisClassName = (this.props.isWordList === true)?'wordlistWord':'morpheme';

              transcriptions.push(
                  <Typography variant="body2" component="p" className={`transcription ${thisClassName} morpheme-${f.kindOf}`}>
                    {f.text}{notesJSON.map(n=><sup class={"circle note "+n.lang}>{n.id}</sup>)}
                  </Typography>
                );
            });
            //word = this.props.w.FORM[0].text;
        }
  }

    return (
      <div id={this.props.w.id} className={`MORPHEME ${this.props.w.hasOwnProperty('class')?this.props.w.class:''}`} style={this.props.isWordList===true ? {} : {display:"inline-block"} } ref={el => (this.instance = el)} >
      { 
            this.props.isWordList===true
            ?
            <div style={{display:'table'}} >
              <div style={{display:'table-cell'}}>
                W{this.props.wID} 
              </div>

              <div style={{display:'table-cell'}} id={this.props.w.id} hidden={!this.props.displayOptions.words} >
                <IconButton color="primary" aria-label="play" onClick={this.playSentence.bind(this)}>
                  <PlayArrow />
                </IconButton>
                <IconButton color="primary" aria-label="play" onClick={this.pauseSentence.bind(this)}>
                  <Pause />
                </IconButton>
              </div>

              <div style={{display:'table-cell',width:'12em'}} class="morpheme" id={this.props.w.id} hidden={!this.props.displayOptions.words} >
                {transcriptions}
              </div>

              {translations}

              <div style={{display:'table-cell'}}>
                {notes}
              </div>       
            </div>
            :
            <div>
              <p>
                {transcriptions}
              </p>

              <p>
                {translations}
              </p>

            </div>
        }
      

			     
          

        </div>

    );
  }
}

export default Morpheme;