from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.api import blockchain_bp
from app.extensions import db
from app.models import BlockchainLog, Device
from app.services.blockchain_service import BlockchainService
from datetime import datetime, timedelta

@blockchain_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_blockchain_logs():
    """Get blockchain audit logs"""
    device_id = request.args.get('device_id', type=int)
    event_type = request.args.get('event_type')
    limit = int(request.args.get('limit', 50))
    
    query = BlockchainLog.query
    
    if device_id:
        query = query.filter_by(device_id=device_id)
    
    if event_type:
        query = query.filter_by(event_type=event_type)
    
    logs = query.order_by(BlockchainLog.block_number.desc()).limit(limit).all()
    
    return jsonify({
        'logs': [log.to_dict() for log in logs],
        'total': len(logs)
    }), 200


@blockchain_bp.route('/add-log', methods=['POST'])
@jwt_required()
def add_blockchain_log():
    """Add a new entry to blockchain ledger"""
    data = request.get_json()
    
    device_id = data.get('device_id')
    event_type = data.get('event_type')
    event_data = data.get('event_data', {})
    
    if not device_id or not event_type:
        return jsonify({'error': 'device_id and event_type are required'}), 400
    
    # Verify device exists
    device = Device.query.get(device_id)
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    
    # Create blockchain log entry
    log = BlockchainService.create_log_entry(
        device_id=device_id,
        event_type=event_type,
        event_data=event_data
    )
    
    return jsonify({
        'message': 'Blockchain log created successfully',
        'log': log.to_dict()
    }), 201


@blockchain_bp.route('/verify/<int:log_id>', methods=['GET'])
@jwt_required()
def verify_log(log_id):
    """Verify integrity of a blockchain log entry"""
    log = BlockchainLog.query.get(log_id)
    
    if not log:
        return jsonify({'error': 'Log not found'}), 404
    
    is_valid = BlockchainService.verify_log_integrity(log)
    
    return jsonify({
        'log_id': log_id,
        'block_number': log.block_number,
        'is_valid': is_valid,
        'timestamp': log.timestamp.isoformat()
    }), 200


@blockchain_bp.route('/chain-status', methods=['GET'])
@jwt_required()
def get_chain_status():
    """Get overall blockchain status"""
    total_blocks = BlockchainLog.query.count()
    latest_block = BlockchainLog.query.order_by(BlockchainLog.block_number.desc()).first()
    
    # Get logs from last 24 hours
    start_time = datetime.utcnow() - timedelta(hours=24)
    recent_logs = BlockchainLog.query.filter(BlockchainLog.timestamp >= start_time).count()
    
    status = {
        'total_blocks': total_blocks,
        'latest_block_number': latest_block.block_number if latest_block else 0,
        'latest_block_hash': latest_block.data_hash if latest_block else None,
        'recent_logs_24h': recent_logs,
        'chain_status': 'healthy',
        'last_update': latest_block.timestamp.isoformat() if latest_block else None
    }
    
    return jsonify(status), 200


@blockchain_bp.route('/device-history/<int:device_id>', methods=['GET'])
@jwt_required()
def get_device_blockchain_history(device_id):
    """Get complete blockchain history for a device"""
    device = Device.query.get(device_id)
    
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    
    logs = BlockchainLog.query.filter_by(device_id=device_id)\
        .order_by(BlockchainLog.block_number.asc())\
        .all()
    
    history = {
        'device_id': device_id,
        'device_type': device.device_type,
        'total_entries': len(logs),
        'logs': [log.to_dict() for log in logs]
    }
    
    return jsonify(history), 200
