// Electricity Consumption Calculator
// Main application logic

// Global variables
let devices = [];
let charts = {
    bar: null,
    pie: null,
    line: null
};

// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDevicesFromStorage();
    // Initialize with default devices if no data exists
    if (devices.length === 0) {
        initializeDefaultDevices();
    }
    
    // Set default view mode to "category"
    document.getElementById('viewMode').value = 'category';
    
    updateDisplay();
    initializeCharts();
});

// Initialize default devices for Winmart store
function initializeDefaultDevices() {
    const defaultDevices = [
        // 3 Máy lạnh - hoạt động 16h (6h-22h)
        {
            id: 1,
            name: 'Máy lạnh khu vực bán hàng 1',
            category: 'Máy lạnh',
            power: 3500,
            hoursPerDay: 16,
            daysPerWeek: 7
        },
        {
            id: 2,
            name: 'Máy lạnh khu vực bán hàng 2',
            category: 'Máy lạnh',
            power: 3500,
            hoursPerDay: 16,
            daysPerWeek: 7
        },
        {
            id: 3,
            name: 'Máy lạnh khu vực thanh toán',
            category: 'Máy lạnh',
            power: 2500,
            hoursPerDay: 16,
            daysPerWeek: 7
        },
        // 2 Tủ open showcase công suất cao - chạy 24/7
        {
            id: 4,
            name: 'Tủ mát trưng bày đồ uống',
            category: 'Tủ mát',
            power: 1200,
            hoursPerDay: 24,
            daysPerWeek: 7
        },
        {
            id: 5,
            name: 'Tủ mát trưng bày thực phẩm tươi sống',
            category: 'Tủ mát',
            power: 1500,
            hoursPerDay: 24,
            daysPerWeek: 7
        },
        // 3 Tủ lạnh công suất nhỏ - chạy 24/7
        {
            id: 6,
            name: 'Tủ lạnh kem',
            category: 'Tủ lạnh',
            power: 300,
            hoursPerDay: 24,
            daysPerWeek: 7
        },
        {
            id: 7,
            name: 'Tủ lạnh thực phẩm đông lạnh',
            category: 'Tủ lạnh',
            power: 400,
            hoursPerDay: 24,
            daysPerWeek: 7
        },
        {
            id: 8,
            name: 'Tủ lạnh đồ uống',
            category: 'Tủ lạnh',
            power: 250,
            hoursPerDay: 24,
            daysPerWeek: 7
        },
        // Đèn biển hiệu - hoạt động 16h (6h-22h)
        {
            id: 9,
            name: 'Đèn biển hiệu Winmart',
            category: 'Đèn LED',
            power: 150,
            hoursPerDay: 16,
            daysPerWeek: 7
        },
        // Đèn indoor - hoạt động 16h (6h-22h)
        {
            id: 10,
            name: 'Hệ thống đèn LED khu vực bán hàng',
            category: 'Đèn LED',
            power: 800,
            hoursPerDay: 16,
            daysPerWeek: 7
        },
        {
            id: 11,
            name: 'Đèn LED khu vực thanh toán',
            category: 'Đèn LED',
            power: 200,
            hoursPerDay: 16,
            daysPerWeek: 7
        },
        {
            id: 12,
            name: 'Đèn LED kho hàng',
            category: 'Đèn LED',
            power: 300,
            hoursPerDay: 16,
            daysPerWeek: 7
        }
    ];
    
    // Calculate consumption for each device
    defaultDevices.forEach(device => {
        device.dailyConsumption = calculateDailyConsumption(device.power, device.hoursPerDay);
        device.weeklyConsumption = calculateWeeklyConsumption(device.dailyConsumption, device.daysPerWeek);
        device.monthlyConsumption = calculateMonthlyConsumption(device.weeklyConsumption);
    });
    
    devices = defaultDevices;
    saveDevicesToStorage();
}

// Device management functions
function saveDevice() {
    const form = document.getElementById('deviceForm');
    const editIndex = parseInt(document.getElementById('editIndex').value);
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const device = {
        id: editIndex >= 0 ? devices[editIndex].id : Date.now(),
        name: document.getElementById('deviceName').value,
        category: document.getElementById('deviceCategory').value,
        power: parseFloat(document.getElementById('devicePower').value),
        hoursPerDay: parseFloat(document.getElementById('hoursPerDay').value),
        daysPerWeek: parseInt(document.getElementById('daysPerWeek').value)
    };
    
    // Calculate consumption
    device.dailyConsumption = calculateDailyConsumption(device.power, device.hoursPerDay);
    device.weeklyConsumption = calculateWeeklyConsumption(device.dailyConsumption, device.daysPerWeek);
    device.monthlyConsumption = calculateMonthlyConsumption(device.weeklyConsumption);
    
    if (editIndex >= 0) {
        devices[editIndex] = device;
    } else {
        devices.push(device);
    }
    
    saveDevicesToStorage();
    updateDisplay();
    clearForm();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deviceModal'));
    modal.hide();
}

