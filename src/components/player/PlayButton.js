import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { PlayArrow, Pause } from '@material-ui/icons';

class PlayButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayPlay : document.getElementById('player').paused,
      duration : (this.props.end - this.props.start) * 1000
    }

  }

  showPlayPause = event => {
      this.setState({
        displayPlay : document.getElementById('player').paused
      });
  }

  componentDidMount(){
    document.getElementById('player').addEventListener('pause', this.showPlayPause);
    document.getElementById('player').addEventListener('playing', this.showPlayPause);
  }

  playPause(){
    var player = document.getElementById('player');
    //si on change de phrase
    /*if(this.props.id !== window.currentSentence || this.props.isWordList === true){
      player.currentTime = this.props.start;
    }*/

    if(player.paused){
      player.currentTime = this.props.start;
      player.play();
      if(!document.getElementsByName('continuousPlay')[0].checked) setTimeout(function() { player.pause() }, this.state.duration);
    }else{
      player.pause();
    }

    this.setState({
      displayPlay : player.paused
    });
    
  }

  render() {
    return(
    <IconButton color="primary" aria-label="play" onClick={this.playPause.bind(this)} >
      <PlayArrow style={{display:(this.state.displayPlay)?'block':'none'}} />
      <Pause style={{display:(this.state.displayPlay)?'none':'block'}} />
    </IconButton>
    );
  }
}

export default PlayButton;