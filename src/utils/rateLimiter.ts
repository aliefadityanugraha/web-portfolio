import fs from 'fs';
import path from 'path';

const RATE_LIMIT_FILE = path.join(process.cwd(), 'data', 'rate-limits.json');

export interface RateLimitEntry {
  ip: string;
  attempts: number;
  firstAttempt: string;
  lastAttempt: string;
  blockedUntil?: string;
}

const MAX_ATTEMPTS = 5; // Maximum login attempts
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes block

// Baca rate limit data
function readRateLimitData(): RateLimitEntry[] {
  try {
    if (!fs.existsSync(RATE_LIMIT_FILE)) {
      return [];
    }
    const data = fs.readFileSync(RATE_LIMIT_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rate limit file:', error);
    return [];
  }
}

// Tulis rate limit data
function writeRateLimitData(data: RateLimitEntry[]): boolean {
  try {
    const dir = path.dirname(RATE_LIMIT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing rate limit file:', error);
    return false;
  }
}

// Get client IP from request
export function getClientIP(request: Request): string {
  // Try to get real IP from headers (for proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfIP) {
    return cfIP;
  }
  
  // Fallback to a default IP for development
  return '127.0.0.1';
}

// Check if IP is currently blocked
export function isBlocked(ip: string): { blocked: boolean; remainingTime?: number } {
  const rateLimits = readRateLimitData();
  const entry = rateLimits.find(e => e.ip === ip);
  
  if (!entry || !entry.blockedUntil) {
    return { blocked: false };
  }
  
  const blockedUntil = new Date(entry.blockedUntil);
  const now = new Date();
  
  if (now < blockedUntil) {
    const remainingTime = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000 / 60); // minutes
    return { blocked: true, remainingTime };
  }
  
  // Block expired, remove it
  const updatedLimits = rateLimits.filter(e => e.ip !== ip);
  writeRateLimitData(updatedLimits);
  
  return { blocked: false };
}

// Record failed login attempt
export function recordFailedAttempt(ip: string): { blocked: boolean; attemptsLeft?: number; blockedUntil?: string } {
  const rateLimits = readRateLimitData();
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  
  let entry = rateLimits.find(e => e.ip === ip);
  
  if (!entry) {
    // First attempt from this IP
    entry = {
      ip,
      attempts: 1,
      firstAttempt: now.toISOString(),
      lastAttempt: now.toISOString()
    };
    rateLimits.push(entry);
  } else {
    // Check if we're still within the window
    const firstAttempt = new Date(entry.firstAttempt);
    
    if (firstAttempt < windowStart) {
      // Window expired, reset counter
      entry.attempts = 1;
      entry.firstAttempt = now.toISOString();
      entry.lastAttempt = now.toISOString();
      delete entry.blockedUntil;
    } else {
      // Within window, increment attempts
      entry.attempts++;
      entry.lastAttempt = now.toISOString();
      
      // Check if we should block
      if (entry.attempts >= MAX_ATTEMPTS) {
        entry.blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MS).toISOString();
      }
    }
  }
  
  writeRateLimitData(rateLimits);
  
  if (entry.blockedUntil) {
    return {
      blocked: true,
      blockedUntil: entry.blockedUntil
    };
  }
  
  return {
    blocked: false,
    attemptsLeft: MAX_ATTEMPTS - entry.attempts
  };
}

// Record successful login (reset attempts)
export function recordSuccessfulLogin(ip: string): void {
  const rateLimits = readRateLimitData();
  const updatedLimits = rateLimits.filter(e => e.ip !== ip);
  writeRateLimitData(updatedLimits);
}

// Clean up old entries
export function cleanupOldEntries(): void {
  const rateLimits = readRateLimitData();
  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS * 2); // Keep entries for 2x window time
  
  const validEntries = rateLimits.filter(entry => {
    const lastAttempt = new Date(entry.lastAttempt);
    const blockedUntil = entry.blockedUntil ? new Date(entry.blockedUntil) : null;
    
    // Keep if still within window or still blocked
    return lastAttempt > cutoff || (blockedUntil && blockedUntil > now);
  });
  
  if (validEntries.length !== rateLimits.length) {
    writeRateLimitData(validEntries);
  }
}

// Get rate limit info for IP
export function getRateLimitInfo(ip: string): {
  attempts: number;
  maxAttempts: number;
  windowMs: number;
  attemptsLeft: number;
  resetTime?: string;
} {
  const rateLimits = readRateLimitData();
  const entry = rateLimits.find(e => e.ip === ip);
  
  if (!entry) {
    return {
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      windowMs: WINDOW_MS,
      attemptsLeft: MAX_ATTEMPTS
    };
  }
  
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const firstAttempt = new Date(entry.firstAttempt);
  
  // Check if window expired
  if (firstAttempt < windowStart) {
    return {
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      windowMs: WINDOW_MS,
      attemptsLeft: MAX_ATTEMPTS
    };
  }
  
  const resetTime = new Date(firstAttempt.getTime() + WINDOW_MS).toISOString();
  
  return {
    attempts: entry.attempts,
    maxAttempts: MAX_ATTEMPTS,
    windowMs: WINDOW_MS,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - entry.attempts),
    resetTime
  };
}

// Middleware function for Astro
export function createRateLimitMiddleware() {
  return {
    checkRateLimit: (ip: string) => {
      // Clean up old entries periodically
      if (Math.random() < 0.1) { // 10% chance to cleanup
        cleanupOldEntries();
      }
      
      return isBlocked(ip);
    },
    
    recordAttempt: (ip: string, success: boolean) => {
      if (success) {
        recordSuccessfulLogin(ip);
        return { blocked: false };
      } else {
        return recordFailedAttempt(ip);
      }
    },
    
    getInfo: (ip: string) => {
      return getRateLimitInfo(ip);
    }
  };
}

// Get rate limit statistics for admin dashboard
export function getRateLimitStats() {
  const data = readRateLimitData();
  const now = new Date();
  
  return data.map(entry => {
    const windowStart = new Date(now.getTime() - WINDOW_MS);
    const firstAttempt = new Date(entry.firstAttempt);
    
    // Check if entry is still within window
    const isWithinWindow = firstAttempt > windowStart;
    const blocked = entry.blockedUntil ? new Date(entry.blockedUntil) > now : false;
    
    return {
      ip: entry.ip,
      attempts: isWithinWindow ? entry.attempts : 0,
      blocked,
      lastAttempt: entry.lastAttempt,
      blockedUntil: entry.blockedUntil,
      firstAttempt: entry.firstAttempt
    };
  });
}