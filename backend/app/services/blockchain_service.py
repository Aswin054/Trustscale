import hashlib
import json
from datetime import datetime
from app.extensions import db
from app.models import BlockchainLog

class BlockchainService:
    
    @staticmethod
    def calculate_hash(data):
        """Calculate SHA-256 hash of data"""
        data_string = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    @staticmethod
    def create_log_entry(device_id, event_type, event_data):
        """Create a new blockchain log entry with proper chaining"""
        # Get the last block
        last_block = BlockchainLog.query.order_by(
            BlockchainLog.block_number.desc()
        ).first()
        
        if last_block:
            block_number = last_block.block_number + 1
            previous_hash = last_block.data_hash
        else:
            block_number = 1
            previous_hash = '0' * 64  # Genesis block
        
        # Prepare data for hashing
        log_data = {
            'block_number': block_number,
            'device_id': device_id,
            'event_type': event_type,
            'event_data': event_data,
            'timestamp': datetime.utcnow().isoformat(),
            'previous_hash': previous_hash
        }
        
        # Calculate hash
        data_hash = BlockchainService.calculate_hash(log_data)
        
        # Create blockchain log entry
        log = BlockchainLog(
            block_number=block_number,
            device_id=device_id,
            event_type=event_type,
            data_hash=data_hash,
            previous_hash=previous_hash,
            extra_data=event_data
        )
        
        db.session.add(log)
        db.session.commit()
        
        return log
    
    @staticmethod
    def verify_log_integrity(log):
        """Verify the integrity of a blockchain log entry[web:23][web:26]"""
        # Reconstruct the data
        log_data = {
            'block_number': log.block_number,
            'device_id': log.device_id,
            'event_type': log.event_type,
            'event_data': log.extra_data,
            'timestamp': log.timestamp.isoformat(),
            'previous_hash': log.previous_hash
        }
        
        # Recalculate hash
        calculated_hash = BlockchainService.calculate_hash(log_data)
        
        # Compare with stored hash
        return calculated_hash == log.data_hash
    
    @staticmethod
    def verify_chain_integrity(device_id=None):
        """Verify integrity of entire blockchain or device-specific chain"""
        query = BlockchainLog.query
        
        if device_id:
            query = query.filter_by(device_id=device_id)
        
        logs = query.order_by(BlockchainLog.block_number.asc()).all()
        
        if not logs:
            return {
                'valid': True,
                'message': 'No logs to verify'
            }
        
        invalid_blocks = []
        
        for i, log in enumerate(logs):
            # Verify hash
            if not BlockchainService.verify_log_integrity(log):
                invalid_blocks.append({
                    'block_number': log.block_number,
                    'reason': 'Hash mismatch'
                })
            
            # Verify chain linkage (except genesis)
            if i > 0:
                if log.previous_hash != logs[i-1].data_hash:
                    invalid_blocks.append({
                        'block_number': log.block_number,
                        'reason': 'Chain break'
                    })
        
        return {
            'valid': len(invalid_blocks) == 0,
            'total_blocks': len(logs),
            'invalid_blocks': invalid_blocks
        }
