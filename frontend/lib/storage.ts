import { User, Lecturer, Tutor, TutorApplication, UserRole, PreviousRole, AcademicCredential } from "./types";

// ==========================================
// USER STORAGE FUNCTIONS
// ==========================================

/**
 * Creates a new user in localStorage
 */
export const createUser = (user: User) => {
  localStorage.setItem(user.email, JSON.stringify(user));
};

// FUNCTIONS FOR ALL USERS

export const getPassword = (email: string) => {
  const user = localStorage.getItem(email);
  if (user) {
    return JSON.parse(user).password;
  }
  return null;
};

export const getName = (email: string) => {
  const user = localStorage.getItem(email);
  if (user) {
    return JSON.parse(user).name;
  }
  return null;
};

export const getRole = (email: string) => {
  const user = localStorage.getItem(email);
  if (!user) {
    return null;
  }
  return JSON.parse(user).role;

};

/**
 * Gets full user data by email
 */
export const getUserData = (email: string): Tutor | Lecturer | null => {
  const user = localStorage.getItem(email);
  if (!user) {
    return null;
  }
  return JSON.parse(user);
};

// FUNCTIONS FOR TUTORS

/**
 * Get applications for a specific tutor
 */
export const getTutorApplications = (email: string): TutorApplication[] => {
  const userData = getUserData(email);
  if (userData && userData.role === UserRole.Tutor) {
    return (userData as Tutor).applications || [];
  }
  return [];
};

/**
 * Get all applications for a specific course
 */
export const getApplicationsForCourse = (courseId: string): TutorApplication[] => {
  const allApplications = getAllApplications();
  return allApplications.filter(app => app.courseId === courseId);
};

/**
 * Get all tutor applications from localStorage
 */
export const getAllApplications = (): TutorApplication[] => {
  const applications = localStorage.getItem('tutorApplications');
  if (!applications) {
    return [];
  }
  return JSON.parse(applications);
};

/**
 * Get skills for a specific application
 */
export const getSkills = (applicationId: string): string[] => {
  const applications = getAllApplications();
  const app = applications.find(a => a.id === applicationId);
  return app?.skills || [];
};

/**
 * Get availability for a specific application
 */
export const getAvailability = (applicationId: string): 'fulltime' | 'parttime' | null => {
  const applications = getAllApplications();
  const app = applications.find(a => a.id === applicationId);
  return app?.availability || null;
};

/**
 * Get previous roles for a specific application
 */
export const getPreviousRoles = (applicationId: string): PreviousRole[] => {
  const applications = getAllApplications();
  const app = applications.find(a => a.id === applicationId);
  return app?.previousRoles || [];
};

/**
 * Get academic credentials for a specific application
 */
export const getAcademicCredentials = (applicationId: string): AcademicCredential[] => {
  const applications = getAllApplications();
  const app = applications.find(a => a.id === applicationId);
  return app?.academicCredentials || [];
};

/**
 * Add a comment to an application
 */
export const addComment = (applicationId: string, comment: string): void => {
  const applications = getAllApplications();
  const appIndex = applications.findIndex(a => a.id === applicationId);

  if (appIndex !== -1) {
    if (!applications[appIndex].comments) {
      applications[appIndex].comments = [];
    }
    applications[appIndex].comments?.push(comment);
    saveAllApplications(applications);
  }
};

/**
 * Get comments for a specific application
 */
export const getComments = (applicationId: string): string[] => {
  const applications = getAllApplications();
  const app = applications.find(a => a.id === applicationId);
  return app?.comments || [];
};

//FUNCTIONS FOR LECTURERS

/**
 * Get courses for a lecturer
 */
export const getCourses = (email: string): string[] | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(email);
  if (user) {
    const userData = JSON.parse(user);
    if (userData.role === UserRole.Lecturer) {
      return userData.courses;
    }
  }
  return null;
};

//FUNCTIONS FOR TUTOR APPLICATION
/**
 * Save a new tutor application
 */
// export const saveTutorApplication = (application: TutorApplication): void => {
//   if (typeof window === 'undefined') return;

//   // Add application to global applications list
//   const allApplications = getAllApplications();
//   allApplications.push(application);
//   saveAllApplications(allApplications);

//   // Add application to tutor's record
//   const tutorData = getUserData(application.tutorEmail);
//   if (tutorData && tutorData.role === UserRole.Tutor) {
//     const tutor = tutorData as Tutor;
//     if (!tutor.applications) {
//       tutor.applications = [];
//     }
//     tutor.applications.push(application);
//     localStorage.setItem(application.tutorEmail, JSON.stringify(tutor));
//   }
// };

/**
 * Save all applications to localStorage
 */
export const saveAllApplications = (applications: TutorApplication[]): void => {
  localStorage.setItem('tutorApplications', JSON.stringify(applications));
};

/**
 * Update application status
 */
