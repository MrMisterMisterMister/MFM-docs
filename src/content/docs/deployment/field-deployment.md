---
title: Field Deployment
description: Best practices for installing and deploying Multiflexmeter V3.7.0 devices in the field
---

# Field Deployment

Best practices and guidelines for installing Multiflexmeter V3.7.0 devices in production environments.

## Pre-Deployment Checklist

### Hardware Preparation

- ✅ Firmware uploaded and tested
- ✅ EEPROM configured with TTN credentials
- ✅ Device successfully joins TTN (test in lab)
- ✅ Antenna properly connected
- ✅ Enclosure is waterproof/weatherproof
- ✅ Power supply tested (battery or mains)
- ✅ Sensor connected and tested
- ✅ Mounting hardware prepared

### Software Configuration

- ✅ Device registered in TTN
- ✅ Payload decoder configured
- ✅ Measurement interval optimized
- ✅ Fair Use Policy enabled
- ✅ Integrations set up (webhooks, storage)
- ✅ Monitoring/alerts configured

### Documentation

- ✅ Device ID recorded
- ✅ Installation location noted (GPS coordinates)
- ✅ Installation date logged
- ✅ Sensor calibration data saved
- ✅ Contact information for site access

## Site Selection

### LoRaWAN Coverage

**Check gateway coverage:**
1. Use TTN Mapper: https://ttnmapper.org/
2. Look for existing gateways in area
3. Check coverage maps from gateway owners
4. Perform site survey with test device

**Minimum requirements:**
- RSSI: Better than -120 dBm
- SNR: Greater than -10 dB
- Gateway distance: Typically <5km urban, <15km rural

### Environmental Considerations

**Temperature:**
- Operating range: -20°C to +60°C
- Avoid direct sunlight (use shade or reflective enclosure)
- Avoid extreme cold (insulation may be needed)

**Humidity:**
- Use IP65+ rated enclosure
- Include desiccant packets
- Ensure all cable entries are sealed

**Physical security:**
- Install out of reach (>2m height)
- Use tamper-proof screws
- Consider camera surveillance
- Mark with ownership labels

## Installation Process

### Step 1: Power Supply

**Battery-Powered:**
- Use high-capacity Li-ion or LiFePO4 batteries
- Calculate runtime:
  ```
  Runtime = Battery_mAh / ((Sleep_mA × Sleep_Time + TX_mA × TX_Time) / Interval)
  
  Example: 10,000 mAh battery, 300s interval
  Sleep: 0.5 mA for 299s
  TX: 120 mA for 1s
  Average: (0.5×299 + 120×1) / 300 ≈ 0.9 mA
  Runtime: 10000 / 0.9 ≈ 11,000 hours (1.25 years)
  ```
- Include solar panel for long-term deployments
- Monitor battery voltage via sensor channel

**Mains-Powered:**
- Use regulated 5V power supply
- Include surge protection
- Use UPS for critical deployments
- Ensure proper grounding

### Step 2: Antenna Placement

**Mounting:**
- Mount antenna **vertically** for optimal omnidirectional pattern
- Keep antenna **outside** enclosure (or use window if plastic)
- Use quality RP-SMA antenna (3dBi or 5dBi)
- Minimum distance from metal objects: 10cm

**Cable:**
- Use low-loss coaxial cable (<1m if possible)
- Avoid sharp bends (minimum radius: 5× cable diameter)
- Weatherproof all connections
- Check SWR if using long cable

### Step 3: Sensor Installation

**Connection:**
- Use shielded cable for I²C (reduces noise)
- Keep cable length <2m for reliability
- Ensure proper pullup resistors (4.7kΩ)
- Use IP68 rated connectors

**Calibration:**
- Perform initial calibration in known conditions
- Record baseline values
- Set expected value ranges
- Configure alerts for out-of-range readings

### Step 4: Enclosure

**Requirements:**
- IP rating: Minimum IP65 (dust-tight, water jet resistant)
- Material: UV-resistant plastic or metal
- Size: Allow for airflow and service access
- Cable glands: Waterproof for all entries

**Internal layout:**
- Secure PCB with standoffs
- Route cables neatly (zip ties)
- Label all connections
- Include maintenance log card

### Step 5: Mounting

**Options:**
- Wall mount: Use stainless steel brackets
- Pole mount: Use stainless steel clamps
- DIN rail: Inside control cabinets
- Magnetic mount: For metal surfaces (temporary)

**Accessibility:**
- Allow access for maintenance
- Consider ladder requirements
- Mark installation height on documentation
- Ensure safe working area

## Initial Testing

### On-Site Verification

1. **Power-On Test**
   - Connect serial console (if accessible)
   - Verify LED blinks (configuration valid)
   - Wait for OTAA join
   - Confirm successful join

