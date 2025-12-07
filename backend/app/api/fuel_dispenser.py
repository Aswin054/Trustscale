from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.api import fuel_dispenser_bp
from app.extensions import db
from app.models import Device, DeviceReading, TamperAlert
from app.services.data_simulator import DataSimulator
from app.services.tamper_detection import TamperDetector
from datetime import datetime, timedelta

@fuel_dispenser_bp.route('/live-data', methods=['GET'])
@jwt_required()
def get_live_data():
    """Get real-time simulated fuel dispenser data"""
    inject_tamper = request.args.get('tamper', 'false').lower() == 'true'
    num_points = int(request.args.get('points', 50))
    
    data = DataSimulator.generate_fuel_dispenser_data(
        num_points=num_points,
        inject_tamper=inject_tamper
    )
    
    return jsonify({
        'device_type': 'fuel_dispenser',
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@fuel_dispenser_bp.route('/readings/<int:device_id>', methods=['GET'])
@jwt_required()
def get_readings(device_id):
    """Get historical readings for fuel dispenser"""
    device = Device.query.filter_by(id=device_id, device_type='fuel_dispenser').first()
    
    if not device:
        return jsonify({'error': 'Fuel dispenser not found'}), 404
    
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


@fuel_dispenser_bp.route('/readings/<int:device_id>', methods=['POST'])
@jwt_required()
def add_reading(device_id):
    """Add new fuel dispenser reading"""
    device = Device.query.filter_by(id=device_id, device_type='fuel_dispenser').first()
    
    if not device:
        return jsonify({'error': 'Fuel dispenser not found'}), 404
    
    data = request.get_json()
    
    # Detect magnetic tamper or flow irregularity
    is_anomaly = TamperDetector.detect_magnetic_tamper(
        magnetic_field=data.get('magnetic_field'),
        flow_rate=data.get('flow_rate'),
        device_id=device_id
    )
    
    reading = DeviceReading(
        device_id=device_id,
        reading_type='flow_rate',
        value=data.get('flow_rate'),
        unit='L/min',
        is_anomaly=is_anomaly,
        extra_data={  # CHANGED
            'totalizer': data.get('totalizer'),
            'pulse_count': data.get('pulse_count'),
            'magnetic_field': data.get('magnetic_field'),
            'pressure': data.get('pressure'),
            'nozzle_state': data.get('nozzle_state')
        }
    )
    
    db.session.add(reading)
    
    # Create alert if tamper detected
    if is_anomaly:
        alert = TamperAlert(
            device_id=device_id,
            alert_type='magnetic_tamper',
            severity='critical',
            description=f'Magnetic tampering detected. Field: {data.get("magnetic_field")} T'
        )
        db.session.add(alert)
        device.status = 'tampered'
    
    db.session.commit()
    
    return jsonify({
        'reading': reading.to_dict(),
        'anomaly_detected': is_anomaly
    }), 201


@fuel_dispenser_bp.route('/analytics/<int:device_id>', methods=['GET'])
@jwt_required()
def get_analytics(device_id):
    """Get analytics for fuel dispenser"""
    device = Device.query.filter_by(id=device_id, device_type='fuel_dispenser').first()
    
    if not device:
        return jsonify({'error': 'Fuel dispenser not found'}), 404
    
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
    
    flow_rates = [r.value for r in readings]
    anomaly_count = sum(1 for r in readings if r.is_anomaly)
    magnetic_fields = [r.metadata.get('magnetic_field', 0) for r in readings if r.metadata]
    
    analytics = {
        'device_id': device_id,
        'total_readings': len(readings),
        'anomaly_count': anomaly_count,
        'avg_flow_rate': round(sum(flow_rates) / len(flow_rates), 2),
        'peak_flow_rate': round(max(flow_rates), 2),
        'total_fuel_dispensed': round(sum(flow_rates) * 0.016, 2),  # Approximate liters
        'magnetic_tamper_count': anomaly_count,
        'avg_magnetic_field': round(sum(magnetic_fields) / len(magnetic_fields), 2) if magnetic_fields else 0
    }
    
    return jsonify(analytics), 200


@fuel_dispenser_bp.route('/real-time-status/<int:device_id>', methods=['GET'])
@jwt_required()
def get_realtime_status(device_id):
    """Get real-time operational status for fuel dispenser"""
    device = Device.query.filter_by(id=device_id, device_type='fuel_dispenser').first()
    
    if not device:
        return jsonify({'error': 'Fuel dispenser not found'}), 404
    
    # Get latest reading
    latest_reading = DeviceReading.query.filter_by(device_id=device.id)\
        .order_by(DeviceReading.timestamp.desc()).first()
    
    # Get active alerts
    active_alerts = TamperAlert.query.filter_by(
        device_id=device.id,
        resolved=False
    ).all()
    
    if not latest_reading:
        return jsonify({
            'device_id': device_id,
            'status': 'No data available'
        }), 200
    
    metadata = latest_reading.metadata or {}
    
    status = {
        'device_id': device_id,
        'device_status': device.status,
        'flow_rate': latest_reading.value,
        'totalizer': metadata.get('totalizer', 0),
        'pulse_count': metadata.get('pulse_count', 0),
        'magnetic_field': metadata.get('magnetic_field', 0),
        'magnetic_field_status': 'HIGH' if metadata.get('magnetic_field', 0) > 1.0 else 'LOW',
        'pressure': metadata.get('pressure', 0),
        'pressure_status': 'NORMAL' if 2.0 <= metadata.get('pressure', 0) <= 3.0 else 'ABNORMAL',
        'nozzle_state': metadata.get('nozzle_state', 'unknown'),
        'valve_state': 'OK',
        'active_alerts': [alert.to_dict() for alert in active_alerts],
        'last_update': latest_reading.timestamp.isoformat()
    }
    
    return jsonify(status), 200


@fuel_dispenser_bp.route('/status', methods=['GET'])
@jwt_required()
def get_all_status():
    """Get status of all fuel dispensers"""
    devices = Device.query.filter_by(device_type='fuel_dispenser').all()
    
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
