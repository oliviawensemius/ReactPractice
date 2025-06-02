// admin-backend/src/resolvers/index.ts
import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { AppDataSource } from "../data-source";
import { User } from "../../../backend/src/entity/User";
import { Course } from "../../../backend/src/entity/Course";
import { Lecturer } from "../../../backend/src/entity/Lecturer";
import { CandidateApplication } from "../../../backend/src/entity/CandidateApplication";
import { Candidate } from "../../../backend/src/entity/Candidate";
import bcrypt from "bcryptjs";

// Import GraphQL types
import {
  CourseInput,
  LecturerCourseAssignmentInput,
  AuthPayload,
  CourseAssignmentResult,
  CandidateReport,
  UnselectedCandidate,
  CourseType,
  LecturerType,
  CandidateType,
  CandidateApplicationType,
  UserType
} from "../types/graphql-types";

@Resolver()
export class AdminResolver {
  // Authentication
  @Mutation(() => AuthPayload)
  async adminLogin(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<AuthPayload> {
    try {
      // Check for hardcoded admin credentials as per HD requirements
      if (username === "admin" && password === "admin") {
        // Create or find admin user
        const userRepo = AppDataSource.getRepository(User);
        let adminUser = await userRepo.findOne({ 
          where: { email: "admin@teachteam.com" } 
        });

        if (!adminUser) {
          const hashedPassword = await bcrypt.hash("admin", 12);
          adminUser = userRepo.create({
            name: "System Administrator",
            email: "admin@teachteam.com",
            password: hashedPassword,
            role: "admin" as any
          });
          await userRepo.save(adminUser);
        }

        return {
          success: true,
          message: "Login successful",
          user: adminUser as any
        };
      }

      return {
        success: false,
        message: "Invalid credentials"
      };
    } catch (error) {
      console.error("Admin login error:", error);
      return {
        success: false,
        message: "Login failed"
      };
    }
  }

  // Course Management
  @Query(() => [CourseType])
  async getAllCourses(): Promise<CourseType[]> {
    const courseRepo = AppDataSource.getRepository(Course);
    const courses = await courseRepo.find({ 
      where: { is_active: true },
      order: { code: "ASC" }
    });
    return courses as CourseType[];
  }

  @Mutation(() => CourseType)
  async addCourse(@Arg("courseData") courseData: CourseInput): Promise<CourseType> {
    const courseRepo = AppDataSource.getRepository(Course);
    
    // Check if course code already exists
    const existingCourse = await courseRepo.findOne({ 
      where: { code: courseData.code } 
    });
    
    if (existingCourse) {
      throw new Error("Course with this code already exists");
    }

    const course = courseRepo.create(courseData);
    const savedCourse = await courseRepo.save(course);
    return savedCourse as CourseType;
  }

  @Mutation(() => CourseType)
  async editCourse(
    @Arg("id") id: string,
    @Arg("courseData") courseData: CourseInput
  ): Promise<CourseType> {
    const courseRepo = AppDataSource.getRepository(Course);
    
    const course = await courseRepo.findOne({ where: { id } });
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if new code conflicts with existing course
    if (courseData.code !== course.code) {
      const existingCourse = await courseRepo.findOne({ 
        where: { code: courseData.code } 
      });
      if (existingCourse) {
        throw new Error("Course with this code already exists");
      }
    }

    Object.assign(course, courseData);
    const savedCourse = await courseRepo.save(course);
    return savedCourse as CourseType;
  }

  @Mutation(() => Boolean)
  async deleteCourse(@Arg("id") id: string): Promise<boolean> {
    const courseRepo = AppDataSource.getRepository(Course);
    
    const course = await courseRepo.findOne({ where: { id } });
    if (!course) {
      throw new Error("Course not found");
    }

    // Soft delete by setting is_active to false
    course.is_active = false;
    await courseRepo.save(course);
    
    return true;
  }

  // Lecturer Management
  @Query(() => [LecturerType])
  async getAllLecturers(): Promise<LecturerType[]> {
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturers = await lecturerRepo.find({
      relations: ["user", "courses"]
    });
    return lecturers as LecturerType[];
  }

  @Mutation(() => CourseAssignmentResult)
  async assignLecturerToCourse(
    @Arg("assignmentData") assignmentData: LecturerCourseAssignmentInput
  ): Promise<CourseAssignmentResult> {
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const courseRepo = AppDataSource.getRepository(Course);

    const lecturer = await lecturerRepo.findOne({
      where: { id: assignmentData.lecturerId },
      relations: ["courses"]
    });

    if (!lecturer) {
      return {
        success: false,
        message: "Lecturer not found"
      };
    }

    const course = await courseRepo.findOne({
      where: { id: assignmentData.courseId }
    });

    if (!course) {
      return {
        success: false,
        message: "Course not found"
      };
    }

    // Check if already assigned
    const isAlreadyAssigned = lecturer.courses.some(c => c.id === course.id);
    if (isAlreadyAssigned) {
      return {
        success: false,
        message: "Lecturer is already assigned to this course"
      };
    }

    // Assign course to lecturer
    lecturer.courses.push(course);
    await lecturerRepo.save(lecturer);

    return {
      success: true,
      message: "Lecturer successfully assigned to course"
    };
  }

  // User Management (Block/Unblock)
  @Mutation(() => Boolean)
  async blockCandidate(@Arg("candidateId") candidateId: string): Promise<boolean> {
    const candidateRepo = AppDataSource.getRepository(Candidate);
    const userRepo = AppDataSource.getRepository(User);

    const candidate = await candidateRepo.findOne({
      where: { id: candidateId },
      relations: ["user"]
    });

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    candidate.user.is_active = false;
    await userRepo.save(candidate.user);

    return true;
  }

  @Mutation(() => Boolean)
  async unblockCandidate(@Arg("candidateId") candidateId: string): Promise<boolean> {
    const candidateRepo = AppDataSource.getRepository(Candidate);
    const userRepo = AppDataSource.getRepository(User);

    const candidate = await candidateRepo.findOne({
      where: { id: candidateId },
      relations: ["user"]
    });

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    candidate.user.is_active = true;
    await userRepo.save(candidate.user);

    return true;
  }

  // Reports
  @Query(() => [CandidateApplicationType])
  async getCandidatesChosenForEachCourse(): Promise<CandidateApplicationType[]> {
    const applicationRepo = AppDataSource.getRepository(CandidateApplication);
    
    const applications = await applicationRepo.find({
      where: { status: "Selected" as any },
      relations: ["candidate", "candidate.user", "course"],
      order: { course: { code: "ASC" } }
    });

    return applications as CandidateApplicationType[];
  }

  @Query(() => [CandidateReport])
  async getCandidatesChosenForMultipleCourses(): Promise<CandidateReport[]> {
    const applicationRepo = AppDataSource.getRepository(CandidateApplication);
    
    const applications = await applicationRepo
      .createQueryBuilder("app")
      .leftJoinAndSelect("app.candidate", "candidate")
      .leftJoinAndSelect("candidate.user", "user")
      .leftJoinAndSelect("app.course", "course")
      .where("app.status = :status", { status: "Selected" })
      .getMany();

    // Group by candidate and count courses
    const candidateGroups = new Map<string, {
      candidate: Candidate;
      courses: Course[];
    }>();

    applications.forEach(app => {
      const candidateId = app.candidate.id;
      if (!candidateGroups.has(candidateId)) {
        candidateGroups.set(candidateId, {
          candidate: app.candidate,
          courses: []
        });
      }
      candidateGroups.get(candidateId)!.courses.push(app.course);
    });

    // Filter candidates with more than 3 courses
    const multipleCoursesCandidates: CandidateReport[] = [];
    candidateGroups.forEach(({ candidate, courses }) => {
      if (courses.length > 3) {
        multipleCoursesCandidates.push({
          id: candidate.id,
          name: candidate.user.name,
          email: candidate.user.email,
          courseCount: courses.length,
          courses: courses.map(c => `${c.code} - ${c.name}`)
        });
      }
    });

    return multipleCoursesCandidates;
  }

  @Query(() => [UnselectedCandidate])
  async getCandidatesNotChosenForAnyCourse(): Promise<UnselectedCandidate[]> {
    const candidateRepo = AppDataSource.getRepository(Candidate);

    // Get all candidates with their applications
    const candidates = await candidateRepo.find({
      relations: ["user", "applications"]
    });

    const unselectedCandidates: UnselectedCandidate[] = [];

    for (const candidate of candidates) {
      const hasSelectedApplication = candidate.applications.some(
        app => app.status === "Selected"
      );

      if (!hasSelectedApplication && candidate.applications.length > 0) {
        unselectedCandidates.push({
          id: candidate.id,
          name: candidate.user.name,
          email: candidate.user.email,
          applicationCount: candidate.applications.length
        });
      }
    }

    return unselectedCandidates;
  }

  // Get all candidates (for blocking/unblocking)
  @Query(() => [CandidateType])
  async getAllCandidates(): Promise<CandidateType[]> {
    const candidateRepo = AppDataSource.getRepository(Candidate);
    const candidates = await candidateRepo.find({
      relations: ["user"]
    });
    return candidates as CandidateType[];
  }
}
        unselectedCandidates.push({
          id: candidate.id,
          name: candidate.user.name,
          email: candidate.user.email,
          applicationCount: candidate.applications.length
        });
      }
    }

    return unselectedCandidates;
  }

  // Get all candidates (for blocking/unblocking)
  @Query(() => [Candidate])
  async getAllCandidates(): Promise<Candidate[]> {
    const candidateRepo = AppDataSource.getRepository(Candidate);
    return await candidateRepo.find({
      relations: ["user"]
    });
  }
}