export const updateApplicationStatus = (
  applicationId: string,
  status: 'Pending' | 'Selected' | 'Rejected'
): void => {
  const applications = getAllApplications();
  const appIndex = applications.findIndex(a => a.id === applicationId);

  if (appIndex !== -1) {
    applications[appIndex].status = status;

    // Add a ranking if being selected
    if (status === 'Selected' && !applications[appIndex].ranking) {
      const selectedCount = applications.filter(a => a.status === 'Selected').length;
      applications[appIndex].ranking = selectedCount;
    }

    saveAllApplications(applications);

    // Update in tutor's record
    const tutorEmail = applications[appIndex].tutorEmail;
    const tutorData = getUserData(tutorEmail);
    if (tutorData && tutorData.role === UserRole.Tutor) {
      const tutor = tutorData as Tutor;
      const tutorAppIndex = tutor.applications.findIndex(a => a.id === applicationId);
      if (tutorAppIndex !== -1) {
        tutor.applications[tutorAppIndex] = applications[appIndex];
        localStorage.setItem(tutorEmail, JSON.stringify(tutor));
      }
    }
  }
};

/**
 * Update application ranking
 */
export const updateApplicationRanking = (
  applicationId: string,
  ranking: number
): boolean => {
  const applications = getAllApplications();
  const appIndex = applications.findIndex(a => a.id === applicationId);

  if (appIndex === -1 || applications[appIndex].status !== 'Selected') {
    return false;
  }

  // Get all selected applications
  const selectedApps = applications.filter(a => a.status === 'Selected');

  // Validate ranking
  if (ranking < 1 || ranking > selectedApps.length) {
    return false;
  }

  // Get current ranking
  const currentRanking = applications[appIndex].ranking || 0;

  // Adjust rankings of affected applications
  applications.forEach(app => {
    if (app.status !== 'Selected' || app.id === applicationId) return;

    const appRanking = app.ranking || 0;

    if (currentRanking && ranking > currentRanking && appRanking > currentRanking && appRanking <= ranking) {
      // Moving down: shift others up
      app.ranking = (appRanking || 0) - 1;
    } else if (currentRanking && ranking < currentRanking && appRanking < currentRanking && appRanking >= ranking) {
      // Moving up: shift others down
      app.ranking = (appRanking || 0) + 1;
    }
  });

  // Set the new ranking
  applications[appIndex].ranking = ranking;

  // Save changes
  saveAllApplications(applications);

  // Update tutor records
  applications.forEach(app => {
    const tutorData = getUserData(app.tutorEmail);
    if (tutorData && tutorData.role === UserRole.Tutor) {
      const tutor = tutorData as Tutor;
      const tutorAppIndex = tutor.applications.findIndex(a => a.id === app.id);
      if (tutorAppIndex !== -1) {
        tutor.applications[tutorAppIndex] = app;
        localStorage.setItem(app.tutorEmail, JSON.stringify(tutor));
      }
    }
  });

  return true;
};

/**
 * Get selected applications ordered by ranking
 */
export const getSelectedApplications = (): TutorApplication[] => {
  const applications = getAllApplications();
  return applications
    .filter(app => app.status === 'Selected')
    .sort((a, b) => {
      if (!a.ranking) return 1;
      if (!b.ranking) return -1;
      return a.ranking - b.ranking;
    });
};

/**
 * Get statistics about applicant selections
 */
export const getApplicantStatistics = () => {
  const applications = getAllApplications();

  // Count selections by email
  const selectionCounts: Record<string, { count: number; name: string }> = {};
  const emailsWithSelection = new Set<string>();

  // Get all unique tutors
  const allTutorEmails = [...new Set(applications.map(app => app.tutorEmail))];

  // Initialize counts for all tutors
  allTutorEmails.forEach(email => {
    const tutorData = getUserData(email);
    selectionCounts[email] = {
      count: 0,
      name: tutorData?.name || email
    };
  });

  // Count selected applications
  applications.forEach(app => {
    if (app.status === 'Selected') {
      selectionCounts[app.tutorEmail].count++;
      emailsWithSelection.add(app.tutorEmail);
    }
  });

  // Find unselected applicants (those with no selected applications)
  const unselectedEmails = allTutorEmails.filter(email => !emailsWithSelection.has(email));
  const unselectedApplicants = unselectedEmails.map(email => {
    const tutorData = getUserData(email);
    return {
      email,
      name: tutorData?.name || email
    };
  });

  // Find most and least selected
  let mostSelected = null;
  let leastSelected = null;

  const applicantsWithSelections = Object.entries(selectionCounts)
    .filter(([,data]) => data.count > 0);

  if (applicantsWithSelections.length > 0) {
    // Find most selected
    mostSelected = applicantsWithSelections.reduce((max, current) =>
      current[1].count > max[1].count ? current : max
    );

    // Find least selected
    leastSelected = applicantsWithSelections.reduce((min, current) =>
      current[1].count < min[1].count ? current : min
    );

    // Format results
    mostSelected = {
      email: mostSelected[0],
      name: mostSelected[1].name,
      count: mostSelected[1].count
    };

    leastSelected = {
      email: leastSelected[0],
      name: leastSelected[1].name,
      count: leastSelected[1].count
    };
  }

  return {
    mostSelected,
    leastSelected,
    unselectedApplicants
  };
};