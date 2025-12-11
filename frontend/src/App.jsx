import CameraView from './CameraView'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <h1 className="title">Thiết Bị Hỗ Trợ Người Khiếm Thị</h1>
      <CameraView />
      <p className="instruction">Đưa vật thể trước camera để nhận diện và nghe phát âm.</p>
    </div>
  )
}

export default App
