import React from 'react';
import {Typography, Popper} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Note from './Note';
import Morpheme from './Morpheme';
import PlayButton from './PlayButton';
import Chip from '@material-ui/core/Chip';

class Word extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {
	      anchorEl: null,
          open: false
	    };
      this.idNote = (isNaN(this.props.idNote))?1:this.props.idNote - 1;
	}

  highlight(){
    window.highlight && window.highlight(this.props.w.id,'W');
  }

  handleClick = (event) => {
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
/*
  componentDidMount() {
      if(this.props.w.AUDIO != undefined){
        window.timeList.push({
          start:parseFloat(this.props.w.AUDIO.start).toFixed(3),
          end:parseFloat(this.props.w.AUDIO.end).toFixed(3),
          mID:null,
          wID:this.props.w.id,
          sID:this.props.sID
        });
      }
  }
*/
  render() {
    this.idNote = (isNaN(this.props.idNote))?1:this.props.idNote - 1;

  	//let word = "";
    const transcriptions = [];
  	const translations = [];
    const notes = [];
    const notesJSON = [];

    //DOI PopUp
    const showDoi = (event) => {
      //console.log(event.currentTarget.id);
        this.setState({ anchorEl: this.state.anchorEl ? null : event.currentTarget});
      };
    const open = Boolean(this.state.anchorEl);
      const popperId = open ? 'simple-popper' : undefined;
    /////////

    //cas où une seule balise FORM est trouvé=>converti en objet et pas en tableau
    var isGlossIncluded = false;
    var thisClassName = "";

    const tableBordered = {
      /*
      border: "1px solid black",
      borderCollapse: "collapse"
      */
    };

    const visible = {
      visibility: "inherit"
    };

    const invisible = {
      display: "none"
    };

    const tableBorderedVisible = {
      ...tableBordered,
      ...visible
    };

    const tableBorderedInvisible = {
      ...tableBordered,
      ...invisible
    }


/////////////////////////////
    //GESTION DES TRADUCTIONS
/////////////////////////////
    if(this.props.w.TRANSL !== undefined && this.props.w.TRANSL !== null){
	    if(this.props.w.TRANSL.length === undefined){
        isGlossIncluded = this.props.displayOptions.wordTranslations.includes(this.props.w.TRANSL["xml:lang"]);
        thisClassName = (this.props.isWordList === true)?'wordlistWord':'word';

        //gestion de l'affichage tableau des WordList : une colonne par langue disponible
        if(this.props.isWordList === true){
          this.props.availableOptions.word.translations.forEach((lang) => {

            if(lang === this.props.w.TRANSL['xml:lang']){
              translations.push(
                <Typography variant="body2" component='td' style={!isGlossIncluded?tableBorderedInvisible:tableBorderedVisible} className={`translation ${thisClassName} word-${this.props.w.TRANSL['xml:lang']}`}>
                  {this.props.w.TRANSL.text}
                </Typography>
              );
            }else{
              translations.push(
                <Typography variant="body2" component='td' style={!isGlossIncluded?tableBorderedInvisible:tableBorderedVisible} className={`translation ${thisClassName} word-${this.props.w.TRANSL['xml:lang']}`}>
                  
                </Typography>
              );
            }
          });
        }else{
          translations.push(
            <Chip 
            style={!isGlossIncluded?invisible:visible}
            className={`translation ${thisClassName} word-${this.props.w.TRANSL['xml:lang']}`}
            label={this.props.w.TRANSL.text}
            />
          );
        }

	    }else{

        //gestion de l'affichage tableau des WordList : une colonne par langue disponible
        if(this.props.isWordList === true){
          this.props.availableOptions.word.translations.forEach((lang) => {

            var found = false;
            isGlossIncluded = this.props.displayOptions.wordTranslations.includes(lang);
            thisClassName = 'wordlistWord';

              this.props.w.TRANSL.forEach((t) => {
                
                if(lang === t['xml:lang']){
                  found = true;

                  translations.push(
                      <Typography variant="body2" component='td' style={!isGlossIncluded?tableBorderedInvisible:tableBorderedVisible}  className={`translation ${thisClassName} word-${t['xml:lang']}`}>
                        {t.text}
                      </Typography>
                    );
                }
              });

            if(found===false){

              translations.push(
                      <Typography variant="body2" component='td' style={!isGlossIncluded?tableBorderedInvisible:tableBorderedVisible}   className={`translation ${thisClassName} word-${lang}`}>
                        
                      </Typography>
                    );
            }
            
          });
        }else{
          this.props.w.TRANSL.forEach((t) => {
            isGlossIncluded = this.props.displayOptions.wordTranslations.includes(t["xml:lang"]);
            thisClassName = 'word';

            translations.push(
                <Chip 
                style={!isGlossIncluded?invisible:visible}
                className={`translation ${thisClassName} word-${t['xml:lang']}`}
                label={t.text}
                />
              );
          });
        }
	      
	    }
    }

  // Get note(s) of the sentence
  /*
  if(this.props.w.NOTE !== undefined && this.props.w.NOTE !== null){
    if(this.props.w.NOTE.length === undefined){
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

  // Get note(s) of the word
  this.getNotes(this.props.w,notesJSON);

  notesJSON.forEach((n)=>{
    notes.push(<Note id={n.id} note={n.note} hidden={n.hidden} lang={n.lang}></Note>);
   });
    
/////////////////////////////
//GESTION DES TRANSCRIPTIONS
/////////////////////////////

  if(this.props.w.FORM !== undefined && this.props.w.FORM !== null){
      // si une seule transcription disponible
      if(this.props.w.FORM.length === undefined){
        isGlossIncluded = this.props.displayOptions.wordTranscriptions.includes(this.props.w.FORM.kindOf);
        thisClassName = (this.props.isWordList === true)?'wordlistWord':'word';
        
        var styleCombined;
        
        if(isGlossIncluded){
          if(this.props.isWordList === true){
            styleCombined = tableBorderedVisible;
          }else{
            styleCombined = visible;
          }
        }else{
          if(this.props.isWordList === true){
            styleCombined = tableBorderedInvisible;
          }else{
            styleCombined = invisible;
          }
        }

        var notesSup = notesJSON.map((n)=>
        <sup style={{display:(!this.props.displayOptions.notes.includes(n.lang))?"none":"inline-block"}} className={"circle note "+n.lang}>{n.id}</sup>
        );

        (this.props.isWordList === true)?
          transcriptions.push( 
            <Typography variant="body2" component="td" style={styleCombined} className={`transcription ${thisClassName} word-${this.props.w.FORM.kindOf}`}>
              {this.props.w.FORM.text}{notesJSON.map(n=><sup style={{display:(!this.props.displayOptions.notes.includes(n.lang))?"none":"inline-block"}} className={"circle note "+n.lang}>{n.id}</sup>)}
            </Typography>
          ):
          transcriptions.push( 
            <div><Chip 
              style={styleCombined}
              className={`transcription ${thisClassName} word-${this.props.w.FORM.kindOf}`}
              label={this.props.w.FORM.text}
              />
              {notesSup}
            </div>
          );


                //word = this.props.w.FORM.text;

      // si plusieurs transcriptions disponibles
      }else{

          this.props.w.FORM.forEach((f) => {
            isGlossIncluded = this.props.displayOptions.wordTranscriptions.includes(f.kindOf);
            thisClassName = (this.props.isWordList === true)?'wordlistWord':'word';

            var styleCombined;
        
            if(isGlossIncluded){
              if(this.props.isWordList === true){
                styleCombined = tableBorderedVisible;
              }else{
                styleCombined = visible;
              }
            }else{
              if(this.props.isWordList === true){
                styleCombined = tableBorderedInvisible;
              }else{
                styleCombined = invisible;
              }
            }

        var notesSup = notesJSON.map((n)=>
        <sup style={{display:(!this.props.displayOptions.notes.includes(n.lang))?"none":"inline-block"}} className={"circle note "+n.lang}>{n.id}</sup>
        );

        (this.props.isWordList === true)?
          transcriptions.push( 
            <Typography variant="body2" component="td" style={styleCombined} className={`transcription ${thisClassName} word-${f.kindOf}`}>
              {f.text}{notesJSON.map(n=><sup style={{display:(!this.props.displayOptions.notes.includes(n.lang))?"none":"inline-block"}} className={"circle note "+n.lang}>{n.id}</sup>)}
            </Typography>
          ):
          transcriptions.push( 
            <div><Chip 
              style={styleCombined}
              className={`transcription ${thisClassName} word-${f.kindOf}`}
              label={f.text}
              color="secondary"
              />
              {notesSup}
            </div>
          );
            });
            //word = this.props.w.FORM[0].text;
      }
  }

  var morphemes = [];

  if(this.props.w.M !== undefined && this.props.w.M !== null){
          
            if(this.props.w.M.length>0){
              
              this.props.w.M.forEach((m) =>{
                morphemes.push(
                      <Morpheme w={m} displayOptions={this.props.displayOptions} idNote={this.idNote} />
                  );
              });
              

            }else{
            morphemes.push(
                      <Morpheme w={this.props.w.M} displayOptions={this.props.displayOptions} idNote={this.idNote} />
                  );
            }
    }

    return (
        
        
            this.props.isWordList===true
            ?
            <tr id={this.props.w.id} className="WORD" style={tableBordered} ref={el => (this.instance = el)} >
      
              <td style={tableBordered}>
                {this.props.w.id}
                <IconButton aria-describedby={popperId} onClick={showDoi} id={"btn_doi_W"+this.props.sID}><img className="doi" src="/dist/images/DOI_logo.svg" alt="doi" /></IconButton>
                <Popper id={"doi_W"+this.props.sID} open={open} anchorEl={this.state.anchorEl} test={document.getElementById("btn_doi_W"+this.props.sID)}>
                  <div>{this.props.doi}</div>
                </Popper> 
                { 
                this.props.w.hasOwnProperty('AUDIO')
                ?
                <PlayButton continuousPlay={this.props.displayOptions.continuousPlay} start={this.props.w.AUDIO?this.props.w.AUDIO.start:0} end={this.props.w.AUDIO?this.props.w.AUDIO.end:0} isWordList={true} />
                :
                <div></div>
                }
              </td>

               <React.Fragment>
              {transcriptions}
              {morphemes}
              {translations}
               </React.Fragment>

              <td className="notes">
                {notes}
              </td> 

            </tr>
            :
            <div id={this.props.w.id} onMouseOver={this.highlight.bind(this)} className={`WORD ${this.props.w.hasOwnProperty('class')?this.props.w.class:''}`} style={this.props.isWordList===true ? {} : {display:"inline-block"} } ref={el => (this.instance = el)} >
              <div>
                <div className="transcBlock">
                  {transcriptions}
                </div>
                <div className="morphemesBlock">
                  {morphemes}
                </div>
                <div className="translBlock">
                  {translations}
                </div>

              </div>
            </div>  

    );
  }
}

export default Word;