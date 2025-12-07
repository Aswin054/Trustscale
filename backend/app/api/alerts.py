from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api import alerts_bp
from app.extensions import db
from app.models import TamperAlert, Device
from datetime import datetime, timedelta

@alerts_bp.route('/', methods=['GET'])
@jwt_required()
def get_alerts():
    """Get all tamper alerts with optional filters"""
    device_id = request.args.get('device_id', type=int)
    severity = request.args.get('severity')
    resolved = request.args.get('resolved')
    hours = int(request.args.get('hours', 168))  # Last 7 days by default
    
    start_time = datetime.utcnow() - timedelta(hours=hours)
    query = TamperAlert.query.filter(TamperAlert.timestamp >= start_time)
    
    if device_id:
        query = query.filter_by(device_id=device_id)
    
    if severity:
        query = query.filter_by(severity=severity)
    
    if resolved is not None:
        is_resolved = resolved.lower() == 'true'
        query = query.filter_by(resolved=is_resolved)
    
    alerts = query.order_by(TamperAlert.timestamp.desc()).all()
    
    return jsonify({
        'alerts': [alert.to_dict() for alert in alerts],
        'total': len(alerts)
    }), 200


@alerts_bp.route('/<int:alert_id>', methods=['GET'])
@jwt_required()
def get_alert(alert_id):
    """Get specific alert details"""
    alert = TamperAlert.query.get(alert_id)
    
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    device = Device.query.get(alert.device_id)
    
    return jsonify({
        'alert': alert.to_dict(),
        'device': device.to_dict() if device else None
    }), 200


@alerts_bp.route('/<int:alert_id>/resolve', methods=['POST'])
@jwt_required()
def resolve_alert(alert_id):
    """Resolve a tamper alert"""
    alert = TamperAlert.query.get(alert_id)
    
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    if alert.resolved:
        return jsonify({'message': 'Alert already resolved'}), 200
    
    user_id = get_jwt_identity()
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = user_id
    
    # Update device status
    device = Device.query.get(alert.device_id)
    if device:
        # Check if there are other active alerts
        other_alerts = TamperAlert.query.filter_by(
            device_id=device.id,
            resolved=False
        ).filter(TamperAlert.id != alert_id).count()
        
        if other_alerts == 0:
            device.status = 'active'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Alert resolved successfully',
        'alert': alert.to_dict()
    }), 200


@alerts_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_alert_summary():
    """Get summary statistics of alerts"""
    hours = int(request.args.get('hours', 24))
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    alerts = TamperAlert.query.filter(TamperAlert.timestamp >= start_time).all()
    
    summary = {
        'total_alerts': len(alerts),
        'resolved': sum(1 for a in alerts if a.resolved),
        'unresolved': sum(1 for a in alerts if not a.resolved),
        'by_severity': {
            'critical': sum(1 for a in alerts if a.severity == 'critical'),
            'high': sum(1 for a in alerts if a.severity == 'high'),
            'medium': sum(1 for a in alerts if a.severity == 'medium'),
            'low': sum(1 for a in alerts if a.severity == 'low')
        },
        'by_type': {}
    }
    
    # Count by alert type
    for alert in alerts:
        alert_type = alert.alert_type
        summary['by_type'][alert_type] = summary['by_type'].get(alert_type, 0) + 1
    
    return jsonify(summary), 200


@alerts_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_alerts():
    """Get most recent alerts for dashboard"""
    limit = int(request.args.get('limit', 10))
    
    alerts = TamperAlert.query.filter_by(resolved=False)\
        .order_by(TamperAlert.timestamp.desc())\
        .limit(limit)\
        .all()
    
    alert_list = []
    for alert in alerts:
        device = Device.query.get(alert.device_id)
        alert_dict = alert.to_dict()
        alert_dict['device'] = device.to_dict() if device else None
        alert_list.append(alert_dict)
    
    return jsonify(alert_list), 200


@alerts_bp.route('/bulk-resolve', methods=['POST'])
@jwt_required()
def bulk_resolve_alerts():
    """Resolve multiple alerts at once"""
    data = request.get_json()
    alert_ids = data.get('alert_ids', [])
    
    if not alert_ids:
        return jsonify({'error': 'No alert IDs provided'}), 400
    
    user_id = get_jwt_identity()
    resolved_count = 0
    
    for alert_id in alert_ids:
        alert = TamperAlert.query.get(alert_id)
        if alert and not alert.resolved:
            alert.resolved = True
            alert.resolved_at = datetime.utcnow()
            alert.resolved_by = user_id
            resolved_count += 1
    
    db.session.commit()
    
    return jsonify({
        'message': f'Resolved {resolved_count} alerts successfully',
        'resolved_count': resolved_count
    }), 200
