cmake_minimum_required(VERSION 3.13)

# Initialize the SDK based on PICO_SDK_PATH
# Note: this must happen before project()
include(pico_sdk_import.cmake)

project(track_monitoring_daq)

# Initialize the Raspberry Pi Pico SDK
pico_sdk_init()

# Add executable
add_executable(track_monitoring_daq
    main.c
)

# Add pico_stdlib library which aggregates commonly used libraries
target_link_libraries(track_monitoring_daq 
    pico_stdlib
    hardware_i2c
    hardware_uart
    hardware_gpio
    hardware_irq
    hardware_pwm
    hardware_timer
    pico_multicore
    pico_sync
    pico_time
    pico_mutex
)

# Enable usb output, disable uart output
pico_enable_stdio_usb(track_monitoring_daq 1)
pico_enable_stdio_uart(track_monitoring_daq 0)

# Create map/bin/hex/uf2 file in addition to ELF.
pico_add_extra_outputs(track_monitoring_daq)

# Compiler flags for optimization and debugging
target_compile_options(track_monitoring_daq PRIVATE
    -O2
    -Wall
    -Wextra
    -Werror
    -Wno-unused-parameter
    -Wno-unused-function
    -Wno-unused-variable
)

# Include directories
target_include_directories(track_monitoring_daq PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}
)

# Link math library
target_link_libraries(track_monitoring_daq m)
