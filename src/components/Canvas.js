import './Canvas.css'
import Webcam from "react-webcam"
import { useCallback, useRef, useState, useEffect } from "react"
import SignaturePad from 'react-signature-pad'
import { Hands, VERSION } from '@mediapipe/hands'
import { drawLandmarks, lerp } from '@mediapipe/drawing_utils'
import { Camera } from "@mediapipe/camera_utils"


export default function Canvas(methods) {
  const webcamRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [prevCoords, setPrevCoords] = useState({ x: 0, y: 0 })
  const [currCoords, setCurrCoords] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDrawing, setIsLoadingDrawing] = useState(true)

  const canvasHandsDetectionRef = useRef(null);
  const handsDetection = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`,
  });

  const onResultsHandsDetection = (results) => {
    setIsLoading(false)
    if (results) {
      const currentWebcam = webcamRef.current;
      const canvasCurrent = canvasHandsDetectionRef.current;
      const videoWidth = currentWebcam.video.videoWidth;
      const videoHeight = currentWebcam.video.videoHeight;
      canvasCurrent.width = videoWidth;
      canvasCurrent.height = videoHeight;
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const indexFinger = results.multiHandLandmarks[0][8]
        const clientWidth = canvasCurrent.clientWidth
        const clientHeight = canvasCurrent.clientHeight
        setCurrCoords({ x: (1 - indexFinger.x) * clientWidth, y: indexFinger.y * clientHeight })

        const ctx = canvasCurrent.getContext("2d");
        for (const landmarks of results.multiHandLandmarks) {
          drawLandmarks(ctx, landmarks, {
            color: '#FF0000',
            fillColor: '#00FF00',
            radius: (data) => {
              return lerp(data.from?.z, -0.15, 0.1, 5, 1);
            },
          });
        }

        setIsMouseDown(true)

        setPrevCoords({ x: (1 - indexFinger.x) * clientWidth, y: indexFinger.y * clientHeight })


        ctx.restore();
      }
      else {
        setIsMouseDown(false)
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

    const btnElement = document.querySelector('.btn-default')
    btnElement.textContent = 'Очистить доску'
  }, [webcamRef.current?.video?.readyState]);


  useEffect(() => {
    if (isLoading) {
      return
    }
    var x1 = prevCoords.x;
    var y1 = prevCoords.y;
    var x2 = currCoords.x;
    var y2 = currCoords.y;
    var frames = 1;
    const dx = (x2 - x1) / frames;
    const dy = (y2 - y1) / frames;


    function animate() {
      x1 += dx;
      y1 += dy;

      const event = new MouseEvent('mousemove', {
        view: window,
        bubbles: true,
        cancelable: true,
        screenX: x1,
        screenY: y1,
        clientX: x1,
        clientY: y1
      });

      const element = document.querySelector('#signature-pad canvas');
      element.dispatchEvent(event);

      if (frames > 0) {
        frames--;
        requestAnimationFrame(animate);
      }
    }

    animate();

    setIsLoadingDrawing(false)
  }, [currCoords])


  useEffect(() => {
    if (isMouseDown) {
      const event = new MouseEvent('mousedown', {
        clientX: currCoords.x, // координата X
        clientY: currCoords.y // координата Y
      });

      // Получаем элемент, на который нужно вызвать событие
      const element = document.querySelector('#signature-pad canvas');

      // Вызываем событие mousedown на элементе с указанными координатами
      element.dispatchEvent(event);
    }
    else {
      const event = new MouseEvent('mouseup', {
        clientX: currCoords.x, // координата X
        clientY: currCoords.y // координата Y
      })
      const element = document.querySelector('#signature-pad canvas');
      element.dispatchEvent(event);

    }

  }, [isMouseDown])


  return (
    <div className="canvas">
      <SignaturePad clearButton="true" options={{
        minWidth: 0.5,
        maxWidth: 6,
      }} />
      <canvas
        className='canvas-hands'
        ref={canvasHandsDetectionRef}
      />
      <Webcam className='webcam' mirrored={true} ref={webcamRef} />
      {isLoading && (<h2>Подождите, идет загрузка</h2>)}
      {!isLoading && isLoadingDrawing && (<h2>Помашите рукой для подгрузки доски</h2>)}
    </div>
  )
}
