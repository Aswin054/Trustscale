from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.api import energy_meter_bp
from app.extensions import db
from app.models import Device, DeviceReading, TamperAlert
from app.services.data_simulator import DataSimulator
from app.services.tamper_detection import TamperDetector
from datetime import datetime, timedelta

@energy_meter_bp.route('/live-data', methods=['GET'])
@jwt_required()
def get_live_data():
    """Get real-time simulated energy meter data"""
    inject_tamper = request.args.get('tamper', 'false').lower() == 'true'
    num_points = int(request.args.get('points', 50))
    
    data = DataSimulator.generate_energy_meter_data(
        num_points=num_points,
        inject_tamper=inject_tamper
    )
    
    return jsonify({
        'device_type': 'energy_meter',
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@energy_meter_bp.route('/readings/<int:device_id>', methods=['GET'])
@jwt_required()
def get_readings(device_id):
    """Get historical readings for energy meter"""
    device = Device.query.filter_by(id=device_id, device_type='energy_meter').first()
    
    if not device:
        return jsonify({'error': 'Energy meter not found'}), 404
    
    hours = int(request.args.get('hours', 24))
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    readings = DeviceReading.query.filter(
        DeviceReading.device_id == device_id,
        DeviceReading.timestamp >= start_time
    ).order_by(DeviceReading.timestamp.asc()).all()
    
    return jsonify({
        'device_id': device_id,
        'readings': [r.to_dict() for r in readings],
        'total': len(readings)
    }), 200


@energy_meter_bp.route('/readings/<int:device_id>', methods=['POST'])
@jwt_required()
def add_reading(device_id):
    """Add new energy meter reading"""
    device = Device.query.filter_by(id=device_id, device_type='energy_meter').first()
    
    if not device:
        return jsonify({'error': 'Energy meter not found'}), 404
    
    data = request.get_json()
    
    # Detect voltage spike anomaly
    is_anomaly = TamperDetector.detect_voltage_anomaly(
        voltage=data.get('voltage'),
        device_id=device_id
    )
    
    reading = DeviceReading(
        device_id=device_id,
        reading_type='power',
        value=data.get('power'),
        unit='kW',
        is_anomaly=is_anomaly,
        extra_data={  # CHANGED
            'voltage': data.get('voltage'),
            'current': data.get('current')
        }
    )
    
    db.session.add(reading)
    
    # Create alert if voltage spike detected
    if is_anomaly:
        alert = TamperAlert(
            device_id=device_id,
            alert_type='voltage_spike',
            severity='critical',
            description=f'Voltage spike detected: {data.get("voltage")} V'
        )
        db.session.add(alert)
        device.status = 'tampered'
    
    db.session.commit()
    
    return jsonify({
        'reading': reading.to_dict(),
        'anomaly_detected': is_anomaly
    }), 201


@energy_meter_bp.route('/analytics/<int:device_id>', methods=['GET'])
@jwt_required()
def get_analytics(device_id):
    """Get analytics for energy meter"""
    device = Device.query.filter_by(id=device_id, device_type='energy_meter').first()
    
    if not device:
        return jsonify({'error': 'Energy meter not found'}), 404
    
    start_time = datetime.utcnow() - timedelta(days=7)
    readings = DeviceReading.query.filter(
        DeviceReading.device_id == device_id,
        DeviceReading.timestamp >= start_time
    ).all()
    
    if not readings:
        return jsonify({
            'device_id': device_id,
            'message': 'No data available'
        }), 200
    
    power_values = [r.value for r in readings]
    voltages = [r.metadata.get('voltage', 0) for r in readings if r.metadata]
    anomaly_count = sum(1 for r in readings if r.is_anomaly)
    
    analytics = {
        'device_id': device_id,
        'total_readings': len(readings),
        'anomaly_count': anomaly_count,
        'avg_power': round(sum(power_values) / len(power_values), 3),
        'avg_voltage': round(sum(voltages) / len(voltages), 2) if voltages else 0,
        'peak_power': round(max(power_values), 3),
        'total_energy_consumed': round(sum(power_values) * 0.1, 2),  # Approximate kWh
        'voltage_spikes': anomaly_count
    }
    
    return jsonify(analytics), 200


@energy_meter_bp.route('/status', methods=['GET'])
@jwt_required()
def get_all_status():
    """Get status of all energy meters"""
    devices = Device.query.filter_by(device_type='energy_meter').all()
    
    status_list = []
    for device in devices:
        latest_reading = DeviceReading.query.filter_by(device_id=device.id)\
            .order_by(DeviceReading.timestamp.desc()).first()
        
        active_alerts = TamperAlert.query.filter_by(
            device_id=device.id,
            resolved=False
        ).count()
        
        status_list.append({
            'device': device.to_dict(),
            'latest_reading': latest_reading.to_dict() if latest_reading else None,
            'active_alerts': active_alerts
        })
    
    return jsonify(status_list), 200
