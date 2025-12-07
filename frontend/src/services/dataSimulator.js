// Client-side data simulator for real-time updates
export class DataSimulator {
  static generateWeighingScaleData(count = 1) {
    const baseWeight = 50.0;
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const weight = baseWeight + (Math.random() - 0.5) * 2;
      data.push({
        timestamp: new Date().toISOString(),
        weight: parseFloat(weight.toFixed(2)),
        unit: 'kg',
        calibration_drift: parseFloat(Math.abs(weight - baseWeight).toFixed(2))
      });
    }
    
    return data;
  }

  static generateEnergyMeterData(count = 1) {
    const baseVoltage = 230.0;
    const baseCurrent = 5.0;
    const data = [];
    
    for (let i = 0; i < count; i++) {
      const voltage = baseVoltage + (Math.random() - 0.5) * 10;
      const current = baseCurrent + (Math.random() - 0.5) * 2;
      const power = (voltage * current) / 1000;
      
      data.push({
        timestamp: new Date().toISOString(),
        voltage: parseFloat(voltage.toFixed(2)),
        current: parseFloat(current.toFixed(2)),
        power: parseFloat(power.toFixed(3)),
        unit: 'kW'
      });
    }
    
    return data;
  }

  static generateFuelDispenserData(count = 1) {
    const baseFlowRate = 3.2;
    const data = [];
    let totalizer = 1000.0;
    
    for (let i = 0; i < count; i++) {
      const flowRate = baseFlowRate + (Math.random() - 0.5) * 0.5;
      totalizer += flowRate / 60;
      
      data.push({
        timestamp: new Date().toISOString(),
        flow_rate: parseFloat(flowRate.toFixed(2)),
        totalizer: parseFloat(totalizer.toFixed(2)),
        pulse_count: Math.floor(flowRate * 10),
        magnetic_field: parseFloat((Math.random() * 0.6).toFixed(2)),
        pressure: parseFloat((2.5 + (Math.random() - 0.5) * 0.3).toFixed(2)),
        nozzle_state: flowRate > 1 ? 'open' : 'closed',
        unit: 'L/min'
      });
    }
    
    return data;
  }
}
