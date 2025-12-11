function e(r){switch(r){case"index":return`@startuml\r
title "System Context"\r
top to bottom direction\r
\r
hide stereotype\r
skinparam ranksep 60\r
skinparam nodesep 30\r
skinparam {\r
  arrowFontSize 10\r
  defaultTextAlignment center\r
  wrapWidth 200\r
  maxMessageSize 100\r
  shadowing false\r
}\r
\r
skinparam rectangle<<MultiFlexMeter>>{\r
  BackgroundColor #AC4D39\r
  FontColor #FBD3CB\r
  BorderColor #853A2D\r
}\r
skinparam rectangle<<Mallemolen>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
skinparam rectangle<<LorawanNetwork>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
skinparam rectangle<<BackendServer>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
rectangle "==Multiflexmeter Device\\n<size:10>[Embedded IoT Device]</size>\\n\\nBattery-powered ATmega1284P-based sensor device with LoRaWAN connectivity for environmental monitoring" <<MultiFlexMeter>> as MultiFlexMeter\r
rectangle "==Mallemolen Polder Mill\\n<size:10>[18th Century Water Mill]</size>\\n\\nHistoric poldermill built in 1727 for water management in the Gouda polder system" <<Mallemolen>> as Mallemolen\r
rectangle "==LoRaWAN Network\\n<size:10>[LoRaWAN 1.0.x (EU868, Class A)]</size>\\n\\nLoRaWAN network server receiving data via EU868 band using OTAA activation with Class A device operation" <<LorawanNetwork>> as LorawanNetwork\r
rectangle "==Multiflexmeter Server\\n<size:10>[Web Server (TTN Integration)]</size>\\n\\nWeb application receiving forwarded sensor data from TTN via MQTT or HTTP integration" <<BackendServer>> as BackendServer\r
\r
MultiFlexMeter .[#6E6E6E,thickness=2].> Mallemolen : "<color:#6E6E6E>Monitors environmental conditions at<color:#6E6E6E>"\r
MultiFlexMeter .[#6E6E6E,thickness=2].> LorawanNetwork : "<color:#6E6E6E>Sends LoRaWAN packets to<color:#6E6E6E>"\r
LorawanNetwork .[#6E6E6E,thickness=2].> BackendServer : "<color:#6E6E6E>Forwards MQTT/HTTP data to<color:#6E6E6E>"\r
@enduml\r
`;case"view_1u6712s":return`@startuml\r
title "Container View"\r
top to bottom direction\r
\r
hide stereotype\r
skinparam ranksep 60\r
skinparam nodesep 30\r
skinparam {\r
  arrowFontSize 10\r
  defaultTextAlignment center\r
  wrapWidth 200\r
  maxMessageSize 100\r
  shadowing false\r
}\r
\r
skinparam rectangle<<MultiFlexMeterFirmware>>{\r
  BackgroundColor #6366f1\r
  FontColor #eef2ff\r
  BorderColor #4f46e5\r
}\r
skinparam rectangle<<MultiFlexMeterHardwareProcessor>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwareSensor>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwareRadio>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwareMemory>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwarePower>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<Mallemolen>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
skinparam rectangle<<LorawanNetwork>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
skinparam rectangle<<BackendServer>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
rectangle "Multiflexmeter Device" <<MultiFlexMeter>> as MultiFlexMeter {\r
  skinparam RectangleBorderColor<<MultiFlexMeter>> #AC4D39\r
  skinparam RectangleFontColor<<MultiFlexMeter>> #AC4D39\r
  skinparam RectangleBorderStyle<<MultiFlexMeter>> dashed\r
\r
  rectangle "==Firmware\\n<size:10>[Arduino C++ (PlatformIO)]</size>\\n\\nArduino-based C++ firmware (704 lines) handling sensor reading, LoRaWAN communication, and power management" <<MultiFlexMeterFirmware>> as MultiFlexMeterFirmware\r
  rectangle "Hardware" <<MultiFlexMeterHardware>> as MultiFlexMeterHardware {\r
  skinparam RectangleBorderColor<<MultiFlexMeterHardware>> #6366f1\r
  skinparam RectangleFontColor<<MultiFlexMeterHardware>> #6366f1\r
  skinparam RectangleBorderStyle<<MultiFlexMeterHardware>> dashed\r
\r
  rectangle "==Processor\\n<size:10>[ATmega1284P-AU (TQFP-44)]</size>\\n\\n8-bit AVR RISC processor running at 8MHz with 128KB Flash, 16KB SRAM, 4KB EEPROM, 32 GPIO pins" <<MultiFlexMeterHardwareProcessor>> as MultiFlexMeterHardwareProcessor\r
  rectangle "==Sensor\\n<size:10>[I2C Sensor Board (0x36)]</size>\\n\\nI2C sensor board at address 0x36 measuring environmental data, responds to CMD_PERFORM (0x10) and CMD_READ (0x11)" <<MultiFlexMeterHardwareSensor>> as MultiFlexMeterHardwareSensor\r
  rectangle "==Radio\\n<size:10>[HopeRF RFM95W-868S2]</size>\\n\\nRFM95W transceiver transmitting on EU868 band (863-870MHz) with SF7-SF12, +20dBm max output, -148dBm sensitivity" <<MultiFlexMeterHardwareRadio>> as MultiFlexMeterHardwareRadio\r
  rectangle "==Storage\\n<size:10>[ATmega1284P EEPROM (4KB)]</size>\\n\\nBuilt-in EEPROM storing 41-byte configuration (DevEUI, AppEUI, AppKey, interval) persisting across power cycles" <<MultiFlexMeterHardwareMemory>> as MultiFlexMeterHardwareMemory\r
  rectangle "==Power Supply\\n<size:10>[2× AA battery]</size>\\n\\n2× AA battery power system with voltage regulation" <<MultiFlexMeterHardwarePower>> as MultiFlexMeterHardwarePower\r
  }\r
}\r
rectangle "==Mallemolen Polder Mill\\n<size:10>[18th Century Water Mill]</size>\\n\\nHistoric poldermill built in 1727 for water management in the Gouda polder system" <<Mallemolen>> as Mallemolen\r
rectangle "==LoRaWAN Network\\n<size:10>[LoRaWAN 1.0.x (EU868, Class A)]</size>\\n\\nLoRaWAN network server receiving data via EU868 band using OTAA activation with Class A device operation" <<LorawanNetwork>> as LorawanNetwork\r
rectangle "==Multiflexmeter Server\\n<size:10>[Web Server (TTN Integration)]</size>\\n\\nWeb application receiving forwarded sensor data from TTN via MQTT or HTTP integration" <<BackendServer>> as BackendServer\r
\r
MultiFlexMeterFirmware .[#6E6E6E,thickness=2].> MultiFlexMeterHardwareProcessor : "<color:#6E6E6E>Controls pins, timers, and watchdog of<color:#6E6E6E>"\r
MultiFlexMeterFirmware .[#6E6E6E,thickness=2].> MultiFlexMeterHardwareSensor : "<color:#6E6E6E>Sends I2C commands (0x10, 0x11) to<color:#6E6E6E>"\r
MultiFlexMeterFirmware .[#6E6E6E,thickness=2].> MultiFlexMeterHardwareRadio : "<color:#6E6E6E>Transmits LoRaWAN frames via SPI to<color:#6E6E6E>"\r
MultiFlexMeterFirmware .[#6E6E6E,thickness=2].> MultiFlexMeterHardwareMemory : "<color:#6E6E6E>Reads/writes 41-byte config in<color:#6E6E6E>"\r
MultiFlexMeterHardwareSensor .[#6E6E6E,thickness=2].> Mallemolen : "<color:#6E6E6E>Monitors environmental conditions at<color:#6E6E6E>"\r
MultiFlexMeterHardwareRadio .[#6E6E6E,thickness=2].> LorawanNetwork : "<color:#6E6E6E>Transmits via<color:#6E6E6E>"\r
LorawanNetwork .[#6E6E6E,thickness=2].> BackendServer : "<color:#6E6E6E>Forwards MQTT/HTTP data to<color:#6E6E6E>"\r
@enduml\r
`;case"view_18ug6g":return`@startuml\r
title "Component View"\r
top to bottom direction\r
\r
hide stereotype\r
skinparam ranksep 60\r
skinparam nodesep 30\r
skinparam {\r
  arrowFontSize 10\r
  defaultTextAlignment center\r
  wrapWidth 200\r
  maxMessageSize 100\r
  shadowing false\r
}\r
\r
skinparam rectangle<<MultiFlexMeterFirmwareController>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterFirmwareHardwareDrivers>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterFirmwareSensorInterface>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterFirmwareSettings>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterFirmwareNetworkStack>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwareProcessor>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwareSensor>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwareRadio>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwareMemory>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<MultiFlexMeterHardwarePower>>{\r
  BackgroundColor #A35829\r
  FontColor #FFE0C2\r
  BorderColor #7E451D\r
}\r
skinparam rectangle<<Mallemolen>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
skinparam rectangle<<LorawanNetwork>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
skinparam rectangle<<BackendServer>>{\r
  BackgroundColor #428a4f\r
  FontColor #f8fafc\r
  BorderColor #2d5d39\r
}\r
rectangle "Firmware" <<MultiFlexMeterFirmware>> as MultiFlexMeterFirmware {\r
  skinparam RectangleBorderColor<<MultiFlexMeterFirmware>> #6366f1\r
  skinparam RectangleFontColor<<MultiFlexMeterFirmware>> #6366f1\r
  skinparam RectangleBorderStyle<<MultiFlexMeterFirmware>> dashed\r
\r
  rectangle "==Main Controller\\n<size:10>[main.cpp (363 lines)]</size>\\n\\nOrchestrates measurement cycle (20-4270s interval), handles LoRaWAN events, processes downlink commands (0xDEAD reset, 0x10 interval, 0x11 sensor)" <<MultiFlexMeterFirmwareController>> as MultiFlexMeterFirmwareController\r
  rectangle "==Hardware Drivers\\n<size:10>[smbus.cpp + Arduino HAL]</size>\\n\\nControls I2C bus (80kHz, smbus.cpp 177 lines), SPI radio interface, GPIO pins, and watchdog timer for reset" <<MultiFlexMeterFirmwareHardwareDrivers>> as MultiFlexMeterFirmwareHardwareDrivers\r
  rectangle "==Sensor Interface\\n<size:10>[sensors.cpp (23 lines)]</size>\\n\\nTriggers sensor measurement (CMD_PERFORM 0x10), waits 10 seconds, reads data (CMD_READ 0x11) via I2C at address 0x36" <<MultiFlexMeterFirmwareSensorInterface>> as MultiFlexMeterFirmwareSensorInterface\r
  rectangle "==Settings Manager\\n<size:10>[rom_conf.cpp (80 lines)]</size>\\n\\nManages 41-byte EEPROM configuration: DevEUI, AppEUI, AppKey, measurement interval, firmware/hardware version" <<MultiFlexMeterFirmwareSettings>> as MultiFlexMeterFirmwareSettings\r
  rectangle "==Network Stack\\n<size:10>[Arduino-LMIC Library]</size>\\n\\nImplements LoRaWAN 1.0.x protocol with OTAA join, handles uplink transmission and downlink reception on EU868 band" <<MultiFlexMeterFirmwareNetworkStack>> as MultiFlexMeterFirmwareNetworkStack\r
}\r
rectangle "Hardware" <<MultiFlexMeterHardware>> as MultiFlexMeterHardware {\r
  skinparam RectangleBorderColor<<MultiFlexMeterHardware>> #6366f1\r
  skinparam RectangleFontColor<<MultiFlexMeterHardware>> #6366f1\r
  skinparam RectangleBorderStyle<<MultiFlexMeterHardware>> dashed\r
\r
  rectangle "==Processor\\n<size:10>[ATmega1284P-AU (TQFP-44)]</size>\\n\\n8-bit AVR RISC processor running at 8MHz with 128KB Flash, 16KB SRAM, 4KB EEPROM, 32 GPIO pins" <<MultiFlexMeterHardwareProcessor>> as MultiFlexMeterHardwareProcessor\r
  rectangle "==Sensor\\n<size:10>[I2C Sensor Board (0x36)]</size>\\n\\nI2C sensor board at address 0x36 measuring environmental data, responds to CMD_PERFORM (0x10) and CMD_READ (0x11)" <<MultiFlexMeterHardwareSensor>> as MultiFlexMeterHardwareSensor\r
  rectangle "==Radio\\n<size:10>[HopeRF RFM95W-868S2]</size>\\n\\nRFM95W transceiver transmitting on EU868 band (863-870MHz) with SF7-SF12, +20dBm max output, -148dBm sensitivity" <<MultiFlexMeterHardwareRadio>> as MultiFlexMeterHardwareRadio\r
  rectangle "==Storage\\n<size:10>[ATmega1284P EEPROM (4KB)]</size>\\n\\nBuilt-in EEPROM storing 41-byte configuration (DevEUI, AppEUI, AppKey, interval) persisting across power cycles" <<MultiFlexMeterHardwareMemory>> as MultiFlexMeterHardwareMemory\r
  rectangle "==Power Supply\\n<size:10>[2× AA battery]</size>\\n\\n2× AA battery power system with voltage regulation" <<MultiFlexMeterHardwarePower>> as MultiFlexMeterHardwarePower\r
}\r
rectangle "==Mallemolen Polder Mill\\n<size:10>[18th Century Water Mill]</size>\\n\\nHistoric poldermill built in 1727 for water management in the Gouda polder system" <<Mallemolen>> as Mallemolen\r
rectangle "==LoRaWAN Network\\n<size:10>[LoRaWAN 1.0.x (EU868, Class A)]</size>\\n\\nLoRaWAN network server receiving data via EU868 band using OTAA activation with Class A device operation" <<LorawanNetwork>> as LorawanNetwork\r
rectangle "==Multiflexmeter Server\\n<size:10>[Web Server (TTN Integration)]</size>\\n\\nWeb application receiving forwarded sensor data from TTN via MQTT or HTTP integration" <<BackendServer>> as BackendServer\r
\r
MultiFlexMeterFirmwareController .[#6E6E6E,thickness=2].> MultiFlexMeterFirmwareSensorInterface : "<color:#6E6E6E>Triggers measurement cycle every 20-4270 seconds<color:#6E6E6E>"\r
MultiFlexMeterFirmwareController .[#6E6E6E,thickness=2].> MultiFlexMeterFirmwareSettings : "<color:#6E6E6E>Reads DevEUI, AppEUI, AppKey, and interval from<color:#6E6E6E>"\r
MultiFlexMeterFirmwareController .[#6E6E6E,thickness=2].> MultiFlexMeterFirmwareNetworkStack : "<color:#6E6E6E>Sends uplink packets and receives downlink commands<color:#6E6E6E>"\r
MultiFlexMeterFirmwareHardwareDrivers .[#6E6E6E,thickness=2].> MultiFlexMeterHardwareProcessor : "<color:#6E6E6E>Controls pins, timers, and watchdog of<color:#6E6E6E>"\r
MultiFlexMeterFirmwareSensorInterface .[#6E6E6E,thickness=2].> MultiFlexMeterHardwareSensor : "<color:#6E6E6E>Sends I2C commands (0x10, 0x11) to<color:#6E6E6E>"\r
MultiFlexMeterFirmwareNetworkStack .[#6E6E6E,thickness=2].> MultiFlexMeterHardwareRadio : "<color:#6E6E6E>Transmits LoRaWAN frames via SPI to<color:#6E6E6E>"\r
MultiFlexMeterFirmwareSettings .[#6E6E6E,thickness=2].> MultiFlexMeterHardwareMemory : "<color:#6E6E6E>Reads/writes 41-byte config in<color:#6E6E6E>"\r
MultiFlexMeterHardwareSensor .[#6E6E6E,thickness=2].> Mallemolen : "<color:#6E6E6E>Monitors environmental conditions at<color:#6E6E6E>"\r
MultiFlexMeterHardwareRadio .[#6E6E6E,thickness=2].> LorawanNetwork : "<color:#6E6E6E>Transmits via<color:#6E6E6E>"\r
LorawanNetwork .[#6E6E6E,thickness=2].> BackendServer : "<color:#6E6E6E>Forwards MQTT/HTTP data to<color:#6E6E6E>"\r
@enduml\r
`;default:throw new Error("Unknown viewId: "+r)}}export{e as pumlSource};
