import { Course, Tutor, Lecturer, UserRole, TutorApplication, PreviousRole, AcademicCredential } from "@/lib/types";

// Dummy courses data (from BP094P21 program structure)
export const courses: Course[] = [
  {
    id: '1',
    code: 'COSC2801',
    name: 'Programming bootcamp 1',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '2',
    code: 'COSC2803',
    name: 'Programming studio 1',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '3',
    code: 'COSC2802',
    name: 'Programming bootcamp 2',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '4',
    code: 'COSC2804',
    name: 'Programming studio 2',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '5',
    code: 'COSC1107',
    name: 'Computing theory',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '6',
    code: 'COSC1076',
    name: 'Advanced programming techniques',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '7',
    code: 'COSC2299',
    name: 'Software engineering: process and tools',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '8',
    code: 'COSC2123',
    name: 'Algorithms and analysis',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '9',
    code: 'COSC1114',
    name: 'Operating systems principles',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '10',
    code: 'COSC1147',
    name: 'Professional computing practice',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '11',
    code: 'COSC1127',
    name: 'Artificial intelligence',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '12',
    code: 'COSC2626',
    name: 'Cloud computing',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '13',
    code: 'COSC2408',
    name: 'Programming project 1',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '14',
    code: 'COSC2409',
    name: 'Programming project 2',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '15',
    code: 'COSC1204',
    name: 'Agent-oriented programming and design',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '16',
    code: 'COSC1111',
    name: 'Data communication and net-centric computing',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '17',
    code: 'COSC2406',
    name: 'Database systems',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '18',
    code: 'COSC2972',
    name: 'Deep learning',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '19',
    code: 'COSC2758',
    name: 'Full stack development',
    semester: 'Semester 1',
    year: 2025
  },
  {
    id: '20',
    code: 'COSC2738',
    name: 'Practical data science',
    semester: 'Semester 1',
    year: 2025
  }
];

// ==========================================
// DEFAULT USER DATA
// ==========================================

// Dummy Lecturer
export const dummyLecturer: Lecturer = {
  name: 'Dummy Lecturer',
  email: 'lecturer@gmail.com',
  role: UserRole.Lecturer,
  password: 'dummyLecturer.123',
  courses: ['1', '2', '3', '7', '19'], // COSC2801, COSC2803, COSC2802, COSC2299, COSC2758
};

// Dummy Tutor
export const dummyTutor: Tutor = {
  name: 'Dummy Tutor',
  email: 'tutor@gmail.com',
  role: UserRole.Tutor,
  password: 'dummyTutor.123',
  applications: []
};

//tutors for testing
export const extraTutors: Tutor[] = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: UserRole.Tutor,
    password: 'Password.123',
    applications: []
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: UserRole.Tutor,
    password: 'Password.123',
    applications: []
  }
];

// Sample previous roles
export const samplePreviousRoles: PreviousRole[] = [
  {
    id: '1',
    position: 'Teaching Assistant',
    organisation: 'RMIT University',
    startDate: '2021-06-01',
    endDate: '2021-12-31',
    description: 'Assisted with programming labs and tutorials'
  },
  {
    id: '2',
    position: 'Software Developer Intern',
    organisation: 'Tech Solutions',
    startDate: '2022-01-15',
    endDate: '2022-12-15',
    description: 'Developed web applications using React and Node.js'
  },
  {
    id: '3',
    position: 'Junior Developer',
    organisation: 'WebSolutions',
    startDate: '2021-02-01',
    endDate: '2022-05-30',
    description: 'Developed front-end components and fixed bugs'
  }
];

// Sample academic creds
export const sampleAcademicCredentials: AcademicCredential[] = [
  {
    id: '1',
    degree: 'BSc Computer Science',
    institution: 'RMIT University',
    year: 2022,
    gpa: 3.8
  },
  {
    id: '2',
    degree: 'Master of Information Technology',
    institution: 'RMIT University',
    year: 2023,
    gpa: 3.9
  },
  {
    id: '3',
    degree: 'BSc Software Engineering',
    institution: 'Monash University',
    year: 2021,
    gpa: 3.5
  }
];


