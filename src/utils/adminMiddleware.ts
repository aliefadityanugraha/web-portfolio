import type { APIContext } from 'astro';
import { verifyToken, getSessionByToken, getUserById } from './auth';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Middleware to check if user is authenticated and authorized
 * @param context Astro API context
 * @param requiredRole Required role for access (default: 'admin')
 * @returns AuthResult with authentication status and user info
 */
export function checkAuth(context: APIContext, requiredRole: string = 'admin'): AuthResult {
  try {
    // Get auth token from cookies
    const authToken = context.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return {
        authenticated: false,
        error: 'No authentication token found'
      };
    }

    // Verify token
    const tokenPayload = verifyToken(authToken);
    if (!tokenPayload) {
      return {
        authenticated: false,
        error: 'Invalid or expired token'
      };
    }

    // Check if session exists and is valid
    const session = getSessionByToken(authToken);
    if (!session) {
      return {
        authenticated: false,
        error: 'Session not found or expired'
      };
    }

    // Get user details
    const user = getUserById(tokenPayload.userId);
    if (!user) {
      return {
        authenticated: false,
        error: 'User not found'
      };
    }

    // Check if user has required role
    if (user.role !== requiredRole) {
      return {
        authenticated: false,
        error: `Access denied. Required role: ${requiredRole}`
      };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      authenticated: false,
      error: 'Authentication error occurred'
    };
  }
}

/**
 * Redirect to login if not authenticated
 * @param context Astro API context
 * @param requiredRole Required role for access
 * @returns Response redirect or null if authenticated
 */
export function requireAuth(context: APIContext, requiredRole: string = 'admin'): Response | null {
  const authResult = checkAuth(context, requiredRole);
  
  if (!authResult.authenticated) {
    // Clear invalid cookies
    context.cookies.delete('auth-token', { path: '/' });
    context.cookies.delete('user-info', { path: '/' });
    
    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(context.url.pathname + context.url.search);
    return context.redirect(`/admin/login?return=${returnUrl}`);
  }
  
  return null;
}

/**
 * Logout user by clearing session and cookies
 * @param context Astro API context
 * @returns Response redirect to login
 */
export function logout(context: APIContext): Response {
  try {
    const authToken = context.cookies.get('auth-token')?.value;
    
    if (authToken) {
      // Remove session from storage
      const session = getSessionByToken(authToken);
      if (session) {
        // Import and use session management functions
        const { removeSession } = require('./auth');
        removeSession(authToken);
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear cookies
  context.cookies.delete('auth-token', { path: '/' });
  context.cookies.delete('user-info', { path: '/' });
  
  // Redirect to login
  return context.redirect('/admin/login');
}

/**
 * Get current authenticated user info
 * @param context Astro API context
 * @returns AuthenticatedUser or null
 */
export function getCurrentUser(context: APIContext): AuthenticatedUser | null {
  const authResult = checkAuth(context);
  return authResult.authenticated ? authResult.user! : null;
}

/**
 * Check if user has specific permission
 * @param context Astro API context
 * @param permission Permission to check
 * @returns boolean
 */
export function hasPermission(context: APIContext, permission: string): boolean {
  const user = getCurrentUser(context);
  if (!user) return false;
  
  // Simple role-based permissions
  const rolePermissions: Record<string, string[]> = {
    'admin': ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
    'editor': ['read', 'write'],
    'viewer': ['read']
  };
  
  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes(permission);
}

/**
 * Middleware for API routes that require authentication
 * @param context Astro API context
 * @param requiredRole Required role
 * @returns JSON error response or null if authenticated
 */
export function requireAuthAPI(context: APIContext, requiredRole: string = 'admin'): Response | null {
  const authResult = checkAuth(context, requiredRole);
  
  if (!authResult.authenticated) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: authResult.error || 'Authentication required'
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
  
  return null;
}

/**
 * Rate limiting for admin actions
 * @param context Astro API context
 * @param action Action being performed
 * @param maxAttempts Maximum attempts per time window
 * @param windowMinutes Time window in minutes
 * @returns boolean indicating if action is allowed
 */
export function checkActionRateLimit(
  context: APIContext, 
  action: string, 
  maxAttempts: number = 10, 
  windowMinutes: number = 60
): boolean {
  try {
    const user = getCurrentUser(context);
    if (!user) return false;
    
    const { checkActionLimit } = require('./rateLimiter');
    return checkActionLimit(user.id, action, maxAttempts, windowMinutes);
  } catch (error) {
    console.error('Action rate limit error:', error);
    return false;
  }
}