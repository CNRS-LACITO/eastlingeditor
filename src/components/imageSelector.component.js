import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function ImageSelector({image,canvas,showAnnotation,showImageCanvas}) {
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  //const [crop, setCrop] = useState({ unit: '%', width: 30});
  const [crop, setCrop] = useState(window.crop);
  const [completedCrop, setCompletedCrop] = useState(window.crop);


  const onLoad = useCallback((img) => {
    imgRef.current = img;
    img.id = image.id;
    img.usemap = "#mapAreaImage"+image.id;
  }, []);


  const handleChange = () => (c)=>{
    c.activeImage=image.id;
    setCrop(c);
    window.crop=c;
  }

  const handleComplete = () => (c) => {
    c.activeImage=image.id;
    setCompletedCrop(c);
    window.crop=c;
    var imageSelectionData = {
      image_id:image.id,
      x:parseFloat(c.x.toFixed(2)),
      y:parseFloat(c.y.toFixed(2)),
      width:parseFloat(c.width.toFixed(2)),
      height:parseFloat(c.height.toFixed(2))
    };
    window.imageSelectionData = imageSelectionData;

    if(window.currentAnnotationEdition){
        window.currentAnnotationEdition.data = imageSelectionData;
    }
    
  }

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [completedCrop]);

  var imageCanvas = [];
  canvas.forEach((c) => {

    var coords = c.areaCoords.split(',');
/*
    canvas.addEventListener('click', () => {
       console.log('canvas click');
    });
*/
    var styleImageCanvas = {
      display:showImageCanvas?"block":"none",
      position: "absolute",
      top: coords[1]+"px",
      left:coords[0]+"px",
      border: "solid",
      borderColor:(c.type==='S')?"red":"blue",
      cursor:"pointer"
    };
    var canvas = (<canvas 
      className="imageCanvas"
      title={c.type+c.rank} 
      style={styleImageCanvas} 
      width={coords[2]-coords[0]}
      height={coords[3]-coords[1]}
      onClick={()=>{showAnnotation(c.id)}}
      />);

    imageCanvas.push(canvas);
  });

  

  return (
    <div id={"ImageSelector_"+image.id} className="ImageSelector">
      <ReactCrop
        src={"data:image/png;base64,"+image["TO_BASE64(content)"]}
        onImageLoaded={onLoad}
        crop={crop}
        onChange={handleChange()}
        onComplete={handleComplete()}
        children={imageCanvas}
      />

      <div id="imageSelectorCanva">
        <canvas
          ref={previewCanvasRef}
          // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0)
          }}
        />
      </div>


    </div>
  );
}