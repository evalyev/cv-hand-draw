import './Canvas.css'
import Webcam from "react-webcam"
import { useCallback, useRef, useState } from "react"
import SignaturePad from 'react-signature-pad'

export default function Canvas(methods) {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  return (
    <div className="canvas">
      <SignaturePad clearButton="true" />
      <Webcam className='webcam' mirrored={true} ref={webcamRef} />
    </div>
  )
}
