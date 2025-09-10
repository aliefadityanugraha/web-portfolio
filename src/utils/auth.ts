import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json');

export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface LoginAttempt {
  ip: string;
  attempts: number;
  lastAttempt: string;
  blockedUntil?: string;
}

export interface JWTPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Validasi input
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  
  if (username.length < 3 || username.length > 20) {
    return { valid: false, error: 'Username must be between 3-20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 100) {
    return { valid: false, error: 'Password is too long' };
  }
  
  return { valid: true };
}

// Sanitasi input untuk mencegah injection
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>"'&]/g, '');
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verifikasi password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(userId: string, username: string): string {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verifikasi JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

// Baca file JSON dengan error handling
function readJsonFile(filePath: string): any[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Tulis file JSON dengan error handling
function writeJsonFile(filePath: string, data: any[]): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// User management
export function getUsers(): User[] {
  return readJsonFile(USERS_FILE);
}

export function getUserByUsername(username: string): User | null {
  const users = getUsers();
  return users.find(user => user.username === username) || null;
}

export function getUserById(id: string): User | null {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
}

export function createUser(username: string, password: string, role: string = 'user'): boolean {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(user => user.username === username)) {
    return false;
  }
  
  const newUser: User = {
    id: generateId(),
    username,
    password,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  return writeJsonFile(USERS_FILE, users);
}

// Session management
export function getSessions(): Session[] {
  return readJsonFile(SESSIONS_FILE);
}

export function createSession(userId: string, token: string): boolean {
  const sessions = getSessions();
  
  const newSession: Session = {
    id: generateId(),
    userId,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    createdAt: new Date().toISOString()
  };
  
  sessions.push(newSession);
  return writeJsonFile(SESSIONS_FILE, sessions);
}

export function removeSession(token: string): void {
  const sessions = getSessions();
  const filteredSessions = sessions.filter(session => session.token !== token);
  writeJsonFile(SESSIONS_FILE, filteredSessions);
}

export function getAllUsers(): User[] {
  return getUsers();
}

export function getAllSessions(): Session[] {
  return getSessions();
}

export function getSessionByToken(token: string): Session | null {
  const sessions = getSessions();
  const session = sessions.find(s => s.token === token);
  
  if (!session) return null;
  
  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    deleteSession(token);
    return null;
  }
  
  return session;
}

export function deleteSession(token: string): boolean {
  const sessions = getSessions();
  const filteredSessions = sessions.filter(s => s.token !== token);
  return writeJsonFile(SESSIONS_FILE, filteredSessions);
}

// Cleanup expired sessions
export function cleanupExpiredSessions(): void {
  const sessions = getSessions();
  const now = new Date();
  const validSessions = sessions.filter(s => new Date(s.expiresAt) > now);
  writeJsonFile(SESSIONS_FILE, validSessions);
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize default admin user if no users exist
export async function initializeDefaultUser(): Promise<void> {
  const users = getUsers();
  
  if (users.length === 0) {
    const defaultPassword = 'admin123';
    const hashedPassword = await hashPassword(defaultPassword);
    
    createUser('admin', hashedPassword, 'admin');
    console.log('Default admin user created: admin/admin123');
  }
}

// Update user password
export function updateUserPassword(userId: string, newHashedPassword: string): boolean {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      console.error('User not found with ID:', userId);
      return false;
    }
    
    users[userIndex].password = newHashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();
    
    const writeResult = writeJsonFile(USERS_FILE, users);
    if (!writeResult) {
      console.error('Failed to write users file');
      return false;
    }
    
    console.log('Password updated successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Error updating user password:', error);
    return false;
  }
}