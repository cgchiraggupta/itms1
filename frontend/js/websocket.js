/**
 * ITMS Frontend - WebSocket Communication
 * Handles real-time data streaming and communication with backend
 */

class ITMSWebSocket {
    constructor() {
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
        this.heartbeatInterval = 30000;
        this.heartbeatTimer = null;
        this.messageHandlers = new Map();
        this.connectionStatus = 'disconnected';
        this.init();
    }

    init() {
        this.setupMessageHandlers();
        this.connect();
        console.log('ITMS WebSocket initialized');
    }

    setupMessageHandlers() {
        // Register default message handlers
        this.registerHandler('sensor_data', this.handleSensorData.bind(this));
        this.registerHandler('defect_alert', this.handleDefectAlert.bind(this));
        this.registerHandler('system_status', this.handleSystemStatus.bind(this));
        this.registerHandler('batch_measurements', this.handleBatchMeasurements.bind(this));
        this.registerHandler('ping', this.handlePing.bind(this));
        this.registerHandler('pong', this.handlePong.bind(this));
        this.registerHandler('connection_established', this.handleConnectionEstablished.bind(this));
        this.registerHandler('error', this.handleError.bind(this));
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/realtime`;
        
        try {
            this.websocket = new WebSocket(wsUrl);
            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }

    setupEventHandlers() {
        this.websocket.onopen = () => {
            console.log('WebSocket connected');
            this.connectionStatus = 'connected';
            this.reconnectAttempts = 0;
            this.updateConnectionStatus();
            this.startHeartbeat();
            this.sendSubscriptionRequest();
        };

        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        this.websocket.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.connectionStatus = 'disconnected';
            this.updateConnectionStatus();
            this.stopHeartbeat();
            
            if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.scheduleReconnect();
            }
        };

        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.connectionStatus = 'error';
            this.updateConnectionStatus();
        };
    }

    handleMessage(data) {
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
            handler(data);
        } else {
            console.log('Unhandled message type:', data.type, data);
        }
    }

    registerHandler(messageType, handler) {
        this.messageHandlers.set(messageType, handler);
    }

    unregisterHandler(messageType) {
        this.messageHandlers.delete(messageType);
    }

    send(data) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(data));
            return true;
        } else {
            console.warn('WebSocket not connected, cannot send message');
            return false;
        }
    }

    sendSubscriptionRequest() {
        this.send({
            type: 'subscribe',
            subscriptions: [
                'sensor_data',
                'defect_alert',
                'system_status',
                'batch_measurements'
            ]
        });
    }

    sendUnsubscriptionRequest(subscriptions) {
        this.send({
            type: 'unsubscribe',
            subscriptions: subscriptions
        });
    }

    // Message Handlers
    handleSensorData(data) {
        console.log('Received sensor data:', data);
        
        // Update UI with sensor data
        if (window.itmsApp && window.itmsApp.updateSensorData) {
            window.itmsApp.updateSensorData(data.data);
        }
        
        // Update charts
        if (window.itmsCharts && window.itmsCharts.updateRealtimeChart) {
            window.itmsCharts.updateRealtimeChart(data.data[0] || {});
        }
    }

    handleDefectAlert(data) {
        console.log('Received defect alert:', data);
        
        // Show alert in UI
        if (window.itmsApp && window.itmsApp.showDefectAlert) {
            window.itmsApp.showDefectAlert(data.data);
        }
        
        // Show notification
        this.showNotification(`Defect Alert: ${data.data.type} at chainage ${data.data.chainage}m`, 'error');
    }

    handleSystemStatus(data) {
        console.log('Received system status:', data);
        
        // Update system status in UI
        if (window.itmsApp && window.itmsApp.updateSystemStatus) {
            window.itmsApp.updateSystemStatus(data.data.status);
        }
    }

    handleBatchMeasurements(data) {
        console.log('Received batch measurements:', data);
        
        // Process batch data
        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(measurement => {
                // Update individual measurements
                this.updateMeasurementDisplay(measurement);
            });
        }
    }

    handlePing(data) {
        // Respond to ping
        this.send({
            type: 'pong',
            timestamp: Date.now()
        });
    }

    handlePong(data) {
        console.log('Received pong from server');
    }

    handleConnectionEstablished(data) {
        console.log('Connection established:', data);
        this.showNotification('Connected to real-time data stream', 'success');
    }

    handleError(data) {
        console.error('Server error:', data.message);
        this.showNotification(`Server Error: ${data.message}`, 'error');
    }

    // Utility Methods
    updateMeasurementDisplay(measurement) {
        // Update specific measurement displays based on type
        switch (measurement.type) {
            case 'gauge':
                this.updateElement('gauge-value', `${measurement.value.toFixed(3)} m`);
                break;
            case 'acceleration':
                this.updateElement('acceleration-value', `${measurement.value.toFixed(2)} g`);
                break;
            case 'alignment':
                this.updateElement('alignment-value', `${measurement.value.toFixed(1)} mm`);
                break;
        }
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    updateConnectionStatus() {
        const statusElement = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (statusElement && statusText) {
            statusElement.className = `status-indicator ${this.connectionStatus}`;
            statusText.textContent = `System ${this.connectionStatus.charAt(0).toUpperCase() + this.connectionStatus.slice(1)}`;
        }
    }

    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.send({
                type: 'ping',
                timestamp: Date.now()
            });
        }, this.heartbeatInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        setTimeout(() => {
            if (this.connectionStatus === 'disconnected') {
                this.connect();
            }
        }, this.reconnectInterval);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    disconnect() {
        this.stopHeartbeat();
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.connectionStatus = 'disconnected';
        this.updateConnectionStatus();
    }

    getConnectionStatus() {
        return this.connectionStatus;
    }

    isConnected() {
        return this.websocket && this.websocket.readyState === WebSocket.OPEN;
    }

    // Emergency stop functionality
    sendEmergencyStop() {
        return this.send({
            type: 'emergency_stop',
            timestamp: Date.now()
        });
    }

    // Request specific data
    requestData(type, parameters = {}) {
        return this.send({
            type: 'request_data',
            data_type: type,
            parameters: parameters,
            timestamp: Date.now()
        });
    }
}

// Initialize WebSocket when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.itmsWebSocket = new ITMSWebSocket();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.itmsWebSocket) {
        window.itmsWebSocket.disconnect();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITMSWebSocket;
}
