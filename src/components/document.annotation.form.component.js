import TextItem from './document.annotation.text.item.component';
import FormService from "../services/form.service";

export default class Form extends TextItem {

  constructor(props){
    super(props);
    this.state = { 
      notes:this.props.data.notes,
      data:this.props.data
    };

  }


  render() {

    return (
      <TextItem 
      type="form" 
      id={this.props.data.id} 
      lang={this.props.data.kindOf} 
      text={this.props.data.text}
      notes={this.props.notes} 
      refresh={this.props.refresh}
      available_lang={this.props.available_lang}
      note_available_lang={this.props.note_available_lang}
      />
    );
  }
};