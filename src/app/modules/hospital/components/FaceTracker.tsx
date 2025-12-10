"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop";

// ... (Giữ nguyên phần khai báo hằng số RIGHT_EYE, LEFT_EYE, hàm createImage, getCroppedImg như cũ) ...
const RIGHT_EYE = [463, 414, 286, 258, 257, 259, 260, 467, 359, 255, 339, 254, 253, 252, 256, 341];
const LEFT_EYE = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
const ALL_EYE_INDICES = [...RIGHT_EYE, ...LEFT_EYE];

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
}

interface FaceTrackerProps {
  onCapture: (blob: Blob) => void;
}

export default function FaceTracker({ onCapture }: FaceTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null); // Lưu blob hiện tại
  const [isEditing, setIsEditing] = useState(false);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(
    null,
  );

  // Easy crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // --- 1. Load Model (Giữ nguyên) ---
  useEffect(() => {
    const initMediaPipe = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
        numFaces: 1,
      });
      setFaceLandmarker(landmarker);
    };
    initMediaPipe();
  }, []);

  // --- 2. Start Webcam (Giữ nguyên) ---
  useEffect(() => {
    const startWebcam = async () => {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      }
    };
    if (faceLandmarker) startWebcam();
    return () => cancelAnimationFrame(requestRef.current);
  }, [faceLandmarker]);

  // --- 3. Predict Logic (Giữ nguyên) ---
  const predictWebcam = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const cropCanvas = cropCanvasRef.current;
    if (!video || !canvas || !cropCanvas || !faceLandmarker || isEditing || capturedImage) return;

    const startTimeMs = performance.now();
    let results: FaceLandmarkerResult | null = null;
    try {
      results = faceLandmarker.detectForVideo(video, startTimeMs);
    } catch {}

    const ctx = canvas.getContext("2d");
    const cropCtx = cropCanvas.getContext("2d");
    if (!ctx || !cropCtx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results?.faceLandmarks.length) {
      const landmarks = results.faceLandmarks[0];
      const eyePoints = ALL_EYE_INDICES.map((i) => ({
        x: landmarks[i].x * canvas.width,
        y: landmarks[i].y * canvas.height,
      }));

      let xMin = Math.min(...eyePoints.map((p) => p.x));
      let yMin = Math.min(...eyePoints.map((p) => p.y));
      let xMax = Math.max(...eyePoints.map((p) => p.x));
      let yMax = Math.max(...eyePoints.map((p) => p.y));

      const pad = 20;
      xMin = Math.max(xMin - pad, 0);
      yMin = Math.max(yMin - pad, 0);
      xMax = Math.min(xMax + pad, canvas.width);
      yMax = Math.min(yMax + pad, canvas.height);

      const w = xMax - xMin;
      const h = yMax - yMin;

      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      ctx.strokeRect(xMin, yMin, w, h);
      setCropRect({ x: xMin, y: yMin, w, h });

      cropCanvas.width = w;
      cropCanvas.height = h;
      cropCtx.drawImage(video, xMin, yMin, w, h, 0, 0, w, h);
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  // --- 4. Handle Capture ---
  const handleCapture = () => {
    if (!cropCanvasRef.current || !cropRect) {
      alert("Chưa nhận diện được khuôn mặt!");
      return;
    }
    cropCanvasRef.current.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setCapturedImage(url);
        setCurrentBlob(blob); // Lưu blob gốc
      }
    }, "image/jpeg");
  };

  // --- 5. Manual Crop Logic ---
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (capturedImage && croppedAreaPixels) {
      try {
        const croppedBlob = await getCroppedImg(capturedImage, croppedAreaPixels);
        if (croppedBlob) {
          const newUrl = URL.createObjectURL(croppedBlob);
          setCapturedImage(newUrl);
          setCurrentBlob(croppedBlob); // Cập nhật blob mới sau khi crop
          setIsEditing(false);
          setZoom(1);
          setCrop({ x: 0, y: 0 });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // --- 6. Gửi ảnh ra Component Cha để chẩn đoán ---
  const handleConfirmDiagnosis = () => {
    if (currentBlob) {
      onCapture(currentBlob);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCurrentBlob(null);
    setIsEditing(false);
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-center w-full">
        {/* WEBCAM VIEW */}
        <div
          className={`relative ${capturedImage && !isEditing ? "hidden md:block opacity-50" : ""}`}
        >
          {/* Chỉ hiện video khi chưa chụp hoặc đang crop đè lên */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute top-0 left-0 w-[640px] h-[480px] object-cover opacity-50 rounded-lg"
          />
          <canvas
            ref={canvasRef}
            className="relative w-[640px] h-[480px] border border-gray-300 rounded-lg shadow-sm"
          />
        </div>

        {/* SIDEBAR / PREVIEW AREA */}
        <div className="flex flex-col items-center gap-4 min-w-[300px]">
          {/* Nút chụp (Chỉ hiện khi chưa chụp) */}
          {!capturedImage && (
            <>
              <div className="bg-gray-100 p-2 rounded-md border text-center">
                <p className="font-semibold text-sm mb-2">Realtime Focus</p>
                <canvas ref={cropCanvasRef} className="border border-red-500 bg-white mx-auto" />
              </div>
              <button
                onClick={handleCapture}
                className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500 transition w-full"
              >
                Chụp ảnh (Auto)
              </button>
            </>
          )}

          {/* Sau khi chụp */}
          {capturedImage && (
            <div className="w-full flex flex-col gap-3">
              <p className="font-semibold text-center">Xem trước ảnh:</p>

              {isEditing ? (
                // --- CHẾ ĐỘ CROP ---
                <div className="flex flex-col gap-2 bg-white p-2 border rounded-md shadow-lg absolute inset-0 z-50 md:relative md:inset-auto">
                  <div className="relative w-full h-64 bg-black rounded-md overflow-hidden">
                    <Cropper
                      image={capturedImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={undefined}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 px-2">
                    <span>Zoom:</span>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveCrop}
                      className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                    >
                      Lưu cắt
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-400"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                // --- CHẾ ĐỘ REVIEW ---
                <div className="flex flex-col gap-3">
                  <div className="relative border-2 border-cyan-500 rounded-md overflow-hidden bg-gray-50">
                    <Image
                      width={400}
                      height={300}
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-auto object-contain max-h-64"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* NÚT QUAN TRỌNG NHẤT: Gửi sang trang chẩn đoán */}
                    <button
                      onClick={handleConfirmDiagnosis}
                      className="w-full px-4 py-3 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500 shadow-md animate-pulse"
                    >
                      Xác nhận & Chẩn đoán ➔
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-400"
                      >
                        Cắt lại
                      </button>
                      <button
                        onClick={handleRetake}
                        className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-400"
                      >
                        Chụp lại
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
