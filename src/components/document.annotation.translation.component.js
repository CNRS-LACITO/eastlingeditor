import TextItem from './document.annotation.text.item.component';

export default class Translation extends TextItem {

  render() {
    return (
      <TextItem
        type="translation"
        id={this.props.data.id}
        lang={this.props.data.lang}
        text={this.props.data.text}
        refresh={this.props.refresh}
        available_lang={this.props.available_lang}
      />
    );
  }
};