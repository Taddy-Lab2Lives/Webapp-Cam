// Camera Object Analyzer - Main JavaScript
class CameraObjectAnalyzer {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.stream = null;
        this.isAnalyzing = false;
        
        this.init();
    }

    // Khởi tạo ứng dụng
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.checkCameraSupport();
    }

    // Thiết lập các elements DOM
    setupElements() {
        this.video = document.getElementById('camera-video');
        this.canvas = document.getElementById('capture-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.startCameraBtn = document.getElementById('start-camera-btn');
        this.stopCameraBtn = document.getElementById('stop-camera-btn');
        this.captureBtn = document.getElementById('capture-btn');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.retryBtn = document.getElementById('retry-btn');
        
        this.fileInput = document.getElementById('file-input');
        this.cameraPlaceholder = document.getElementById('camera-placeholder');
        this.capturedImageContainer = document.getElementById('captured-image-container');
        this.capturedImage = document.getElementById('captured-image');
        
        this.loadingElement = document.getElementById('loading');
        this.resultsContainer = document.getElementById('results-container');
        this.errorContainer = document.getElementById('error-container');
        this.errorMessage = document.getElementById('error-message');
        this.summary = document.getElementById('summary');
        this.objectsList = document.getElementById('objects-list');
        
        // Token input elements
        this.tokenInput = document.getElementById('api-token-input');
        this.toggleTokenBtn = document.getElementById('toggle-token-btn');
    }

    // Thiết lập event listeners
    setupEventListeners() {
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.stopCameraBtn.addEventListener('click', () => this.stopCamera());
        this.captureBtn.addEventListener('click', () => this.captureImage());
        this.analyzeBtn.addEventListener('click', () => this.analyzeCurrentImage());
        this.retryBtn.addEventListener('click', () => this.retryAnalysis());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Token input events
        this.toggleTokenBtn.addEventListener('click', () => this.toggleTokenVisibility());
        this.tokenInput.addEventListener('input', () => this.saveTokenToStorage());
        
        // Load saved token on init
        this.loadTokenFromStorage();
    }

    // Kiểm tra hỗ trợ camera
    checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError(ERROR_MESSAGES.CAMERA_NOT_SUPPORTED);
            this.startCameraBtn.disabled = true;
        }
    }

    // Bắt đầu camera
    async startCamera() {
        try {
            this.showLoading('Đang khởi động camera...');
            
            this.stream = await navigator.mediaDevices.getUserMedia(CONFIG.CAMERA.VIDEO_CONSTRAINTS);
            this.video.srcObject = this.stream;
            
            this.video.onloadedmetadata = () => {
                this.video.play();
                this.cameraPlaceholder.style.display = 'none';
                this.video.style.display = 'block';
                
                this.startCameraBtn.disabled = true;
                this.stopCameraBtn.disabled = false;
                this.captureBtn.disabled = false;
                
                this.hideError();
                this.hideLoading();
            };
            
        } catch (error) {
            this.handleCameraError(error);
        }
    }

    // Dừng camera
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.style.display = 'none';
        this.cameraPlaceholder.style.display = 'flex';
        
        this.startCameraBtn.disabled = false;
        this.stopCameraBtn.disabled = true;
        this.captureBtn.disabled = true;
        
        this.hideResults();
        this.hideCapturedImage();
    }

    // Chụp ảnh từ camera
    captureImage() {
        if (!this.video.videoWidth || !this.video.videoHeight) {
            this.showError('Camera chưa sẵn sàng. Vui lòng thử lại.');
            return;
        }

        // Thiết lập kích thước canvas
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // Vẽ frame hiện tại lên canvas
        this.ctx.drawImage(this.video, 0, 0);
        
        // Chuyển đổi thành image data
        const imageDataUrl = this.canvas.toDataURL('image/jpeg', CONFIG.CAMERA.CAPTURE_QUALITY);
        
        // Hiển thị ảnh đã chụp
        this.showCapturedImage(imageDataUrl);
    }

    // Xử lý upload file
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Kiểm tra file hợp lệ
        const validation = UTILS.isValidImageFile(file);
        if (!validation.valid) {
            this.showError(validation.error);
            return;
        }

        // Đọc file và hiển thị
        const reader = new FileReader();
        reader.onload = (e) => {
            this.showCapturedImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Hiển thị ảnh đã chụp/upload
    showCapturedImage(imageDataUrl) {
        this.capturedImage.src = imageDataUrl;
        this.capturedImageContainer.style.display = 'block';
        this.hideResults();
        this.hideError();
        
        // Scroll to image
        this.capturedImageContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Ẩn ảnh đã chụp
    hideCapturedImage() {
        this.capturedImageContainer.style.display = 'none';
    }

    // Phân tích ảnh hiện tại
    async analyzeCurrentImage() {
        if (!this.capturedImage.src) {
            this.showError('Không có ảnh để phân tích');
            return;
        }

        await this.analyzeImage(this.capturedImage.src);
    }

    // Phân tích ảnh với AI
    async analyzeImage(imageDataUrl) {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.showLoading('Đang phân tích ảnh với AI...');
        this.hideResults();
        this.hideError();

        try {
            // Chuyển đổi data URL thành blob
            const blob = await this.dataURLToBlob(imageDataUrl);
            
            // Gọi API với retry logic
            const results = await this.callHuggingFaceAPI(blob);
            
            // Xử lý và hiển thị kết quả
            this.displayResults(results);
            
        } catch (error) {
            this.handleAPIError(error);
        } finally {
            this.isAnalyzing = false;
            this.hideLoading();
        }
    }

    // Gọi Hugging Face API với retry logic
    async callHuggingFaceAPI(imageBlob, attempt = 1) {
        // Lấy token từ input hoặc config
        const apiToken = this.tokenInput.value.trim() || CONFIG.HUGGINGFACE.API_TOKEN;
        
        if (!apiToken) {
            throw new Error('Vui lòng nhập Hugging Face API token để sử dụng tính năng này.');
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.HUGGINGFACE.TIMEOUT);
            
            const response = await fetch(CONFIG.HUGGINGFACE.API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`
                },
                body: imageBlob,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                if (response.status === 503 && attempt < CONFIG.HUGGINGFACE.RETRY_ATTEMPTS) {
                    // API đang loading model, thử lại
                    await UTILS.delay(CONFIG.HUGGINGFACE.RETRY_DELAY * attempt);
                    return this.callHuggingFaceAPI(imageBlob, attempt + 1);
                }
                
                if (response.status === 429) {
                    throw new Error(ERROR_MESSAGES.API_RATE_LIMIT);
                }
                
                throw new Error(ERROR_MESSAGES.API_ERROR);
            }
            
            const results = await response.json();
            return results;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(ERROR_MESSAGES.API_TIMEOUT);
            }
            
            if (attempt < CONFIG.HUGGINGFACE.RETRY_ATTEMPTS) {
                await UTILS.delay(CONFIG.HUGGINGFACE.RETRY_DELAY * attempt);
                return this.callHuggingFaceAPI(imageBlob, attempt + 1);
            }
            
            throw error;
        }
    }

    // Hiển thị kết quả phân tích
    displayResults(results) {
        if (!results || !Array.isArray(results) || results.length === 0) {
            this.showError(ERROR_MESSAGES.NO_OBJECTS_DETECTED);
            return;
        }

        // Lọc kết quả theo ngưỡng tin cậy
        const filteredResults = results
            .filter(item => item.score >= CONFIG.DETECTION.MIN_CONFIDENCE)
            .slice(0, CONFIG.DETECTION.MAX_RESULTS)
            .sort((a, b) => b.score - a.score);

        if (filteredResults.length === 0) {
            this.showError(ERROR_MESSAGES.NO_OBJECTS_DETECTED);
            return;
        }

        // Hiển thị tóm tắt
        this.summary.innerHTML = `
            <strong>🎯 Phát hiện ${filteredResults.length} đối tượng</strong>
        `;

        // Hiển thị danh sách objects
        this.objectsList.innerHTML = filteredResults.map(item => `
            <div class="object-item">
                <span class="object-name">
                    ${UTILS.translateObjectName(item.label)}
                </span>
                <span class="object-confidence">
                    ${UTILS.formatConfidence(item.score)}
                </span>
            </div>
        `).join('');

        this.resultsContainer.style.display = 'block';
        
        // Scroll to results
        this.resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Chuyển đổi data URL thành blob
    async dataURLToBlob(dataURL) {
        const response = await fetch(dataURL);
        return response.blob();
    }

    // Xử lý lỗi camera
    handleCameraError(error) {
        console.error('Camera error:', error);
        
        let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
        
        switch (error.name) {
            case 'NotAllowedError':
                errorMessage = ERROR_MESSAGES.CAMERA_PERMISSION_DENIED;
                break;
            case 'NotFoundError':
                errorMessage = ERROR_MESSAGES.CAMERA_NOT_FOUND;
                break;
            case 'NotReadableError':
                errorMessage = ERROR_MESSAGES.CAMERA_IN_USE;
                break;
            case 'OverconstrainedError':
                errorMessage = ERROR_MESSAGES.CAMERA_NOT_SUPPORTED;
                break;
        }
        
        this.showError(errorMessage);
        this.hideLoading();
    }

    // Xử lý lỗi API
    handleAPIError(error) {
        console.error('API error:', error);
        
        let errorMessage = error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
        }
        
        this.showError(errorMessage);
    }

    // Hiển thị loading
    showLoading(message = 'Đang xử lý...') {
        this.loadingElement.querySelector('p').textContent = message;
        this.loadingElement.style.display = 'block';
    }

    // Ẩn loading
    hideLoading() {
        this.loadingElement.style.display = 'none';
    }

    // Hiển thị lỗi
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorContainer.style.display = 'block';
        this.hideResults();
        this.hideLoading();
    }

    // Ẩn lỗi
    hideError() {
        this.errorContainer.style.display = 'none';
    }

    // Hiển thị kết quả
    showResults() {
        this.resultsContainer.style.display = 'block';
    }

    // Ẩn kết quả
    hideResults() {
        this.resultsContainer.style.display = 'none';
    }

    // Thử lại phân tích
    retryAnalysis() {
        if (this.capturedImage.src) {
            this.analyzeCurrentImage();
        } else {
            this.hideError();
        }
    }

    // Toggle token visibility
    toggleTokenVisibility() {
        const isPassword = this.tokenInput.type === 'password';
        this.tokenInput.type = isPassword ? 'text' : 'password';
        this.toggleTokenBtn.textContent = isPassword ? '🙈' : '👁️';
    }

    // Save token to localStorage
    saveTokenToStorage() {
        const token = this.tokenInput.value.trim();
        if (token) {
            localStorage.setItem('hf_api_token', token);
        } else {
            localStorage.removeItem('hf_api_token');
        }
    }

    // Load token from localStorage
    loadTokenFromStorage() {
        const savedToken = localStorage.getItem('hf_api_token');
        if (savedToken) {
            this.tokenInput.value = savedToken;
        }
    }
}

// Khởi tạo ứng dụng khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    new CameraObjectAnalyzer();
});

// Service Worker registration (optional - for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}