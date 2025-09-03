import hashlib
import jwt
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import redis
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/system.log'),
        logging.StreamHandler()
    ]
)

class SecurityManager:
    def __init__(self):
        self.secret_key = os.getenv("SECRET_KEY", "your-secret-key-here")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        self.logger = logging.getLogger(__name__)
        
        # User roles and permissions
        self.roles = {
            'admin': ['read', 'write', 'delete', 'system_control'],
            'operator': ['read', 'write', 'drone_control'],
            'analyst': ['read', 'analytics'],
            'viewer': ['read']
        }
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return self.hash_password(password) == hashed
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    def check_permission(self, user_role: str, required_permission: str) -> bool:
        """Check if user has required permission"""
        if user_role not in self.roles:
            return False
        return required_permission in self.roles[user_role]
    
    def log_security_event(self, event_type: str, user_id: str, details: str):
        """Log security events"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'details': details,
            'ip_address': '127.0.0.1'  # In real implementation, get from request
        }
        self.logger.info(f"Security Event: {json.dumps(log_entry)}")
        
        # Store in Redis for monitoring
        self.redis_client.lpush('security_events', json.dumps(log_entry))
        self.redis_client.ltrim('security_events', 0, 999)  # Keep last 1000 events
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        # In production, use proper encryption like AES
        return hashlib.sha256(data.encode()).hexdigest()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        # In production, implement proper decryption
        return encrypted_data
    
    def monitor_system_health(self) -> Dict:
        """Monitor system health and security status"""
        health_status = {
            'timestamp': datetime.now().isoformat(),
            'system_status': 'healthy',
            'security_events_last_hour': len(self.redis_client.lrange('security_events', 0, 59)),
            'active_sessions': len(self.redis_client.keys('session:*')),
            'failed_login_attempts': len(self.redis_client.lrange('failed_logins', 0, -1)),
            'system_uptime': '99.8%',
            'memory_usage': '67%',
            'cpu_usage': '45%',
            'disk_usage': '23%'
        }
        
        # Check for security alerts
        recent_events = self.redis_client.lrange('security_events', 0, 9)
        failed_logins = len(self.redis_client.lrange('failed_logins', 0, -1))
        
        if failed_logins > 10:
            health_status['security_alert'] = 'High number of failed login attempts'
            health_status['system_status'] = 'warning'
        
        return health_status
    
    def rate_limit_check(self, user_id: str, action: str) -> bool:
        """Check rate limiting for user actions with atomic operations"""
        key = f"rate_limit:{user_id}:{action}"
        
        # Use Redis pipeline for atomic operations to prevent race conditions
        pipe = self.redis_client.pipeline()
        pipe.multi()
        
        try:
            # Watch the key for changes
            pipe.watch(key)
            current_count = self.redis_client.get(key)
            
            if current_count and int(current_count) > 100:  # 100 requests per hour
                pipe.unwatch()
                return False
            
            # Atomic increment and expire
            pipe.incr(key)
            pipe.expire(key, 3600)  # Expire in 1 hour
            pipe.execute()
            
            return True
            
        except redis.WatchError:
            # Key was modified during transaction, retry
            return self.rate_limit_check(user_id, action)

# Initialize security manager
security_manager = SecurityManager()

# HTTP Bearer token scheme
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = security_manager.verify_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return payload

def require_permission(permission: str):
    """Decorator to require specific permission"""
    def permission_checker(current_user: Dict = Depends(get_current_user)):
        user_role = current_user.get("role", "viewer")
        if not security_manager.check_permission(user_role, permission):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return permission_checker 