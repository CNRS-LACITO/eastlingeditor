import React from 'react';

class Picture extends React.Component {

  componentDidMount(){
    document.querySelectorAll('.pictureBlock canvas').forEach(c=>{
      c.onmouseover=function(){
        window.highlight && window.highlight(this.attributes.wordid.nodeValue,"W");
      }
    });
  }

  render() {

        var images = [];
        var that = this;

        //ici il s'agit des zones image de la sentence

          var a = this.props.area;
            
            var coords = a.coords.split(',');
            var image_scope = coords[3]-coords[1];
            var image_width = coords[2]-coords[0];
            //var image_bottom = 0;
            //var image_bottom = parseInt(coords[1]); 
            var usemap ="#map_" + this.props.sentenceId + this.props.areaIndex;

           var delta_x = coords[0];
           var delta_y = coords[1];

           var ratio = 1;

            ratio = 1/coords[4];
           
           var cssBGPosition = '-' + delta_x + 'px -' + delta_y + 'px';    
           //var cssBG ='url('+url_image+') -' + delta_x + 'px -' + delta_y + 'px';
           
            //const wordsAreas = [];
            const imgStyle = {
              'background-position': cssBGPosition,
              'width': image_width + 'px',
              'height': image_scope + 'px',
              'padding': '0px',
              'border': '0px',
              'object-fit': 'none',
              'object-position':cssBGPosition,
              'max-width' : 'inherit !important',
              'transform': 'scale('+ratio+')',
              'transform-origin': 'left top',
              //'position': 'absolute'
            };


            const imageBlock = () => {
              var imgBinary = null;
              if(window.imagesMap.filter((image)=>image.id === parseInt(a.image.split('image')[1])).length > 0)
                imgBinary = window.imagesMap.filter((image)=>image.id === parseInt(a.image.split('image')[1]))[0].content;

              return (
                <div style={{position:'relative',textAlign:'initial'}}>
                  <img 
                    alt={a.image} 
                    src={"data:image/png;base64,"+imgBinary} 
                    style={imgStyle} 
                    width={image_width} 
                    height={image_scope} 
                    usemap={usemap} 
                  />
                  {this.props.canvas}
                </div>
              )

            }
              ;

            images.push(imageBlock());


    return (
          <div class="pictureBlock" sentenceId={this.props.sentenceId} areaId={this.props.areaIndex} >
              
               {images}

          </div>
    );
  }
}

export default Picture;