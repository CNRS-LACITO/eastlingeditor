import React from 'react';
import Picture from './Picture';
import Word from './Word';
import Morpheme from './Morpheme';
import Note from './Note';
import { Card, Avatar, CardContent, Popper } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PlayButton from './PlayButton';
import blue from "@material-ui/core/colors/blue";

//BUG POPOVER
//https://codepen.io/chocochip/pen/zYxMgRG
class Sentence extends React.Component {

	constructor(props) {
	    super(props);
	    this.state = {
	        displayOptions : this.props.displayOptions,
	        notes : null, //#17
	        anchorEl : null
	    };
	    this.idNote = 1;
	}


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


  	this.idNote = 1;
  	const transcriptions = [];
	const translations = [];
	const notesJSON = [];
	const words = [];
	const canvas = [];

	//DOI PopUp

	const showDoi = (event) => {
		//console.log(event.currentTarget.id);
	    this.setState({ anchorEl: this.state.anchorEl ? null : event.currentTarget});
	  };
	const open = Boolean(this.state.anchorEl);
    const popperId = open ? 'simple-popper' : undefined;
    /////////

	// Get translation(s) of the sentence
	if(this.props.s.TRANSL !== null && this.props.s.TRANSL !== undefined){
		if(this.props.s.TRANSL.length === undefined){
			translations.push(
		          <Typography hidden={!this.props.displayOptions.sentenceTranslations.includes(this.props.s.TRANSL["xml:lang"])} variant="body2" component="p" className={`translation sentence-${this.props.s.TRANSL['xml:lang']}`}>
			          <b>{this.props.s.TRANSL.text}</b>
			        </Typography>
		        );
		}else{
			this.props.s.TRANSL.forEach((t) => {
		      translations.push(
		        	<Typography hidden={!this.props.displayOptions.sentenceTranslations.includes(t["xml:lang"])} variant="body2" component="p" className={`translation sentence-${t["xml:lang"]}`}>
			        	<b>{t.text}</b>
			       	</Typography>
		        );
		    });
		}
	}
	
	//#17
	// Get note(s) of the sentence
	this.getNotes(this.props.s,notesJSON);

//
	// Get transcription(s) of the sentence
	if(this.props.s.FORM !== undefined && this.props.s.FORM !== null){
		if(this.props.s.FORM.length === undefined){
			transcriptions.push(
		          <Typography hidden={!this.props.displayOptions.sentenceTranscriptions.includes(this.props.s.FORM.kindOf)} variant="body2" component="p" className={`transcription sentence-${this.props.s.FORM.kindOf}`}>
			          <b>{this.props.s.FORM.text}</b>{notesJSON.map(n=><sup style={{display:(!this.props.displayOptions.notes.includes(n.lang))?"none":"inline-block"}} className={"circle note "+n.lang}>{n.id}</sup>)}
			        </Typography>
		        );

		}else{
			this.props.s.FORM.forEach((f) => {
		      transcriptions.push(
		          <Typography hidden={!this.props.displayOptions.sentenceTranscriptions.includes(f.kindOf)} variant="body2" component="p" className={`transcription sentence-${f.kindOf}`}>
			          <b>{f.text}</b>{notesJSON.map(n=><sup style={{display:(!this.props.displayOptions.notes.includes(n.lang))?"none":"inline-block"}} className={"circle note "+n.lang}>{n.id}</sup>)}
			        </Typography>
		        );
		    });
		}
	}
  	
    
    if(this.props.s.AREA !== undefined && this.props.s.AREA !== null){
    	var coords = this.props.s.AREA.coords.split(',');
	    var delta_x = coords[0];//offset for x, image positioning
	    var delta_y = coords[1];//offset for y, image positioning
	}
	
