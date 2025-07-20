# 🎯 Camera Object Analyzer

Ứng dụng web phân tích đối tượng thông minh sử dụng AI, tích hợp camera và Hugging Face API.

## ✨ Tính năng

- 📷 **Camera Access**: Truy cập camera trực tiếp trên mobile/desktop
- 📸 **Capture Image**: Chụp ảnh từ camera với chất lượng cao
- 📁 **File Upload**: Upload ảnh từ thiết bị (fallback)
- 🤖 **AI Detection**: Phân tích đối tượng với Hugging Face DETR ResNet-50
- 🇻🇳 **Vietnamese Support**: Dịch tên đối tượng sang tiếng Việt
- 📱 **Mobile Optimized**: Responsive design, touch-friendly
- ⚡ **Real-time**: Phân tích ảnh real-time với confidence score
- 🔄 **Error Handling**: Xử lý lỗi toàn diện với retry logic

## 🚀 Demo

👉 **[Live Demo](https://taddy-lab2lives.github.io/Webapp-Cam/WebappCam/)**

## 📦 Setup

### 1. Clone Repository
```bash
git clone https://github.com/Taddy-Lab2Lives/Webapp-Cam.git
cd Webapp-Cam/WebappCam
```

### 2. Cấu hình API Token
Mở file `config.js` và thêm Hugging Face API token:

```javascript
const CONFIG = {
    HUGGINGFACE: {
        API_TOKEN: 'hf_YOUR_TOKEN_HERE', // Thay bằng token của bạn
        // ...
    }
};
```

### 3. Chạy Local Server
```bash
# Python 3
python3 -m http.server 8000

# Node.js (nếu có)
npx serve .

# PHP (nếu có)
php -S localhost:8000
```

### 4. Truy cập App
Mở browser: **http://localhost:8000**

## 🔑 Lấy Hugging Face API Token

1. Đăng ký tài khoản tại [Hugging Face](https://huggingface.co)
2. Vào **Settings** → **Access Tokens**
3. Tạo **New Token** với quyền **Read**
4. Copy token và paste vào `config.js`

## 📱 Cách sử dụng

1. **Bật Camera**: Nhấn "Bật Camera" và cho phép quyền truy cập
2. **Chụp ảnh**: Nhấn "Chụp Ảnh" khi đã sẵn sàng
3. **Hoặc Upload**: Chọn ảnh từ thiết bị
4. **Phân tích**: Nhấn "Phân tích ảnh" để xem kết quả
5. **Xem kết quả**: Danh sách đối tượng với độ tin cậy

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **AI API**: Hugging Face Inference API
- **Model**: Facebook DETR ResNet-50
- **Camera**: getUserMedia API
- **Design**: CSS Grid/Flexbox, Gradient UI

## 📁 Cấu trúc Project

```
WebappCam/
├── index.html          # Giao diện chính
├── style.css           # CSS responsive
├── script.js           # Logic chính
├── config.js           # Cấu hình API
└── README.md           # Documentation
```

## 🌟 Features chi tiết

### Camera Integration
- ✅ getUserMedia API với error handling
- ✅ Mobile camera support (front/back)
- ✅ Video stream management
- ✅ Image capture với canvas

### AI Object Detection
- ✅ Hugging Face DETR ResNet-50 model
- ✅ Real-time inference
- ✅ Confidence scoring
- ✅ Multiple object detection

### User Experience
- ✅ Modern gradient UI design
- ✅ Loading states và progress indicators
- ✅ Comprehensive error messages
- ✅ Mobile-first responsive design
- ✅ Touch-friendly controls

### Error Handling
- ✅ Camera permission denied
- ✅ API rate limiting (503 errors)
- ✅ Network connectivity issues
- ✅ Invalid file formats
- ✅ Large file size limits

## 🔧 Customization

### Thay đổi Model AI
Sửa trong `config.js`:
```javascript
API_URL: 'https://api-inference.huggingface.co/models/YOUR_MODEL'
```

### Thêm ngôn ngữ mới
Cập nhật `VIETNAMESE_TRANSLATIONS` trong `config.js`

### Tùy chỉnh Camera
Sửa `VIDEO_CONSTRAINTS` trong `config.js`:
```javascript
CAMERA: {
    VIDEO_CONSTRAINTS: {
        video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user' // front camera
        }
    }
}
```

## 📄 License

MIT License - Sử dụng tự do cho mục đích học tập và thương mại.

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/Taddy-Lab2Lives/Webapp-Cam/issues)
- 📧 **Email**: taddytruong@gmail.com
- 🌐 **Website**: [Taddy Lab](https://taddy-lab.com)

---

⭐ **Star repo này nếu hữu ích!** ⭐