//sample applications
export const createSampleApplications = (): TutorApplication[] => {
  const applications: TutorApplication[] = [
    {
      id: 'app-1',
      tutorEmail: dummyTutor.email,
      courseId: '1',
      role: 'tutor',
      skills: ['JavaScript', 'Python', 'React'],
      previousRoles: [samplePreviousRoles[0]],
      academicCredentials: [sampleAcademicCredentials[0]],
      availability: 'parttime',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      status: 'Pending',
      comments: []
    },
    {
      id: 'app-2',
      tutorEmail: dummyTutor.email,
      courseId: '2',
      role: 'lab_assistant',
      skills: ['JavaScript', 'Python', 'React'],
      previousRoles: [samplePreviousRoles[0]],
      academicCredentials: [sampleAcademicCredentials[0]],
      availability: 'parttime',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      status: 'Pending',
      comments: []
    },

    // Alice's applications
    {
      id: 'app-3',
      tutorEmail: extraTutors[0].email,
      courseId: '7',
      role: 'tutor',
      skills: ['Java', 'Spring Boot', 'SQL', 'React'],
      previousRoles: [samplePreviousRoles[1]],
      academicCredentials: [sampleAcademicCredentials[1]],
      availability: 'fulltime',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      status: 'Pending',
      comments: []
    },
    {
      id: 'app-4',
      tutorEmail: extraTutors[0].email,
      courseId: '19',
      role: 'lab_assistant',
      skills: ['Java', 'Spring Boot', 'SQL', 'React'],
      previousRoles: [samplePreviousRoles[1]],
      academicCredentials: [sampleAcademicCredentials[1]],
      availability: 'fulltime',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      status: 'Pending',
      comments: []
    },

    // Bob's applications
    {
      id: 'app-5',
      tutorEmail: extraTutors[1].email,
      courseId: '3',
      role: 'tutor',
      skills: ['JavaScript', 'TypeScript', 'React', 'HTML/CSS'],
      previousRoles: [samplePreviousRoles[2]],
      academicCredentials: [sampleAcademicCredentials[2]],
      availability: 'parttime',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      status: 'Pending',
      comments: []
    },
    {
      id: 'app-6',
      tutorEmail: extraTutors[1].email,
      courseId: '4',
      role: 'tutor',
      skills: ['JavaScript', 'TypeScript', 'React', 'HTML/CSS'],
      previousRoles: [samplePreviousRoles[2]],
      academicCredentials: [sampleAcademicCredentials[2]],
      availability: 'parttime',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: 'Pending',
      comments: []
    }
  ];

  return applications;
};

//initialize dummy data
export const initializeUsers = (): void => {
  if (typeof window === 'undefined') return;

  // Check if data is already initialized
  const isInitialized = localStorage.getItem('usersInitialized') === 'true';
  if (isInitialized) return;

  // sample applications
  const applications = createSampleApplications();

  // Add applications to tutors
  dummyTutor.applications = applications.filter(app => app.tutorEmail === dummyTutor.email);
  extraTutors[0].applications = applications.filter(app => app.tutorEmail === extraTutors[0].email);
  extraTutors[1].applications = applications.filter(app => app.tutorEmail === extraTutors[1].email);

  // Save users to localStorage
  localStorage.setItem(dummyTutor.email, JSON.stringify(dummyTutor));
  localStorage.setItem(dummyLecturer.email, JSON.stringify(dummyLecturer));
  extraTutors.forEach(tutor => {
    localStorage.setItem(tutor.email, JSON.stringify(tutor));
  });

  // Save applications to localStorage
  localStorage.setItem('tutorApplications', JSON.stringify(applications));

  // Mark data as initialized
  localStorage.setItem('usersInitialized', 'true');
};
