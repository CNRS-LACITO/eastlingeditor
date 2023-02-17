import React from 'react'
import ReactDOM from 'react-dom'
import MultiCrops from 'react-multi-crops'

export default class ImageMultiSelector extends React.Component {
  
  constructor(props){
    super(props);
    this.divCanvas = React.createRef();

    /////////////////////////////////
    //var pCoords = [];
    var imageCanvas = [];
      var badgeStyleCommon = {
        position: "absolute",
        top:"0px",
        width: "12px",
        height: "12px",
        //boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
        borderRadius: "50%",
        color: "white",
        fontSize: "0.6rem",
        fontWeight: "bold",
        textAlign: "center"
      };

    this.props.canvas && this.props.canvas.forEach((c) => {

      var badgeStyleForm = {
        position: badgeStyleCommon.position,
        top:badgeStyleCommon.top,
        width: badgeStyleCommon.width,
        height: badgeStyleCommon.height,
        //boxShadow: badgeStyleCommon.boxShadow,
        borderRadius: badgeStyleCommon.borderRadius,
        color: badgeStyleCommon.color,
        fontSize: badgeStyleCommon.fontSize,
        fontWeight: badgeStyleCommon.fontWeight,
        textAlign: badgeStyleCommon.textAlign
      };

      var badgeStyleTranslation = {
        position: badgeStyleCommon.position,
        top:badgeStyleCommon.top,
        width: badgeStyleCommon.width,
        height: badgeStyleCommon.height,
        //boxShadow: badgeStyleCommon.boxShadow,
        borderRadius: badgeStyleCommon.borderRadius,
        color: badgeStyleCommon.color,
        fontSize: badgeStyleCommon.fontSize,
        fontWeight: badgeStyleCommon.fontWeight,
        textAlign: badgeStyleCommon.textAlign
      };

      badgeStyleForm.right = "10px";
      badgeStyleTranslation.right = "0px";

      var formInfo = "";var translationInfo = "";

      badgeStyleForm.backgroundColor = (c.hasForm > 0) ? "green":"red";
      badgeStyleTranslation.backgroundColor = (c.hasTranslation > 0) ? "green":"red";
      formInfo = (c.hasForm > 0) ? "At least one form exists":"No form";
      translationInfo = (c.hasTranslation > 0) ? "At least one translation exists":"No translation";

      var coords = c.areaCoords.split(',');

      var styleImageCanvas = {
        display:props.showImageCanvas?"block":"none",
        position: "absolute",
        top: coords[1]/coords[4]+"px", // #21
        left:coords[0]/coords[4]+"px", // #21
        border: "solid",
        borderColor:(c.type==='S')?"blue":"blue",
        borderStyle: (c.type==='S')?"solid":"dotted",
        cursor:"pointer"
      };
      var canvas = (
        <div style={styleImageCanvas}>
            <canvas 
              className="imageCanvas"
              title={c.type+c.rank} 
              style={{position: "relative"}} 
              width={(coords[2]-coords[0])/coords[4]} // #21
              height={(coords[3]-coords[1])/coords[4]} // #21
              onClick={()=>{props.showAnnotation(this.props.documentId,c.id)}}
            />
            <span class="infoBadge" style={badgeStyleForm} title={formInfo} >F</span>
            <span class="infoBadge" style={badgeStyleTranslation} title={translationInfo} >T</span>
        </div>);

      imageCanvas.push(canvas);
  });

    this.state = {
      coordinates: this.props.coordinates,
      canvas: imageCanvas,
      imageSelectorWidth:1000
    }

    // #21
    var image = new Image();
    //image.src = "data:image/png;base64,"+this.props.image["TO_BASE64(content)"];
    image.src = "data:image/png;base64,"+window.imagesMap.filter((i)=>i.id === this.props.image.id)[0].content;
    //image.src =   window.imagesMap["image"+this.props.key];
    const scaleX = image.naturalWidth / this.state.imageSelectorWidth;
    window.imageRatio = scaleX;

  }
 
  changeCoordinate = (coordinate, index, coordinates) => {
    
    this.setState({
      coordinates,
    });

    var imageSelectionData=[];

    coordinates.forEach((c)=>{
      imageSelectionData.push({
        image_id:this.props.image.id,
        x:parseFloat(c.x.toFixed(2)),
        y:parseFloat(c.y.toFixed(2)),
        width:parseFloat(c.width.toFixed(2)),
        height:parseFloat(c.height.toFixed(2)),
      });
    });

    window.coordinates=coordinates;
    window.imageSelectionData = imageSelectionData;

    if(window.currentAnnotationEdition){
      window.currentAnnotationEdition.data = imageSelectionData;
    }


  }
  deleteCoordinate = (coordinate, index, coordinates) => {
    this.setState({
      coordinates,
    });
    window.coordinates=coordinates;
  }

  componentDidMount(){
    var divImageSelector = this.divCanvas.previousSibling;
    divImageSelector.append(this.divCanvas);
  }

  render() {

    return (
      <div id={"ImageSelector_"+this.props.image.id} className="ImageSelector">

        <MultiCrops
          src={this.props.image["url"] || "data:image/png;base64,"+this.props.image["TO_BASE64(content)"]}
          //src={"data:image/png;base64,"+window.imagesMap["image"+this.props.image.id]}
          width={this.state.imageSelectorWidth}
          coordinates={this.state.coordinates}
          onChange={this.changeCoordinate}
          onDelete={this.deleteCoordinate}
          //canvas={this.state.canvas}
        />
        <div ref={ref => this.divCanvas = ref}>{this.state.canvas}</div>
        

      </div>

    );
  }
}

