```bash
backend/
│
├── .gitignore             # Ignores node_modules and other unnecessary files
├── package.json           # Project configuration and dependencies
├── tsconfig.json          # TypeScript configuration
│
└── src/
    ├── index.ts           # Entry point for the Express server
    ├── data-source.ts     # TypeORM database connection configuration
    │
    ├── entity/            # Database entity definitions
    │   ├── User.ts        # Base user entity with common properties
    │   ├── Tutor.ts       # Tutor entity extending User
    │   ├── Lecturer.ts    # Lecturer entity extending User
    │   ├── Admin.ts       # Admin entity extending User
    │   ├── Course.ts      # Course entity definition
    │   └── TutorApplication.ts  # Application entity with relationships
    │
    ├── controller/        # Route handlers
    │   ├── AuthController.ts    # Handles login and registration
    │   ├── UserController.ts    # User CRUD operations
    │   ├── CourseController.ts  # Course CRUD operations
    │   └── ApplicationController.ts  # Application CRUD and status updates
    │
    ├── routes/            # Express route definitions
    │   ├── auth.routes.ts       # Authentication routes
    │   ├── user.routes.ts       # User routes
    │   ├── course.routes.ts     # Course routes
    │   └── application.routes.ts  # Application routes
    │
    └── middleware/        # Custom middleware
        └── auth.middleware.ts  # Authentication middleware
        ```