from datetime import datetime
from app.extensions import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # admin, user, technician
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }


class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    device_type = db.Column(db.String(50), nullable=False)  # weighing_scale, energy_meter, fuel_dispenser
    device_id = db.Column(db.String(100), unique=True, nullable=False)
    location = db.Column(db.String(200))
    status = db.Column(db.String(20), default='active')  # active, inactive, tampered
    last_calibration = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    readings = db.relationship('DeviceReading', backref='device', lazy=True, cascade='all, delete-orphan')
    alerts = db.relationship('TamperAlert', backref='device', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'device_type': self.device_type,
            'device_id': self.device_id,
            'location': self.location,
            'status': self.status,
            'last_calibration': self.last_calibration.isoformat() if self.last_calibration else None,
            'created_at': self.created_at.isoformat()
        }


class DeviceReading(db.Model):
    __tablename__ = 'device_readings'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    reading_type = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20))
    is_anomaly = db.Column(db.Boolean, default=False)
    extra_data = db.Column(db.JSON)  # CHANGED FROM metadata to extra_data
    
    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'timestamp': self.timestamp.isoformat(),
            'reading_type': self.reading_type,
            'value': self.value,
            'unit': self.unit,
            'is_anomaly': self.is_anomaly,
            'metadata': self.extra_data  # Return as 'metadata' for API compatibility
        }


class TamperAlert(db.Model):
    __tablename__ = 'tamper_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    description = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)
    resolved_at = db.Column(db.DateTime)
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'description': self.description,
            'timestamp': self.timestamp.isoformat(),
            'resolved': self.resolved,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }


class BlockchainLog(db.Model):
    __tablename__ = 'blockchain_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    block_number = db.Column(db.Integer, nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    data_hash = db.Column(db.String(255), nullable=False)
    previous_hash = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    extra_data = db.Column(db.JSON)  # CHANGED FROM metadata to extra_data
    
    def to_dict(self):
        return {
            'id': self.id,
            'block_number': self.block_number,
            'device_id': self.device_id,
            'event_type': self.event_type,
            'data_hash': self.data_hash,
            'previous_hash': self.previous_hash,
            'timestamp': self.timestamp.isoformat(),
            'metadata': self.extra_data  # Return as 'metadata' for API compatibility
        }


class CalibrationLog(db.Model):
    __tablename__ = 'calibration_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    calibrated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    calibration_date = db.Column(db.DateTime, default=datetime.utcnow)
    next_calibration_date = db.Column(db.DateTime)
    status = db.Column(db.String(20))  # passed, failed
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'calibrated_by': self.calibrated_by,
            'calibration_date': self.calibration_date.isoformat(),
            'next_calibration_date': self.next_calibration_date.isoformat() if self.next_calibration_date else None,
            'status': self.status,
            'notes': self.notes
        }