2. **First Uplink**
   - Wait for first measurement
   - Check TTN Console for uplink
   - Verify decoded payload is correct
   - Check RSSI/SNR values

3. **Signal Quality**
   - RSSI: Target >-110 dBm
   - SNR: Target >0 dB
   - Spreading Factor: SF7-SF9 optimal
   - If poor signal: adjust antenna or relocate

4. **Sensor Test**
   - Verify sensor readings are reasonable
   - Compare to known reference values
   - Check all channels are updating
   - Test sensor power cycling

## Maintenance

### Routine Checks

**Weekly (first month):**
- Check uplink success rate (>95%)
- Monitor battery level
- Verify sensor readings
- Check for alerts/errors

**Monthly:**
- Inspect physical condition
- Clean enclosure exterior
- Check cable connections
- Verify antenna is secure

**Quarterly:**
- Sensor calibration check
- Battery health test
- Firmware update check
- Documentation update

### Battery Replacement

1. Schedule during dry weather
2. Bring replacement battery (fully charged)
3. Note old battery voltage
4. Swap quickly (device has capacitor holdover ~30s)
5. Verify device rejoins network
6. Dispose of old battery properly

### Troubleshooting On-Site

**No Uplinks:**
- Check power supply voltage
- Inspect antenna connection
- Verify no physical damage
- Check serial debug output
- Consider gateway issues

**Poor Signal Quality:**
- Relocate antenna (higher/different position)
- Check for new obstructions
- Verify antenna is not damaged
- Consider using higher gain antenna
- Check gateway status

**Sensor Errors:**
- Verify sensor power
- Check I²C cable integrity
- Measure pullup resistor values
- Try different sensor address
- Replace sensor if faulty

## Documentation

### Installation Record

Create installation record document:

```
Device ID: mfm-sensor-001
TTN DevEUI: 0004A30B00F8AC2D
Location: Building A, North Wall
GPS: 52.3728, 4.8951
Installed: 2024-01-15
Installer: John Doe

Hardware:
- Antenna: 3dBi RP-SMA whip
- Enclosure: IP65 ABS, 200×150×75mm
- Power: 10Ah LiFePO4 + 10W solar
- Sensor: Model XYZ, S/N 12345

Configuration:
- Interval: 300s (5 min)
- Fair Use: Enabled
- Firmware: v1.3.7

Initial Readings:
- RSSI: -87 dBm
- SNR: 8.5 dB
- SF: 7
- Battery: 12.6V

Notes:
- Mounted 3m height on wall
- Direct view to gateway (~2km)
- Solar panel facing south
```

### Maintenance Log

Keep maintenance log:

```
Date       | Action             | By      | Notes
-----------|--------------------|---------|-----------------
2024-01-15 | Initial install    | J. Doe  | RSSI -87 dBm
2024-02-15 | Routine check      | J. Doe  | All OK
2024-05-10 | Battery replacement| J. Smith| Old: 11.8V
2024-08-01 | Firmware update    | J. Doe  | v1.3.0 → v1.3.7
```

## Decommissioning

### Removal Process

1. **Notify stakeholders**
   - Schedule removal date
   - Coordinate site access
   - Update monitoring systems

2. **Data backup**
   - Download historical data from TTN
   - Save final sensor readings
   - Export device configuration

3. **Physical removal**
   - Power off device
   - Disconnect sensor
   - Remove antenna
   - Unmount enclosure
   - Restore site (fill holes, paint, etc.)

4. **TTN cleanup**
   - Delete device from application
   - Remove webhooks/integrations
   - Archive documentation

## Deployment Scenarios

### Scenario 1: Urban Environment

- **Challenge:** Gateway coverage good, but RF interference
- **Solution:** Use SF7, short intervals (2-3 min), higher mounting
- **Power:** Mains or solar (sufficient sunlight)
- **Enclosure:** Secure, anti-vandal

### Scenario 2: Rural/Agricultural

- **Challenge:** Long distances to gateway (5-15km)
- **Solution:** Use SF9-SF12, longer intervals (10-15 min), high mounting
- **Power:** Solar + large battery bank
- **Enclosure:** Weatherproof, animal-proof

### Scenario 3: Industrial

- **Challenge:** Metal structures, electrical noise
- **Solution:** External antenna, shielded cables, grounded enclosure
- **Power:** Mains with UPS backup
- **Enclosure:** Explosion-proof if required

## Next Steps

- [Configuration](/deployment/configuration/) - Configure device settings
- [TTN Setup](/deployment/ttn-setup/) - Network configuration
- [Troubleshooting](/troubleshooting/common-issues/) - Common problems
