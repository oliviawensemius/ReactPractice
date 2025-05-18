import { PreviousRole, AcademicCredential, TutorApplication } from '@/lib/types';

/**
 * Creates a tutor application
 */
export const createTutorApplication = (
  tutorEmail: string,
  tutorName: string,
  courseId: string,
  role: 'tutor' | 'lab_assistant',
  skills: string[],
  previousRoles: PreviousRole[],
  academicCredentials: AcademicCredential[],
  availability: 'fulltime' | 'parttime'
): TutorApplication => {
  return {
    id: `app-${Date.now()}`, // unique ID
    tutorEmail,
    courseId,
    role,
    skills,
    previousRoles,
    academicCredentials,
    availability,
    createdAt: new Date().toISOString(),
    status: 'Pending',
    comments: []
  };
};

/**
 * Adds a previous role with a generated ID
 */
export const addPreviousRole = (
  role: Omit<PreviousRole, 'id'>,
  currentRoles: PreviousRole[]
): PreviousRole[] => {
  if (!role.position || !role.organisation || !role.startDate) {
    return currentRoles;
  }

  return [
    ...currentRoles,
    {
      ...role,
      id: `role-${Date.now()}`
    }
  ];
};

/**
 * Removes a previous role by ID
 */
export const removePreviousRole = (
  roleId: string,
  currentRoles: PreviousRole[]
): PreviousRole[] => {
  return currentRoles.filter(role => role.id !== roleId);
};

/**
 * Adds an academic credential with a generated ID
 */
export const addAcademicCredential = (
  credential: Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string },
  currentCredentials: AcademicCredential[]
): AcademicCredential[] => {
  if (!credential.degree || !credential.institution) {
    return currentCredentials;
  }

  return [
    ...currentCredentials,
    {
      ...credential,
      id: `cred-${Date.now()}`,
      gpa: credential.gpa ? parseFloat(credential.gpa) : undefined
    }
  ];
};

/**
 * Removes an academic credential by ID
 */
export const removeAcademicCredential = (
  credentialId: string,
  currentCredentials: AcademicCredential[]
): AcademicCredential[] => {
  return currentCredentials.filter(cred => cred.id !== credentialId);
};

/**
 * Adds a skill if it doesn't already exist
 */
export const addSkill = (
  newSkill: string,
  currentSkills: string[]
): string[] => {
  if (!newSkill || currentSkills.includes(newSkill)) {
    return currentSkills;
  }

  return [...currentSkills, newSkill];
};

/**
 * Removes a skill by value
 */
export const removeSkill = (
  skillToRemove: string,
  currentSkills: string[]
): string[] => {
  return currentSkills.filter(skill => skill !== skillToRemove);
};

