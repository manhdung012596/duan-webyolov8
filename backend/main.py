from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
from ultralytics import YOLO
from translations import COCO_TRANSLATIONS
import asyncio
import json
from gtts import gTTS
from io import BytesIO
from fastapi.responses import StreamingResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/tts")
async def tts_endpoint(text: str):
    """
    Generate Vietnamese TTS audio
    """
    try:
        mp3_fp = BytesIO()
        tts = gTTS(text=text, lang='vi')
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")
    except Exception as e:
        print(f"TTS Error: {e}")
        return {"error": str(e)}

# Load model
model = YOLO("yolov8n.pt")

@app.get("/")
def read_root():
    return {"message": "YOLOv8 Real-time Detection Backend API"}

@app.websocket("/ws/detect")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive frame
            data = await websocket.receive_text()
            
            # Decode base64 image
            # Expected format: "data:image/jpeg;base64,..." or just raw base64
            if "," in data:
                data = data.split(",")[1]
            
            image_bytes = base64.b64decode(data)
            np_arr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            # Run inference
            results = model(frame, verbose=False) # verbose=False to reduce logs
            
            detections = []
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    # Bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    
                    # Class and Confidence
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    
                    # Get class name (English) -> Vietnamese
                    class_name_en = model.names[cls_id]
                    class_name_vi = COCO_TRANSLATIONS.get(class_name_en, class_name_en)

                    detections.append({
                        "bbox": [x1, y1, x2, y2],
                        "label": class_name_vi,
                        "score": conf
                    })
            
            # Send results back
            if detections:
                print(f"Sending detections: {detections}")
            await websocket.send_json({"detections": detections})

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()
