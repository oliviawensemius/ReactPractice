// admin-backend/src/types/subscription-types.ts - Add to your existing types
import { ObjectType, Field, InputType, registerEnumType } from "type-graphql";

// Subscription payload for candidate unavailable notifications
@ObjectType()
export class CandidateUnavailableNotification {
  @Field()
  candidateId!: string;

  @Field()
  candidateName!: string;

  @Field()
  candidateEmail!: string;

  @Field()
  reason!: string;

  @Field()
  timestamp!: string;

  @Field(() => [String])
  affectedCourses!: string[];

  @Field()
  notifiedBy!: string;
}

// Input for marking candidate unavailable
@InputType()
export class MarkCandidateUnavailableInput {
  @Field()
  candidateId!: string;

  @Field()
  reason!: string;
}

// Response for marking candidate unavailable
@ObjectType()
export class MarkCandidateUnavailableResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(() => [String])
  affectedCourses!: string[];
}