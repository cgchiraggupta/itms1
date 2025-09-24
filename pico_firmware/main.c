/*
 * Integrated Track Monitoring System - Pico Firmware
 * 
 * This firmware handles:
 * - Quadrature encoder reading with high-speed interrupt handling
 * - IMU data acquisition via I2C
 * - Camera trigger synchronization with encoder
 * - Data transmission to Pi4/Jetson via UART
 * - Real-time timestamping and data logging
 * 
 * Author: DAQ System Design
 * Version: 1.0
 * Date: 2024
 */

#include "pico/stdlib.h"
#include "pico/time.h"
#include "hardware/i2c.h"
#include "hardware/uart.h"
#include "hardware/gpio.h"
#include "hardware/irq.h"
#include "hardware/pwm.h"
#include "hardware/timer.h"
#include "pico/multicore.h"
#include "pico/sync.h"
#include <stdio.h>
#include <string.h>
#include <math.h>

// Pin Definitions
#define ENCODER_A_PIN          16
#define ENCODER_B_PIN          17
#define ENCODER_INDEX_PIN      18
#define IMU_SDA_PIN            20
#define IMU_SCL_PIN            21
#define CAMERA_TRIGGER_PIN     22
#define STATUS_LED_PIN         2
#define ERROR_LED_PIN          3
#define UART_TX_PIN            0
#define UART_RX_PIN            1

// IMU Configuration (MPU-9250)
#define IMU_I2C_ADDR           0x68
#define IMU_WHO_AM_I           0x75
#define IMU_PWR_MGMT_1         0x6B
#define IMU_ACCEL_XOUT_H       0x3B
#define IMU_GYRO_XOUT_H        0x43
#define IMU_SMPLRT_DIV         0x19
#define IMU_CONFIG             0x1A
#define IMU_GYRO_CONFIG        0x1B
#define IMU_ACCEL_CONFIG       0x1C

// System Configuration
#define UART_BAUD_RATE         115200
#define I2C_BAUD_RATE          400000
#define IMU_SAMPLE_RATE_HZ     1000
#define ENCODER_TRIGGER_INTERVAL 100  // Trigger camera every 100 encoder pulses
#define DATA_BUFFER_SIZE       1024
#define MAX_STRING_LENGTH      256

// Data Structures
typedef struct {
    uint64_t timestamp_us;
    int32_t encoder_position;
    int32_t encoder_velocity;
    float accel_x, accel_y, accel_z;
    float gyro_x, gyro_y, gyro_z;
    uint32_t camera_trigger_count;
    uint8_t system_status;
} sensor_data_t;

typedef struct {
    volatile int32_t position;
    volatile int32_t velocity;
    volatile uint32_t pulse_count;
    volatile uint64_t last_pulse_time;
    volatile bool index_detected;
} encoder_state_t;

// Global Variables
static encoder_state_t encoder_state = {0};
static sensor_data_t current_data = {0};
static char data_buffer[DATA_BUFFER_SIZE];
static mutex_t data_mutex;
static mutex_t uart_mutex;
static bool system_initialized = false;
static uint32_t camera_trigger_count = 0;
static uint64_t system_start_time = 0;

// Function Prototypes
void system_init(void);
void encoder_init(void);
void imu_init(void);
void uart_init_system(void);
void gpio_init_system(void);
void encoder_irq_handler(uint gpio, uint32_t events);
void imu_read_data(sensor_data_t* data);
void camera_trigger(void);
void send_data_uart(const sensor_data_t* data);
void update_encoder_velocity(void);
uint64_t get_timestamp_us(void);
void status_led_toggle(void);
void error_led_on(void);
void error_led_off(void);
bool imu_self_test(void);
void system_health_check(void);

/*
 * System Initialization
 */
void system_init(void) {
    // Initialize mutexes
    mutex_init(&data_mutex);
    mutex_init(&uart_mutex);
    
    // Initialize GPIO
    gpio_init_system();
    
    // Initialize UART
    uart_init_system();
    
    // Initialize I2C for IMU
    imu_init();
    
    // Initialize encoder
    encoder_init();
    
    // Get system start time
    system_start_time = get_timestamp_us();
    
    // Perform system health check
    system_health_check();
    
    system_initialized = true;
    
    // Send startup message
    const char* startup_msg = "DAQ System Initialized\n";
    mutex_enter_blocking(&uart_mutex);
    uart_puts(uart0, startup_msg);
    mutex_exit(&uart_mutex);
}

/*
 * GPIO Initialization
 */
void gpio_init_system(void) {
    // Status LEDs
    gpio_init(STATUS_LED_PIN);
    gpio_set_dir(STATUS_LED_PIN, GPIO_OUT);
    gpio_init(ERROR_LED_PIN);
    gpio_set_dir(ERROR_LED_PIN, GPIO_OUT);
    
    // Camera trigger
    gpio_init(CAMERA_TRIGGER_PIN);
    gpio_set_dir(CAMERA_TRIGGER_PIN, GPIO_OUT);
    gpio_put(CAMERA_TRIGGER_PIN, 0);
    
    // Encoder pins
    gpio_init(ENCODER_A_PIN);
    gpio_set_dir(ENCODER_A_PIN, GPIO_IN);
    gpio_pull_up(ENCODER_A_PIN);
    
    gpio_init(ENCODER_B_PIN);
    gpio_set_dir(ENCODER_B_PIN, GPIO_IN);
    gpio_pull_up(ENCODER_B_PIN);
    
    gpio_init(ENCODER_INDEX_PIN);
    gpio_set_dir(ENCODER_INDEX_PIN, GPIO_IN);
    gpio_pull_up(ENCODER_INDEX_PIN);
}

