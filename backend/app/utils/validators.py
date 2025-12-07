from functools import wraps
from flask import request, jsonify

def validate_json(*expected_args):
    """Decorator to validate JSON request data"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            
            for arg in expected_args:
                if arg not in data:
                    return jsonify({'error': f'Missing required field: {arg}'}), 400
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def validate_device_type(device_type):
    """Validate device type"""
    valid_types = ['weighing_scale', 'energy_meter', 'fuel_dispenser']
    return device_type in valid_types


def validate_alert_severity(severity):
    """Validate alert severity"""
    valid_severities = ['low', 'medium', 'high', 'critical']
    return severity in valid_severities
