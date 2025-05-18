import { User, UserRole } from '@/lib/types';
import { checkUser } from '@/lib/validation';
import { getUserData } from '@/lib/storage';

/**
 * Check if a user is currently logged in
 */
export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('currentUserEmail') !== null;
}

/**
 * Get the currently logged in user
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const email = localStorage.getItem('currentUserEmail');
  if (!email) return null;
  
  return getUserData(email);
}

/**
 * Log in a user with email and password
 */
export function loginUser(email: string, password: string): boolean {
  if (typeof window === 'undefined') return false;

  if (checkUser(email, password)) {
    const userData = getUserData(email);
    if (userData) {
      localStorage.setItem('currentUserEmail', email);
      window.dispatchEvent(new Event('storage'));
      return true;
    }
  }
  return false;
}

/**
 * Log out the current user
 */
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('currentUserEmail');
  window.dispatchEvent(new Event('storage'));
  
  sessionStorage.removeItem('authState');
}

/**
 * Check if current user is a lecturer
 */
export function isLecturer(): boolean {
  const user = getCurrentUser();
  return user?.role === UserRole.Lecturer;
}

/**
 * Check if current user is a tutor
 */
export function isTutor(): boolean {
  const user = getCurrentUser();
  return user?.role === UserRole.Tutor;
}

/**
 * Get user's role as a display string
 */
export function getUserRoleDisplay(): string {
  if (isLecturer()) return 'lecturer';
  if (isTutor()) return 'applicant';
  return '';
}

/**
 * Get user's display name
 */
export function getUserName(): string {
  const user = getCurrentUser();
  return user?.name || '';
}