# 🔌 BÁO CÁO HIỆU QUẢ SỬ DỤNG NĂNG LƯỢNG - MÁY LẠNH

Báo cáo phân tích năng lượng toàn diện được xây dựng bằng React, TypeScript, Tailwind CSS và Recharts. Tích hợp với Benkon Energy API để tạo báo cáo chi tiết về hiệu quả sử dụng năng lượng máy lạnh.

## ✨ Tính năng chính

### 📋 **Báo cáo 4 phần chi tiết**
- **PHẦN 1**: Thông tin thiết bị & bố trí (Database)
- **PHẦN 2**: Phân tích công suất thiết kế (W/m²)
- **PHẦN 3**: Đường tiêu thụ năng lượng trong 1 ngày tiêu biểu
- **PHẦN 4**: Các vấn đề phát hiện bởi AI

### 📊 **Trực quan hóa dữ liệu**
- **Biểu đồ đường**: Tiêu thụ năng lượng theo giờ (00h-24h)
- **Biểu đồ tròn**: Phân bố tải nhiệt theo từng thành phần
- **Bảng thống kê**: Phân tích chi tiết công suất và hiệu quả
- **Cảnh báo AI**: Phát hiện vấn đề và đưa ra khuyến nghị

### 🎯 **Chỉ số quan trọng**
- Công suất lạnh trên diện tích (W/m²)
- Phân tích tải nhiệt (người, ánh sáng, thiết bị, vỏ công trình)
- Tiêu thụ điện theo khung giờ (hành chính, cao điểm, thấp điểm)
- Hệ số an toàn thiết kế
- Phát hiện bất thường trong vận hành

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm start
```

3. **Build for production:**
```bash
npm run build
```

The app will open at `http://localhost:3000`

## 📡 API Integration

### Default Configuration
- **Base URL**: `https://data-analytics-868579264401.us-central1.run.app`
- **Organization ID**: `7411698114757914624`
- **Location ID**: `7407763056947015680`
- **Date Range**: Last 7 days (automatically calculated)

### API Endpoints Used
- `GET /orgs/{orgID}/locations/{locID}` - Location details
- `GET /orgs/{orgID}/locations/{locID}/equips` - Equipment list
- `GET /orgs/{orgID}/locations/{locID}/data/hourlyEnergy` - Energy data
- `GET /orgs/{orgID}/locations/{locID}/equipsData/hourlyEnergy` - Equipment energy data

## 🎨 Component Architecture

```
src/
├── components/
│   ├── Dashboard.tsx (Main component)
│   ├── Cards/StatsCard.tsx
│   ├── Charts/
│   │   ├── EnergyLineChart.tsx
│   │   └── EquipmentPieChart.tsx
│   └── Tables/EquipmentTable.tsx
├── services/api.ts (API integration)
├── types/index.ts (TypeScript definitions)
└── utils/dataProcessing.ts (Data transformation)
```

## 🔍 Usage

1. Open the dashboard at `http://localhost:3000`
2. Enter Organization ID and Location ID  
3. Select date range (max 30 days)
4. Click "Analyze" to fetch and display data
5. Toggle "Show per m² values" for normalized metrics

## 🎯 Key Features

### Data Visualization
- **Interactive charts** with hover tooltips
- **Real-time statistics** calculation
- **Equipment distribution** analysis
- **Cost estimation** in VND

### Error Handling
- **Form validation** with clear messages
- **API error handling** with retry options
- **Loading states** for better UX
- **Date range validation** (max 30 days)

### Responsive Design
- **Mobile-first** approach
- **Tablet and desktop** optimized
- **Touch-friendly** interactions
- **Accessible** UI components

## 🛠️ Technical Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 3.1
- **HTTP Client**: Axios 1.10
- **Icons**: Lucide React
- **Build Tool**: Create React App

## 📱 Screenshots

The dashboard includes:
- Header with controls and location info
- Stats cards showing key metrics
- Line chart for hourly consumption patterns
- Pie chart for equipment energy distribution  
- Equipment table with detailed specifications

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
