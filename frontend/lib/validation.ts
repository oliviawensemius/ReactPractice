// frontend/lib/validation.ts

// Email validation
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  
  if (!email.trim()) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true };
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (!passwordRegex.test(password)) {
    return { 
      valid: false, 
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and number' 
    };
  }
  
  return { valid: true };
};

// Name validation
export const validateName = (name: string): { valid: boolean; message?: string } => {
  if (!name.trim()) {
    return { valid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  return { valid: true };
};

// Role validation
export const validateRole = (role: string): { valid: boolean; message?: string } => {
  const validRoles = ['candidate', 'lecturer', 'admin'];
  
  if (!role) {
    return { valid: false, message: 'Role is required' };
  }
  
  if (!validRoles.includes(role)) {
    return { valid: false, message: 'Invalid role' };
  }
  
  return { valid: true };
};

// Course validation
export const validateCourse = (code: string, name: string): { valid: boolean; message?: string } => {
  const courseCodeRegex = /^COSC\d{4}$/;
  
  if (!code || !name) {
    return { valid: false, message: 'Course code and name are required' };
  }
  
  if (!courseCodeRegex.test(code)) {
    return { valid: false, message: 'Course code must be in format COSCxxxx' };
  }
  
  if (name.trim().length < 3) {
    return { valid: false, message: 'Course name must be at least 3 characters' };
  }
  
  return { valid: true };
};

// Skills validation
export const validateSkills = (skills: string[]): { valid: boolean; message?: string } => {
  if (!skills || skills.length === 0) {
    return { valid: false, message: 'At least one skill is required' };
  }
  
  if (skills.some(skill => !skill.trim())) {
    return { valid: false, message: 'Skills cannot be empty' };
  }
  
  return { valid: true };
};

// Availability validation
export const validateAvailability = (availability: string): { valid: boolean; message?: string } => {
  const validAvailability = ['fulltime', 'parttime'];
  
  if (!availability) {
    return { valid: false, message: 'Availability is required' };
  }
  
  if (!validAvailability.includes(availability)) {
    return { valid: false, message: 'Invalid availability option' };
  }
  
  return { valid: true };
};