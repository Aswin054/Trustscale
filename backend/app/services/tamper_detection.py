import numpy as np
from datetime import datetime, timedelta
from app.models import DeviceReading
from app.extensions import db

class TamperDetector:
    
    # Threshold values
    WEIGHT_DRIFT_THRESHOLD = 5.0  # kg
    VOLTAGE_SPIKE_THRESHOLD = 250.0  # V
    MAGNETIC_FIELD_THRESHOLD = 1.0  # T (Tesla)
    FLOW_RATE_DROP_THRESHOLD = 0.3  # 30% drop
    
    @staticmethod
    def detect_weight_anomaly(current_weight, device_id, window_minutes=30):
        """Detect weight drift anomaly using historical data"""
        start_time = datetime.utcnow() - timedelta(minutes=window_minutes)
        
        # Get recent readings
        recent_readings = DeviceReading.query.filter(
            DeviceReading.device_id == device_id,
            DeviceReading.reading_type == 'weight',
            DeviceReading.timestamp >= start_time
        ).all()
        
        if len(recent_readings) < 5:
            return False
        
        # Calculate baseline
        weights = [r.value for r in recent_readings]
        baseline = np.median(weights)
        
        # Check drift
        drift = abs(current_weight - baseline)
        
        return drift > TamperDetector.WEIGHT_DRIFT_THRESHOLD
    
    @staticmethod
    def detect_voltage_anomaly(voltage, device_id, window_minutes=30):
        """Detect voltage spike indicating tamper"""
        start_time = datetime.utcnow() - timedelta(minutes=window_minutes)
        
        recent_readings = DeviceReading.query.filter(
            DeviceReading.device_id == device_id,
            DeviceReading.reading_type == 'power',
            DeviceReading.timestamp >= start_time
        ).all()
        
        if len(recent_readings) < 5:
            return voltage > TamperDetector.VOLTAGE_SPIKE_THRESHOLD
        
        # Extract voltages from metadata
        voltages = [
            r.extra_data.get('voltage', 0)  # CHANGED
            for r in recent_readings 
            if r.extra_data and 'voltage' in r.extra_data  # CHANGED
        ]
        
        if not voltages:
            return voltage > TamperDetector.VOLTAGE_SPIKE_THRESHOLD
        
        avg_voltage = np.mean(voltages)
        std_voltage = np.std(voltages)
        
        # Z-score anomaly detection
        if std_voltage > 0:
            z_score = abs((voltage - avg_voltage) / std_voltage)
            return z_score > 3.0
        
        return voltage > TamperDetector.VOLTAGE_SPIKE_THRESHOLD
    
    @staticmethod
    def detect_magnetic_tamper(magnetic_field, flow_rate, device_id, window_minutes=30):
        """Detect magnetic tampering in fuel dispenser"""
        # Check magnetic field threshold
        if magnetic_field > TamperDetector.MAGNETIC_FIELD_THRESHOLD:
            return True
        
        # Check flow rate irregularity
        start_time = datetime.utcnow() - timedelta(minutes=window_minutes)
        
        recent_readings = DeviceReading.query.filter(
            DeviceReading.device_id == device_id,
            DeviceReading.reading_type == 'flow_rate',
            DeviceReading.timestamp >= start_time
        ).all()
        
        if len(recent_readings) < 5:
            return False
        
        flow_rates = [r.value for r in recent_readings]
        avg_flow = np.mean(flow_rates)
        
        # Detect sudden drop in flow rate
        if avg_flow > 0:
            flow_drop = (avg_flow - flow_rate) / avg_flow
            if flow_drop > TamperDetector.FLOW_RATE_DROP_THRESHOLD:
                return True
        
        return False
    
    @staticmethod
    def analyze_pattern(device_id, hours=24):
        """Analyze patterns for ML-based anomaly detection"""
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        readings = DeviceReading.query.filter(
            DeviceReading.device_id == device_id,
            DeviceReading.timestamp >= start_time
        ).all()
        
        if len(readings) < 10:
            return {
                'status': 'insufficient_data',
                'anomaly_score': 0
            }
        
        values = [r.value for r in readings]
        
        # Simple statistical analysis
        mean_val = np.mean(values)
        std_val = np.std(values)
        
        # Count anomalies
        anomalies = sum(1 for r in readings if r.is_anomaly)
        anomaly_rate = anomalies / len(readings)
        
        # Calculate anomaly score (0-100)
        anomaly_score = min(100, int(anomaly_rate * 200))
        
        return {
            'status': 'analyzed',
            'total_readings': len(readings),
            'anomaly_count': anomalies,
            'anomaly_rate': round(anomaly_rate * 100, 2),
            'anomaly_score': anomaly_score,
            'mean_value': round(mean_val, 2),
            'std_deviation': round(std_val, 2)
        }