function editDevice(index) {
    const device = devices[index];
    
    document.getElementById('deviceName').value = device.name;
    document.getElementById('deviceCategory').value = device.category;
    document.getElementById('devicePower').value = device.power;
    document.getElementById('hoursPerDay').value = device.hoursPerDay;
    document.getElementById('daysPerWeek').value = device.daysPerWeek;
    document.getElementById('editIndex').value = index;
    
    document.getElementById('deviceModalLabel').textContent = 'Chỉnh Sửa Thiết Bị';
    
    const modal = new bootstrap.Modal(document.getElementById('deviceModal'));
    modal.show();
}

function deleteDevice(index) {
    if (confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
        devices.splice(index, 1);
        saveDevicesToStorage();
        updateDisplay();
    }
}

function clearForm() {
    document.getElementById('deviceForm').reset();
    document.getElementById('editIndex').value = '-1';
    document.getElementById('deviceModalLabel').textContent = 'Thêm Thiết Bị Mới';
}

// Calculation functions
function calculateDailyConsumption(power, hours) {
    return (power * hours) / 1000; // Convert to kWh
}

function calculateWeeklyConsumption(dailyConsumption, daysPerWeek) {
    return dailyConsumption * daysPerWeek;
}

function calculateMonthlyConsumption(weeklyConsumption) {
    return weeklyConsumption * 4.33; // Average weeks per month
}

// Display update functions
function updateDisplay() {
    updateSummaryCards();
    updateDeviceTable();
    updateCharts();
}

function updateSummaryCards() {
    const totals = calculateTotals();
    
    document.getElementById('dailyTotal').textContent = totals.daily.toFixed(2) + ' kWh';
    document.getElementById('weeklyTotal').textContent = totals.weekly.toFixed(2) + ' kWh';
    document.getElementById('monthlyTotal').textContent = totals.monthly.toFixed(2) + ' kWh';
    document.getElementById('deviceCount').textContent = devices.length;
}

function calculateTotals() {
    return devices.reduce((totals, device) => {
        totals.daily += device.dailyConsumption || 0;
        totals.weekly += device.weeklyConsumption || 0;
        totals.monthly += device.monthlyConsumption || 0;
        return totals;
    }, { daily: 0, weekly: 0, monthly: 0 });
}

function updateDeviceTable() {
    const tbody = document.getElementById('deviceTableBody');
    tbody.innerHTML = '';
    
    devices.forEach((device, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${device.name}</td>
            <td><span class="badge bg-secondary">${device.category}</span></td>
            <td>${device.power}W</td>
            <td>${device.hoursPerDay}h</td>
            <td>${device.daysPerWeek} ngày</td>
            <td class="fw-bold text-success">${device.dailyConsumption.toFixed(3)}</td>
            <td class="fw-bold text-warning">${device.weeklyConsumption.toFixed(3)}</td>
            <td class="fw-bold text-danger">${device.monthlyConsumption.toFixed(3)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editDevice(${index})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteDevice(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Chart functions
function initializeCharts() {
    initializeBarChart();
    initializePieChart();
    initializeLineChart();
}

function initializeBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    charts.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Tiêu thụ tháng (kWh)',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tiêu Thụ Điện Theo Thiết Bị'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kWh/tháng'
                    }
                }
            }
        }
    });
}

function initializePieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    charts.pie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Phân Bố Tiêu Thụ Theo Nhóm'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function initializeLineChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    charts.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h', '24h'],
            datasets: [{
                label: 'Đường phụ tải (kW)',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Đường Phụ Tải Cửa Hàng Winmart (24h)'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Giờ trong ngày'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Công suất (kW)'
                    }
                }
            }
        }
    });
}

function updateCharts() {
    updateBarChart();
    updatePieChart();
    updateLineChart();
}