/*
 * UART Initialization
 */
void uart_init_system(void) {
    uart_init(uart0, UART_BAUD_RATE);
    gpio_set_function(UART_TX_PIN, GPIO_FUNC_UART);
    gpio_set_function(UART_RX_PIN, GPIO_FUNC_UART);
}

/*
 * Encoder Initialization
 */
void encoder_init(void) {
    // Set up interrupt on encoder A pin (rising edge)
    gpio_set_irq_enabled_with_callback(ENCODER_A_PIN, GPIO_IRQ_EDGE_RISE | GPIO_IRQ_EDGE_FALL, true, &encoder_irq_handler);
    
    // Set up interrupt on encoder index pin
    gpio_set_irq_enabled_with_callback(ENCODER_INDEX_PIN, GPIO_IRQ_EDGE_RISE, true, &encoder_irq_handler);
    
    // Initialize encoder state
    encoder_state.position = 0;
    encoder_state.velocity = 0;
    encoder_state.pulse_count = 0;
    encoder_state.last_pulse_time = get_timestamp_us();
    encoder_state.index_detected = false;
}

/*
 * IMU Initialization
 */
void imu_init(void) {
    i2c_init(i2c0, I2C_BAUD_RATE);
    gpio_set_function(IMU_SDA_PIN, GPIO_FUNC_I2C);
    gpio_set_function(IMU_SCL_PIN, GPIO_FUNC_I2C);
    gpio_pull_up(IMU_SDA_PIN);
    gpio_pull_up(IMU_SCL_PIN);
    
    // Wait for IMU to stabilize
    sleep_ms(100);
    
    // Wake up the IMU
    uint8_t data = 0x00;
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &IMU_PWR_MGMT_1, 1, true);
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &data, 1, false);
    
    // Configure sample rate (1kHz)
    data = 0x09; // 1kHz / (1 + 9) = 100Hz
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &IMU_SMPLRT_DIV, 1, true);
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &data, 1, false);
    
    // Configure DLPF
    data = 0x06; // 5Hz DLPF
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &IMU_CONFIG, 1, true);
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &data, 1, false);
    
    // Configure gyroscope (±2000°/s)
    data = 0x18;
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &IMU_GYRO_CONFIG, 1, true);
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &data, 1, false);
    
    // Configure accelerometer (±16g)
    data = 0x18;
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &IMU_ACCEL_CONFIG, 1, true);
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &data, 1, false);
    
    sleep_ms(100);
}

/*
 * Encoder Interrupt Handler
 */
void encoder_irq_handler(uint gpio, uint32_t events) {
    if (gpio == ENCODER_A_PIN) {
        uint64_t current_time = get_timestamp_us();
        
        // Read encoder B state to determine direction
        bool b_state = gpio_get(ENCODER_B_PIN);
        bool a_state = gpio_get(ENCODER_A_PIN);
        
        if (a_state == b_state) {
            encoder_state.position++;
        } else {
            encoder_state.position--;
        }
        
        encoder_state.pulse_count++;
        encoder_state.last_pulse_time = current_time;
        
        // Trigger camera at specified intervals
        if (encoder_state.pulse_count % ENCODER_TRIGGER_INTERVAL == 0) {
            camera_trigger();
            camera_trigger_count++;
        }
        
        // Update velocity calculation
        update_encoder_velocity();
        
    } else if (gpio == ENCODER_INDEX_PIN) {
        encoder_state.index_detected = true;
        // Reset position to zero on index pulse (optional)
        // encoder_state.position = 0;
    }
}

/*
 * Update Encoder Velocity
 */
void update_encoder_velocity(void) {
    static uint64_t last_velocity_update = 0;
    uint64_t current_time = get_timestamp_us();
    
    if (current_time - last_velocity_update >= 10000) { // Update every 10ms
        static int32_t last_position = 0;
        int32_t position_diff = encoder_state.position - last_position;
        uint64_t time_diff = current_time - last_velocity_update;
        
        if (time_diff > 0) {
            encoder_state.velocity = (position_diff * 1000000) / time_diff; // pulses per second
        }
        
        last_position = encoder_state.position;
        last_velocity_update = current_time;
    }
}

/*
 * Read IMU Data
 */
