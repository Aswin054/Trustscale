from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.api import weighing_scale_bp
from app.extensions import db
from app.models import Device, DeviceReading, TamperAlert
from app.services.data_simulator import DataSimulator
from app.services.tamper_detection import TamperDetector
from datetime import datetime, timedelta

@weighing_scale_bp.route('/live-data', methods=['GET'])
@jwt_required()
def get_live_data():
    """Get real-time simulated weighing scale data"""
    inject_tamper = request.args.get('tamper', 'false').lower() == 'true'
    num_points = int(request.args.get('points', 50))
    
    data = DataSimulator.generate_weighing_scale_data(
        num_points=num_points,
        inject_tamper=inject_tamper
    )
    
    return jsonify({
        'device_type': 'weighing_scale',
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@weighing_scale_bp.route('/readings/<int:device_id>', methods=['GET'])
@jwt_required()
def get_readings(device_id):
    """Get historical readings for a weighing scale"""
    device = Device.query.filter_by(id=device_id, device_type='weighing_scale').first()
    
    if not device:
        return jsonify({'error': 'Weighing scale not found'}), 404
    
    # Get time range from query params
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


@weighing_scale_bp.route('/readings/<int:device_id>', methods=['POST'])
@jwt_required()
def add_reading(device_id):
    """Add a new reading for weighing scale"""
    device = Device.query.filter_by(id=device_id, device_type='weighing_scale').first()
    
    if not device:
        return jsonify({'error': 'Weighing scale not found'}), 404
    
    data = request.get_json()
    
    # Detect anomaly
    is_anomaly = TamperDetector.detect_weight_anomaly(
        current_weight=data.get('weight'),
        device_id=device_id
    )
    
    reading = DeviceReading(
        device_id=device_id,
        reading_type='weight',
        value=data.get('weight'),
        unit='kg',
        is_anomaly=is_anomaly,
        extra_data=data.get('metadata', {})  # CHANGED
    )
    
    db.session.add(reading)
    
    # Create alert if anomaly detected
    if is_anomaly:
        alert = TamperAlert(
            device_id=device_id,
            alert_type='weight_drift',
            severity='high',
            description=f'Abnormal weight detected: {data.get("weight")} kg'
        )
        db.session.add(alert)
        device.status = 'tampered'
    
    db.session.commit()
    
    return jsonify({
        'reading': reading.to_dict(),
        'anomaly_detected': is_anomaly
    }), 201


@weighing_scale_bp.route('/analytics/<int:device_id>', methods=['GET'])
@jwt_required()
def get_analytics(device_id):
    """Get analytics for weighing scale"""
    device = Device.query.filter_by(id=device_id, device_type='weighing_scale').first()
    
    if not device:
        return jsonify({'error': 'Weighing scale not found'}), 404
    
    # Get readings from last 7 days
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
    
    weights = [r.value for r in readings]
    anomaly_count = sum(1 for r in readings if r.is_anomaly)
    
    analytics = {
        'device_id': device_id,
        'total_readings': len(readings),
        'anomaly_count': anomaly_count,
        'anomaly_percentage': round((anomaly_count / len(readings)) * 100, 2),
        'avg_weight': round(sum(weights) / len(weights), 2),
        'min_weight': round(min(weights), 2),
        'max_weight': round(max(weights), 2),
        'weight_drift': round(max(weights) - min(weights), 2),
        'last_calibration': device.last_calibration.isoformat() if device.last_calibration else None
    }
    
    return jsonify(analytics), 200


@weighing_scale_bp.route('/status', methods=['GET'])
@jwt_required()
def get_all_status():
    """Get status of all weighing scales"""
    devices = Device.query.filter_by(device_type='weighing_scale').all()
    
    status_list = []
    for device in devices:
        # Get latest reading
        latest_reading = DeviceReading.query.filter_by(device_id=device.id)\
            .order_by(DeviceReading.timestamp.desc()).first()
        
        # Get active alerts
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
