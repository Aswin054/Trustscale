import random
import numpy as np
from datetime import datetime, timedelta

class DataSimulator:
    
    @staticmethod
    def generate_weighing_scale_data(num_points=100, inject_tamper=False):
        """Generate simulated weighing scale data"""
        data = []
        base_weight = 50.0  # kg
        
        for i in range(num_points):
            timestamp = datetime.utcnow() - timedelta(minutes=num_points - i)
            
            # Normal operation with small variations
            weight = base_weight + np.random.normal(0, 0.5)
            
            # Inject tamper anomaly
            is_anomaly = False
            if inject_tamper and i > num_points * 0.7 and random.random() < 0.3:
                weight += random.uniform(5, 15)  # Significant weight drift
                is_anomaly = True
            
            data.append({
                'timestamp': timestamp.isoformat(),
                'weight': round(weight, 2),
                'unit': 'kg',
                'is_anomaly': is_anomaly,
                'calibration_drift': round(abs(weight - base_weight), 2)
            })
        
        return data
    
    @staticmethod
    def generate_energy_meter_data(num_points=100, inject_tamper=False):
        """Generate simulated energy meter data"""
        data = []
        base_voltage = 230.0  # V
        base_current = 5.0    # A
        
        for i in range(num_points):
            timestamp = datetime.utcnow() - timedelta(minutes=num_points - i)
            
            # Normal operation
            voltage = base_voltage + np.random.normal(0, 2)
            current = base_current + np.random.normal(0, 0.5)
            power = (voltage * current) / 1000  # kW
            
            # Inject tamper anomaly
            is_anomaly = False
            if inject_tamper and i > num_points * 0.6 and random.random() < 0.25:
                voltage += random.uniform(20, 50)  # Voltage spike
                is_anomaly = True
            
            data.append({
                'timestamp': timestamp.isoformat(),
                'voltage': round(voltage, 2),
                'current': round(current, 2),
                'power': round(power, 3),
                'unit': 'kW',
                'is_anomaly': is_anomaly
            })
        
        return data
    
    @staticmethod
    def generate_fuel_dispenser_data(num_points=100, inject_tamper=False):
        """Generate simulated fuel dispenser data"""
        data = []
        base_flow_rate = 3.2  # L/min
        totalizer = 1000.0    # L
        
        for i in range(num_points):
            timestamp = datetime.utcnow() - timedelta(seconds=num_points - i)
            
            # Normal operation
            flow_rate = base_flow_rate + np.random.normal(0, 0.2)
            totalizer += flow_rate / 60  # Add per second
            
            pulse_count = int(flow_rate * 10)
            magnetic_field = random.uniform(0.1, 0.5)
            pressure = 2.5 + np.random.normal(0, 0.1)
            
            # Inject tamper anomaly
            is_anomaly = False
            if inject_tamper and i > num_points * 0.7 and random.random() < 0.3:
                magnetic_field += random.uniform(2, 5)  # Magnetic tampering
                flow_rate *= random.uniform(0.7, 0.9)   # Flow irregularity
                is_anomaly = True
            
            data.append({
                'timestamp': timestamp.isoformat(),
                'flow_rate': round(flow_rate, 2),
                'totalizer': round(totalizer, 2),
                'pulse_count': pulse_count,
                'magnetic_field': round(magnetic_field, 2),
                'pressure': round(pressure, 2),
                'nozzle_state': 'open' if flow_rate > 1 else 'closed',
                'unit': 'L/min',
                'is_anomaly': is_anomaly
            })
        
        return data
    
    @staticmethod
    def detect_anomalies(data_points, threshold=2.5):
        """Simple anomaly detection using z-score"""
        values = [point['value'] for point in data_points if 'value' in point]
        
        if len(values) < 3:
            return data_points
        
        mean = np.mean(values)
        std = np.std(values)
        
        for point in data_points:
            if 'value' in point:
                z_score = abs((point['value'] - mean) / std) if std > 0 else 0
                point['is_anomaly'] = z_score > threshold
        
        return data_points
