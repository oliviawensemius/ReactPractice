
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
    if (!role) {
      return { valid: false, message: 'Role is required' };
    }
    
    return { valid: true };
  };