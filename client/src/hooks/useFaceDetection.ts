/**
 * useFaceDetection Hook
 * Manages webcam stream, face-api.js model loading, and real-time face detection
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { nanoid } from 'nanoid';
import type { DetectedFace, Person, Classification } from '@/lib/types';
import { MODEL_URL } from '@/lib/types';

interface UseFaceDetectionOptions {
  persons: Person[];
  onFacesDetected: (faces: DetectedFace[]) => void;
  onStatusChange: (status: { modelsLoaded: boolean; camerasActive: number }) => void;
}

export function useFaceDetection({ persons, onFacesDetected, onStatusChange }: UseFaceDetectionOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const personsRef = useRef(persons);
  const descriptorsRef = useRef<{ person: Person; descriptor: Float32Array }[]>([]);

  // Keep persons ref updated
  useEffect(() => {
    personsRef.current = persons;
  }, [persons]);

  // Load face-api models
  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        // face-api.js expects to fetch manifest + shard files from a base URL
        // The CDN has renamed files, so we need to serve from public or use a workaround
        // We'll load from the original GitHub CDN which has correct file names
        const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
          faceapi.nets.faceExpressionNet.loadFromUri(modelUrl),
          faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
        ]);

        if (!cancelled) {
          setIsModelLoaded(true);
          onStatusChange({ modelsLoaded: true, camerasActive: 0 });
        }
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        if (!cancelled) {
          setError('Failed to load AI models. Please refresh the page.');
        }
      }
    }

    loadModels();
    return () => { cancelled = true; };
  }, []);

  // Build face descriptors for known persons
  const buildDescriptors = useCallback(async () => {
    const descs: { person: Person; descriptor: Float32Array }[] = [];
    for (const person of personsRef.current) {
      if (person.photoUrl) {
        try {
          const img = await faceapi.fetchImage(person.photoUrl);
          const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          if (detection) {
            descs.push({ person, descriptor: detection.descriptor });
          }
        } catch (e) {
          // Skip persons whose photos can't be processed
        }
      }
    }
    descriptorsRef.current = descs;
  }, []);

  useEffect(() => {
    if (isModelLoaded) {
      buildDescriptors();
    }
  }, [isModelLoaded, persons, buildDescriptors]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!isModelLoaded) {
      setError('Models not yet loaded. Please wait...');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        setError(null);
        onStatusChange({ modelsLoaded: true, camerasActive: 1 });
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access denied. Please allow camera permissions.');
    }
  }, [isModelLoaded, onStatusChange]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setIsCameraOn(false);
    onFacesDetected([]);
    onStatusChange({ modelsLoaded: isModelLoaded, camerasActive: 0 });
  }, [isModelLoaded, onFacesDetected, onStatusChange]);

  // Face detection loop
  useEffect(() => {
    if (!isCameraOn || !isModelLoaded || !videoRef.current) return;

    let lastDetectionTime = 0;
    const DETECTION_INTERVAL = 150; // ms between detections

    async function detectFaces() {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !isCameraOn) return;

      const now = Date.now();
      if (now - lastDetectionTime < DETECTION_INTERVAL) {
        animFrameRef.current = requestAnimationFrame(detectFaces);
        return;
      }
      lastDetectionTime = now;

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptors()
          .withFaceExpressions();

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const displayWidth = video.clientWidth;
        const displayHeight = video.clientHeight;

        const scaleX = displayWidth / videoWidth;
        const scaleY = displayHeight / videoHeight;

        const faces: DetectedFace[] = detections.map(det => {
          const box = det.detection.box;
          let matchedPerson: Person | undefined;
          let bestDistance = 1;

          // Try to match with known persons
          if (det.descriptor && descriptorsRef.current.length > 0) {
            for (const { person, descriptor } of descriptorsRef.current) {
              const distance = faceapi.euclideanDistance(det.descriptor, descriptor);
              if (distance < bestDistance && distance < 0.6) {
                bestDistance = distance;
                matchedPerson = person;
              }
            }
          }

          // Determine classification
          let classification: Classification = 'unknown';
          if (matchedPerson) {
            classification = matchedPerson.classification;
          }

          // Get dominant expression
          const expressions = det.expressions;
          let dominantExpression = 'neutral';
          let maxScore = 0;
          if (expressions) {
            Object.entries(expressions).forEach(([expr, score]) => {
              if (typeof score === 'number' && score > maxScore) {
                maxScore = score;
                dominantExpression = expr;
              }
            });
          }

          return {
            id: nanoid(),
            box: {
              x: box.x * scaleX,
              y: box.y * scaleY,
              width: box.width * scaleX,
              height: box.height * scaleY,
            },
            matchedPerson,
            confidence: det.detection.score,
            classification,
            descriptor: det.descriptor,
            expression: dominantExpression,
            timestamp: now,
          };
        });

        onFacesDetected(faces);
      } catch (err) {
        // Silently handle detection errors
      }

      animFrameRef.current = requestAnimationFrame(detectFaces);
    }

    const video = videoRef.current;
    const handlePlay = () => {
      animFrameRef.current = requestAnimationFrame(detectFaces);
    };

    video.addEventListener('playing', handlePlay);

    if (!video.paused) {
      animFrameRef.current = requestAnimationFrame(detectFaces);
    }

    return () => {
      video.removeEventListener('playing', handlePlay);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraOn, isModelLoaded, onFacesDetected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isModelLoaded,
    isCameraOn,
    error,
    startCamera,
    stopCamera,
  };
}
