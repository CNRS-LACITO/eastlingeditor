import TextItem from './document.annotation.text.item.component';
import TranslationService from "../services/translation.service";

export default class Translation extends TextItem {
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
        type="translation"
        id={this.props.data.id} 
        lang={this.props.data.lang} 
        text={this.props.data.text}
        notes={this.props.notes}
        refresh={this.props.refresh}
        available_lang={this.props.available_lang}
        note_available_lang={this.props.note_available_lang}
      />
    );
  }
};