	// Get word(s) of the sentence
	if(this.props.s.W !== undefined && this.props.s.W !== null){

		//W can be an array or an object depending on the number of children in the XML
		//Object if only one Word, Array if more than 1 word

		if(Array.isArray(this.props.s.W)){
			//get words of the sentence
		    this.props.s.W.forEach((w) => {

		    	if(w.M !== undefined && w.M !== null){

					var morphemes = [];
					var divWord;


		    		if(w.M.length>0){
		    			
		    			w.M.forEach((m) =>{
		    				// Get note(s) of the morpheme
							this.getNotes(m,notesJSON);

			    			morphemes.push(
				          		<Morpheme wID={w.id} w={m} displayOptions={this.props.displayOptions} idNote={this.idNote} />
				        	);


			    		});
			    		//divWord = <div id={w.id} className="WORD hasMorphemes" style={{display: "inline-block"}}>{morphemes}</div>;
						divWord = <Word sID={this.props.s.id} w={w} displayOptions={this.props.displayOptions} idNote={this.idNote} />;
			    		words.push(divWord);

		    		}else{
		    			// Get note(s) of the morpheme
						this.getNotes(w.M,notesJSON);
						morphemes.push(
				          		<Morpheme wID={w.id} w={w.M} displayOptions={this.props.displayOptions} idNote={this.idNote} />
				        	);
						//divWord = <div id={w.id} className="WORD hasMorphemes" style={{display: "inline-block"}}>{morphemes}</div>;
						divWord = <Word sID={this.props.s.id} w={w} displayOptions={this.props.displayOptions} idNote={this.idNote} />;
			    		words.push(divWord);
		    			
		    		}


		    	}else{

		    		// Get note(s) of the word
					this.getNotes(w,notesJSON);

		    		words.push(
			          	<Word sID={this.props.s.id} w={w} displayOptions={this.props.displayOptions} idNote={this.idNote} />
			        );

			        if(w.AREA !== undefined && w.AREA !== null){
			        	var coords = w.AREA.coords.split(',');
				        coords[0] -= delta_x;
				        coords[1] -= delta_y;
								coords[2] -= delta_x;
				        coords[3] -= delta_y;

				        //var newCoords = coords.join(',');
				        var canvasStyle = {
				        	'position': 'absolute',
				        	'top': coords[1],
				        	'left': coords[0],
				        	
				        }

				        // Get transcription(s) of the word
				        var word="";
					  	if(w.FORM.length === undefined){
					  		word = w.FORM.text
						}else{
						      word = (w.FORM[0]!==undefined) ? w.FORM[0].text:"";
						}

				        canvas.push(
				        	<canvas title={word} style={canvasStyle} wordid={w.id} width={coords[2]-coords[0]} height={coords[3]-coords[1]} onClick={()=>document.getElementById(w.id).click()} ></canvas>
				        );
				        
			        }
		    	}	
		     	
		    });

		}	
		

	}
	 
	 var notes = [];
	 //#17 NOTES
	 notesJSON.forEach((n)=>{
	 	notes.push(<Note id={n.id} note={n.note} hidden={n.hidden} lang={n.lang}></Note>);
	 });

    
    var avatarStyle={
    	'backgroundColor': blue[800],
    	'display': 'inline-flex'
    }

    return (
      <div id={this.props.s.id} className="SENTENCE" ref={el => (this.instance = el)}>
		<Card> 
	      <CardContent>  	
	      		{(this.props.s.AREA !== undefined) ? 
	      		(
	      		<Picture sentenceId={this.props.s.id} imageSrc={this.props.imageSrc} canvas={canvas} area={this.props.s.AREA} />
	      		):(<div></div>)
	      		}
	       	
	        <div style={{textAlign:"initial"}} className="annotationsBlock">

	        	<Avatar aria-label="sentenceId" style={avatarStyle}>
		            {this.props.s.id} 
		          </Avatar>
				<IconButton aria-describedby={popperId} onClick={showDoi} id={"btn_doi_"+this.props.s.id}><img className="doi" src="/dist/images/DOI_logo.svg" alt="doi" /></IconButton>
	        	<Popper id={"doi_"+this.props.s.id} open={open} anchorEl={this.state.anchorEl} test={document.getElementById("btn_doi_"+this.props.s.id)}>
			      <div>{this.props.doi}</div>
			    </Popper>
			    { 
		    	 	(this.props.s.hasOwnProperty('AUDIO') && window.wavesurfer)
		    	 	?
					<PlayButton continuousPlay={this.state.displayOptions.continuousPlay} start={this.props.s.AUDIO?this.props.s.AUDIO.start:0} end={this.props.s.AUDIO?this.props.s.AUDIO.end:0} id={this.props.s.id} />
					:
					<div></div>
				}
				<div className="transcBlock" style={{display: "inline-block"}}>
	        		{transcriptions}
	        	</div>

	        	<div className="wordsBlock">
					{words}
				</div>

	        	<div className="translBlock">
	        		{translations}
	        	</div>

	        	<div className="notesBlock">
	        		{notes}
	        	</div>
	        	
	        </div> 
	      </CardContent>
	    </Card>

      </div>
    );
  }
}

export default Sentence;