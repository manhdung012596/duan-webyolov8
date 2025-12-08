import React, { useRef, useEffect, useState } from 'react';
import { announcer } from './VoiceAnnouncer';

const CameraView = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);

    // Audio state
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [lastSpoken, setLastSpoken] = useState("");

    // Detection state
    const [isDetecting, setIsDetecting] = useState(false);

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
    }, [isAudioEnabled, isDetecting]); // Re-bind if audio/detection state changes

    const sendFrame = () => {
        // Gate detection by state
        if (!isDetecting) return;
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

        // Only draw if we are supposedly detecting
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

    const enableAudio = () => {
        setIsAudioEnabled(true);
        announcer.speak("Âm thanh đã được bật");
    };

    const startDetection = () => {
        setIsDetecting(true);
        announcer.speak("Bắt đầu nhận diện");
    }

    const stopDetection = () => {
        setIsDetecting(false);
        announcer.speak("Kết thúc nhận diện");
        // Clear canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    const announceDetections = (detections) => {
        if (!isAudioEnabled) return;

        // Collect all distinct labels with high confidence
        const highConfDetections = detections.filter(d => d.score > 0.5);
        if (highConfDetections.length === 0) return;

        // Get unique labels only
        const labels = [...new Set(highConfDetections.map(d => d.label))];

        // Pass list to announcer
        announcer.announce(labels);

        // Update last spoken visual indicator (show most confident or just list)
        // For UI, let's show the top one or join them? Joining them might be too long.
        // Let's just show the top scoring one for the UI "Speaking..." text
        const topDet = highConfDetections.sort((a, b) => b.score - a.score)[0];
        if (topDet) {
            setLastSpoken(topDet.label);
        }
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

            <div className="controls-overlay">
                {!isAudioEnabled && (
                    <button className="btn-enable-audio" onClick={enableAudio}>
                        🔊 Bật Âm Thanh
                    </button>
                )}

                <div className="detection-controls" style={{ marginTop: '10px' }}>
                    {!isDetecting ? (
                        <button className="btn-start" onClick={startDetection} style={{ backgroundColor: '#00cc00', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', marginRight: '10px', fontSize: '16px' }}>
                            ▶ Bắt đầu
                        </button>
                    ) : (
                        <button className="btn-stop" onClick={stopDetection} style={{ backgroundColor: '#cc0000', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', marginRight: '10px', fontSize: '16px' }}>
                            ⏹ Kết thúc
                        </button>
                    )}
                </div>

                {isAudioEnabled && lastSpoken && (
                    <div className="speaking-indicator">
                        Đang nói: {lastSpoken}
                    </div>
                )}
            </div>

            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '● Máy chủ: Đã kết nối' : '○ Máy chủ: Đang kết nối...'}
            </div>
        </div>
    );
};

export default CameraView;