function updateBarChart() {
    if (!charts.bar) return;
    
    const viewMode = document.getElementById('viewMode').value;
    let labels = [];
    let data = [];
    
    if (viewMode === 'device') {
        labels = devices.map(device => device.name);
        data = devices.map(device => device.monthlyConsumption);
    } else if (viewMode === 'category') {
        const categoryTotals = calculateCategoryTotals();
        labels = Object.keys(categoryTotals);
        data = Object.values(categoryTotals);
    } else { // total
        labels = ['Tổng tiêu thụ'];
        data = [calculateTotals().monthly];
    }
    
    // Add marking lines
    const average = data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 0;
    const highMark = average * 1.1;
    const lowMark = average * 0.9;
    
    charts.bar.data.labels = labels;
    charts.bar.data.datasets[0].data = data;
    
    // Add marking lines as annotations
    charts.bar.options.plugins.annotation = {
        annotations: {
            highLine: {
                type: 'line',
                yMin: highMark,
                yMax: highMark,
                borderColor: 'red',
                borderWidth: 2,
                label: {
                    content: 'Cao (+10%)',
                    enabled: true,
                    position: 'end'
                }
            },
            lowLine: {
                type: 'line',
                yMin: lowMark,
                yMax: lowMark,
                borderColor: 'green',
                borderWidth: 2,
                label: {
                    content: 'Thấp (-10%)',
                    enabled: true,
                    position: 'end'
                }
            }
        }
    };
    
    charts.bar.update();
}

function updatePieChart() {
    if (!charts.pie) return;
    
    const categoryTotals = calculateCategoryTotals();
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    charts.pie.data.labels = labels;
    charts.pie.data.datasets[0].data = data;
    charts.pie.update();
}

function updateLineChart() {
    if (!charts.line) return;
    
    // Calculate 24h load curve for Winmart store
    const loadCurve = calculateDailyLoadCurve();
    
    charts.line.data.datasets[0].data = loadCurve;
    charts.line.update();
}

function calculateDailyLoadCurve() {
    // Define hourly load based on store operations
    const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];
    const loadData = [];
    
    hours.forEach(hour => {
        let totalLoad = 0;
        
        devices.forEach(device => {
            const powerKW = device.power / 1000; // Convert to kW
            
            // 24/7 devices (refrigeration)
            if (device.category === 'Tủ lạnh' || device.category === 'Tủ mát') {
                totalLoad += powerKW;
            }
            // Store operation hours (6h-22h) for AC and lighting
            else if (hour >= 6 && hour <= 22) {
                totalLoad += powerKW;
            }
        });
        
        loadData.push(Math.round(totalLoad * 100) / 100); // Round to 2 decimal places
    });
    
    return loadData;
}

function calculateCategoryTotals() {
    const categoryTotals = {};
    
    devices.forEach(device => {
        if (!categoryTotals[device.category]) {
            categoryTotals[device.category] = 0;
        }
        categoryTotals[device.category] += device.monthlyConsumption;
    });
    
    return categoryTotals;
}

// View mode functions
function updateView() {
    updateCharts();
}

// Storage functions
function saveDevicesToStorage() {
    localStorage.setItem('electricityDevices', JSON.stringify(devices));
}

function loadDevicesFromStorage() {
    const storedDevices = localStorage.getItem('electricityDevices');
    if (storedDevices) {
        devices = JSON.parse(storedDevices);
    }
}

// Export functions
function exportCSV() {
    if (devices.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    const headers = [
        'Tên Thiết Bị',
        'Nhóm',
        'Công Suất (W)',
        'Giờ/Ngày',
        'Ngày/Tuần',
        'kWh/Ngày',
        'kWh/Tuần',
        'kWh/Tháng'
    ];
    
    const csvContent = [
        headers.join(','),
        ...devices.map(device => [
            `"${device.name}"`,
            `"${device.category}"`,
            device.power,
            device.hoursPerDay,
            device.daysPerWeek,
            device.dailyConsumption.toFixed(3),
            device.weeklyConsumption.toFixed(3),
            device.monthlyConsumption.toFixed(3)
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dien_tieu_thu_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Modal event handlers
document.getElementById('deviceModal').addEventListener('hidden.bs.modal', function() {
    clearForm();
});

// Reset to default devices
function resetToDefault() {
    if (confirm('Bạn có chắc chắn muốn reset về dữ liệu mặc định của cửa hàng Winmart?')) {
        devices = [];
        localStorage.removeItem('electricityDevices');
        initializeDefaultDevices();
        
        // Set view mode back to category
        document.getElementById('viewMode').value = 'category';
        
        updateDisplay();
        alert('Đã reset về dữ liệu mặc định thành công!');
    }
}

// Form validation
document.getElementById('deviceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveDevice();
});