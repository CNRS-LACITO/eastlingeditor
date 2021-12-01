import TextItem from './document.annotation.text.item.component';

export default class Form extends TextItem {

  render() {
    return (
      <TextItem 
      type="form" 
      id={this.props.data.id} 
      lang={this.props.data.kindOf} 
      text={this.props.data.text} 
      refresh={this.props.refresh} 
      available_lang={this.props.available_lang}
      />
    );
  }
};