import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from app.models import DeviceReading
from datetime import datetime, timedelta

class AnomalyDetector:
    
    def __init__(self, contamination=0.1):
        """Initialize anomaly detector with Isolation Forest"""
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def prepare_features(self, readings):
        """Extract features from device readings"""
        features = []
        
        for reading in readings:
            feature_vector = [
                reading.value,
                reading.timestamp.hour,
                reading.timestamp.weekday()
            ]
            
            # Add metadata features if available
            if reading.metadata:
                for key in ['voltage', 'current', 'pressure', 'magnetic_field']:
                    if key in reading.metadata:
                        feature_vector.append(reading.metadata[key])
            
            features.append(feature_vector)
        
        return np.array(features)
    
    def train(self, device_id, hours=168):
        """Train anomaly detection model on historical data"""
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        readings = DeviceReading.query.filter(
            DeviceReading.device_id == device_id,
            DeviceReading.timestamp >= start_time
        ).all()
        
        if len(readings) < 50:
            return {
                'success': False,
                'message': 'Insufficient training data'
            }
        
        # Prepare features
        X = self.prepare_features(readings)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled)
        self.is_fitted = True
        
        return {
            'success': True,
            'samples_trained': len(readings),
            'message': 'Model trained successfully'
        }
    
    def predict(self, reading):
        """Predict if a reading is anomalous"""
        if not self.is_fitted:
            return {
                'is_anomaly': False,
                'confidence': 0,
                'message': 'Model not trained'
            }
        
        # Prepare features
        X = self.prepare_features([reading])
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        anomaly_score = self.model.score_samples(X_scaled)[0]
        
        is_anomaly = prediction == -1
        confidence = abs(anomaly_score) * 100
        
        return {
            'is_anomaly': is_anomaly,
            'confidence': round(confidence, 2),
            'anomaly_score': round(anomaly_score, 4)
        }
    
    def batch_predict(self, device_id, hours=24):
        """Predict anomalies for recent readings"""
        start_time = datetime.utcnow() - timedelta(hours=hours)
        
        readings = DeviceReading.query.filter(
            DeviceReading.device_id == device_id,
            DeviceReading.timestamp >= start_time
        ).all()
        
        if not readings or not self.is_fitted:
            return []
        
        results = []
        for reading in readings:
            prediction = self.predict(reading)
            results.append({
                'reading_id': reading.id,
                'timestamp': reading.timestamp.isoformat(),
                'value': reading.value,
                **prediction
            })
        
        return results
