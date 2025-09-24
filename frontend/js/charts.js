/**
 * ITMS Frontend - Charts and Visualization
 * Handles chart initialization, updates, and data visualization
 */

class ITMSCharts {
    constructor() {
        this.charts = {};
        this.chartConfigs = {};
        this.init();
    }

    init() {
        this.setupChartConfigs();
        this.initializeAllCharts();
        console.log('ITMS Charts initialized');
    }

    setupChartConfigs() {
        // Common chart options
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };

        // Real-time chart configuration
        this.chartConfigs.realtime = {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Vibration (g)',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    },
                    {
                        label: 'Gauge (m)',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    },
                    {
                        label: 'Acceleration (g)',
                        data: [],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 4
                    }
                ]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        beginAtZero: true,
                        max: 3
                    }
                },
                animation: {
                    duration: 0
                }
            }
        };

        // Encoder chart configuration
        this.chartConfigs.encoder = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Position (pulses)',
                    data: [],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        beginAtZero: true
                    }
                }
            }
        };

        // IMU chart configuration
        this.chartConfigs.imu = {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Accel X (g)',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Accel Y (g)',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Accel Z (g)',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        min: -2,
                        max: 2
                    }
                }
            }
        };

        // Laser chart configuration
        this.chartConfigs.laser = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Distance (mm)',
                    data: [],
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        beginAtZero: true
                    }
                }
            }
        };

        // Analytics chart configuration
        this.chartConfigs.analytics = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Track Quality Score',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        min: 0,
                        max: 100
                    }
                }
            }
        };
    }

    initializeAllCharts() {
        // Initialize real-time chart
        this.initializeChart('realtime-chart', 'realtime');
        
        // Initialize sensor detail charts
        this.initializeChart('encoder-chart', 'encoder');
        this.initializeChart('imu-chart', 'imu');
        this.initializeChart('laser-chart', 'laser');
        
        // Initialize analytics chart
        this.initializeChart('analytics-chart', 'analytics');
    }

    initializeChart(canvasId, configKey) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const config = this.chartConfigs[configKey];
        if (!config) return;

        this.charts[canvasId] = new Chart(canvas, config);
    }

    updateRealtimeChart(data) {
        const chart = this.charts['realtime-chart'];
        if (!chart) return;

        const now = new Date().toLocaleTimeString();
        
        // Add new data points
        chart.data.labels.push(now);
        chart.data.datasets[0].data.push(data.vibration || Math.random() * 2);
        chart.data.datasets[1].data.push(data.gauge || 1.676 + Math.random() * 0.02);
        chart.data.datasets[2].data.push(data.acceleration || Math.random() * 1);

        // Keep only last 20 data points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
        }

        chart.update('none');
    }

    updateEncoderChart(data) {
        const chart = this.charts['encoder-chart'];
        if (!chart) return;

        const now = new Date().toLocaleTimeString();
        
        chart.data.labels.push(now);
        chart.data.datasets[0].data.push(data.position || Math.random() * 1000);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none');
    }

    updateIMUChart(data) {
        const chart = this.charts['imu-chart'];
        if (!chart) return;

        const now = new Date().toLocaleTimeString();
        
        chart.data.labels.push(now);
        chart.data.datasets[0].data.push(data.accelX || (Math.random() - 0.5) * 2);
        chart.data.datasets[1].data.push(data.accelY || (Math.random() - 0.5) * 2);
        chart.data.datasets[2].data.push(data.accelZ || (Math.random() - 0.5) * 2);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
        }

        chart.update('none');
    }

    updateLaserChart(data) {
        const chart = this.charts['laser-chart'];
        if (!chart) return;

        const now = new Date().toLocaleTimeString();
        
        chart.data.labels.push(now);
        chart.data.datasets[0].data.push(data.distance || 100 + Math.random() * 50);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none');
    }

    updateAnalyticsChart(data) {
        const chart = this.charts['analytics-chart'];
        if (!chart) return;

        // Update with historical data
        chart.data.labels = data.labels || [];
        chart.data.datasets[0].data = data.values || [];

        chart.update();
    }

    createHeatmapChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Create heatmap visualization
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw heatmap
        const cellWidth = width / data.length;
        const cellHeight = height / data[0].length;

        data.forEach((row, x) => {
            row.forEach((value, y) => {
                const intensity = Math.min(value / 10, 1); // Normalize to 0-1
                const color = this.getHeatmapColor(intensity);
                
                ctx.fillStyle = color;
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            });
        });
    }

    getHeatmapColor(intensity) {
        // Convert intensity (0-1) to color
        const r = Math.floor(255 * intensity);
        const g = Math.floor(255 * (1 - intensity));
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
    }

    createGaugeChart(canvasId, value, max = 100, label = 'Value') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 20;
        ctx.stroke();

        // Draw value arc
        const angle = (value / max) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
        ctx.strokeStyle = value > max * 0.8 ? '#ef4444' : value > max * 0.6 ? '#f59e0b' : '#10b981';
        ctx.lineWidth = 20;
        ctx.stroke();

        // Draw value text
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(1), centerX, centerY + 8);

        // Draw label
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.fillText(label, centerX, centerY + 35);
    }

    destroyChart(canvasId) {
        const chart = this.charts[canvasId];
        if (chart) {
            chart.destroy();
            delete this.charts[canvasId];
        }
    }

    destroyAllCharts() {
        Object.keys(this.charts).forEach(canvasId => {
            this.destroyChart(canvasId);
        });
    }

    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.resize();
        });
    }

    exportChart(canvasId, filename = 'chart.png') {
        const chart = this.charts[canvasId];
        if (!chart) return;

        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
    }
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.itmsCharts = new ITMSCharts();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.itmsCharts) {
        window.itmsCharts.resizeCharts();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITMSCharts;
}
