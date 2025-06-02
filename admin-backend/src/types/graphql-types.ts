// admin-backend/src/types/graphql-types.ts
import { ObjectType, Field, ID, InputType, registerEnumType } from "type-graphql";
import { User } from "../../../backend/src/entity/User";
import { Course } from "../../../backend/src/entity/Course";
import { Lecturer } from "../../../backend/src/entity/Lecturer";
import { CandidateApplication } from "../../../backend/src/entity/CandidateApplication";
import { Candidate } from "../../../backend/src/entity/Candidate";

// Register enums for GraphQL
export enum UserRoleEnum {
  CANDIDATE = "candnnnidate",
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

registerEnumType(UserRoleEnum, { name: "UserRole" });
registerEnumType(SessionTypeEnum, { name: "SessionType" });
registerEnumType(ApplicationStatusEnum, { name: "ApplicationStatus" });
registerEnumType(AvailabilityTypeEnum, { name: "AvailabilityType" });

// GraphQL Object Types (wrapping existing entities)
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
  created_at!: Date;

  @Field()
  updated_at!: Date;
}

@ObjectType()
export class CourseType {
  @Field(() => ID)
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field()
  semester!: string;

  @Field()
  year!: number;

  @Field()
  is_active!: boolean;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}

@ObjectType()
export class LecturerType {
  @Field(() => ID)
  id!: string;

  @Field(() => UserType)
  user!: UserType;

  @Field({ nullable: true })
  department?: string;

  @Field(() => [CourseType])
  courses!: CourseType[];

  @Field()
  created_at!: Date;
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

@ObjectType()
export class CandidateApplicationType {
  @Field(() => ID)
  id!: string;

  @Field(() => CandidateType)
  candidate!: CandidateType;

  @Field(() => CourseType)
  course!: CourseType;

  @Field(() => SessionTypeEnum)
  session_type!: string;

  @Field(() => AvailabilityTypeEnum)
  availability!: string;

  @Field(() => [String])
  skills!: string[];

  @Field(() => ApplicationStatusEnum)
  status!: string;

  @Field({ nullable: true })
  ranking?: number;

  @Field(() => [String], { nullable: true })
  comments?: string[];

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}

// Input Types
@InputType()
export class CourseInput {
  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field()
  semester!: string;

  @Field()
  year!: number;
}

@InputType()
export class LecturerCourseAssignmentInput {
  @Field()
  lecturerId!: string;

  @Field()
  courseId!: string;
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
export class CandidateReport {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

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
  name!: string;

  @Field()
  email!: string;

  @Field()
  applicationCount!: number;
}