from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.api import devices_bp
from app.extensions import db
from app.models import Device, DeviceReading, TamperAlert
from datetime import datetime, timedelta

@devices_bp.route('/', methods=['GET'])
@jwt_required()
def get_devices():
    device_type = request.args.get('type')
    
    query = Device.query
    if device_type:
        query = query.filter_by(device_type=device_type)
    
    devices = query.all()
    return jsonify([device.to_dict() for device in devices]), 200


@devices_bp.route('/<int:device_id>', methods=['GET'])
@jwt_required()
def get_device(device_id):
    device = Device.query.get(device_id)
    
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    
    return jsonify(device.to_dict()), 200


@devices_bp.route('/', methods=['POST'])
@jwt_required()
def create_device():
    data = request.get_json()
    
    device = Device(
        device_type=data.get('device_type'),
        device_id=data.get('device_id'),
        location=data.get('location'),
        last_calibration=datetime.utcnow()
    )
    
    db.session.add(device)
    db.session.commit()
    
    return jsonify(device.to_dict()), 201


@devices_bp.route('/<int:device_id>/health', methods=['GET'])
@jwt_required()
def get_device_health(device_id):
    device = Device.query.get(device_id)
    
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    
    # Get recent readings
    recent_readings = DeviceReading.query.filter_by(device_id=device_id)\
        .filter(DeviceReading.timestamp >= datetime.utcnow() - timedelta(hours=24))\
        .all()
    
    # Get active alerts
    active_alerts = TamperAlert.query.filter_by(device_id=device_id, resolved=False).all()
    
    # Calculate health score (0-100)
    health_score = 100
    if len(active_alerts) > 0:
        health_score -= len(active_alerts) * 10
    
    anomaly_count = sum(1 for r in recent_readings if r.is_anomaly)
    if anomaly_count > 0:
        health_score -= anomaly_count * 5
    
    health_score = max(0, health_score)
    
    health_status = 'healthy' if health_score >= 80 else 'warning' if health_score >= 50 else 'critical'
    
    return jsonify({
        'device_id': device_id,
        'health_score': health_score,
        'status': health_status,
        'active_alerts_count': len(active_alerts),
        'anomaly_count': anomaly_count,
        'last_reading': recent_readings[-1].to_dict() if recent_readings else None
    }), 200


@devices_bp.route('/<int:device_id>', methods=['DELETE'])
@jwt_required()
def delete_device(device_id):
    device = Device.query.get(device_id)
    
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    
    db.session.delete(device)
    db.session.commit()
    
    return jsonify({'message': 'Device deleted successfully'}), 200
