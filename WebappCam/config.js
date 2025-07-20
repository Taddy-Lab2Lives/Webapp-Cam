// Cấu hình API và constants
const CONFIG = {
    // Hugging Face API
    HUGGINGFACE: {
        API_URL: 'https://api-inference.huggingface.co/models/facebook/detr-resnet-50',
        API_TOKEN: '', // Add your Hugging Face token here
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000, // 2 giây
        TIMEOUT: 30000 // 30 giây
    },

    // Camera settings
    CAMERA: {
        VIDEO_CONSTRAINTS: {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment' // Camera sau cho mobile
            },
            audio: false
        },
        CAPTURE_QUALITY: 0.8 // Chất lượng ảnh JPEG
    },

    // Confidence threshold
    DETECTION: {
        MIN_CONFIDENCE: 0.3, // Ngưỡng tin cậy tối thiểu
        MAX_RESULTS: 20 // Số kết quả tối đa hiển thị
    }
};

// Từ điển dịch tiếng Anh sang tiếng Việt
const VIETNAMESE_TRANSLATIONS = {
    // Người và động vật
    'person': 'Người',
    'bicycle': 'Xe đạp',
    'car': 'Ô tô',
    'motorcycle': 'Xe máy',
    'airplane': 'Máy bay',
    'bus': 'Xe buýt',
    'train': 'Tàu hỏa',
    'truck': 'Xe tải',
    'boat': 'Thuyền',
    'traffic light': 'Đèn giao thông',
    'fire hydrant': 'Vòi cứu hỏa',
    'stop sign': 'Biển báo dừng',
    'parking meter': 'Đồng hồ đỗ xe',
    'bench': 'Ghế băng',
    'bird': 'Chim',
    'cat': 'Mèo',
    'dog': 'Chó',
    'horse': 'Ngựa',
    'sheep': 'Cừu',
    'cow': 'Bò',
    'elephant': 'Voi',
    'bear': 'Gấu',
    'zebra': 'Ngựa vằn',
    'giraffe': 'Hươu cao cổ',

    // Đồ dùng và thức ăn
    'backpack': 'Ba lô',
    'umbrella': 'Ô',
    'handbag': 'Túi xách',
    'tie': 'Cà vạt',
    'suitcase': 'Vali',
    'frisbee': 'Đĩa bay',
    'skis': 'Ván trượt tuyết',
    'snowboard': 'Ván trượt tuyết',
    'sports ball': 'Bóng thể thao',
    'kite': 'Diều',
    'baseball bat': 'Gậy bóng chày',
    'baseball glove': 'Găng tay bóng chày',
    'skateboard': 'Ván trượt',
    'surfboard': 'Ván lướt sóng',
    'tennis racket': 'Vợt tennis',
    'bottle': 'Chai',
    'wine glass': 'Ly rượu',
    'cup': 'Cốc',
    'fork': 'Nĩa',
    'knife': 'Dao',
    'spoon': 'Thìa',
    'bowl': 'Bát',
    'banana': 'Chuối',
    'apple': 'Táo',
    'sandwich': 'Bánh sandwich',
    'orange': 'Cam',
    'broccoli': 'Bông cải xanh',
    'carrot': 'Cà rốt',
    'hot dog': 'Xúc xích',
    'pizza': 'Pizza',
    'donut': 'Bánh donut',
    'cake': 'Bánh ngọt',

    // Đồ nội thất
    'chair': 'Ghế',
    'couch': 'Ghế sofa',
    'potted plant': 'Cây cảnh',
    'bed': 'Giường',
    'dining table': 'Bàn ăn',
    'toilet': 'Toilet',
    'tv': 'Tivi',
    'laptop': 'Laptop',
    'mouse': 'Chuột máy tính',
    'remote': 'Điều khiển từ xa',
    'keyboard': 'Bàn phím',
    'cell phone': 'Điện thoại',
    'microwave': 'Lò vi sóng',
    'oven': 'Lò nướng',
    'toaster': 'Máy nướng bánh',
    'sink': 'Bồn rửa',
    'refrigerator': 'Tủ lạnh',
    'book': 'Sách',
    'clock': 'Đồng hồ',
    'vase': 'Bình hoa',
    'scissors': 'Kéo',
    'teddy bear': 'Gấu bông',
    'hair drier': 'Máy sấy tóc',
    'toothbrush': 'Bàn chải đánh răng'
};

// Thông báo lỗi tiếng Việt
const ERROR_MESSAGES = {
    CAMERA_NOT_SUPPORTED: 'Trình duyệt không hỗ trợ camera',
    CAMERA_PERMISSION_DENIED: 'Không có quyền truy cập camera. Vui lòng cho phép quyền truy cập camera trong cài đặt trình duyệt.',
    CAMERA_NOT_FOUND: 'Không tìm thấy camera trên thiết bị',
    CAMERA_IN_USE: 'Camera đang được sử dụng bởi ứng dụng khác',
    API_RATE_LIMIT: 'API đang quá tải. Vui lòng thử lại sau vài phút.',
    API_ERROR: 'Lỗi kết nối API. Vui lòng kiểm tra kết nối internet.',
    API_TIMEOUT: 'Kết nối API hết thời gian. Vui lòng thử lại.',
    NO_OBJECTS_DETECTED: 'Không phát hiện được đối tượng nào trong ảnh',
    INVALID_IMAGE: 'File không phải là ảnh hợp lệ',
    IMAGE_TOO_LARGE: 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.',
    NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
    UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
};

// Utility functions
const UTILS = {
    // Dịch tên đối tượng sang tiếng Việt
    translateObjectName: function(englishName) {
        return VIETNAMESE_TRANSLATIONS[englishName.toLowerCase()] || englishName;
    },

    // Format confidence score
    formatConfidence: function(confidence) {
        return Math.round(confidence * 100) + '%';
    },

    // Kiểm tra file ảnh hợp lệ
    isValidImageFile: function(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
            return { valid: false, error: ERROR_MESSAGES.INVALID_IMAGE };
        }
        
        if (file.size > maxSize) {
            return { valid: false, error: ERROR_MESSAGES.IMAGE_TOO_LARGE };
        }
        
        return { valid: true };
    },

    // Delay function cho retry
    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};