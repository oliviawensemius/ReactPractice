// admin-backend/src/types/graphql-types.ts - Simplified to work with existing structure
import { ObjectType, Field, ID, InputType, registerEnumType } from "type-graphql";

// Register enums for GraphQL
export enum UserRoleEnum {
  CANDIDATE = "candidate",
  LECTURER = "lecturer", 
  ADMIN = "admin"
}

export enum SessionTypeEnum {
  TUTOR = "tutor",
  LAB_ASSISTANT = "lab_assistant"
}

export enum ApplicationStatusEnum {
  PENDING = "Pending",
  SELECTED = "Selected",
  REJECTED = "Rejected"
}

export enum AvailabilityTypeEnum {
  FULLTIME = "fulltime",
  PARTTIME = "parttime"
}

export enum SemesterEnum {
  SEMESTER_1 = "Semester 1",
  SEMESTER_2 = "Semester 2",
  SUMMER = "Summer",
  WINTER = "Winter"
}

registerEnumType(UserRoleEnum, { name: "UserRole" });
registerEnumType(SessionTypeEnum, { name: "SessionType" });
registerEnumType(ApplicationStatusEnum, { name: "ApplicationStatus" });
registerEnumType(AvailabilityTypeEnum, { name: "AvailabilityType" });
registerEnumType(SemesterEnum, { name: "Semester" });

// Enhanced User Type with blocking information
@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => UserRoleEnum)
  role!: string;

  @Field()
  is_active!: boolean;

  @Field()
  is_blocked!: boolean;

  @Field({ nullable: true })
  blocked_reason?: string;

  @Field({ nullable: true })
  blocked_by?: string;

  @Field({ nullable: true })
  blocked_at?: Date;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}

// Course Type with semester information
@ObjectType()
export class CourseType {
  @Field(() => ID)
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field(() => SemesterEnum)
  semester!: string;

  @Field()
  year!: number;

  @Field()
  is_active!: boolean;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;

  @Field(() => [LecturerType], { nullable: true })
  lecturers?: LecturerType[];
}

@ObjectType()
export class LecturerType {
  @Field(() => ID)
  id!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field({ nullable: true })
  department?: string;

  @Field()
  created_at!: Date;

  @Field(() => [CourseType])
  courses!: CourseType[];
}

// Enhanced Candidate Type with selected courses information
@ObjectType()
export class CandidateSelectedCourseType {
  @Field()
  courseCode!: string;

  @Field()
  courseName!: string;

  @Field(() => SemesterEnum)
  semester!: string;

  @Field()
  year!: number;

  @Field()
  role!: string;

  @Field({ nullable: true })
  ranking?: number;
}

@ObjectType()
export class CandidateWithCoursesType {
  @Field(() => ID)
  id!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field(() => AvailabilityTypeEnum)
  availability!: string;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field()
  created_at!: Date;

  @Field(() => [CandidateSelectedCourseType])
  selectedCourses!: CandidateSelectedCourseType[];

  @Field()
  totalApplications!: number;

  @Field()
  selectedApplicationsCount!: number;
}

@ObjectType()
export class CandidateType {
  @Field(() => ID)
  id!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field(() => AvailabilityTypeEnum)
  availability!: string;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field()
  created_at!: Date;
}

// Input Types
@InputType()
export class CourseInput {
  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field(() => SemesterEnum)
  semester!: string;

  @Field()
  year!: number;
}

@InputType()
export class BlockCandidateInput {
  @Field()
  candidateId!: string;

  @Field()
  isBlocked!: boolean;

  @Field({ nullable: true })
  reason?: string;
}

@InputType()
export class LecturerCourseAssignmentInput {
  @Field()
  lecturerId!: string;

  @Field()
  courseId!: string;
}

@InputType()
export class LecturerMultipleCourseAssignmentInput {
  @Field()
  lecturerId!: string;

  @Field(() => [String])
  courseIds!: string[];
}

// Output Types
@ObjectType()
export class AuthPayload {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class CourseAssignmentResult {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}

@ObjectType()
export class SelectedCandidateInfo {
  @Field()
  candidateName!: string;

  @Field()
  candidateEmail!: string;

  @Field()
  sessionType!: string;

  @Field({ nullable: true })
  ranking?: number;
}

@ObjectType()
export class CourseReportType {
  @Field()
  courseCode!: string;

  @Field()
  courseName!: string;

  @Field(() => [SelectedCandidateInfo])
  selectedCandidates!: SelectedCandidateInfo[];
}

@ObjectType()
export class CandidateReport {
  @Field(() => ID)
  id!: string;

  @Field()
  candidateName!: string;

  @Field()
  candidateEmail!: string;

  @Field()
  courseCount!: number;

  @Field(() => [String])
  courses!: string[];
}

@ObjectType()
export class UnselectedCandidate {
  @Field(() => ID)
  id!: string;

  @Field()
  candidateName!: string;

  @Field()
  candidateEmail!: string;

  @Field()
  applicationCount!: number;

  @Field(() => [String])
  appliedCourses!: string[];
}