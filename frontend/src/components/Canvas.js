import './Canvas.css'
import Webcam from "react-webcam"
import { useCallback, useRef, useState, useEffect } from "react"
import SignaturePad from 'react-signature-pad'
import { Hands, VERSION } from '@mediapipe/hands'
import { drawLandmarks, lerp } from '@mediapipe/drawing_utils'
import { Camera } from "@mediapipe/camera_utils"


export default function Canvas(methods) {
  const webcamRef = useRef(null);

  const canvasHandsDetectionRef = useRef(null);
  const handsDetection = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`,
  });


  const onResultsHandsDetection = (results) => {
    if (results) {
      const currentWebcam = webcamRef.current;
      const canvasCurrent = canvasHandsDetectionRef.current;
      const videoWidth = currentWebcam.video.videoWidth;
      const videoHeight = currentWebcam.video.videoHeight;
      canvasCurrent.width = videoWidth;
      canvasCurrent.height = videoHeight;
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const ctx = canvasCurrent.getContext("2d");
        for (const landmarks of results.multiHandLandmarks) {
          drawLandmarks(ctx, landmarks, {
            color: '#FF0000',
            fillColor: '#00FF00',
            radius: (data) => {
              return lerp(data.from?.z, -0.15, 0.1, 10, 1);
            },
          });
        }
        ctx.restore();
      }
    }
  };


  useEffect(() => {
    handsDetection.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    handsDetection.onResults(onResultsHandsDetection);
    const currentWebcam = webcamRef.current;
    if (typeof currentWebcam !== "undefined" && currentWebcam !== null) {
      let camera;
      camera = new Camera(currentWebcam?.video, {
        onFrame: async () => {
          await handsDetection.send({ image: currentWebcam?.video });
        },
        width: currentWebcam.video.width,
        height: currentWebcam.video.height,
      });
      camera.start();
    }
  }, [webcamRef.current?.video?.readyState]);

  
  return (
    <div className="canvas">
      <SignaturePad clearButton="true" />
      <canvas
        className='canvas-hands'
        ref={canvasHandsDetectionRef}
      />
      <Webcam className='webcam' mirrored={true} ref={webcamRef} />
    </div>
  )
}
