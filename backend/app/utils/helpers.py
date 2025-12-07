from datetime import datetime
import random
import string

def generate_device_id(device_type, length=8):
    """Generate unique device ID"""
    prefix = device_type[:3].upper()
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    return f"{prefix}-{suffix}"


def format_timestamp(dt):
    """Format datetime for API response"""
    if dt:
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    return None


def calculate_uptime(last_calibration):
    """Calculate device uptime since last calibration"""
    if not last_calibration:
        return None
    
    delta = datetime.utcnow() - last_calibration
    days = delta.days
    hours = delta.seconds // 3600
    
    return f"{days} days, {hours} hours"


def get_health_status(anomaly_count, total_readings):
    """Determine health status based on anomaly rate"""
    if total_readings == 0:
        return 'unknown'
    
    anomaly_rate = (anomaly_count / total_readings) * 100
    
    if anomaly_rate < 5:
        return 'healthy'
    elif anomaly_rate < 15:
        return 'warning'
    else:
        return 'critical'
