# Hướng Dẫn Cài Đặt Dự Án Trên Máy Mới

Tài liệu này hướng dẫn chi tiết cách cài đặt và chạy dự án **Web YOLOv8 Real-time Detection** trên một máy tính hoàn toàn mới (Windows).

## 1. Yêu Cầu Hệ Thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:

1.  **Git**: [Tải về tại đây](https://git-scm.com/downloads) (Chọn "Windows" và cài đặt mặc định).
2.  **Python (3.9 - 3.11)**: [Tải về tại đây](https://www.python.org/downloads/)
    *   **QUAN TRỌNG**: Khi cài đặt, tích vào ô **"Add Python to PATH"**.
3.  **Node.js (LTS version)**: [Tải về tại đây](https://nodejs.org/) (Chọn bản "LTS Recommended for most users").

## 2. Tải Dự Án Về Máy

1.  Mở thư mục bạn muốn chứa code.
2.  Nhấn chuột phải chọn "Open Git Bash here" hoặc mở Terminal.
3.  Chạy lệnh clone (thay thế URL bằng link GitHub của bạn):
    ```bash
    git clone https://github.com/manhdung012596/duan-webyolov8.git
    ```
4.  Truy cập thư mục dự án:
    ```bash
    cd duan-webyolov8
    ```

## 3. Cài Đặt Backend (Python)

1.  Từ thư mục gốc `duan-webyolov8`, mở Terminal (CMD hoặc PowerShell).
2.  Tạo môi trường ảo (Virtual Environment) để quản lý thư viện:
    ```bash
    python -m venv .venv
    ```
3.  Kích hoạt môi trường ảo:
    *   **Windows (PowerShell)**:
        ```bash
        .venv\Scripts\Activate
        ```
    *   **Windows (CMD)**:
        ```bash
        .venv\Scripts\activate.bat
        ```
    *   *(Nếu thấy có chữ `(.venv)` ở đầu dòng lệnh là thành công)*
4.  Di chuyển vào thư mục backend và cài thư viện:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

## 4. Cài Đặt Frontend (React)

1.  Mở một cửa sổ Terminal **mới**.
2.  Di chuyển vào thư mục frontend:
    ```bash
    cd frontend
    ```
3.  Cài đặt các gói phụ thuộc (node_modules):
    ```bash
    npm install
    ```

## 5. Chạy Chương Trình

Mỗi lần muốn sử dụng, bạn cần chạy cả Backend và Frontend.

### Bước 1: Chạy Backend
Trong Terminal 1 (đã kích hoạt `.venv`):
```bash
cd backend  # Nếu chưa vào
uvicorn main:app --reload
```
*Backend chạy thành công khi thấy hiện:* `http://127.0.0.1:8000`

### Bước 2: Chạy Frontend
Trong Terminal 2:
```bash
cd frontend # Nếu chưa vào
npm run dev
```
*Frontend chạy thành công khi thấy hiện:* `http://localhost:5173`

### Bước 3: Sử Dụng
1.  Mở trình duyệt (Chrome/Edge) truy cập `http://localhost:5173`.
2.  Nhấn nút **"Bật Âm Thanh"**.
3.  Nhấn nút **"Bắt đầu" (Màu xanh)** để kích hoạt camera và nhận diện.

---
**Lưu ý:**
- Nếu gặp lỗi "ExecutionPolicy" khi chạy `.venv`, mở PowerShell với quyền Admin và chạy: `Set-ExecutionPolicy RemoteSigned`.
- Đảm bảo Camera và Loa hoạt động tốt.