void imu_read_data(sensor_data_t* data) {
    uint8_t buffer[14];
    uint8_t reg_addr = IMU_ACCEL_XOUT_H;
    
    // Read accelerometer and gyroscope data
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &reg_addr, 1, true);
    i2c_read_blocking(i2c0, IMU_I2C_ADDR, buffer, 14, false);
    
    // Convert accelerometer data (16-bit, ±16g)
    int16_t accel_x_raw = (buffer[0] << 8) | buffer[1];
    int16_t accel_y_raw = (buffer[2] << 8) | buffer[3];
    int16_t accel_z_raw = (buffer[4] << 8) | buffer[5];
    
    data->accel_x = (float)accel_x_raw / 2048.0f; // ±16g = ±32768/16
    data->accel_y = (float)accel_y_raw / 2048.0f;
    data->accel_z = (float)accel_z_raw / 2048.0f;
    
    // Convert gyroscope data (16-bit, ±2000°/s)
    int16_t gyro_x_raw = (buffer[8] << 8) | buffer[9];
    int16_t gyro_y_raw = (buffer[10] << 8) | buffer[11];
    int16_t gyro_z_raw = (buffer[12] << 8) | buffer[13];
    
    data->gyro_x = (float)gyro_x_raw / 16.384f; // ±2000°/s = ±32768/2000
    data->gyro_y = (float)gyro_y_raw / 16.384f;
    data->gyro_z = (float)gyro_z_raw / 16.384f;
}

/*
 * Camera Trigger
 */
void camera_trigger(void) {
    gpio_put(CAMERA_TRIGGER_PIN, 1);
    sleep_us(100); // 100μs trigger pulse
    gpio_put(CAMERA_TRIGGER_PIN, 0);
}

/*
 * Send Data via UART (JSON format for backend API)
 */
void send_data_uart(const sensor_data_t* data) {
    mutex_enter_blocking(&uart_mutex);
    
    // Create JSON payload for backend API
    snprintf(data_buffer, DATA_BUFFER_SIZE,
        "{\"chainage\":%.2f,\"timestamp\":\"%llu\",\"type\":\"acceleration\",\"value\":%.3f,\"sensor_id\":\"imu_axle\"}\n",
        (float)data->encoder_position * 0.1f,  // Convert pulses to meters (assuming 0.1m per pulse)
        data->timestamp_us,
        sqrt(data->accel_x*data->accel_x + data->accel_y*data->accel_y + data->accel_z*data->accel_z)
    );
    
    uart_puts(uart0, data_buffer);
    mutex_exit(&uart_mutex);
}

/*
 * Get High-Resolution Timestamp
 */
uint64_t get_timestamp_us(void) {
    return to_us_since_boot(get_absolute_time());
}

/*
 * Status LED Control
 */
void status_led_toggle(void) {
    static bool led_state = false;
    led_state = !led_state;
    gpio_put(STATUS_LED_PIN, led_state);
}

void error_led_on(void) {
    gpio_put(ERROR_LED_PIN, 1);
}

void error_led_off(void) {
    gpio_put(ERROR_LED_PIN, 0);
}

/*
 * IMU Self-Test
 */
bool imu_self_test(void) {
    uint8_t who_am_i;
    uint8_t reg_addr = IMU_WHO_AM_I;
    
    i2c_write_blocking(i2c0, IMU_I2C_ADDR, &reg_addr, 1, true);
    i2c_read_blocking(i2c0, IMU_I2C_ADDR, &who_am_i, 1, false);
    
    return (who_am_i == 0x71); // MPU-9250 WHO_AM_I value
}

/*
 * System Health Check
 */
void system_health_check(void) {
    bool imu_ok = imu_self_test();
    
    if (!imu_ok) {
        error_led_on();
        const char* error_msg = "ERROR: IMU self-test failed\n";
        mutex_enter_blocking(&uart_mutex);
        uart_puts(uart0, error_msg);
        mutex_exit(&uart_mutex);
    } else {
        error_led_off();
    }
}

/*
 * Main Data Acquisition Loop
 */
void data_acquisition_loop(void) {
    static uint64_t last_imu_read = 0;
    static uint64_t last_status_update = 0;
    
    while (true) {
        uint64_t current_time = get_timestamp_us();
        
        // Read IMU data at specified rate
        if (current_time - last_imu_read >= (1000000 / IMU_SAMPLE_RATE_HZ)) {
            mutex_enter_blocking(&data_mutex);
            
            current_data.timestamp_us = current_time;
            current_data.encoder_position = encoder_state.position;
            current_data.encoder_velocity = encoder_state.velocity;
            current_data.camera_trigger_count = camera_trigger_count;
            current_data.system_status = system_initialized ? 1 : 0;
            
            imu_read_data(&current_data);
            
            send_data_uart(&current_data);
            
            mutex_exit(&data_mutex);
            last_imu_read = current_time;
        }
        
        // Update status LED every second
        if (current_time - last_status_update >= 1000000) {
            status_led_toggle();
            last_status_update = current_time;
        }
        
        // Perform periodic health check
        if (current_time % 10000000 == 0) { // Every 10 seconds
            system_health_check();
        }
        
        // Small delay to prevent excessive CPU usage
        sleep_us(100);
    }
}

/*
 * Main Function
 */
int main() {
    // Initialize system
    system_init();
    
    // Start data acquisition loop
    data_acquisition_loop();
    
    return 0;
}
