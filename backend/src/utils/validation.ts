// backend/src/utils/validation.ts

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

// Comment validation
export const validateComment = (comment: string): { valid: boolean; message?: string } => {
  if (!comment || comment.trim().length === 0) {
    return { valid: false, message: 'Comment cannot be empty' };
  }
  
  if (comment.trim().length < 3) {
    return { valid: false, message: 'Comment must be at least 3 characters' };
  }
  
  if (comment.trim().length > 500) {
    return { valid: false, message: 'Comment must not exceed 500 characters' };
  }
  
  return { valid: true };
};

// Application validation
export const validateApplication = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.candidate_id) {
    errors.push('Candidate ID is required');
  }
  
  if (!data.course_id) {
    errors.push('Course ID is required');
  }
  
  // Session type validation
  if (!data.session_type || !['tutor', 'lab_assistant'].includes(data.session_type)) {
    errors.push('Valid session type (tutor or lab_assistant) is required');
  }
  
  // Skills validation
  if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
    errors.push('At least one skill is required');
  }
  
  // Availability validation
  if (!data.availability || !['fulltime', 'parttime'].includes(data.availability)) {
    errors.push('Availability must be either fulltime or parttime');
  }
  
  // Academic credentials validation
  if (data.academic_credentials && Array.isArray(data.academic_credentials)) {
    data.academic_credentials.forEach((cred: any, index: number) => {
      if (!cred.degree || typeof cred.degree !== 'string' || cred.degree.trim().length === 0) {
        errors.push(`Academic credential ${index + 1}: Degree is required`);
      }
      
      if (!cred.institution || typeof cred.institution !== 'string' || cred.institution.trim().length === 0) {
        errors.push(`Academic credential ${index + 1}: Institution is required`);
      }
      
      if (!cred.year || !Number.isInteger(cred.year) || cred.year < 1950 || cred.year > new Date().getFullYear()) {
        errors.push(`Academic credential ${index + 1}: Valid year between 1950 and ${new Date().getFullYear()} is required`);
      }
      
      if (cred.gpa !== undefined && cred.gpa !== null) {
        const gpa = parseFloat(cred.gpa);
        if (isNaN(gpa) || gpa < 0 || gpa > 4) {
          errors.push(`Academic credential ${index + 1}: GPA must be between 0 and 4`);
        }
      }
    });
  }
  
  // Previous roles validation
  if (data.previous_roles && Array.isArray(data.previous_roles)) {
    data.previous_roles.forEach((role: any, index: number) => {
      if (!role.position || typeof role.position !== 'string' || role.position.trim().length === 0) {
        errors.push(`Previous role ${index + 1}: Position is required`);
      }
      
      if (!role.organisation || typeof role.organisation !== 'string' || role.organisation.trim().length === 0) {
        errors.push(`Previous role ${index + 1}: Organisation is required`);
      }
      
      if (!role.startDate || typeof role.startDate !== 'string') {
        errors.push(`Previous role ${index + 1}: Start date is required`);
      }
      
      if (role.endDate && typeof role.endDate === 'string') {
        if (new Date(role.endDate) < new Date(role.startDate)) {
          errors.push(`Previous role ${index + 1}: End date cannot be before start date`);
        }
      }
    });
  }
  
  return { 
    valid: errors.length === 0,
    errors
  };
};