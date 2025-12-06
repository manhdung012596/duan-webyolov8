import CameraView from './CameraView'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <h1 className="title">YOLOv8 Nhận Diện Vật Thể (Tiếng Việt)</h1>
      <CameraView />
      <p className="instruction">Đưa vật thể trước camera để nhận diện và nghe phát âm.</p>
    </div>
  )
}

export default App
