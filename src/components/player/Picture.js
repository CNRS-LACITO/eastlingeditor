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
        //var url_image = this.props.imageSrc;

        var images = [];
        var that = this;
        var canvas = [];


        this.props.canvas && this.props.canvas.forEach((canva)=>{
          if(!canvas[canva.props.image]) canvas[canva.props.image]=[];
          canvas[canva.props.image].push(canva);
        });

        //ici il s'agit des zones image de la sentence
        this.props.area && this.props.area.forEach((a)=>{
            
            var coords = a.coords.split(',');
            var image_scope = coords[3]-coords[1];
            var image_width = coords[2]-coords[0];
            //var image_bottom = 0;
            //var image_bottom = parseInt(coords[1]); 
            var usemap ="#map_" + this.props.sentenceId;

           var delta_x = coords[0];
           var delta_y = coords[1];
           
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
              //'position': 'absolute'
            };

            const imageBlock = () => {
              return (
                <div style={{position:'relative',textAlign:'initial'}}>
                  <img 
                    alt={a.image} 
                    src={"data:image/png;base64,"+localStorage[a.image]} 
                    style={imgStyle} 
                    width={image_width} 
                    height={image_scope} 
                    usemap={usemap} 
                  />
                  {canvas[a.image]}
                </div>
              )

            }
              ;

            images.push(imageBlock());

        });

        
            /*
                    var coords = this.props.area.coords.split(',');

                    var image_scope = coords[3]-coords[1];
                    var image_width = coords[2]-coords[0];
                    //var image_bottom = 0;
                    //var image_bottom = parseInt(coords[1]); 
                    var usemap ="#map_" + this.props.sentenceId;

                   var delta_x = coords[0];
                   var delta_y = coords[1];
                   
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
                      'max-width' : 'inherit !important'
                    };
            */

    return (
          <div class="pictureBlock" sentenceId={this.props.sentenceId}>
              
               {images}

          </div>
    );
  }
}

export default Picture;