# TeachTeam (TT)

## Assignment 1 - COSC2758 Full Stack Development

A client-side prototype of the TeachTeam (TT) web system, a platform dedicated to the selection and hiring of casual tutors for courses offered at the School of Computer Science.

## GitHub Repository

[https://github.com/rmit-fsd-2025-s1/s4101562-s4095526-a1](https://github.com/rmit-fsd-2025-s1/s4101562-s4095526-a1)

## Team Members

- Olivia Wensemius (s4101562)
- Fatima Hubail (s4095526)

## Technology Stack

- React
- Next.js
- Typescript
- Tailwind CSS
- LocalStorage for now....

## Features

- User authentication (login)
- Dashboard for tutors to apply for teaching positions
- Dashboard for lecturers to review and select candidates
- Search and sorting functionality
- Visual data representation

## Project Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

```
## Project Structure
```bash
app/
├── (auth)/                                           # Authentication routes
│   ├── signin/                                       # Sign-in folder
│       ├── page.tsx                                  # Sign-in page
│       └── signin.test.tsx                           # Sign-in page testing
│   └── layout.tsx                                    # Layout for auth pages
├── (dashboard)/                                      # Dashboard routes
│   ├── lecturer/                                     # Lecturer dashboard pages
│       └── page.tsx                                  # Lecture dashboard page                 
│   ├── tutor/                                        # Tutor dashboard pages
│       └── page.tsx                                  # Tutor dashboard page    
│   └── layout.tsx                                    # Layout for dashboard pages
├── page.tsx                                          # Home page
├── layout.tsx                                        # Root layout
├── globals.css                                       # Global styles
├── page.tsx                                          # Page
components/
├── auth/                                             # Authentication-related components
├── landing/                                          # Landing page components 
│   ├── CTASection.tsx
│   ├── FeatureCard.tsx
│   ├── FeatureSelection.tsx
├── layout/                                           # Layout components (header, footer, etc.)
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── MainLayout.test.tsx                           # Test for the main layout compoment
│   ├── MainLayout.tsx
│   └── Navbar.tsx
├── lecturer/                                         # Lecturer-specific components
│   ├── ApplicantDetails.test.tsx
│   ├── ApplicantDetails.tsx
│   ├── ApplicantList.tsx
│   ├── ApplicantStatistics.tsx
│   ├── ComppactSortControls.tsx
│   ├── Searchbar.tsx
│   └── SelectedCandidates.test.tsx       
│   └── SelectedCandidates.tsx       
├── tutor/                                            # Tutor-specific components
│   ├── AcademicCredentials.tsx
│   ├── AcademicSelection.tsx
│   ├── CourseSelection.test.tsx
│   ├── CourseSelection.tsx
│   ├── PreviousRoles.tsx
│   ├── SkillsList.tsx
├── ui/                                               # Generic UI components (buttons, inputs, etc.)
│   ├── Button.tsx                                    # Button used in project
│   ├── Card.tsx                                      # Card component used in dashboards
│   ├── Notification.test.tsx                         # Test of notification component
│   ├── Notification.tsx                              # Notification component used in sign in page
lib/                                                  # Utility functions and libraries
├── applicantList.ts
├── auth.ts
├── data.ts                                           # Dummy data
├── lecturer.ts                                       # Lecturer helper functions
├── storage.ts                                        # LocalStorage utilities
├── tutor.ts                                          # Tutor helper functions
├── types.ts                                          # Interafces for users
└── validation.ts                                     # Form validation functions
public/                                               # Static assets

```

## Files
- **app/auth/signin/page.tsx:** This is a React component for the sign-in page that implements user authentication. It includes a form with email and password inputs, error handling, notifications for success/failure, and role-based redirection. The page also displays demo credentials for testing.



- **app/auth/signin.test.tsx**: A test file for the sign-in page using React Testing Library. It tests rendering of the form, validation for empty fields, error handling for invalid credentials, and proper redirection for valid login attempts by both lecturer and tutor users.



- **app/auth/layout.tsx**: A simple layout component for authentication pages that creates a centered container with a maximum width, providing consistent styling across auth-related pages like sign-in and sign-up.


- **app/dashboard/lecturer/page.tsx**: The dashboard for lecturers that displays applicant data for courses. It includes functionality for viewing applicant lists, applicant details, search filtering, and statistics. The component manages state for selected applicants, course filtering, and handles refreshing data when selections change. It redirects to the sign-in page if no user is authenticated.



- **app/dashboard/tutor/page.tsx**: A React component for the tutor application dashboard where tutors can apply for teaching positions. It includes forms for course selection, role selection (tutor or lab assistant), availability preferences, skills listing, previous roles documentation, and academic credential submission. The component handles form validation and submission of applications.



- **app/dashboard/layout.tsx**: A simple layout component for the dashboard section that simply passes through its children components without adding additional styling or structure.



- **app/global.css**: The application's global stylesheet that imports Tailwind CSS and defines a comprehensive style guide for TeachTeam. It includes color palettes (emerald greens as primary colors), typography guidelines, component styling standards, and layout recommendations for consistent design across the application.



- **app/layout.tsx**: The root layout component that wraps all pages in the application. It sets metadata (title and description), imports global CSS, and embeds all content within a MainLayout component.



- **app/page.tsx**: The landing page component that composes three sections: HeroSection, FeaturesSection, and CTASection. These sections are arranged to create the home page for visitors who aren't logged in.



- **components/landing/CTASection.tsx**: A React component that creates a call-to-action section with a green background. It encourages users to sign up or sign in to access TeachTeam's features, providing prominent buttons that link to the respective authentication pages.



- **components/landing/FeatureCard.tsx**: A reusable component that displays a feature with an icon, title, and description. It uses the Card UI component to create consistent styling and accepts props to customize the content displayed within each card.



- **components/landing/FeaturesSection.tsx**: A section component that displays three FeatureCards in a responsive grid layout. It highlights the key features of TeachTeam for different user types: tutor applicants, lecturers, and the overall streamlined process, each with a descriptive icon.




- **components/layout/Footer.tsx**: A page footer component with a lime background and emerald text. It's organized into three columns displaying quick links for navigation, developer information, and a brief description of TeachTeam. It also includes a copyright notice with the current year.



- **components/layout/Navbar.tsx**: A navigation component that displays differently based on authentication status. When users are logged in, it shows role-specific links (apply for tutors, review applicants for lecturers) and user information with a sign-out button. For unauthenticated users, it shows sign-in and sign-up buttons. It uses client-side code to check authentication status and handle sign-out functionality.



- **components/layout/Header.tsx**: A page header component with a lime background that displays the application title and a tagline about the tutor selection system. When a user is authenticated, it also shows a user information box with their name and role. The component is designed to be responsive and visually prominent at the top of each page.



- **components/layout/MainLayout.test.tsx**: A test file for the MainLayout component that verifies it renders correctly with its child components (Header, Navbar, Footer) and properly initializes user data. It mocks authentication-related functions and child components to isolate testing of the MainLayout functionality.



- **components/layout/MainLayout.tsx**: The main layout wrapper for the entire application that provides consistent structure across all pages. It includes Navigation, Header, and Footer components and manages authentication state. The component initializes sample users on mount and listens for authentication state changes, passing that information to its child components.



- **components/lecturer/ApplicantList.tsx**: The ApplicantList component displays a list of tutor applicants filtered by course selection and search criteria. It retrieves applicants dynamically, allowing users to filter by tutor name, availability, and skill set. Sorting options are provided to arrange applicants by course name or availability. The component also includes a dropdown to filter applicants by course and updates the list in real time based on user interactions. Clicking an applicant selects them for further actions, and status indicators visually differentiate selected, rejected, and pending applicants.



- **components/lecturer/ApplicantStatistics.tsx**: The ApplicantStatistics component provides an overview of applicant selection trends. It calculates and displays the most selected and least selected applicants based on selection count, as well as a list of unselected applicants. The component fetches statistics using getApplicantStatistics() from applicantList and updates its state accordingly. It visually organizes the data into three sections using color-coded cards for clarity: green for the most selected applicant, yellow for the least selected, and red for unselected applicants. If no selections have been made, appropriate placeholder messages are shown.



- **components/lecturer/CompactSortControls.tsx**: The CompactSortControls component provides sorting functionality for tutor applicants based on course name or availability. It allows users to toggle between ascending and descending order by clicking the respective buttons. The selected sort option is visually highlighted in green, while unselected options remain gray. A "Clear" button appears when sorting is active, allowing users to reset the sorting criteria. This component ensures a user-friendly and efficient way to organize applicant data dynamically.



- **components/lecturer/Searchbar.tsx**: The SearchBar component enables users to filter tutor applicants based on multiple criteria, including course name, tutor name, availability, and skill set. It maintains an internal state for search inputs and updates them dynamically as users type. A "Search" button triggers the filtering function, while a "Reset" button clears all fields and resets the state. The component optionally includes a course search field, depending on the showCourseSearch prop. Styled with a clean UI, it enhances usability by providing dropdowns for availability and placeholders for intuitive input guidance.



- **components/lecturer/SelectedCandidates.test.tsx**: Test suite verifies the functionality of the SelectedCandidates component, which displays and manages a list of selected tutor applicants. It mocks getSelectedApplicants and updateRanking from applicantList to control test behavior. The tests ensure that the component renders applicants correctly, displays a message when no applicants are available, triggers selection when an applicant is clicked, and supports ranking adjustments. The suite also verifies that rank changes can be saved or canceled, ensuring robust interaction handling within the component.



- **components/lecturer/SelectedCandidates.tsx**: This React component displays a table of selected tutor applicants, allowing users to view, rank, and manage them. It fetches the list of selected applicants using getSelectedApplicants from applicantList and updates rankings through updateRanking. The table allows users to adjust rankings dynamically, triggering updates in the UI. It also includes automatic periodic refreshes to keep the list updated. Clicking on an applicant notifies the parent component using onSelectApplicant.



- **components/tutor/AcademicCredentials.tsx**: This React component allows tutors to manage their academic credentials within the system. It displays a list of added credentials and provides a form to add new ones. Users can input details such as the degree, institution, graduation year, and optional GPA. The component enables credential deletion and updates the parent component via onAddCredential and onRemoveCredential functions. It uses a card-style layout with responsive inputs for better user experience.



- **components/tutor/AvailabilitySelection.tsx**: This component allows tutors to specify their availability as either full-time or part-time. It presents a radio button selection inside a styled card, ensuring clear and simple interaction. The selected availability is controlled via the availability prop, and changes are communicated to the parent component using the onChange callback. The design ensures accessibility and ease of use.



- **components/tutor/CourseSelectionComponent.tsx**: The CourseSelectionComponent.tsx allows tutors or lab assistants to select courses they want to apply for. It provides a dropdown menu to choose from available courses and another dropdown to select the role (either "Tutor" or "Lab Assistant"). Users can add their selected course-role pair, which is displayed as a list of selected courses with an option to remove them. The component maintains local state for the selected course and role, updating the parent component via onAddCourse and onRemoveCourse callbacks. It ensures a clean UI with proper accessibility and validation, preventing empty submissions.



- **components/tutor/CourseSelectionComponent.test.tsx**: The test suite for the CourseSelectionComponent verifies the component's functionality by simulating user interactions and checking the expected outcomes. It first tests the initial rendering of the component, ensuring key elements like the course selection header and instructions are present. The second test simulates the user selecting a course and role from dropdowns and clicking the "Add Course" button, confirming that the onAddCourse function is called with the correct arguments. The third test checks if the selected courses are correctly rendered and allows users to remove them, triggering the onRemoveCourse function. The fourth test handles an edge case where a selected course is not found in the available course list, ensuring that the course ID does not appear in the document. Finally, the fifth test ensures that the "Add Course" button is disabled when no course is selected, confirming that the button's state behaves correctly based on the form's input. Overall, the tests ensure the CourseSelectionComponent behaves as expected in various scenarios.


- **components/tutor/SkillsList.tsx**: The PreviousRoles component allows tutors to manage their past teaching or related experience. It displays a list of previously held roles, each showing details like position, organization, start and end dates, and an optional description. Users can add new roles by filling out a form with fields for position, organization, dates, and a description. The form is reset after submission. Each role entry has a remove button for deletion. The component uses state to manage input fields and triggers callback functions (onAddRole and onRemoveRole) to update the parent component's data. It is styled using a card layout with responsive form inputs.


- **components/tutor/PreviousRoles.tsx**: The SkillsList component is a functional React component that allows users, specifically tutors, to manage their list of skills by adding or removing entries dynamically. It receives three props: an array of existing skills, a function to add a skill, and another to remove a skill. Internally, it maintains local state for a new skill being entered and handles both click and keyboard interactions for submission. Users can input a skill and either press the "Add" button or hit Enter to add it, as long as it’s not already in the list and is not just whitespace. The skills are visually displayed in rounded badge-like elements with a remove button beside each one, styled using Tailwind CSS classes for a clean UI. If no skills are present, a message indicates this with a muted italic style. The component is wrapped in a reusable Card component for structured presentation, contributing to a consistent and responsive user experience.

  

- **components/ui/Button.tsx**: The Button component is a reusable UI element that provides styled buttons with different variants. It supports three styles: Primary: White background with emerald text, secondary: Emerald background with white text, Outline: Transparent with a white border and text. The component can function as either a regular button (<button>) or a link (<Link>) if an href is provided. It accepts optional props for onClick, className (for additional styling), and type (button, submit, or reset). Styles are dynamically assigned based on the selected variant, ensuring consistent UI behavior.



- **components/ui/Card.tsx**: The Card component is a reusable container for displaying content with a consistent style. Key features include an optional title prop: If provided, it renders a header section with an emerald-themed background and border, customizable styling: Accepts an optional className for additional styling flexibility. and encapsulates content: Wraps children inside a white, rounded box with a shadow for a clean UI. Structured to group related information in a structured and visually appealing way.



- **components/ui/Notification.test.tsx**: The Notification component test suite ensures that notifications render correctly with the appropriate message and styling based on their type. It verifies that success and error messages apply the correct background classes and that notifications disappear after the specified duration using Jest’s fake timers. It also checks whether the onClose callback is triggered when the close button is clicked, confirming that user interactions properly dismiss the notification. Additionally, the tests ensure that notifications do not appear when isVisible is false and validate that manual closing works as expected.



- **components/ui/Notification.tsx**: The Notification component displays temporary messages to inform users of success or error states. It starts as visible and automatically disappears after a specified duration, defaulting to three seconds. The component uses useEffect to set a timer that hides the notification and calls an optional onClose callback when the duration ends. It supports manual dismissal through a close button, which immediately hides the notification and triggers the onClose function if provided. The styling adapts based on the notification type, applying a green background for success messages and a red background for errors, with smooth transitions for visibility changes.



- **lib/applicantList.tsx**: This module provides functions for managing tutor applications, retrieving applicant data, and handling course-related details. It includes utilities for converting raw tutor applications into a structured format that is easier to display, ensuring that course details are accurately retrieved based on either course IDs or codes. Functions are available to fetch applicants for specific courses, list all courses with applications, and retrieve selected applicants along with their rankings. It also supports updating application statuses and rankings, adding and retrieving comments, and obtaining statistical insights into applicant selections. The module includes safeguards to prevent execution in non-browser environments.



- **lib/auth.ts**: The code in this file provides functions for managing user authentication and roles within an application. It checks if a user is logged in using the isUserLoggedIn function, which verifies the presence of a user's email in the localStorage. The getCurrentUser function retrieves the user’s data from storage based on the email stored in localStorage. For logging in, the loginUser function checks the user's credentials with the checkUser function and, if valid, stores the user's email in localStorage, triggering a storage event to notify other components. The logoutUser function removes the user's email from localStorage and clears any related session state, ensuring a clean logout process. The functions isLecturer and isTutor check the user's role by comparing it with predefined roles, returning a boolean indicating whether the user is a lecturer or tutor. The getUserRoleDisplay function returns a string representation of the user's role for display, and getUserName fetches and returns the user's name from their profile. These functions help handle user login, logout, and role-based logic in a seamless manner within the application.



- **lib/data.ts**: This code defines a list of courses for the BP094P21 program structure, each course containing an id, code, name, semester, and year property. The courses span various subjects, including programming, computing theory, algorithms, operating systems, artificial intelligence, cloud computing, database systems, and data science. The courses are part of the semester 1 offerings for the year 2025. Each course is represented as an object that adheres to the Course interface, which could be used for building applications such as course listings, scheduling systems, or academic management platforms.



- **lib/lecturer.ts**: This code defines a function filterApplicantDisplays that filters a list of applicants (ApplicantDisplay[]) based on various search criteria provided by a SearchCriteria object. The filtering logic includes: Course Name/Code: It checks if the course name or code matches the search term provided in criteria.courseName. Tutor Name: It filters applicants whose tutor name includes the search term provided in criteria.tutorName. Availability: It filters applicants based on their availability matching the search term in criteria.availability. Skill Set: It checks if any of the applicant’s skills contain the search term in criteria.skillSet. The function returns a filtered array of applicants that match all the provided criteria. This is made for situations like a lecturer or administrator needing to search and narrow down applicants based on specific parameters such as course, tutor name, availability, and skills.



- **lib/storage.ts**: This file contains a series of functions for managing user and tutro applications, mainly using localStorage related functions. The key sections include user stroage functions to create a tutor object, and retrieveing tutor related information. Furthemrore, it includes tutor appliction storage functions relating to saving, updating, and creating applications. functions relating to getting selected applicants, applicant rankings and applicant statistics are also housed in this file.



- **lib/tutor.ts**: The tutor.ts file provides a set of functions for managing tutor applications, previous roles, academic credentials, and skills. The createTutorApplication function generates a new tutor application with a unique ID, including details such as the tutor's email, course ID, role, skills, previous roles, academic credentials, availability, and status. Functions like addPreviousRole and removePreviousRole allow for managing a tutor's previous work experience by adding or removing roles, while addAcademicCredential and removeAcademicCredential perform similar tasks for managing academic qualifications. The addSkill and removeSkill functions handle the tutor's skills, ensuring that duplicates are avoided when adding skills and enabling easy removal of unnecessary skills. These functions provide essential operations to manage and modify a tutor's profile data effectively, allowing for dynamic updates and interaction within the application system.



- **lib/types.ts**: The code defines various TypeScript interfaces to manage user roles, applications, and related data in an educational context. The UserRole enum distinguishes between tutors and lecturers, while the User interface serves as the base for both. Tutors have applications, represented by the TutorApplication interface, which includes details like the course, role, skills, previous roles, academic credentials, availability, and application status. PreviousRole and AcademicCredential interfaces track a tutor's prior work experience and educational background, respectively. The Course interface defines course details such as the code, name, semester, and year. Additionally, the ApplicantDisplay interface combines the tutor and application data for easy display, showing essential information like the tutor's name, email, skills, and application status. This structure ensures that the system can effectively manage and display tutor applications and related data for lecturers and administrators.



- **lib/validation.ts**: Contains various functions and data structures for managing users and tutor applications within a system. It includes validation functions for email, password, and unique email checks, as well as user authentication. The system uses localStorage to store dummy data for lecturers and tutors, such as their courses, applications, previous roles, and academic credentials. Additionally, it includes a function to validate tutor applications based on selected courses, required skills, and relevant experience. This ensures that applications are properly formatted and meet necessary criteria before submission. The system also includes sample data for testing purposes, including tutors' applications, roles, and academic credentials, making it easier to simulate and manage real-world use cases in the application.



## Testing
The testing for this project is implemented using Jest and React Testing Library, set up with version 8 and configured to run in a jsDOM environment, enabling DOM-like testing behavior for React components in a Node.js context. These tests are run using the **npm test** command and are designed to simulate real user interactions with the component. There are 6 test suites that each consist of 3-6 test (total of 29 tests). The tests are set up using a describe -it structure. The tests are listed below:

**ApplicantDetails.test.tsx** → 5 mini tests 
* 5 mini testsRenders applicant details correctly 
* Handles status change to "Selected" 
* Handles status change to "Rejected" 
* Adds a new comment 
* Shows a message when no applicant is selected 


**Signin.test.tsx** → 5 mini tests
* Renders the sign in page
* Shows an error when fields are empty
* Shows an error for invalid email or password
* Shows a success notification and redirects to the lecturer dashboard on valid login
* Shows a success notification and redirects to the tutor dashboard or valid login


**SelectedCandidate.test.tsx** → 5 mini tests
* Renders the component with applicants
* Displays ‘no selected applicants yet’ when there are no applicants
* Calls onSelectApplicant when an applicant row is clicked
* Allows editing and saving the rank of an applicant
* Cancels rank editing when cancel button is clicked


**CourseSelection.test.tsx** → 5 mini tests
* Renders the component with initial state
* Allows selecting a course and role, and calls onAddCourse when Add Course is clicked
* Renders selected courses and allows removing them
* Handles edge case where selected course is not found in the course list
* Disables Add Course button when no course is selected

**MainLayout.test.tsx** → 3 mini tests
* Renders the layout with children
* Initializes users on mount
* Updates authentication state based on auth functions

**Notification.test.tsx** → 6 mini tests
* Renders the notification with the correct message and type
* Renders error notification with the correct styling
* Closes the notification after the specified duration
* Calls the onClose callback when the notification is closed
* Does not render the notification if isVisible is false
* Renders and allows manual close via the close button'
