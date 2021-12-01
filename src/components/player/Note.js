import React from 'react';

class Note extends React.Component {

  render() {

    return (
          <div class={`note ${this.props.lang}`} hidden={this.props.hidden} >
          <span class='circle'>
            {this.props.id}
          </span>
          {this.props.note}
          </div>
    );
  }
}

export default Note;