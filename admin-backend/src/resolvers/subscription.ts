// admin-backend/src/resolvers/subscription.ts - Updated to use Candidate table
import { Resolver, Subscription, Mutation, Arg, Root, Ctx } from "type-graphql";
import { AppDataSource } from "../data-source";
import { Candidate } from "../../../backend/src/entity/Candidate";
import { CandidateApplication } from "../../../backend/src/entity/CandidateApplication";
import { 
  CandidateUnavailableNotification, 
  MarkCandidateUnavailableInput, 
  MarkCandidateUnavailableResponse 
} from "../types/subscription-types";

const CANDIDATE_UNAVAILABLE = "CANDIDATE_UNAVAILABLE";

@Resolver()
export class SubscriptionResolver {
  
  @Subscription(() => CandidateUnavailableNotification, {
    topics: CANDIDATE_UNAVAILABLE,
    description: "Real-time notifications when a candidate becomes unavailable"
  })
  candidateUnavailable(
    @Root() notification: CandidateUnavailableNotification
  ): CandidateUnavailableNotification {
    console.log("🔄 Sending real-time notification:", notification);
    return notification;
  }

  @Mutation(() => MarkCandidateUnavailableResponse)
  async markCandidateUnavailable(
    @Arg("input") input: MarkCandidateUnavailableInput,
    @Ctx() { pubSub }: { pubSub: any }
  ): Promise<MarkCandidateUnavailableResponse> {
    try {
      console.log("🚨 Processing candidate unavailable request:", input);

      const candidateRepository = AppDataSource.getRepository(Candidate);
      const applicationRepository = AppDataSource.getRepository(CandidateApplication);

      // Debug: Log the candidateId we're looking for
      console.log("🔍 Searching for candidate with ID:", input.candidateId);

      // First, let's check what candidates exist in the database
      const allCandidates = await candidateRepository.find({
        relations: ['user'],
        select: {
          id: true,
          user_id: true,
          user: {
            id: true,
            name: true,
            email: true
          }
        }
      });
      
      console.log("📋 All candidates in database:", allCandidates.map(c => ({
        candidateId: c.id,
        userId: c.user_id,
        userName: c.user?.name,
        userEmail: c.user?.email
      })));

      // Try to find candidate by their Candidate ID first
      let candidate = await candidateRepository.findOne({
        where: { id: input.candidateId },
        relations: ['user']
      });

      // If not found by Candidate ID, try by User ID (in case candidateId is actually a User ID)
      if (!candidate) {
        console.log("🔄 Candidate not found by Candidate ID, trying by User ID...");
        candidate = await candidateRepository.findOne({
          where: { user_id: input.candidateId },
          relations: ['user']
        });
      }

      console.log("🎯 Found candidate:", candidate ? {
        candidateId: candidate.id,
        userId: candidate.user_id,
        userName: candidate.user?.name,
        userEmail: candidate.user?.email
      } : 'null');

      if (!candidate) {
        throw new Error(`Candidate not found with ID: ${input.candidateId}. Available candidate IDs: ${allCandidates.map(c => c.id).join(', ')} | Available user IDs: ${allCandidates.map(c => c.user_id).join(', ')}`);
      }

      if (!candidate.user) {
        throw new Error(`Candidate found but associated user not found. Candidate ID: ${candidate.id}, User ID: ${candidate.user_id}`);
      }

      // Find all applications for this candidate
      const applications = await applicationRepository.find({
        where: { candidate_id: candidate.id },
        relations: ['course']
      });

      // Filter applications that need to be affected
      const affectedApplications = applications.filter(
        app => app.status === 'Pending' || app.status === 'Selected'
      );

      // Get list of affected courses for notification
      const affectedCourses = affectedApplications.map(app => 
        `${app.course.code} - ${app.course.name} (${app.course.semester} ${app.course.year})`
      );

      // Update the user's blocking status through the candidate relationship
      candidate.user.is_blocked = true;
      candidate.user.blocked_reason = input.reason;
      candidate.user.blocked_by = "admin";
      candidate.user.blocked_at = new Date();

      // Save the updated user data through the candidate entity
      await candidateRepository.save(candidate);

      // Update affected applications
      for (const application of affectedApplications) {
        if (application.status === 'Pending') {
          application.status = 'Rejected';
          if (!application.comments) application.comments = [];
          application.comments.push(`Candidate became unavailable: ${input.reason}`);
          await applicationRepository.save(application);
        }
      }

      // Create notification object
      const notification: CandidateUnavailableNotification = {
        candidateId: candidate.id,
        candidateName: candidate.user.name,
        candidateEmail: candidate.user.email,
        reason: input.reason,
        timestamp: new Date().toISOString(),
        affectedCourses,
        notifiedBy: "admin",
      };

      // Publish real-time notification
      await pubSub.publish(CANDIDATE_UNAVAILABLE, notification);
      console.log("📡 Real-time notification published for candidate:", candidate.user.name);

      return {
        success: true,
        message: `Candidate ${candidate.user.name} marked as unavailable. Real-time notifications sent.`,
        affectedCourses,
      };

    } catch (error) {
      console.error("❌ Error in markCandidateUnavailable:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to mark candidate unavailable: ${errorMessage}`);
    }
  }
}