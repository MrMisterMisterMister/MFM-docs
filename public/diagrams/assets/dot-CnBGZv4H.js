function t(e){switch(e){case"index":return`digraph {
  graph [TBbalance=min,
  bgcolor=transparent,
  compound=true,
  fontname=Arial,
  fontsize=15,
  labeljust=l,
  labelloc=t,
  layout=dot,
  likec4_viewId=index,
  nodesep=1.528,
  outputorder=nodesfirst,
  pad=0.209,
  rankdir=TB,
  ranksep=1.667,
  splines=spline
  ];
  node [color="#2563eb",
  fillcolor="#3b82f6",
  fontcolor="#eff6ff",
  fontname=Arial,
  label="\\N",
  penwidth=0,
  shape=rect,
  style=filled
  ];
  edge [arrowsize=0.75,
  color="#6E6E6E",
  fontcolor="#C6C6C6",
  fontname=Arial,
  fontsize=14,
  penwidth=2
  ];
  multiflexmeter [color="#853A2D",
  fillcolor="#AC4D39",
  fontcolor="#FBD3CB",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Multiflexmeter Device</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f5b2a3">Embedded IoT Device</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f5b2a3">Battery-powered ATmega1284P-based sensor<BR/>device with LoRaWAN connectivity for<BR/>environmental monitoring</FONT></TD></TR></TABLE>>,
  likec4_id=multiFlexMeter,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  mallemolen [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Mallemolen Polder Mill</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">18th Century Water Mill</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Historic windmill built in 1727 for water<BR/>management in the Gouda polder system</FONT></TD></TR></TABLE>>,
  likec4_id=mallemolen,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  multiflexmeter -> mallemolen [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Monitors environmental conditions at</FONT></TD></TR></TABLE>>,
  likec4_id="6szc37",
  minlen=1,
  style=dashed];
  lorawannetwork [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">LoRaWAN Network</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">LoRaWAN 1.0.x (EU868, Class A)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">LoRaWAN network server receiving data via<BR/>EU868 band using OTAA activation with Class A<BR/>device operation</FONT></TD></TR></TABLE>>,
  likec4_id=lorawanNetwork,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  multiflexmeter -> lorawannetwork [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Sends LoRaWAN packets to</FONT></TD></TR></TABLE>>,
  likec4_id=z7koh5,
  style=dashed];
  backendserver [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Multiflexmeter Server</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">Web Server (TTN Integration)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Web application receiving forwarded sensor<BR/>data from TTN via MQTT or HTTP integration</FONT></TD></TR></TABLE>>,
  likec4_id=backendServer,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  lorawannetwork -> backendserver [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Forwards MQTT/HTTP data to</FONT></TD></TR></TABLE>>,
  likec4_id="2f0hb1",
  minlen=1,
  style=dashed];
}
`;case"view_1u6712s":return`digraph {
  graph [TBbalance=min,
  bgcolor=transparent,
  compound=true,
  fontname=Arial,
  fontsize=15,
  labeljust=l,
  labelloc=t,
  layout=dot,
  likec4_viewId=view_1u6712s,
  nodesep=1.528,
  outputorder=nodesfirst,
  pad=0.209,
  rankdir=TB,
  ranksep=1.667,
  splines=spline
  ];
  node [color="#2563eb",
  fillcolor="#3b82f6",
  fontcolor="#eff6ff",
  fontname=Arial,
  label="\\N",
  penwidth=0,
  shape=rect,
  style=filled
  ];
  edge [arrowsize=0.75,
  color="#6E6E6E",
  fontcolor="#C6C6C6",
  fontname=Arial,
  fontsize=14,
  penwidth=2
  ];
  subgraph cluster_multiflexmeter {
  graph [color="#43241f",
      fillcolor="#573027",
      label=<<FONT POINT-SIZE="11" COLOR="#f5b2a3b3"><B>MULTIFLEXMETER DEVICE</B></FONT>>,
      likec4_depth=2,
      likec4_id=multiFlexMeter,
      likec4_level=0,
      margin=40,
      style=filled
  ];
  subgraph cluster_hardware {
      graph [color="#2a2490",
    fillcolor="#2225aa",
    label=<<FONT POINT-SIZE="11" COLOR="#c7d2feb3"><B>HARDWARE</B></FONT>>,
    likec4_depth=1,
    likec4_id="multiFlexMeter.hardware",
    likec4_level=1,
    margin=40,
    style=filled
      ];
      processor [color="#7E451D",
    fillcolor="#A35829",
    fontcolor="#FFE0C2",
    group=multiFlexMeter,
    height=2.5,
    label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Processor</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">ATmega1284P-AU (TQFP-44)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">8-bit AVR RISC processor running at 8MHz with<BR/>128KB Flash, 16KB SRAM, 4KB EEPROM, 32 GPIO<BR/>pins</FONT></TD></TR></TABLE>>,
    likec4_id="multiFlexMeter.hardware.processor",
    likec4_level=2,
    margin="0.223,0.223",
    width=4.445];
      sensor [color="#7E451D",
    fillcolor="#A35829",
    fontcolor="#FFE0C2",
    group=multiFlexMeter,
    height=2.5,
    label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Sensor</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">I2C Sensor Board (0x36)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">I2C sensor board at address 0x36 measuring<BR/>environmental data, responds to CMD_PERFORM<BR/>(0x10) and CMD_READ (0x11)</FONT></TD></TR></TABLE>>,
    likec4_id="multiFlexMeter.hardware.sensor",
    likec4_level=2,
    margin="0.223,0.223",
    width=4.445];
      radio [color="#7E451D",
    fillcolor="#A35829",
    fontcolor="#FFE0C2",
    group=multiFlexMeter,
    height=2.5,
    label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Radio</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">HopeRF RFM95W-868S2</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">RFM95W transceiver transmitting on EU868 band<BR/>(863-870MHz) with SF7-SF12, +20dBm max<BR/>output, -148dBm sensitivity</FONT></TD></TR></TABLE>>,
    likec4_id="multiFlexMeter.hardware.radio",
    likec4_level=2,
    margin="0.223,0.223",
    width=4.445];
      memory [color="#7E451D",
    fillcolor="#A35829",
    fontcolor="#FFE0C2",
    group=multiFlexMeter,
    height=2.5,
    label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Storage</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">ATmega1284P EEPROM (4KB)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Built-in EEPROM storing 41-byte configuration<BR/>(DevEUI, AppEUI, AppKey, interval) persisting<BR/>across power cycles</FONT></TD></TR></TABLE>>,
    likec4_id="multiFlexMeter.hardware.memory",
    likec4_level=2,
    margin="0.223,0.223",
    width=4.445];
      power [color="#7E451D",
    fillcolor="#A35829",
    fontcolor="#FFE0C2",
    height=2.5,
    label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Power Supply</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">2× AA battery</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">2× AA battery power system with voltage<BR/>regulation</FONT></TD></TR></TABLE>>,
    likec4_id="multiFlexMeter.hardware.power",
    likec4_level=2,
    margin="0.223,0.223",
    width=4.445];
  }
  firmware [color="#4f46e5",
      fillcolor="#6366f1",
      fontcolor="#eef2ff",
      group=multiFlexMeter,
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Firmware</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c7d2fe">Arduino C++ (PlatformIO)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c7d2fe">Arduino-based C++ firmware (704 lines)<BR/>handling sensor reading, LoRaWAN<BR/>communication, and power management</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.firmware",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  }
  firmware -> processor [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Controls pins, timers, and watchdog of</FONT></TD></TR></TABLE>>,
  likec4_id=o551a5,
  minlen=1,
  style=dashed];
  firmware -> sensor [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Sends I2C commands (0x10, 0x11) to</FONT></TD></TR></TABLE>>,
  likec4_id=r54bj1,
  style=dashed,
  weight=2];
  firmware -> radio [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Transmits LoRaWAN frames via SPI to</FONT></TD></TR></TABLE>>,
  likec4_id="1mwxfh6",
  style=dashed,
  weight=2];
  firmware -> memory [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Reads/writes 41-byte config in</FONT></TD></TR></TABLE>>,
  likec4_id=cu6lqi,
  minlen=1,
  style=dashed];
  mallemolen [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Mallemolen Polder Mill</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">18th Century Water Mill</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Historic windmill built in 1727 for water<BR/>management in the Gouda polder system</FONT></TD></TR></TABLE>>,
  likec4_id=mallemolen,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  sensor -> mallemolen [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Monitors environmental conditions at</FONT></TD></TR></TABLE>>,
  likec4_id="121c0nv",
  minlen=1,
  style=dashed];
  lorawannetwork [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">LoRaWAN Network</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">LoRaWAN 1.0.x (EU868, Class A)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">LoRaWAN network server receiving data via<BR/>EU868 band using OTAA activation with Class A<BR/>device operation</FONT></TD></TR></TABLE>>,
  likec4_id=lorawanNetwork,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  radio -> lorawannetwork [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Transmits via</FONT></TD></TR></TABLE>>,
  likec4_id=l2j352,
  style=dashed];
  backendserver [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Multiflexmeter Server</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">Web Server (TTN Integration)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Web application receiving forwarded sensor<BR/>data from TTN via MQTT or HTTP integration</FONT></TD></TR></TABLE>>,
  likec4_id=backendServer,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  lorawannetwork -> backendserver [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Forwards MQTT/HTTP data to</FONT></TD></TR></TABLE>>,
  likec4_id="2f0hb1",
  minlen=0,
  style=dashed,
  weight=3];
}
`;case"view_18ug6g":return`digraph {
  graph [TBbalance=min,
  bgcolor=transparent,
  compound=true,
  fontname=Arial,
  fontsize=15,
  labeljust=l,
  labelloc=t,
  layout=dot,
  likec4_viewId=view_18ug6g,
  nodesep=1.528,
  outputorder=nodesfirst,
  pad=0.209,
  rankdir=TB,
  ranksep=1.667,
  splines=spline
  ];
  node [color="#2563eb",
  fillcolor="#3b82f6",
  fontcolor="#eff6ff",
  fontname=Arial,
  label="\\N",
  penwidth=0,
  shape=rect,
  style=filled
  ];
  edge [arrowsize=0.75,
  color="#6E6E6E",
  fontcolor="#C6C6C6",
  fontname=Arial,
  fontsize=14,
  penwidth=2
  ];
  subgraph cluster_firmware {
  graph [color="#2a2490",
      fillcolor="#2225aa",
      label=<<FONT POINT-SIZE="11" COLOR="#c7d2feb3"><B>FIRMWARE</B></FONT>>,
      likec4_depth=1,
      likec4_id="multiFlexMeter.firmware",
      likec4_level=0,
      margin=40,
      style=filled
  ];
  controller [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      group="multiFlexMeter.firmware",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Main Controller</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">main.cpp (363 lines)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Orchestrates measurement cycle (20-4270s<BR/>interval), handles LoRaWAN events, processes<BR/>downlink commands (0xDEAD reset, 0x10<BR/>interval, 0x11 sensor)</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.firmware.controller",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  hardwaredrivers [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Hardware Drivers</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">smbus.cpp + Arduino HAL</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Controls I2C bus (80kHz, smbus.cpp 177<BR/>lines), SPI radio interface, GPIO pins, and<BR/>watchdog timer for reset</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.firmware.hardwareDrivers",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  sensorinterface [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      group="multiFlexMeter.firmware",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Sensor Interface</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">sensors.cpp (23 lines)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Triggers sensor measurement (CMD_PERFORM<BR/>0x10), waits 10 seconds, reads data (CMD_READ<BR/>0x11) via I2C at address 0x36</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.firmware.sensorInterface",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  settings [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      group="multiFlexMeter.firmware",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Settings Manager</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">rom_conf.cpp (80 lines)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Manages 41-byte EEPROM configuration: DevEUI,<BR/>AppEUI, AppKey, measurement interval,<BR/>firmware/hardware version</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.firmware.settings",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  networkstack [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      group="multiFlexMeter.firmware",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Network Stack</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">Arduino-LMIC Library</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Implements LoRaWAN 1.0.x protocol with OTAA<BR/>join, handles uplink transmission and<BR/>downlink reception on EU868 band</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.firmware.networkStack",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  }
  subgraph cluster_hardware {
  graph [color="#2a2490",
      fillcolor="#2225aa",
      label=<<FONT POINT-SIZE="11" COLOR="#c7d2feb3"><B>HARDWARE</B></FONT>>,
      likec4_depth=1,
      likec4_id="multiFlexMeter.hardware",
      likec4_level=0,
      margin=40,
      style=filled
  ];
  processor [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Processor</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">ATmega1284P-AU (TQFP-44)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">8-bit AVR RISC processor running at 8MHz with<BR/>128KB Flash, 16KB SRAM, 4KB EEPROM, 32 GPIO<BR/>pins</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.hardware.processor",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  sensor [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Sensor</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">I2C Sensor Board (0x36)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">I2C sensor board at address 0x36 measuring<BR/>environmental data, responds to CMD_PERFORM<BR/>(0x10) and CMD_READ (0x11)</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.hardware.sensor",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  radio [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Radio</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">HopeRF RFM95W-868S2</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">RFM95W transceiver transmitting on EU868 band<BR/>(863-870MHz) with SF7-SF12, +20dBm max<BR/>output, -148dBm sensitivity</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.hardware.radio",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  memory [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Storage</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">ATmega1284P EEPROM (4KB)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">Built-in EEPROM storing 41-byte configuration<BR/>(DevEUI, AppEUI, AppKey, interval) persisting<BR/>across power cycles</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.hardware.memory",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  power [color="#7E451D",
      fillcolor="#A35829",
      fontcolor="#FFE0C2",
      height=2.5,
      label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Power Supply</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#f9b27c">2× AA battery</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#f9b27c">2× AA battery power system with voltage<BR/>regulation</FONT></TD></TR></TABLE>>,
      likec4_id="multiFlexMeter.hardware.power",
      likec4_level=1,
      margin="0.223,0.223",
      width=4.445];
  }
  controller -> sensorinterface [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Triggers measurement cycle every 20-4270<BR/>seconds</FONT></TD></TR></TABLE>>,
  likec4_id=f04yh1,
  style=dashed,
  weight=3];
  controller -> settings [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Reads DevEUI, AppEUI, AppKey, and<BR/>interval from</FONT></TD></TR></TABLE>>,
  likec4_id=cmgdmb,
  style=dashed,
  weight=3];
  controller -> networkstack [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Sends uplink packets and receives<BR/>downlink commands</FONT></TD></TR></TABLE>>,
  likec4_id="2056yu",
  style=dashed,
  weight=3];
  hardwaredrivers -> processor [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Controls pins, timers, and watchdog of</FONT></TD></TR></TABLE>>,
  likec4_id="21d5nk",
  style=dashed,
  weight=3];
  sensorinterface -> sensor [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Sends I2C commands (0x10, 0x11) to</FONT></TD></TR></TABLE>>,
  likec4_id="1iubx6o",
  style=dashed];
  settings -> memory [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Reads/writes 41-byte config in</FONT></TD></TR></TABLE>>,
  likec4_id=wgd21t,
  minlen=1,
  style=dashed];
  networkstack -> radio [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Transmits LoRaWAN frames via SPI to</FONT></TD></TR></TABLE>>,
  likec4_id="11dgt2c",
  style=dashed];
  mallemolen [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Mallemolen Polder Mill</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">18th Century Water Mill</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Historic windmill built in 1727 for water<BR/>management in the Gouda polder system</FONT></TD></TR></TABLE>>,
  likec4_id=mallemolen,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  sensor -> mallemolen [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Monitors environmental conditions at</FONT></TD></TR></TABLE>>,
  likec4_id="121c0nv",
  minlen=1,
  style=dashed];
  lorawannetwork [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">LoRaWAN Network</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">LoRaWAN 1.0.x (EU868, Class A)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">LoRaWAN network server receiving data via<BR/>EU868 band using OTAA activation with Class A<BR/>device operation</FONT></TD></TR></TABLE>>,
  likec4_id=lorawanNetwork,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  radio -> lorawannetwork [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Transmits via</FONT></TD></TR></TABLE>>,
  likec4_id=l2j352,
  style=dashed];
  backendserver [color="#2d5d39",
  fillcolor="#428a4f",
  fontcolor="#f8fafc",
  height=2.5,
  label=<<TABLE BORDER="0" CELLPADDING="0" CELLSPACING="4"><TR><TD><FONT POINT-SIZE="20">Multiflexmeter Server</FONT></TD></TR><TR><TD><FONT POINT-SIZE="13" COLOR="#c2f0c2">Web Server (TTN Integration)</FONT></TD></TR><TR><TD><FONT POINT-SIZE="15" COLOR="#c2f0c2">Web application receiving forwarded sensor<BR/>data from TTN via MQTT or HTTP integration</FONT></TD></TR></TABLE>>,
  likec4_id=backendServer,
  likec4_level=0,
  margin="0.223,0.223",
  width=4.445];
  lorawannetwork -> backendserver [arrowhead=normal,
  label=<<TABLE BORDER="0" CELLPADDING="3" CELLSPACING="0" BGCOLOR="#18191bA0"><TR><TD ALIGN="TEXT" BALIGN="LEFT"><FONT POINT-SIZE="14">Forwards MQTT/HTTP data to</FONT></TD></TR></TABLE>>,
  likec4_id="2f0hb1",
  minlen=0,
  style=dashed,
  weight=3];
}
`;default:throw new Error("Unknown viewId: "+e)}}function n(e){switch(e){case"index":return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 13.1.2 (0)
 -->
<!-- Pages: 1 -->
<svg width="836pt" height="856pt"
 viewBox="0.00 0.00 836.00 856.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 840.65)">
<!-- multiflexmeter -->
<g id="node1" class="node">
<title>multiflexmeter</title>
<polygon fill="#ac4d39" stroke="#853a2d" stroke-width="0" points="534.75,-825.6 185.29,-825.6 185.29,-645.6 534.75,-645.6 534.75,-825.6"/>
<text xml:space="preserve" text-anchor="start" x="264.44" y="-768.4" font-family="Arial" font-size="20.00" fill="#fbd3cb">Multiflexmeter Device</text>
<text xml:space="preserve" text-anchor="start" x="295.71" y="-746.7" font-family="Arial" font-size="13.00" fill="#f5b2a3">Embedded IoT Device</text>
<text xml:space="preserve" text-anchor="start" x="205.35" y="-725.3" font-family="Arial" font-size="15.00" fill="#f5b2a3">Battery&#45;powered ATmega1284P&#45;based sensor</text>
<text xml:space="preserve" text-anchor="start" x="233.3" y="-707.3" font-family="Arial" font-size="15.00" fill="#f5b2a3">device with LoRaWAN connectivity for</text>
<text xml:space="preserve" text-anchor="start" x="275.81" y="-689.3" font-family="Arial" font-size="15.00" fill="#f5b2a3">environmental monitoring</text>
</g>
<!-- mallemolen -->
<g id="node2" class="node">
<title>mallemolen</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="320.04,-502.8 0,-502.8 0,-322.8 320.04,-322.8 320.04,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="59.43" y="-436.6" font-family="Arial" font-size="20.00" fill="#f8fafc">Mallemolen Polder Mill</text>
<text xml:space="preserve" text-anchor="start" x="92.11" y="-414.9" font-family="Arial" font-size="13.00" fill="#c2f0c2">18th Century Water Mill</text>
<text xml:space="preserve" text-anchor="start" x="32.47" y="-393.5" font-family="Arial" font-size="15.00" fill="#c2f0c2">Historic windmill built in 1727 for water</text>
<text xml:space="preserve" text-anchor="start" x="22.44" y="-375.5" font-family="Arial" font-size="15.00" fill="#c2f0c2">management in the Gouda polder system</text>
</g>
<!-- lorawannetwork -->
<g id="node3" class="node">
<title>lorawannetwork</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="792.41,-502.8 429.63,-502.8 429.63,-322.8 792.41,-322.8 792.41,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="524.33" y="-445.6" font-family="Arial" font-size="20.00" fill="#f8fafc">LoRaWAN Network</text>
<text xml:space="preserve" text-anchor="start" x="512.4" y="-423.9" font-family="Arial" font-size="13.00" fill="#c2f0c2">LoRaWAN 1.0.x (EU868, Class A)</text>
<text xml:space="preserve" text-anchor="start" x="463.88" y="-402.5" font-family="Arial" font-size="15.00" fill="#c2f0c2">LoRaWAN network server receiving data via</text>
<text xml:space="preserve" text-anchor="start" x="449.69" y="-384.5" font-family="Arial" font-size="15.00" fill="#c2f0c2">EU868 band using OTAA activation with Class A</text>
<text xml:space="preserve" text-anchor="start" x="555.98" y="-366.5" font-family="Arial" font-size="15.00" fill="#c2f0c2">device operation</text>
</g>
<!-- backendserver -->
<g id="node4" class="node">
<title>backendserver</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="781.94,-180 440.1,-180 440.1,0 781.94,0 781.94,-180"/>
<text xml:space="preserve" text-anchor="start" x="516.55" y="-113.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Multiflexmeter Server</text>
<text xml:space="preserve" text-anchor="start" x="525.41" y="-92.1" font-family="Arial" font-size="13.00" fill="#c2f0c2">Web Server (TTN Integration)</text>
<text xml:space="preserve" text-anchor="start" x="465.53" y="-70.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">Web application receiving forwarded sensor</text>
<text xml:space="preserve" text-anchor="start" x="460.15" y="-52.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">data from TTN via MQTT or HTTP integration</text>
</g>
<!-- multiflexmeter&#45;&gt;mallemolen -->
<g id="edge1" class="edge">
<title>multiflexmeter&#45;&gt;mallemolen</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M236.52,-645.98C218.18,-627.89 201.33,-607.59 189.01,-585.6 176.67,-563.57 169.3,-537.63 164.96,-512.68"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="167.58,-512.42 163.81,-505.43 162.39,-513.24 167.58,-512.42"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="189.01,-562.8 189.01,-585.6 423.02,-585.6 423.02,-562.8 189.01,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="192.01" y="-570" font-family="Arial" font-size="14.00" fill="#c6c6c6">Monitors environmental conditions at</text>
</g>
<!-- multiflexmeter&#45;&gt;lorawannetwork -->
<g id="edge2" class="edge">
<title>multiflexmeter&#45;&gt;lorawannetwork</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M429.6,-645.67C462.38,-603.77 501.56,-553.7 535.11,-510.83"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="537.1,-512.54 539.65,-505.01 532.96,-509.3 537.1,-512.54"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="493.05,-562.8 493.05,-585.6 676.47,-585.6 676.47,-562.8 493.05,-562.8"/>
<text xml:space="preserve" text-anchor="start" x="496.05" y="-570" font-family="Arial" font-size="14.00" fill="#c6c6c6">Sends LoRaWAN packets to</text>
</g>
<!-- lorawannetwork&#45;&gt;backendserver -->
<g id="edge3" class="edge">
<title>lorawannetwork&#45;&gt;backendserver</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M611.02,-322.87C611.02,-281.67 611.02,-232.56 611.02,-190.17"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="613.65,-190.36 611.02,-182.86 608.4,-190.36 613.65,-190.36"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="611.02,-240 611.02,-262.8 806.05,-262.8 806.05,-240 611.02,-240"/>
<text xml:space="preserve" text-anchor="start" x="614.02" y="-247.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Forwards MQTT/HTTP data to</text>
</g>
</g>
</svg>
`;case"view_1u6712s":return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 13.1.2 (0)
 -->
<!-- Pages: 1 -->
<svg width="2454pt" height="962pt"
 viewBox="0.00 0.00 2454.00 962.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 947.05)">
<g id="clust1" class="cluster">
<title>cluster_multiflexmeter</title>
<polygon fill="#573027" stroke="#43241f" points="8,-270.8 8,-924 2416,-924 2416,-270.8 8,-270.8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-911.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#f5b2a3" fill-opacity="0.701961">MULTIFLEXMETER DEVICE</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_hardware</title>
<polygon fill="#2225aa" stroke="#2a2490" points="48,-310.8 48,-592 2376,-592 2376,-310.8 48,-310.8"/>
<text xml:space="preserve" text-anchor="start" x="56" y="-579.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#c7d2fe" fill-opacity="0.701961">HARDWARE</text>
</g>
<!-- processor -->
<g id="node1" class="node">
<title>processor</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="479.54,-530.8 88.46,-530.8 88.46,-350.8 479.54,-350.8 479.54,-530.8"/>
<text xml:space="preserve" text-anchor="start" x="238.99" y="-473.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Processor</text>
<text xml:space="preserve" text-anchor="start" x="196.58" y="-451.9" font-family="Arial" font-size="13.00" fill="#f9b27c">ATmega1284P&#45;AU (TQFP&#45;44)</text>
<text xml:space="preserve" text-anchor="start" x="124.36" y="-430.5" font-family="Arial" font-size="15.00" fill="#f9b27c">8&#45;bit AVR RISC processor running at 8MHz with</text>
<text xml:space="preserve" text-anchor="start" x="108.51" y="-412.5" font-family="Arial" font-size="15.00" fill="#f9b27c">128KB Flash, 16KB SRAM, 4KB EEPROM, 32 GPIO</text>
<text xml:space="preserve" text-anchor="start" x="270.24" y="-394.5" font-family="Arial" font-size="15.00" fill="#f9b27c">pins</text>
</g>
<!-- sensor -->
<g id="node2" class="node">
<title>sensor</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="966.04,-530.8 589.96,-530.8 589.96,-350.8 966.04,-350.8 966.04,-530.8"/>
<text xml:space="preserve" text-anchor="start" x="746.32" y="-473.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Sensor</text>
<text xml:space="preserve" text-anchor="start" x="706.1" y="-451.9" font-family="Arial" font-size="13.00" fill="#f9b27c">I2C Sensor Board (0x36)</text>
<text xml:space="preserve" text-anchor="start" x="627.92" y="-430.5" font-family="Arial" font-size="15.00" fill="#f9b27c">I2C sensor board at address 0x36 measuring</text>
<text xml:space="preserve" text-anchor="start" x="610.02" y="-412.5" font-family="Arial" font-size="15.00" fill="#f9b27c">environmental data, responds to CMD_PERFORM</text>
<text xml:space="preserve" text-anchor="start" x="674.63" y="-394.5" font-family="Arial" font-size="15.00" fill="#f9b27c">(0x10) and CMD_READ (0x11)</text>
</g>
<!-- radio -->
<g id="node3" class="node">
<title>radio</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1447.54,-530.8 1076.46,-530.8 1076.46,-350.8 1447.54,-350.8 1447.54,-530.8"/>
<text xml:space="preserve" text-anchor="start" x="1235.87" y="-473.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Radio</text>
<text xml:space="preserve" text-anchor="start" x="1187.59" y="-451.9" font-family="Arial" font-size="13.00" fill="#f9b27c">HopeRF RFM95W&#45;868S2</text>
<text xml:space="preserve" text-anchor="start" x="1096.51" y="-430.5" font-family="Arial" font-size="15.00" fill="#f9b27c">RFM95W transceiver transmitting on EU868 band</text>
<text xml:space="preserve" text-anchor="start" x="1113.82" y="-412.5" font-family="Arial" font-size="15.00" fill="#f9b27c">(863&#45;870MHz) with SF7&#45;SF12, +20dBm max</text>
<text xml:space="preserve" text-anchor="start" x="1171.96" y="-394.5" font-family="Arial" font-size="15.00" fill="#f9b27c">output, &#45;148dBm sensitivity</text>
</g>
<!-- memory -->
<g id="node4" class="node">
<title>memory</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1906.29,-530.8 1557.71,-530.8 1557.71,-350.8 1906.29,-350.8 1906.29,-530.8"/>
<text xml:space="preserve" text-anchor="start" x="1696.98" y="-473.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Storage</text>
<text xml:space="preserve" text-anchor="start" x="1640.24" y="-451.9" font-family="Arial" font-size="13.00" fill="#f9b27c">ATmega1284P EEPROM (4KB)</text>
<text xml:space="preserve" text-anchor="start" x="1577.76" y="-430.5" font-family="Arial" font-size="15.00" fill="#f9b27c">Built&#45;in EEPROM storing 41&#45;byte configuration</text>
<text xml:space="preserve" text-anchor="start" x="1578.19" y="-412.5" font-family="Arial" font-size="15.00" fill="#f9b27c">(DevEUI, AppEUI, AppKey, interval) persisting</text>
<text xml:space="preserve" text-anchor="start" x="1664.48" y="-394.5" font-family="Arial" font-size="15.00" fill="#f9b27c">across power cycles</text>
</g>
<!-- power -->
<g id="node5" class="node">
<title>power</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="2336.02,-530.8 2015.98,-530.8 2015.98,-350.8 2336.02,-350.8 2336.02,-530.8"/>
<text xml:space="preserve" text-anchor="start" x="2114.3" y="-464.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Power Supply</text>
<text xml:space="preserve" text-anchor="start" x="2136.62" y="-442.9" font-family="Arial" font-size="13.00" fill="#f9b27c">2× AA battery</text>
<text xml:space="preserve" text-anchor="start" x="2040.52" y="-421.5" font-family="Arial" font-size="15.00" fill="#f9b27c">2× AA battery power system with voltage</text>
<text xml:space="preserve" text-anchor="start" x="2143.06" y="-403.5" font-family="Arial" font-size="15.00" fill="#f9b27c">regulation</text>
</g>
<!-- firmware -->
<g id="node6" class="node">
<title>firmware</title>
<polygon fill="#6366f1" stroke="#4f46e5" stroke-width="0" points="1180.02,-862.8 859.98,-862.8 859.98,-682.8 1180.02,-682.8 1180.02,-862.8"/>
<text xml:space="preserve" text-anchor="start" x="978.33" y="-805.6" font-family="Arial" font-size="20.00" fill="#eef2ff">Firmware</text>
<text xml:space="preserve" text-anchor="start" x="946.31" y="-783.9" font-family="Arial" font-size="13.00" fill="#c7d2fe">Arduino C++ (PlatformIO)</text>
<text xml:space="preserve" text-anchor="start" x="887.02" y="-762.5" font-family="Arial" font-size="15.00" fill="#c7d2fe">Arduino&#45;based C++ firmware (704 lines)</text>
<text xml:space="preserve" text-anchor="start" x="900.35" y="-744.5" font-family="Arial" font-size="15.00" fill="#c7d2fe">handling sensor reading, LoRaWAN</text>
<text xml:space="preserve" text-anchor="start" x="884.51" y="-726.5" font-family="Arial" font-size="15.00" fill="#c7d2fe">communication, and power management</text>
</g>
<!-- mallemolen -->
<g id="node7" class="node">
<title>mallemolen</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="938.02,-180 617.98,-180 617.98,0 938.02,0 938.02,-180"/>
<text xml:space="preserve" text-anchor="start" x="677.41" y="-113.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Mallemolen Polder Mill</text>
<text xml:space="preserve" text-anchor="start" x="710.09" y="-92.1" font-family="Arial" font-size="13.00" fill="#c2f0c2">18th Century Water Mill</text>
<text xml:space="preserve" text-anchor="start" x="650.45" y="-70.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">Historic windmill built in 1727 for water</text>
<text xml:space="preserve" text-anchor="start" x="640.42" y="-52.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">management in the Gouda polder system</text>
</g>
<!-- lorawannetwork -->
<g id="node8" class="node">
<title>lorawannetwork</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="1443.39,-180 1080.61,-180 1080.61,0 1443.39,0 1443.39,-180"/>
<text xml:space="preserve" text-anchor="start" x="1175.31" y="-122.8" font-family="Arial" font-size="20.00" fill="#f8fafc">LoRaWAN Network</text>
<text xml:space="preserve" text-anchor="start" x="1163.38" y="-101.1" font-family="Arial" font-size="13.00" fill="#c2f0c2">LoRaWAN 1.0.x (EU868, Class A)</text>
<text xml:space="preserve" text-anchor="start" x="1114.86" y="-79.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">LoRaWAN network server receiving data via</text>
<text xml:space="preserve" text-anchor="start" x="1100.67" y="-61.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">EU868 band using OTAA activation with Class A</text>
<text xml:space="preserve" text-anchor="start" x="1206.96" y="-43.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">device operation</text>
</g>
<!-- backendserver -->
<g id="node9" class="node">
<title>backendserver</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="2089.92,-180 1748.08,-180 1748.08,0 2089.92,0 2089.92,-180"/>
<text xml:space="preserve" text-anchor="start" x="1824.53" y="-113.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Multiflexmeter Server</text>
<text xml:space="preserve" text-anchor="start" x="1833.39" y="-92.1" font-family="Arial" font-size="13.00" fill="#c2f0c2">Web Server (TTN Integration)</text>
<text xml:space="preserve" text-anchor="start" x="1773.51" y="-70.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">Web application receiving forwarded sensor</text>
<text xml:space="preserve" text-anchor="start" x="1768.13" y="-52.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">data from TTN via MQTT or HTTP integration</text>
</g>
<!-- sensor&#45;&gt;mallemolen -->
<g id="edge5" class="edge">
<title>sensor&#45;&gt;mallemolen</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M778,-350.88C778,-301.79 778,-240.68 778,-190.06"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="780.63,-190.28 778,-182.78 775.38,-190.28 780.63,-190.28"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="778,-240 778,-262.8 1012.01,-262.8 1012.01,-240 778,-240"/>
<text xml:space="preserve" text-anchor="start" x="781" y="-247.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Monitors environmental conditions at</text>
</g>
<!-- radio&#45;&gt;lorawannetwork -->
<g id="edge6" class="edge">
<title>radio&#45;&gt;lorawannetwork</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M1262,-350.88C1262,-301.79 1262,-240.68 1262,-190.06"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1264.63,-190.28 1262,-182.78 1259.38,-190.28 1264.63,-190.28"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1262,-240 1262,-262.8 1351.23,-262.8 1351.23,-240 1262,-240"/>
<text xml:space="preserve" text-anchor="start" x="1265" y="-247.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Transmits via</text>
</g>
<!-- firmware&#45;&gt;processor -->
<g id="edge1" class="edge">
<title>firmware&#45;&gt;processor</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M859.99,-729.88C771.49,-704.07 660.76,-667.39 566.88,-622.8 515.69,-598.48 462.59,-566.54 416.42,-536.27"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="418.11,-534.24 410.4,-532.3 415.22,-538.62 418.11,-534.24"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="566.88,-600 566.88,-622.8 811,-622.8 811,-600 566.88,-600"/>
<text xml:space="preserve" text-anchor="start" x="569.88" y="-607.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Controls pins, timers, and watchdog of</text>
</g>
<!-- firmware&#45;&gt;sensor -->
<g id="edge2" class="edge">
<title>firmware&#45;&gt;sensor</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M905.2,-682.92C885.81,-664.47 867.1,-644.11 851.99,-622.8 834.36,-597.92 819.98,-568.21 808.76,-540.12"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="811.34,-539.52 806.17,-533.49 806.45,-541.43 811.34,-539.52"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="851.99,-600 851.99,-622.8 1093,-622.8 1093,-600 851.99,-600"/>
<text xml:space="preserve" text-anchor="start" x="854.99" y="-607.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Sends I2C commands (0x10, 0x11) to</text>
</g>
<!-- firmware&#45;&gt;radio -->
<g id="edge3" class="edge">
<title>firmware&#45;&gt;radio</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M1085.17,-682.93C1117.79,-638.45 1157.34,-584.52 1190.76,-538.95"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1192.82,-540.58 1195.13,-532.98 1188.58,-537.48 1192.82,-540.58"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1141,-600 1141,-622.8 1388.95,-622.8 1388.95,-600 1141,-600"/>
<text xml:space="preserve" text-anchor="start" x="1144" y="-607.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Transmits LoRaWAN frames via SPI to</text>
</g>
<!-- firmware&#45;&gt;memory -->
<g id="edge4" class="edge">
<title>firmware&#45;&gt;memory</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M1179.86,-722.36C1275.81,-690.24 1399.01,-644.62 1503,-592 1535.09,-575.76 1568.21,-556.01 1598.94,-536.23"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1600.14,-538.59 1605.01,-532.3 1597.29,-534.18 1600.14,-538.59"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1478.14,-600 1478.14,-622.8 1671.68,-622.8 1671.68,-600 1478.14,-600"/>
<text xml:space="preserve" text-anchor="start" x="1481.14" y="-607.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Reads/writes 41&#45;byte config in</text>
</g>
<!-- lorawannetwork&#45;&gt;backendserver -->
<g id="edge7" class="edge">
<title>lorawannetwork&#45;&gt;backendserver</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M1443.27,-90C1534.97,-90 1645.98,-90 1737.69,-90"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1737.68,-92.63 1745.18,-90 1737.68,-87.38 1737.68,-92.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1498.21,-93 1498.21,-115.8 1693.25,-115.8 1693.25,-93 1498.21,-93"/>
<text xml:space="preserve" text-anchor="start" x="1501.21" y="-100.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Forwards MQTT/HTTP data to</text>
</g>
</g>
</svg>
`;case"view_18ug6g":return`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
 "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generated by graphviz version 13.1.2 (0)
 -->
<!-- Pages: 1 -->
<svg width="2373pt" height="1274pt"
 viewBox="0.00 0.00 2373.00 1274.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(15.05 1258.65)">
<g id="clust1" class="cluster">
<title>cluster_firmware</title>
<polygon fill="#2225aa" stroke="#2a2490" points="33,-614.8 33,-1235.6 1449,-1235.6 1449,-614.8 33,-614.8"/>
<text xml:space="preserve" text-anchor="start" x="41" y="-1222.7" font-family="Arial" font-weight="bold" font-size="11.00" fill="#c7d2fe" fill-opacity="0.701961">FIRMWARE</text>
</g>
<g id="clust2" class="cluster">
<title>cluster_hardware</title>
<polygon fill="#2225aa" stroke="#2a2490" points="8,-282.8 8,-564 2335,-564 2335,-282.8 8,-282.8"/>
<text xml:space="preserve" text-anchor="start" x="16" y="-551.1" font-family="Arial" font-weight="bold" font-size="11.00" fill="#c7d2fe" fill-opacity="0.701961">HARDWARE</text>
</g>
<!-- controller -->
<g id="node1" class="node">
<title>controller</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="924.21,-1174.4 569.79,-1174.4 569.79,-994.4 924.21,-994.4 924.21,-1174.4"/>
<text xml:space="preserve" text-anchor="start" x="679.2" y="-1126.2" font-family="Arial" font-size="20.00" fill="#ffe0c2">Main Controller</text>
<text xml:space="preserve" text-anchor="start" x="688.47" y="-1104.5" font-family="Arial" font-size="13.00" fill="#f9b27c">main.cpp (363 lines)</text>
<text xml:space="preserve" text-anchor="start" x="601.11" y="-1083.1" font-family="Arial" font-size="15.00" fill="#f9b27c">Orchestrates measurement cycle (20&#45;4270s</text>
<text xml:space="preserve" text-anchor="start" x="589.84" y="-1065.1" font-family="Arial" font-size="15.00" fill="#f9b27c">interval), handles LoRaWAN events, processes</text>
<text xml:space="preserve" text-anchor="start" x="606.53" y="-1047.1" font-family="Arial" font-size="15.00" fill="#f9b27c">downlink commands (0xDEAD reset, 0x10</text>
<text xml:space="preserve" text-anchor="start" x="675.3" y="-1029.1" font-family="Arial" font-size="15.00" fill="#f9b27c">interval, 0x11 sensor)</text>
</g>
<!-- hardwaredrivers -->
<g id="node2" class="node">
<title>hardwaredrivers</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1409.02,-1174.4 1088.98,-1174.4 1088.98,-994.4 1409.02,-994.4 1409.02,-1174.4"/>
<text xml:space="preserve" text-anchor="start" x="1171.21" y="-1117.2" font-family="Arial" font-size="20.00" fill="#ffe0c2">Hardware Drivers</text>
<text xml:space="preserve" text-anchor="start" x="1173.31" y="-1095.5" font-family="Arial" font-size="13.00" fill="#f9b27c">smbus.cpp + Arduino HAL</text>
<text xml:space="preserve" text-anchor="start" x="1112.27" y="-1074.1" font-family="Arial" font-size="15.00" fill="#f9b27c">Controls I2C bus (80kHz, smbus.cpp 177</text>
<text xml:space="preserve" text-anchor="start" x="1109.77" y="-1056.1" font-family="Arial" font-size="15.00" fill="#f9b27c">lines), SPI radio interface, GPIO pins, and</text>
<text xml:space="preserve" text-anchor="start" x="1168.55" y="-1038.1" font-family="Arial" font-size="15.00" fill="#f9b27c">watchdog timer for reset</text>
</g>
<!-- sensorinterface -->
<g id="node3" class="node">
<title>sensorinterface</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="446.8,-834.8 73.2,-834.8 73.2,-654.8 446.8,-654.8 446.8,-834.8"/>
<text xml:space="preserve" text-anchor="start" x="186.63" y="-777.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Sensor Interface</text>
<text xml:space="preserve" text-anchor="start" x="196.42" y="-755.9" font-family="Arial" font-size="13.00" fill="#f9b27c">sensors.cpp (23 lines)</text>
<text xml:space="preserve" text-anchor="start" x="96.63" y="-734.5" font-family="Arial" font-size="15.00" fill="#f9b27c">Triggers sensor measurement (CMD_PERFORM</text>
<text xml:space="preserve" text-anchor="start" x="93.26" y="-716.5" font-family="Arial" font-size="15.00" fill="#f9b27c">0x10), waits 10 seconds, reads data (CMD_READ</text>
<text xml:space="preserve" text-anchor="start" x="160.36" y="-698.5" font-family="Arial" font-size="15.00" fill="#f9b27c">0x11) via I2C at address 0x36</text>
</g>
<!-- settings -->
<g id="node4" class="node">
<title>settings</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="936.72,-834.8 557.28,-834.8 557.28,-654.8 936.72,-654.8 936.72,-834.8"/>
<text xml:space="preserve" text-anchor="start" x="668.62" y="-777.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Settings Manager</text>
<text xml:space="preserve" text-anchor="start" x="679.08" y="-755.9" font-family="Arial" font-size="13.00" fill="#f9b27c">rom_conf.cpp (80 lines)</text>
<text xml:space="preserve" text-anchor="start" x="577.34" y="-734.5" font-family="Arial" font-size="15.00" fill="#f9b27c">Manages 41&#45;byte EEPROM configuration: DevEUI,</text>
<text xml:space="preserve" text-anchor="start" x="612.35" y="-716.5" font-family="Arial" font-size="15.00" fill="#f9b27c">AppEUI, AppKey, measurement interval,</text>
<text xml:space="preserve" text-anchor="start" x="658.64" y="-698.5" font-family="Arial" font-size="15.00" fill="#f9b27c">firmware/hardware version</text>
</g>
<!-- networkstack -->
<g id="node5" class="node">
<title>networkstack</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1409.36,-834.8 1046.64,-834.8 1046.64,-654.8 1409.36,-654.8 1409.36,-834.8"/>
<text xml:space="preserve" text-anchor="start" x="1163.54" y="-777.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Network Stack</text>
<text xml:space="preserve" text-anchor="start" x="1166.23" y="-755.9" font-family="Arial" font-size="13.00" fill="#f9b27c">Arduino&#45;LMIC Library</text>
<text xml:space="preserve" text-anchor="start" x="1066.69" y="-734.5" font-family="Arial" font-size="15.00" fill="#f9b27c">Implements LoRaWAN 1.0.x protocol with OTAA</text>
<text xml:space="preserve" text-anchor="start" x="1105.43" y="-716.5" font-family="Arial" font-size="15.00" fill="#f9b27c">join, handles uplink transmission and</text>
<text xml:space="preserve" text-anchor="start" x="1111.67" y="-698.5" font-family="Arial" font-size="15.00" fill="#f9b27c">downlink reception on EU868 band</text>
</g>
<!-- processor -->
<g id="node6" class="node">
<title>processor</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1864.54,-502.8 1473.46,-502.8 1473.46,-322.8 1864.54,-322.8 1864.54,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="1623.99" y="-445.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Processor</text>
<text xml:space="preserve" text-anchor="start" x="1581.58" y="-423.9" font-family="Arial" font-size="13.00" fill="#f9b27c">ATmega1284P&#45;AU (TQFP&#45;44)</text>
<text xml:space="preserve" text-anchor="start" x="1509.36" y="-402.5" font-family="Arial" font-size="15.00" fill="#f9b27c">8&#45;bit AVR RISC processor running at 8MHz with</text>
<text xml:space="preserve" text-anchor="start" x="1493.51" y="-384.5" font-family="Arial" font-size="15.00" fill="#f9b27c">128KB Flash, 16KB SRAM, 4KB EEPROM, 32 GPIO</text>
<text xml:space="preserve" text-anchor="start" x="1655.24" y="-366.5" font-family="Arial" font-size="15.00" fill="#f9b27c">pins</text>
</g>
<!-- sensor -->
<g id="node7" class="node">
<title>sensor</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="424.04,-502.8 47.96,-502.8 47.96,-322.8 424.04,-322.8 424.04,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="204.32" y="-445.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Sensor</text>
<text xml:space="preserve" text-anchor="start" x="164.1" y="-423.9" font-family="Arial" font-size="13.00" fill="#f9b27c">I2C Sensor Board (0x36)</text>
<text xml:space="preserve" text-anchor="start" x="85.92" y="-402.5" font-family="Arial" font-size="15.00" fill="#f9b27c">I2C sensor board at address 0x36 measuring</text>
<text xml:space="preserve" text-anchor="start" x="68.02" y="-384.5" font-family="Arial" font-size="15.00" fill="#f9b27c">environmental data, responds to CMD_PERFORM</text>
<text xml:space="preserve" text-anchor="start" x="132.63" y="-366.5" font-family="Arial" font-size="15.00" fill="#f9b27c">(0x10) and CMD_READ (0x11)</text>
</g>
<!-- radio -->
<g id="node8" class="node">
<title>radio</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="1363.54,-502.8 992.46,-502.8 992.46,-322.8 1363.54,-322.8 1363.54,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="1151.87" y="-445.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Radio</text>
<text xml:space="preserve" text-anchor="start" x="1103.59" y="-423.9" font-family="Arial" font-size="13.00" fill="#f9b27c">HopeRF RFM95W&#45;868S2</text>
<text xml:space="preserve" text-anchor="start" x="1012.51" y="-402.5" font-family="Arial" font-size="15.00" fill="#f9b27c">RFM95W transceiver transmitting on EU868 band</text>
<text xml:space="preserve" text-anchor="start" x="1029.82" y="-384.5" font-family="Arial" font-size="15.00" fill="#f9b27c">(863&#45;870MHz) with SF7&#45;SF12, +20dBm max</text>
<text xml:space="preserve" text-anchor="start" x="1087.96" y="-366.5" font-family="Arial" font-size="15.00" fill="#f9b27c">output, &#45;148dBm sensitivity</text>
</g>
<!-- memory -->
<g id="node9" class="node">
<title>memory</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="882.29,-502.8 533.71,-502.8 533.71,-322.8 882.29,-322.8 882.29,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="672.98" y="-445.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Storage</text>
<text xml:space="preserve" text-anchor="start" x="616.24" y="-423.9" font-family="Arial" font-size="13.00" fill="#f9b27c">ATmega1284P EEPROM (4KB)</text>
<text xml:space="preserve" text-anchor="start" x="553.76" y="-402.5" font-family="Arial" font-size="15.00" fill="#f9b27c">Built&#45;in EEPROM storing 41&#45;byte configuration</text>
<text xml:space="preserve" text-anchor="start" x="554.19" y="-384.5" font-family="Arial" font-size="15.00" fill="#f9b27c">(DevEUI, AppEUI, AppKey, interval) persisting</text>
<text xml:space="preserve" text-anchor="start" x="640.48" y="-366.5" font-family="Arial" font-size="15.00" fill="#f9b27c">across power cycles</text>
</g>
<!-- power -->
<g id="node10" class="node">
<title>power</title>
<polygon fill="#a35829" stroke="#7e451d" stroke-width="0" points="2295.02,-502.8 1974.98,-502.8 1974.98,-322.8 2295.02,-322.8 2295.02,-502.8"/>
<text xml:space="preserve" text-anchor="start" x="2073.3" y="-436.6" font-family="Arial" font-size="20.00" fill="#ffe0c2">Power Supply</text>
<text xml:space="preserve" text-anchor="start" x="2095.62" y="-414.9" font-family="Arial" font-size="13.00" fill="#f9b27c">2× AA battery</text>
<text xml:space="preserve" text-anchor="start" x="1999.52" y="-393.5" font-family="Arial" font-size="15.00" fill="#f9b27c">2× AA battery power system with voltage</text>
<text xml:space="preserve" text-anchor="start" x="2102.06" y="-375.5" font-family="Arial" font-size="15.00" fill="#f9b27c">regulation</text>
</g>
<!-- mallemolen -->
<g id="node11" class="node">
<title>mallemolen</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="396.02,-180 75.98,-180 75.98,0 396.02,0 396.02,-180"/>
<text xml:space="preserve" text-anchor="start" x="135.41" y="-113.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Mallemolen Polder Mill</text>
<text xml:space="preserve" text-anchor="start" x="168.09" y="-92.1" font-family="Arial" font-size="13.00" fill="#c2f0c2">18th Century Water Mill</text>
<text xml:space="preserve" text-anchor="start" x="108.45" y="-70.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">Historic windmill built in 1727 for water</text>
<text xml:space="preserve" text-anchor="start" x="98.42" y="-52.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">management in the Gouda polder system</text>
</g>
<!-- lorawannetwork -->
<g id="node12" class="node">
<title>lorawannetwork</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="1359.39,-180 996.61,-180 996.61,0 1359.39,0 1359.39,-180"/>
<text xml:space="preserve" text-anchor="start" x="1091.31" y="-122.8" font-family="Arial" font-size="20.00" fill="#f8fafc">LoRaWAN Network</text>
<text xml:space="preserve" text-anchor="start" x="1079.38" y="-101.1" font-family="Arial" font-size="13.00" fill="#c2f0c2">LoRaWAN 1.0.x (EU868, Class A)</text>
<text xml:space="preserve" text-anchor="start" x="1030.86" y="-79.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">LoRaWAN network server receiving data via</text>
<text xml:space="preserve" text-anchor="start" x="1016.67" y="-61.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">EU868 band using OTAA activation with Class A</text>
<text xml:space="preserve" text-anchor="start" x="1122.96" y="-43.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">device operation</text>
</g>
<!-- backendserver -->
<g id="node13" class="node">
<title>backendserver</title>
<polygon fill="#428a4f" stroke="#2d5d39" stroke-width="0" points="2005.92,-180 1664.08,-180 1664.08,0 2005.92,0 2005.92,-180"/>
<text xml:space="preserve" text-anchor="start" x="1740.53" y="-113.8" font-family="Arial" font-size="20.00" fill="#f8fafc">Multiflexmeter Server</text>
<text xml:space="preserve" text-anchor="start" x="1749.39" y="-92.1" font-family="Arial" font-size="13.00" fill="#c2f0c2">Web Server (TTN Integration)</text>
<text xml:space="preserve" text-anchor="start" x="1689.51" y="-70.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">Web application receiving forwarded sensor</text>
<text xml:space="preserve" text-anchor="start" x="1684.13" y="-52.7" font-family="Arial" font-size="15.00" fill="#c2f0c2">data from TTN via MQTT or HTTP integration</text>
</g>
<!-- controller&#45;&gt;sensorinterface -->
<g id="edge1" class="edge">
<title>controller&#45;&gt;sensorinterface</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M570.09,-1008.99C527.16,-987.58 482.55,-962.36 443.99,-934.4 407.48,-907.92 371.8,-873.87 341.73,-841.99"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="343.71,-840.27 336.67,-836.59 339.88,-843.86 343.71,-840.27"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="443.99,-894.8 443.99,-934.4 720,-934.4 720,-894.8 443.99,-894.8"/>
<text xml:space="preserve" text-anchor="start" x="446.99" y="-918.8" font-family="Arial" font-size="14.00" fill="#c6c6c6">Triggers measurement cycle every 20&#45;4270</text>
<text xml:space="preserve" text-anchor="start" x="446.99" y="-902" font-family="Arial" font-size="14.00" fill="#c6c6c6">seconds</text>
</g>
<!-- controller&#45;&gt;settings -->
<g id="edge2" class="edge">
<title>controller&#45;&gt;settings</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M747,-994.7C747,-948.74 747,-892.47 747,-845.07"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="749.63,-845.31 747,-837.81 744.38,-845.31 749.63,-845.31"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="747,-894.8 747,-934.4 989.57,-934.4 989.57,-894.8 747,-894.8"/>
<text xml:space="preserve" text-anchor="start" x="750" y="-918.8" font-family="Arial" font-size="14.00" fill="#c6c6c6">Reads DevEUI, AppEUI, AppKey, and</text>
<text xml:space="preserve" text-anchor="start" x="750" y="-902" font-family="Arial" font-size="14.00" fill="#c6c6c6">interval from</text>
</g>
<!-- controller&#45;&gt;networkstack -->
<g id="edge3" class="edge">
<title>controller&#45;&gt;networkstack</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M921.92,-994.43C954.33,-975.84 987.3,-955.46 1017,-934.4 1055.94,-906.79 1095.71,-872.97 1130.07,-841.64"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1131.79,-843.62 1135.55,-836.62 1128.24,-839.75 1131.79,-843.62"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1066.23,-894.8 1066.23,-934.4 1287.8,-934.4 1287.8,-894.8 1066.23,-894.8"/>
<text xml:space="preserve" text-anchor="start" x="1069.23" y="-918.8" font-family="Arial" font-size="14.00" fill="#c6c6c6">Sends uplink packets and receives</text>
<text xml:space="preserve" text-anchor="start" x="1069.23" y="-902" font-family="Arial" font-size="14.00" fill="#c6c6c6">downlink commands</text>
</g>
<!-- hardwaredrivers&#45;&gt;processor -->
<g id="edge4" class="edge">
<title>hardwaredrivers&#45;&gt;processor</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M1335.96,-994.43C1377.73,-948.94 1426.69,-891.36 1464,-834.8 1532.71,-730.63 1592.72,-600.03 1629.77,-512.14"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1632.18,-513.16 1632.66,-505.23 1627.34,-511.13 1632.18,-513.16"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1582.82,-733.4 1582.82,-756.2 1826.94,-756.2 1826.94,-733.4 1582.82,-733.4"/>
<text xml:space="preserve" text-anchor="start" x="1585.82" y="-740.6" font-family="Arial" font-size="14.00" fill="#c6c6c6">Controls pins, timers, and watchdog of</text>
</g>
<!-- sensorinterface&#45;&gt;sensor -->
<g id="edge5" class="edge">
<title>sensorinterface&#45;&gt;sensor</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M253.54,-654.93C250.35,-611.1 246.49,-558.08 243.21,-512.94"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="245.84,-512.85 242.67,-505.56 240.6,-513.23 245.84,-512.85"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="248.72,-572 248.72,-594.8 489.73,-594.8 489.73,-572 248.72,-572"/>
<text xml:space="preserve" text-anchor="start" x="251.72" y="-579.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Sends I2C commands (0x10, 0x11) to</text>
</g>
<!-- settings&#45;&gt;memory -->
<g id="edge6" class="edge">
<title>settings&#45;&gt;memory</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M736.5,-654.93C731.32,-611.1 725.05,-558.08 719.72,-512.94"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="722.33,-512.69 718.84,-505.55 717.12,-513.3 722.33,-512.69"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="728.67,-572 728.67,-594.8 922.21,-594.8 922.21,-572 728.67,-572"/>
<text xml:space="preserve" text-anchor="start" x="731.67" y="-579.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Reads/writes 41&#45;byte config in</text>
</g>
<!-- networkstack&#45;&gt;radio -->
<g id="edge7" class="edge">
<title>networkstack&#45;&gt;radio</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M1214.54,-654.93C1207.89,-611.1 1199.86,-558.08 1193.02,-512.94"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1195.62,-512.56 1191.9,-505.53 1190.43,-513.34 1195.62,-512.56"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1204.5,-572 1204.5,-594.8 1452.45,-594.8 1452.45,-572 1204.5,-572"/>
<text xml:space="preserve" text-anchor="start" x="1207.5" y="-579.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Transmits LoRaWAN frames via SPI to</text>
</g>
<!-- sensor&#45;&gt;mallemolen -->
<g id="edge8" class="edge">
<title>sensor&#45;&gt;mallemolen</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M236,-322.87C236,-281.67 236,-232.56 236,-190.17"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="238.63,-190.36 236,-182.86 233.38,-190.36 238.63,-190.36"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="236,-240 236,-262.8 470.01,-262.8 470.01,-240 236,-240"/>
<text xml:space="preserve" text-anchor="start" x="239" y="-247.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Monitors environmental conditions at</text>
</g>
<!-- radio&#45;&gt;lorawannetwork -->
<g id="edge9" class="edge">
<title>radio&#45;&gt;lorawannetwork</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M1178,-322.87C1178,-281.67 1178,-232.56 1178,-190.17"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1180.63,-190.36 1178,-182.86 1175.38,-190.36 1180.63,-190.36"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1178,-240 1178,-262.8 1267.23,-262.8 1267.23,-240 1178,-240"/>
<text xml:space="preserve" text-anchor="start" x="1181" y="-247.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Transmits via</text>
</g>
<!-- lorawannetwork&#45;&gt;backendserver -->
<g id="edge10" class="edge">
<title>lorawannetwork&#45;&gt;backendserver</title>
<path fill="none" stroke="#6e6e6e" stroke-width="2" stroke-dasharray="5,2" d="M1359.27,-90C1450.97,-90 1561.98,-90 1653.69,-90"/>
<polygon fill="#6e6e6e" stroke="#6e6e6e" stroke-width="2" points="1653.68,-92.63 1661.18,-90 1653.68,-87.38 1653.68,-92.63"/>
<polygon fill="#18191b" fill-opacity="0.627451" stroke="none" points="1414.21,-93 1414.21,-115.8 1609.25,-115.8 1609.25,-93 1414.21,-93"/>
<text xml:space="preserve" text-anchor="start" x="1417.21" y="-100.2" font-family="Arial" font-size="14.00" fill="#c6c6c6">Forwards MQTT/HTTP data to</text>
</g>
</g>
</svg>
`;default:throw new Error("Unknown viewId: "+e)}}export{t as dotSource,n as svgSource};
