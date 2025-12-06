import React, { useRef, useEffect, useState } from 'react';
import { announcer } from './VoiceAnnouncer';

const CameraView = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        // Init Camera
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "environment"
                    }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Không thể truy cập camera. Vui lòng cấp quyền.");
            }
        };

        startCamera();

        // Init WebSocket
        const connectWs = () => {
            // Assuming backend is on localhost:8000
            const ws = new WebSocket('ws://localhost:8000/ws/detect');
            ws.onopen = () => {
                console.log("WebSocket connected");
                setIsConnected(true);
            };
            ws.onclose = () => {
                console.log("WebSocket disconnected");
                setIsConnected(false);
                setTimeout(connectWs, 3000); // Reconnect
            };
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                drawDetections(data.detections);
                announceDetections(data.detections);
            };
            wsRef.current = ws;
        };

        connectWs();

        // Send frames loop
        const intervalId = setInterval(() => {
            sendFrame();
        }, 100); // 10 FPS sending

        return () => {
            clearInterval(intervalId);
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    const sendFrame = () => {
        if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const video = videoRef.current;
        // Check if video is ready
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        const canvas = document.createElement('canvas'); // Offscreen canvas for encoding
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Compress as JPEG to reduce bandwidth
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        wsRef.current.send(base64);
    };

    const drawDetections = (detections) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        // Match canvas memory size to video size
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach(det => {
            const [x1, y1, x2, y2] = det.bbox;
            const label = det.label;
            const score = det.score;

            // Draw Box
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 4;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            // Draw Label Background
            ctx.fillStyle = '#00FF00';
            const text = `${label} ${(score * 100).toFixed(0)}%`;
            ctx.font = 'bold 18px Arial';
            const textWidth = ctx.measureText(text).width;
            ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);

            // Draw Text
            ctx.fillStyle = '#000000';
            ctx.fillText(text, x1 + 5, y1 - 7);
        });
    };

    const announceDetections = (detections) => {
        // Sort by confidence
        detections.sort((a, b) => b.score - a.score);

        detections.forEach(det => {
            if (det.score > 0.6) {
                announcer.announce(det.label);
            }
        });
    };

    return (
        <div className="camera-container">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
            />
            <canvas
                ref={canvasRef}
                className="camera-overlay"
            />
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '● Máy chủ: Đã kết nối' : '○ Máy chủ: Đang kết nối...'}
            </div>
        </div>
    );
};

export default CameraView;
