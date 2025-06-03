// admin-backend/src/resolvers/index.ts
import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { AppDataSource } from "../data-source";
import { User } from "../../../backend/src/entity/User";
import { Course } from "../../../backend/src/entity/Course";
import { Lecturer } from "../../../backend/src/entity/Lecturer";
import { CandidateApplication } from "../../../backend/src/entity/CandidateApplication";
import { Candidate } from "../../../backend/src/entity/Candidate";
import bcrypt from "bcryptjs";
import { In } from "typeorm";

// Import GraphQL types
import {
  CourseInput,
  LecturerCourseAssignmentInput,
  LecturerMultipleCourseAssignmentInput,
  AuthPayload,
  CourseAssignmentResult,
  CandidateReport,
  UnselectedCandidate,
  CourseType,
  LecturerType,
  CandidateType,
  CandidateApplicationType,
  UserType,
  CourseReportType
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
        return {
          success: true,
          message: "Login successful",
          user: {
            id: "admin-001",
            name: "System Administrator",
            email: "admin@teachteam.com",
            role: "admin",
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          } as UserType
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
      relations: ["lecturers", "lecturers.user"],
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
  async assignLecturerToCourses(
    @Arg("input") input: LecturerMultipleCourseAssignmentInput
  ): Promise<CourseAssignmentResult> {
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const courseRepo = AppDataSource.getRepository(Course);

    try {
      const lecturer = await lecturerRepo.findOne({
        where: { id: input.lecturerId },
        relations: ["courses"]
      });

      if (!lecturer) {
        return {
          success: false,
          message: "Lecturer not found"
        };
      }

      // Get all courses to assign
      const courses = await courseRepo.find({
        where: { id: In(input.courseIds) }
      });

      if (courses.length !== input.courseIds.length) {
        return {
          success: false,
          message: "One or more courses not found"
        };
      }

      // Replace lecturer's courses with new selection
      lecturer.courses = courses;
      await lecturerRepo.save(lecturer);

      return {
        success: true,
        message: `Successfully assigned ${courses.length} course(s) to lecturer`
      };
    } catch (error) {
      console.error("Error assigning courses:", error);
      return {
        success: false,
        message: "Failed to assign courses"
      };
    }
  }

  // User Management (Block/Unblock)
  @Mutation(() => Boolean)
  async toggleCandidateStatus(@Arg("id") id: string): Promise<boolean> {
    const candidateRepo = AppDataSource.getRepository(Candidate);
    const userRepo = AppDataSource.getRepository(User);

    const candidate = await candidateRepo.findOne({
      where: { id },
      relations: ["user"]
    });

    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Toggle the active status
    candidate.user.is_active = !candidate.user.is_active;
    await userRepo.save(candidate.user);

    return true;
  }

  // Reports - HD Requirements
  @Query(() => [CourseReportType])
  async getCourseApplicationReports(): Promise<CourseReportType[]> {
    const courseRepo = AppDataSource.getRepository(Course);
    const applicationRepo = AppDataSource.getRepository(CandidateApplication);
    
    const courses = await courseRepo.find({
      where: { is_active: true },
      order: { code: "ASC" }
    });

    const reports: CourseReportType[] = [];

    for (const course of courses) {
      const selectedApplications = await applicationRepo.find({
        where: { 
          course_id: course.id,
          status: "Selected" as any
        },
        relations: ["candidate", "candidate.user"],
        order: { ranking: "ASC" }
      });

      const selectedCandidates = selectedApplications.map(app => ({
        candidateName: app.candidate.user.name,
        candidateEmail: app.candidate.user.email,
        sessionType: app.session_type,
        ranking: app.ranking
      }));

      reports.push({
        courseCode: course.code,
        courseName: course.name,
        selectedCandidates
      });
    }

    return reports;
  }

  @Query(() => [CandidateReport])
  async getCandidatesWithMultipleCourses(): Promise<CandidateReport[]> {
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
          candidateName: candidate.user.name,
          candidateEmail: candidate.user.email,
          courseCount: courses.length,
          courses: courses.map(c => c.code)
        });
      }
    });

    return multipleCoursesCandidates;
  }

  @Query(() => [UnselectedCandidate])
  async getUnselectedCandidates(): Promise<UnselectedCandidate[]> {
    const candidateRepo = AppDataSource.getRepository(Candidate);

    // Get all candidates with their applications
    const candidates = await candidateRepo.find({
      relations: ["user", "applications", "applications.course"]
    });

    const unselectedCandidates: UnselectedCandidate[] = [];

    for (const candidate of candidates) {
      const hasSelectedApplication = candidate.applications.some(
        app => app.status === "Selected"
      );

      if (!hasSelectedApplication && candidate.applications.length > 0) {
        unselectedCandidates.push({
          id: candidate.id,
          candidateName: candidate.user.name,
          candidateEmail: candidate.user.email,
          applicationCount: candidate.applications.length,
          appliedCourses: candidate.applications.map(app => app.course.code)
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
      relations: ["user"],
      order: { created_at: "DESC" }
    });
    return candidates as CandidateType[];
  }
}