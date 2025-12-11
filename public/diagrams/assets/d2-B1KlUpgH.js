function e(r){switch(r){case"index":return`direction: down\r
\r
MultiFlexMeter: {\r
  label: "Multiflexmeter Device"\r
}\r
Mallemolen: {\r
  label: "Mallemolen Polder Mill"\r
}\r
LorawanNetwork: {\r
  label: "LoRaWAN Network"\r
}\r
BackendServer: {\r
  label: "Multiflexmeter Server"\r
}\r
\r
MultiFlexMeter -> Mallemolen: "Monitors environmental conditions at"\r
MultiFlexMeter -> LorawanNetwork: "Sends LoRaWAN packets to"\r
LorawanNetwork -> BackendServer: "Forwards MQTT/HTTP data to"\r
`;case"view_1u6712s":return`direction: down\r
\r
MultiFlexMeter: {\r
  label: "Multiflexmeter Device"\r
\r
  Firmware: {\r
  label: "Firmware"\r
  }\r
  Hardware: {\r
  label: "Hardware"\r
\r
  Processor: {\r
      label: "Processor"\r
  }\r
  Sensor: {\r
      label: "Sensor"\r
  }\r
  Radio: {\r
      label: "Radio"\r
  }\r
  Memory: {\r
      label: "Storage"\r
  }\r
  Power: {\r
      label: "Power Supply"\r
  }\r
  }\r
}\r
Mallemolen: {\r
  label: "Mallemolen Polder Mill"\r
}\r
LorawanNetwork: {\r
  label: "LoRaWAN Network"\r
}\r
BackendServer: {\r
  label: "Multiflexmeter Server"\r
}\r
\r
MultiFlexMeter.Firmware -> MultiFlexMeter.Hardware.Processor: "Controls pins, timers, and watchdog of"\r
MultiFlexMeter.Firmware -> MultiFlexMeter.Hardware.Sensor: "Sends I2C commands (0x10, 0x11) to"\r
MultiFlexMeter.Firmware -> MultiFlexMeter.Hardware.Radio: "Transmits LoRaWAN frames via SPI to"\r
MultiFlexMeter.Firmware -> MultiFlexMeter.Hardware.Memory: "Reads/writes 41-byte config in"\r
MultiFlexMeter.Hardware.Sensor -> Mallemolen: "Monitors environmental conditions at"\r
MultiFlexMeter.Hardware.Radio -> LorawanNetwork: "Transmits via"\r
LorawanNetwork -> BackendServer: "Forwards MQTT/HTTP data to"\r
`;case"view_18ug6g":return`direction: down\r
\r
MultiFlexMeterFirmware: {\r
  label: "Firmware"\r
\r
  Controller: {\r
  label: "Main Controller"\r
  }\r
  HardwareDrivers: {\r
  label: "Hardware Drivers"\r
  }\r
  SensorInterface: {\r
  label: "Sensor Interface"\r
  }\r
  Settings: {\r
  label: "Settings Manager"\r
  }\r
  NetworkStack: {\r
  label: "Network Stack"\r
  }\r
}\r
MultiFlexMeterHardware: {\r
  label: "Hardware"\r
\r
  Processor: {\r
  label: "Processor"\r
  }\r
  Sensor: {\r
  label: "Sensor"\r
  }\r
  Radio: {\r
  label: "Radio"\r
  }\r
  Memory: {\r
  label: "Storage"\r
  }\r
  Power: {\r
  label: "Power Supply"\r
  }\r
}\r
Mallemolen: {\r
  label: "Mallemolen Polder Mill"\r
}\r
LorawanNetwork: {\r
  label: "LoRaWAN Network"\r
}\r
BackendServer: {\r
  label: "Multiflexmeter Server"\r
}\r
\r
MultiFlexMeterFirmware.Controller -> MultiFlexMeterFirmware.SensorInterface: "Triggers measurement cycle every 20-4270 seconds"\r
MultiFlexMeterFirmware.Controller -> MultiFlexMeterFirmware.Settings: "Reads DevEUI, AppEUI, AppKey, and interval from"\r
MultiFlexMeterFirmware.Controller -> MultiFlexMeterFirmware.NetworkStack: "Sends uplink packets and receives downlink commands"\r
MultiFlexMeterFirmware.HardwareDrivers -> MultiFlexMeterHardware.Processor: "Controls pins, timers, and watchdog of"\r
MultiFlexMeterFirmware.SensorInterface -> MultiFlexMeterHardware.Sensor: "Sends I2C commands (0x10, 0x11) to"\r
MultiFlexMeterFirmware.NetworkStack -> MultiFlexMeterHardware.Radio: "Transmits LoRaWAN frames via SPI to"\r
MultiFlexMeterFirmware.Settings -> MultiFlexMeterHardware.Memory: "Reads/writes 41-byte config in"\r
MultiFlexMeterHardware.Sensor -> Mallemolen: "Monitors environmental conditions at"\r
MultiFlexMeterHardware.Radio -> LorawanNetwork: "Transmits via"\r
LorawanNetwork -> BackendServer: "Forwards MQTT/HTTP data to"\r
`;default:throw new Error("Unknown viewId: "+r)}}export{e as d2Source};
