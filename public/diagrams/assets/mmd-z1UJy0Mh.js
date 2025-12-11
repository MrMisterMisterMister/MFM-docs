function r(e){switch(e){case"index":return`---\r
title: "System Context"\r
---\r
graph TB\r
  MultiFlexMeter[Multiflexmeter Device]\r
  Mallemolen[Mallemolen Polder Mill]\r
  LorawanNetwork[LoRaWAN Network]\r
  BackendServer[Multiflexmeter Server]\r
  MultiFlexMeter -. "Monitors environmental conditions at" .-> Mallemolen\r
  MultiFlexMeter -. "Sends LoRaWAN packets to" .-> LorawanNetwork\r
  LorawanNetwork -. "Forwards MQTT/HTTP data to" .-> BackendServer\r
`;case"view_1u6712s":return`---\r
title: "Container View"\r
---\r
graph TB\r
  subgraph MultiFlexMeter["Multiflexmeter Device"]\r
  MultiFlexMeter.Firmware[Firmware]\r
  subgraph MultiFlexMeter.Hardware["Hardware"]\r
      MultiFlexMeter.Hardware.Processor[Processor]\r
      MultiFlexMeter.Hardware.Sensor[Sensor]\r
      MultiFlexMeter.Hardware.Radio[Radio]\r
      MultiFlexMeter.Hardware.Memory[Storage]\r
      MultiFlexMeter.Hardware.Power[Power Supply]\r
  end\r
  end\r
  Mallemolen[Mallemolen Polder Mill]\r
  LorawanNetwork[LoRaWAN Network]\r
  BackendServer[Multiflexmeter Server]\r
  MultiFlexMeter.Firmware -. "Controls pins, timers, and watchdog of" .-> MultiFlexMeter.Hardware.Processor\r
  MultiFlexMeter.Firmware -. "Sends I2C commands (0x10, 0x11) to" .-> MultiFlexMeter.Hardware.Sensor\r
  MultiFlexMeter.Firmware -. "Transmits LoRaWAN frames via SPI to" .-> MultiFlexMeter.Hardware.Radio\r
  MultiFlexMeter.Firmware -. "Reads/writes 41-byte config in" .-> MultiFlexMeter.Hardware.Memory\r
  MultiFlexMeter.Hardware.Sensor -. "Monitors environmental conditions at" .-> Mallemolen\r
  MultiFlexMeter.Hardware.Radio -. "Transmits via" .-> LorawanNetwork\r
  LorawanNetwork -. "Forwards MQTT/HTTP data to" .-> BackendServer\r
`;case"view_18ug6g":return`---\r
title: "Component View"\r
---\r
graph TB\r
  subgraph MultiFlexMeterFirmware["Firmware"]\r
  MultiFlexMeterFirmware.Controller[Main Controller]\r
  MultiFlexMeterFirmware.HardwareDrivers[Hardware Drivers]\r
  MultiFlexMeterFirmware.SensorInterface[Sensor Interface]\r
  MultiFlexMeterFirmware.Settings[Settings Manager]\r
  MultiFlexMeterFirmware.NetworkStack[Network Stack]\r
  end\r
  subgraph MultiFlexMeterHardware["Hardware"]\r
  MultiFlexMeterHardware.Processor[Processor]\r
  MultiFlexMeterHardware.Sensor[Sensor]\r
  MultiFlexMeterHardware.Radio[Radio]\r
  MultiFlexMeterHardware.Memory[Storage]\r
  MultiFlexMeterHardware.Power[Power Supply]\r
  end\r
  Mallemolen[Mallemolen Polder Mill]\r
  LorawanNetwork[LoRaWAN Network]\r
  BackendServer[Multiflexmeter Server]\r
  MultiFlexMeterFirmware.Controller -. "Triggers measurement cycle every 20-4270 seconds" .-> MultiFlexMeterFirmware.SensorInterface\r
  MultiFlexMeterFirmware.Controller -. "Reads DevEUI, AppEUI, AppKey, and interval from" .-> MultiFlexMeterFirmware.Settings\r
  MultiFlexMeterFirmware.Controller -. "Sends uplink packets and receives downlink commands" .-> MultiFlexMeterFirmware.NetworkStack\r
  MultiFlexMeterFirmware.HardwareDrivers -. "Controls pins, timers, and watchdog of" .-> MultiFlexMeterHardware.Processor\r
  MultiFlexMeterFirmware.SensorInterface -. "Sends I2C commands (0x10, 0x11) to" .-> MultiFlexMeterHardware.Sensor\r
  MultiFlexMeterFirmware.NetworkStack -. "Transmits LoRaWAN frames via SPI to" .-> MultiFlexMeterHardware.Radio\r
  MultiFlexMeterFirmware.Settings -. "Reads/writes 41-byte config in" .-> MultiFlexMeterHardware.Memory\r
  MultiFlexMeterHardware.Sensor -. "Monitors environmental conditions at" .-> Mallemolen\r
  MultiFlexMeterHardware.Radio -. "Transmits via" .-> LorawanNetwork\r
  LorawanNetwork -. "Forwards MQTT/HTTP data to" .-> BackendServer\r
`;default:throw new Error("Unknown viewId: "+e)}}export{r as mmdSource};
