"""
Advanced Security System for Drone Surveillance
Provides JWT authentication, rate limiting, encryption, and security monitoring
"""

import jwt
import bcrypt
import hashlib
import secrets
import time
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
import json
import aiohttp
from collections import defaultdict, deque
import threading
from pathlib import Path
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class User:
    """User model for authentication"""
    id: str
    username: str
    email: str
    role: str  # admin, operator, analyst, viewer
    permissions: List[str]
    created_at: str
    last_login: Optional[str] = None
    is_active: bool = True
    failed_attempts: int = 0
    locked_until: Optional[str] = None

@dataclass
class SecurityEvent:
    """Security event log"""
    timestamp: str
    event_type: str  # login, logout, failed_login, access_denied, etc.
    user_id: Optional[str]
    ip_address: str
    user_agent: str
    details: Dict[str, Any]
    severity: str  # low, medium, high, critical

@dataclass
class RateLimitInfo:
    """Rate limiting information"""
    ip_address: str
    endpoint: str
    request_count: int
    window_start: float
    blocked_until: Optional[float] = None

class AdvancedSecurity:
    """Comprehensive security system"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        
        # Security configuration
        self.secret_key = self.config.get('secret_key', self._generate_secret_key())
        self.algorithm = "HS256"
        self.token_expiry_hours = self.config.get('token_expiry_hours', 24)
        
        # Rate limiting configuration
        self.rate_limits = {
            'default': {'requests': 100, 'window': 3600},  # 100 requests per hour
            'login': {'requests': 5, 'window': 300},       # 5 login attempts per 5 minutes
            'api': {'requests': 1000, 'window': 3600},     # 1000 API calls per hour
            'upload': {'requests': 50, 'window': 3600}     # 50 uploads per hour
        }
        
        # Security thresholds
        self.security_thresholds = {
            'max_failed_logins': 5,
            'lockout_duration_minutes': 30,
            'password_min_length': 12,
            'session_timeout_minutes': 480,  # 8 hours
            'max_concurrent_sessions': 3
        }
        
        # Data storage
        self.users: Dict[str, User] = {}
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.rate_limit_data: Dict[str, RateLimitInfo] = {}
        self.security_events: deque = deque(maxlen=10000)
        
        # Encryption
        self.encryption_key = self._generate_encryption_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
        # Initialize with default admin user
        self._initialize_default_users()
        
        # Security monitoring
        self.monitoring_active = False
        self.monitoring_thread = None
        
        logger.info("Advanced Security System initialized")
    
    def _generate_secret_key(self) -> str:
        """Generate a secure secret key"""
        return secrets.token_urlsafe(32)
    
    def _generate_encryption_key(self) -> bytes:
        """Generate encryption key"""
        return Fernet.generate_key()
    
    def _initialize_default_users(self):
        """Initialize default users for the system"""
        # Use environment variable for admin password
        admin_password_plain = os.getenv('ADMIN_PASSWORD', 'DefaultSecurePassword123!')
        admin_password = self._hash_password(admin_password_plain)
        
        self.users = {
            "admin": User(
                id="admin",
                username="admin",
                email="admin@military-surveillance.com",
                role="admin",
                permissions=[
                    "system:read", "system:write", "system:delete",
                    "drones:read", "drones:write", "drones:delete",
                    "defense:read", "defense:write", "defense:delete",
                    "analytics:read", "analytics:write",
                    "security:read", "security:write",
                    "users:read", "users:write", "users:delete"
                ],
                created_at=datetime.utcnow().isoformat()
            ),
            "operator": User(
                id="operator",
                username="operator",
                email="operator@military-surveillance.com",
                role="operator",
                permissions=[
                    "drones:read", "drones:write",
                    "defense:read", "defense:write",
                    "analytics:read"
                ],
                created_at=datetime.utcnow().isoformat()
            ),
            "analyst": User(
                id="analyst",
                username="analyst",
                email="analyst@military-surveillance.com",
                role="analyst",
                permissions=[
                    "analytics:read", "analytics:write",
                    "drones:read"
                ],
                created_at=datetime.utcnow().isoformat()
            ),
            "viewer": User(
                id="viewer",
                username="viewer",
                email="viewer@military-surveillance.com",
                role="viewer",
                permissions=[
                    "drones:read",
                    "analytics:read"
                ],
                created_at=datetime.utcnow().isoformat()
            )
        }
        
        logger.info("Default users initialized")
    
    def _hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def _verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def _generate_token(self, user_id: str, role: str, permissions: List[str]) -> str:
        """Generate JWT token"""
        payload = {
            'user_id': user_id,
            'role': role,
            'permissions': permissions,
            'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
            'iat': datetime.utcnow(),
            'jti': secrets.token_urlsafe(16)  # JWT ID for uniqueness
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def _verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {e}")
            return None
    
    def _log_security_event(self, event_type: str, user_id: Optional[str], 
                           ip_address: str, user_agent: str, details: Dict[str, Any], 
                           severity: str = "medium"):
        """Log a security event"""
        event = SecurityEvent(
            timestamp=datetime.utcnow().isoformat(),
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
            severity=severity
        )
        
        self.security_events.append(event)
        logger.info(f"Security Event [{severity.upper()}]: {event_type} - {details}")
    
    def _check_rate_limit(self, ip_address: str, endpoint: str) -> bool:
        """Check if request is within rate limits"""
        current_time = time.time()
        key = f"{ip_address}:{endpoint}"
        
        # Get rate limit config
        rate_limit_config = self.rate_limits.get(endpoint, self.rate_limits['default'])
        
        if key not in self.rate_limit_data:
            self.rate_limit_data[key] = RateLimitInfo(
                ip_address=ip_address,
                endpoint=endpoint,
                request_count=1,
                window_start=current_time
            )
            return True
        
        rate_limit_info = self.rate_limit_data[key]
        
        # Check if window has expired
        if current_time - rate_limit_info.window_start > rate_limit_config['window']:
            rate_limit_info.request_count = 1
            rate_limit_info.window_start = current_time
            rate_limit_info.blocked_until = None
            return True
        
        # Check if blocked
        if rate_limit_info.blocked_until and current_time < rate_limit_info.blocked_until:
            return False
        
        # Increment request count
        rate_limit_info.request_count += 1
        
        # Check if limit exceeded
        if rate_limit_info.request_count > rate_limit_config['requests']:
            rate_limit_info.blocked_until = current_time + 300  # Block for 5 minutes
            return False
        
        return True
    
    async def authenticate_user(self, username: str, password: str, 
                              ip_address: str, user_agent: str) -> Dict[str, Any]:
        """Authenticate a user"""
        try:
            # Check if user exists
            if username not in self.users:
                self._log_security_event(
                    "failed_login", None, ip_address, user_agent,
                    {"username": username, "reason": "user_not_found"},
                    "medium"
                )
                return {"success": False, "error": "Invalid credentials"}
            
            user = self.users[username]
            
            # Check if account is locked
            if user.locked_until:
                lock_time = datetime.fromisoformat(user.locked_until)
                if datetime.utcnow() < lock_time:
                    remaining_time = (lock_time - datetime.utcnow()).seconds // 60
                    self._log_security_event(
                        "failed_login", user.id, ip_address, user_agent,
                        {"reason": "account_locked", "remaining_minutes": remaining_time},
                        "medium"
                    )
                    return {"success": False, "error": f"Account locked. Try again in {remaining_time} minutes"}
                else:
                    # Unlock account
                    user.locked_until = None
                    user.failed_attempts = 0
            
            # Use proper password verification with stored hashes
            stored_password_hash = getattr(user, 'password_hash', None)
            if stored_password_hash:
                password_correct = self._verify_password(password, stored_password_hash)
            else:
                # Fallback for demo - use environment variables
                expected_password = os.getenv(f'{username.upper()}_PASSWORD', 'DefaultPassword123!')
                password_correct = password == expected_password
            
            if not password_correct:
                user.failed_attempts += 1
                
                # Check if account should be locked
                if user.failed_attempts >= self.security_thresholds['max_failed_logins']:
                    lock_until = datetime.utcnow() + timedelta(minutes=self.security_thresholds['lockout_duration_minutes'])
                    user.locked_until = lock_until.isoformat()
                    
                    self._log_security_event(
                        "account_locked", user.id, ip_address, user_agent,
                        {"failed_attempts": user.failed_attempts, "lockout_duration": self.security_thresholds['lockout_duration_minutes']},
                        "high"
                    )
                    return {"success": False, "error": f"Account locked due to too many failed attempts"}
                
                self._log_security_event(
                    "failed_login", user.id, ip_address, user_agent,
                    {"failed_attempts": user.failed_attempts},
                    "medium"
                )
                return {"success": False, "error": "Invalid credentials"}
            
            # Reset failed attempts on successful login
            user.failed_attempts = 0
            user.last_login = datetime.now(timezone.utc).isoformat()
            
            # Generate token
            token = self._generate_token(user.id, user.role, user.permissions)
            
            # Track active session
            session_id = secrets.token_urlsafe(16)
            self.active_sessions[session_id] = {
                "user_id": user.id,
                "token": token,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_activity": datetime.now(timezone.utc).isoformat()
            }
            
            self._log_security_event(
                "login_success", user.id, ip_address, user_agent,
                {"role": user.role, "session_id": session_id},
                "low"
            )
            
            return {
                "success": True,
                "token": token,
                "session_id": session_id,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "permissions": user.permissions
                }
            }
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return {"success": False, "error": "Authentication failed"}
    
    def verify_token(self, token: str, required_permission: Optional[str] = None) -> Dict[str, Any]:
        """Verify JWT token and check permissions"""
        try:
            payload = self._verify_token(token)
            if not payload:
                return {"valid": False, "error": "Invalid or expired token"}
            
            user_id = payload.get('user_id')
            if user_id not in self.users:
                return {"valid": False, "error": "User not found"}
            
            user = self.users[user_id]
            if not user.is_active:
                return {"valid": False, "error": "User account is disabled"}
            
            # Check specific permission if required
            if required_permission:
                user_permissions = payload.get('permissions', [])
                if required_permission not in user_permissions:
                    return {"valid": False, "error": "Insufficient permissions"}
            
            return {
                "valid": True,
                "user_id": user_id,
                "role": payload.get('role'),
                "permissions": payload.get('permissions', [])
            }
            
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return {"valid": False, "error": "Token verification failed"}
    
    def check_rate_limit(self, ip_address: str, endpoint: str) -> Dict[str, Any]:
        """Check rate limiting for an IP address and endpoint"""
        is_allowed = self._check_rate_limit(ip_address, endpoint)
        
        if not is_allowed:
            self._log_security_event(
                "rate_limit_exceeded", None, ip_address, "",
                {"endpoint": endpoint},
                "medium"
            )
        
        return {
            "allowed": is_allowed,
            "ip_address": ip_address,
            "endpoint": endpoint
        }
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        try:
            encrypted = self.cipher_suite.encrypt(data.encode('utf-8'))
            return base64.urlsafe_b64encode(encrypted).decode('utf-8')
        except Exception as e:
            logger.error(f"Encryption error: {e}")
            return data
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode('utf-8'))
            decrypted = self.cipher_suite.decrypt(encrypted_bytes)
            return decrypted.decode('utf-8')
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            return encrypted_data
    
    def hash_sensitive_data(self, data: str) -> str:
        """Hash sensitive data for storage"""
        return hashlib.sha256(data.encode('utf-8')).hexdigest()
    
    def validate_password_strength(self, password: str) -> Dict[str, Any]:
        """Validate password strength"""
        errors = []
        warnings = []
        
        if len(password) < self.security_thresholds['password_min_length']:
            errors.append(f"Password must be at least {self.security_thresholds['password_min_length']} characters")
        
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Password must contain at least one special character")
        
        # Check for common patterns
        if password.lower() in ['password', '123456', 'admin', 'qwerty']:
            errors.append("Password is too common")
        
        # Warnings for additional security
        if len(password) < 16:
            warnings.append("Consider using a longer password for better security")
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            warnings.append("Consider adding special characters for better security")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "strength_score": self._calculate_password_strength(password)
        }
    
    def _calculate_password_strength(self, password: str) -> int:
        """Calculate password strength score (0-100)"""
        score = 0
        
        # Length contribution
        score += min(len(password) * 4, 40)
        
        # Character variety contribution
        if any(c.isupper() for c in password):
            score += 10
        if any(c.islower() for c in password):
            score += 10
        if any(c.isdigit() for c in password):
            score += 10
        if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            score += 10
        
        # Deduct for common patterns
        if password.lower() in ['password', '123456', 'admin', 'qwerty']:
            score -= 50
        
        return max(0, min(100, score))
    
    def get_security_summary(self) -> Dict[str, Any]:
        """Get security system summary"""
        try:
            current_time = datetime.utcnow()
            one_hour_ago = current_time - timedelta(hours=1)
            
            # Count recent security events
            recent_events = [e for e in self.security_events 
                           if datetime.fromisoformat(e.timestamp) > one_hour_ago]
            
            event_counts = defaultdict(int)
            for event in recent_events:
                event_counts[event.event_type] += 1
            
            # Count active sessions
            active_sessions = len(self.active_sessions)
            
            # Count locked accounts
            locked_accounts = sum(1 for user in self.users.values() 
                                if user.locked_until and datetime.fromisoformat(user.locked_until) > current_time)
            
            return {
                "timestamp": current_time.isoformat(),
                "users": {
                    "total": len(self.users),
                    "active": sum(1 for u in self.users.values() if u.is_active),
                    "locked": locked_accounts
                },
                "sessions": {
                    "active": active_sessions,
                    "max_concurrent": self.security_thresholds['max_concurrent_sessions']
                },
                "security_events": {
                    "total": len(self.security_events),
                    "recent": len(recent_events),
                    "by_type": dict(event_counts)
                },
                "rate_limiting": {
                    "tracked_ips": len(self.rate_limit_data),
                    "blocked_ips": sum(1 for info in self.rate_limit_data.values() 
                                     if info.blocked_until and time.time() < info.blocked_until)
                },
                "security_status": "healthy" if len(recent_events) < 100 else "attention_needed"
            }
            
        except Exception as e:
            logger.error(f"Error getting security summary: {e}")
            return {"error": str(e)}
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        try:
            current_time = datetime.utcnow()
            expired_sessions = []
            
            for session_id, session_data in self.active_sessions.items():
                last_activity = datetime.fromisoformat(session_data['last_activity'])
                if (current_time - last_activity).total_seconds() > self.security_thresholds['session_timeout_minutes'] * 60:
                    expired_sessions.append(session_id)
            
            for session_id in expired_sessions:
                del self.active_sessions[session_id]
            
            if expired_sessions:
                logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
                
        except Exception as e:
            logger.error(f"Error cleaning up sessions: {e}")
    
    def save_security_data(self, filename: str = None):
        """Save security data to file"""
        try:
            if filename is None:
                filename = f"security_data_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
            
            # Prepare data for export (exclude sensitive information)
            export_data = {
                "export_timestamp": datetime.utcnow().isoformat(),
                "users": {
                    user_id: {
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                        "permissions": user.permissions,
                        "created_at": user.created_at,
                        "last_login": user.last_login,
                        "is_active": user.is_active,
                        "failed_attempts": user.failed_attempts
                    } for user_id, user in self.users.items()
                },
                "security_events": [asdict(event) for event in list(self.security_events)[-1000:]],  # Last 1000 events
                "rate_limits": {
                    key: {
                        "ip_address": info.ip_address,
                        "endpoint": info.endpoint,
                        "request_count": info.request_count,
                        "blocked_until": info.blocked_until
                    } for key, info in self.rate_limit_data.items()
                },
                "configuration": {
                    "rate_limits": self.rate_limits,
                    "security_thresholds": self.security_thresholds
                }
            }
            
            with open(filename, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            logger.info(f"Security data saved to {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"Error saving security data: {e}")
            return None

# Global security instance
security_system = AdvancedSecurity()

def get_security_system():
    """Get the global security system instance"""
    return security_system

if __name__ == "__main__":
    # Test the security system
    async def test_security():
        # Test authentication
        result = await security_system.authenticate_user(
            "admin", "Admin@Drone2024!", "192.168.1.100", "Mozilla/5.0"
        )
        print("Authentication result:", json.dumps(result, indent=2))
        
        if result["success"]:
            # Test token verification
            token = result["token"]
            verification = security_system.verify_token(token, "drones:read")
            print("Token verification:", json.dumps(verification, indent=2))
            
            # Test rate limiting
            rate_limit = security_system.check_rate_limit("192.168.1.100", "api")
            print("Rate limit check:", json.dumps(rate_limit, indent=2))
            
            # Test password validation
            password_check = security_system.validate_password_strength("WeakPassword123!")
            print("Password validation:", json.dumps(password_check, indent=2))
            
            # Test encryption
            original_data = "sensitive information"
            encrypted = security_system.encrypt_data(original_data)
            decrypted = security_system.decrypt_data(encrypted)
            print(f"Encryption test: {original_data} -> {encrypted} -> {decrypted}")
            
            # Get security summary
            summary = security_system.get_security_summary()
            print("Security summary:", json.dumps(summary, indent=2))
    
    asyncio.run(test_security()) 