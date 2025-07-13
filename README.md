# Máy Tính Điện Tiêu Thụ

Ứng dụng web hoàn chỉnh để tính toán và quản lý điện năng tiêu thụ của các thiết bị điện.

## ✨ Tính Năng Chính

### 🔧 Quản Lý Thiết Bị
- ➕ Thêm thiết bị điện mới
- ✏️ Chỉnh sửa thông tin thiết bị
- 🗑️ Xóa thiết bị không cần thiết
- 📋 Hiển thị danh sách thiết bị trong bảng

### 🧮 Tính Toán Tiêu Thụ
- **Điện tiêu thụ ngày**: Công suất × Thời gian sử dụng / 1000 (kWh)
- **Điện tiêu thụ tuần**: Điện ngày × Số ngày sử dụng
- **Điện tiêu thụ tháng**: Điện tuần × 4.33

### 📊 Biểu Đồ Trực Quan
- **Bar Chart**: Tiêu thụ theo từng thiết bị
- **Pie Chart**: Phân bố tiêu thụ theo nhóm thiết bị
- **Line Chart**: Xu hướng tiêu thụ theo thời gian
- **Marking System**: Đường đỏ (+10% trung bình), đường xanh (-10% trung bình)

### 🎨 Giao Diện
- **Responsive Design**: Tương thích mọi thiết bị
- **Bootstrap UI**: Giao diện hiện đại, chuyên nghiệp
- **Dark/Light Theme**: Tùy chọn giao diện
- **Vietnamese Language**: Hoàn toàn tiếng Việt

### 💾 Lưu Trữ & Xuất Data
- **LocalStorage**: Lưu dữ liệu trên trình duyệt
- **CSV Export**: Xuất báo cáo Excel
- **Data Persistence**: Dữ liệu không bị mất khi refresh

## 🛠️ Công Nghệ Sử Dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và responsive design
- **JavaScript ES6**: Logic ứng dụng
- **Bootstrap 5**: UI framework
- **Chart.js**: Thư viện biểu đồ
- **LocalStorage**: Lưu trữ dữ liệu

## 🚀 Hướng Dẫn Sử Dụng

### 1. Mở Ứng Dụng
Mở file `index.html` trong trình duyệt web hoặc chạy với live server.

### 2. Thêm Thiết Bị
1. Click nút **"Thêm Thiết Bị"**
2. Điền thông tin:
   - Tên thiết bị
   - Nhóm thiết bị (Điều hòa, Đèn, Tủ lạnh, Máy tính, Khác)
   - Công suất (W)
   - Thời gian sử dụng/ngày (giờ)
   - Số ngày sử dụng/tuần
3. Click **"Lưu"**

### 3. Xem Báo Cáo
- **Summary Cards**: Tổng quan tiêu thụ ngày/tuần/tháng
- **Bảng chi tiết**: Danh sách thiết bị và tính toán
- **Biểu đồ**: Visualize dữ liệu theo nhiều cách

### 4. Chế Độ Xem
- **Theo Thiết Bị**: Hiển thị từng thiết bị riêng lẻ
- **Theo Nhóm**: Gom nhóm thiết bị cùng loại
- **Tổng Cửa Hàng**: Tổng quan toàn bộ

### 5. Xuất Dữ Liệu
Click **"Xuất CSV"** để tải file Excel với đầy đủ thông tin.

## 📁 Cấu Trúc File

```
electricity-calculator/
├── index.html          # Trang chính
├── style.css           # CSS tùy chỉnh
├── script.js           # JavaScript logic
├── package.json        # Package configuration
└── README.md           # Tài liệu hướng dẫn
```

## 🎯 Ví Dụ Sử Dụng

### Thêm Điều Hòa
- **Tên**: Điều hòa phòng khách
- **Nhóm**: Điều hòa
- **Công suất**: 1500W
- **Giờ/ngày**: 8 giờ
- **Ngày/tuần**: 7 ngày

**Kết quả tính toán:**
- Tiêu thụ ngày: 12 kWh
- Tiêu thụ tuần: 84 kWh
- Tiêu thụ tháng: 363.72 kWh

## 🔍 Marking System

Hệ thống marking giúp phát hiện thiết bị tiêu thụ điện bất thường:

- **Đường đỏ**: Thiết bị tiêu thụ cao (+10% so với trung bình)
- **Đường xanh**: Thiết bị tiêu thụ thấp (-10% so với trung bình)
- **Vùng bình thường**: Giữa hai đường marking

## 🌟 Tính Năng Nâng Cao

- **Auto-save**: Tự động lưu khi thay đổi
- **Form validation**: Kiểm tra dữ liệu đầu vào
- **Responsive charts**: Biểu đồ tự động điều chỉnh
- **Smooth animations**: Hiệu ứng mượt mà
- **Error handling**: Xử lý lỗi thân thiện

## 📱 Tương Thích

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 🔧 Development

### Chạy Local Server
```bash
npm install -g live-server
npm start
```

### Hoặc mở trực tiếp
Mở file `index.html` trong trình duyệt.

## 📄 License

MIT License - Sử dụng tự do cho mục đích cá nhân và thương mại.

## 🤝 Đóng Góp

Mọi đóng góp đều được hoan nghênh! Tạo Pull Request hoặc Issue để cải thiện ứng dụng.

---

**Phát triển bởi**: Electricity Calculator Team  
**Phiên bản**: 1.0.0  
**Cập nhật**: 2024