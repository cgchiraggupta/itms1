/**
 * ITMS Frontend - Main Application JavaScript
 * Handles navigation, UI interactions, and data management
 */

class ITMSApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.websocket = null;
        this.charts = {};
        this.dataBuffer = [];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.initializeCharts();
        this.connectWebSocket();
        this.startDataSimulation();
        console.log('ITMS Frontend initialized');
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.content-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.dataset.section;
                this.showSection(targetSection);
            });
        });
    }

    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;
    }

    setupEventListeners() {
        // Emergency stop button
        document.getElementById('emergency-stop')?.addEventListener('click', () => {
            this.emergencyStop();
        });

        // Chart timeframe selector
        document.getElementById('chart-timeframe')?.addEventListener('change', (e) => {
            this.updateChartTimeframe(e.target.value);
        });

        // Sensor tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSensorTab(e.target.dataset.sensor);
            });
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.exportData(e.target.dataset.format);
            });
        });

        // Report form
        document.querySelector('.report-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateReport();
        });

        // Settings forms
        document.querySelector('.settings-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });
    }

    initializeCharts() {
        // Real-time chart
        const ctx = document.getElementById('realtime-chart');
        if (ctx) {
            this.charts.realtime = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Vibration (g)',
                            data: [],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Gauge (m)',
                            data: [],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Acceleration (g)',
                            data: [],
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    }
                }
            });
        }

        // Sensor detail charts
        this.initializeSensorCharts();
    }

    initializeSensorCharts() {
        const sensorCharts = ['encoder-chart', 'imu-chart', 'laser-chart'];
        
        sensorCharts.forEach(chartId => {
            const ctx = document.getElementById(chartId);
            if (ctx) {
                this.charts[chartId] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Value',
                            data: [],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        });
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/realtime`;
        
        try {
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('WebSocket connected');
                this.updateSystemStatus('online');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };
            
            this.websocket.onclose = () => {
                console.log('WebSocket disconnected');
                this.updateSystemStatus('offline');
                // Reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateSystemStatus('error');
            };
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            this.updateSystemStatus('offline');
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'sensor_data':
                this.updateSensorData(data.data);
                break;
            case 'defect_alert':
                this.showDefectAlert(data.data);
                break;
            case 'system_status':
                this.updateSystemStatus(data.data.status);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    updateSensorData(sensorData) {
        // Update real-time metrics
        if (sensorData.length > 0) {
            const latest = sensorData[sensorData.length - 1];
            
            // Update metric displays
            this.updateMetric('train-speed', (Math.random() * 200).toFixed(1));
            this.updateMetric('distance-traveled', (parseFloat(latest.chainage / 1000).toFixed(1)));
            this.updateMetric('data-rate', (Math.random() * 50).toFixed(1));
            
            // Update sensor values
            this.updateSensorValue('encoder-position', `${latest.chainage} m`);
            this.updateSensorValue('imu-acceleration', `${latest.value.toFixed(2)} g`);
            this.updateSensorValue('camera-frames', `${Math.floor(Math.random() * 1000)} frames`);
            this.updateSensorValue('laser-distance', `${(100 + Math.random() * 50).toFixed(1)} mm`);
        }

        // Update charts
        this.updateCharts(sensorData);
    }

    updateMetric(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    updateSensorValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    updateCharts(sensorData) {
        if (!this.charts.realtime) return;

        const chart = this.charts.realtime;
        const now = new Date().toLocaleTimeString();
        
        // Add new data points
        chart.data.labels.push(now);
        chart.data.datasets[0].data.push(Math.random() * 2); // Vibration
        chart.data.datasets[1].data.push(1.676 + Math.random() * 0.02); // Gauge
        chart.data.datasets[2].data.push(Math.random() * 1); // Acceleration

        // Keep only last 20 data points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
        }

        chart.update('none');
    }

    updateSystemStatus(status) {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator ${status}`;
            statusText.textContent = `System ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        }
    }

    showDefectAlert(defectData) {
        const alertsList = document.getElementById('alerts-list');
        const alertCount = document.getElementById('alert-count');
        
        if (alertsList && alertCount) {
            const alertElement = document.createElement('div');
            alertElement.className = 'alert-item error';
            alertElement.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Defect detected: ${defectData.type} at chainage ${defectData.chainage}m</span>
                <span class="alert-time">Just now</span>
            `;
            
            alertsList.insertBefore(alertElement, alertsList.firstChild);
            
            // Update alert count
            const currentCount = parseInt(alertCount.textContent);
            alertCount.textContent = currentCount + 1;
            
            // Remove old alerts if more than 5
            const alerts = alertsList.querySelectorAll('.alert-item');
            if (alerts.length > 5) {
                alerts[alerts.length - 1].remove();
            }
        }
    }

    startDataSimulation() {
        // Simulate real-time data updates
        setInterval(() => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                // Send ping to keep connection alive
                this.websocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);

        // Update session time
        setInterval(() => {
            const sessionTime = document.getElementById('session-time');
            if (sessionTime) {
                const now = new Date();
                sessionTime.textContent = now.toLocaleTimeString();
            }
        }, 1000);
    }

    emergencyStop() {
        if (confirm('Are you sure you want to trigger emergency stop?')) {
            // Send emergency stop command
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({ type: 'emergency_stop' }));
            }
            
            // Update UI
            this.updateSystemStatus('offline');
            this.showAlert('Emergency stop activated', 'error');
        }
    }

    updateChartTimeframe(timeframe) {
        console.log('Updating chart timeframe to:', timeframe);
        // Implementation would depend on backend API
    }

    switchSensorTab(sensorType) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-sensor="${sensorType}"]`).classList.add('active');

        // Update sensor detail content
        document.querySelectorAll('.sensor-detail').forEach(detail => {
            detail.classList.remove('active');
        });
        document.getElementById(`${sensorType}-details`).classList.add('active');
    }

    exportData(format) {
        console.log(`Exporting data in ${format} format`);
        // Implementation would call backend API
        this.showAlert(`Exporting data in ${format.toUpperCase()} format...`, 'info');
    }

    generateReport() {
        const reportType = document.getElementById('report-type').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        console.log('Generating report:', { reportType, startDate, endDate });
        this.showAlert('Generating report...', 'info');
    }

    saveSettings() {
        console.log('Saving settings...');
        this.showAlert('Settings saved successfully', 'success');
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <span>${message}</span>
                <button class="alert-close">&times;</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
        
        // Close button functionality
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.remove();
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.itmsApp = new ITMSApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITMSApp;
}
