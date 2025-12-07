from flask import Blueprint

auth_bp = Blueprint('auth', __name__)
devices_bp = Blueprint('devices', __name__)
weighing_scale_bp = Blueprint('weighing_scale', __name__)
energy_meter_bp = Blueprint('energy_meter', __name__)
fuel_dispenser_bp = Blueprint('fuel_dispenser', __name__)
alerts_bp = Blueprint('alerts', __name__)
blockchain_bp = Blueprint('blockchain', __name__)

from app.api import auth, devices, weighing_scale, energy_meter, fuel_dispenser, alerts, blockchain
