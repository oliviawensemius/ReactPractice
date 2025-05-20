// backend/src/controller/StatisticsController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CandidateApplication, ApplicationStatus } from "../entity/CandidateApplication";
import { Lecturer } from "../entity/Lecturer";
import { Course } from "../entity/Course";
import { Candidate } from "../entity/Candidate";

export class StatisticsController {
    // Get applicant statistics for a lecturer
    static async getLecturerApplicantStatistics(req: Request, res: Response) {
        try {
            const { lecturer_id } = req.params;
            
            if (!lecturer_id) {
                return res.status(400).json({
                    success: false,
                    message: "Lecturer ID is required"
                });
            }
            
            // Find lecturer with courses
            const lecturer = await AppDataSource.getRepository(Lecturer).findOne({
                where: { id: lecturer_id },
                relations: ["courses"]
            });
            
            if (!lecturer) {
                return res.status(404).json({
                    success: false,
                    message: "Lecturer not found"
                });
            }
            
            // Get course IDs assigned to this lecturer
            const courseIds = lecturer.courses.map(course => course.id);
            
            if (courseIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    statistics: {
                        totalApplicants: 0,
                        selectedCount: 0,
                        pendingCount: 0,
                        rejectedCount: 0,
                        mostSelected: null,
                        leastSelected: null,
                        unselectedApplicants: []
                    }
                });
            }
            
            // Get all applications for these courses
            const applications = await AppDataSource.getRepository(CandidateApplication)
                .createQueryBuilder("app")
                .leftJoinAndSelect("app.candidate", "candidate")
                .leftJoinAndSelect("app.course", "course")
                .where("course.id IN (:...courseIds)", { courseIds })
                .getMany();
            
            // Count applications by status
            const totalApplicants = applications.length;
            const selectedCount = applications.filter(app => app.status === ApplicationStatus.SELECTED).length;
            const pendingCount = applications.filter(app => app.status === ApplicationStatus.PENDING).length;
            const rejectedCount = applications.filter(app => app.status === ApplicationStatus.REJECTED).length;
            
            // Get unique candidate IDs from applications
            const candidateIds = Array.from(new Set(applications.map(app => app.candidate.id)));
            
            // Track selection count per candidate
            const selectionCounts: Record<string, { id: string, name: string, email: string, count: number }> = {};
            
            // Initialize all candidates with count 0
            for (const candidateId of candidateIds) {
                const candidate = applications.find(app => app.candidate.id === candidateId)?.candidate;
                
                if (candidate) {
                    selectionCounts[candidateId] = {
                        id: candidateId,
                        name: candidate.name,
                        email: candidate.email,
                        count: 0
                    };
                }
            }
            
            // Count selections for each candidate
            for (const app of applications) {
                if (app.status === ApplicationStatus.SELECTED) {
                    selectionCounts[app.candidate.id].count += 1;
                }
            }
            
            // Find most and least selected candidates
            const selectedCandidates = Object.values(selectionCounts).filter(c => c.count > 0);
            let mostSelected = null;
            let leastSelected = null;
            
            if (selectedCandidates.length > 0) {
                mostSelected = selectedCandidates.reduce((prev, current) => 
                    (prev.count > current.count) ? prev : current
                );
                
                leastSelected = selectedCandidates.reduce((prev, current) => 
                    (prev.count < current.count) ? prev : current
                );
            }
            
            // Find unselected applicants
            const unselectedApplicants = Object.values(selectionCounts)
                .filter(c => c.count === 0)
                .map(({ id, name, email }) => ({ id, name, email }));
            
            return res.status(200).json({
                success: true,
                statistics: {
                    totalApplicants,
                    selectedCount,
                    pendingCount,
                    rejectedCount,
                    mostSelected,
                    leastSelected,
                    unselectedApplicants
                }
            });
        } catch (error: any) {
            console.error("Error generating lecturer statistics:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
    
    // Get statistics for a specific course
    static async getCourseStatistics(req: Request, res: Response) {
        try {
            const { course_id } = req.params;
            
            if (!course_id) {
                return res.status(400).json({
                    success: false,
                    message: "Course ID is required"
                });
            }
            
            // Find course
            const course = await AppDataSource.getRepository(Course).findOne({
                where: { id: course_id }
            });
            
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }
            
            // Get all applications for this course
            const applications = await AppDataSource.getRepository(CandidateApplication)
                .createQueryBuilder("app")
                .leftJoinAndSelect("app.candidate", "candidate")
                .where("app.course.id = :courseId", { courseId: course_id })
                .getMany();
            
            // Count applications by status and role
            const totalApplicants = applications.length;
            const selectedCount = applications.filter(app => app.status === ApplicationStatus.SELECTED).length;
            const pendingCount = applications.filter(app => app.status === ApplicationStatus.PENDING).length;
            const rejectedCount = applications.filter(app => app.status === ApplicationStatus.REJECTED).length;
            
            const tutorCount = applications.filter(app => app.sessionType === 'tutor').length;
            const labAssistantCount = applications.filter(app => app.sessionType === 'lab_assistant').length;
            
            // Full-time vs Part-time
            const fullTimeApplicants = applications.filter(app => app.candidate.availability === 'fulltime').length;
            const partTimeApplicants = applications.filter(app => app.candidate.availability === 'parttime').length;
            
            return res.status(200).json({
                success: true,
                statistics: {
                    totalApplicants,
                    selectedCount,
                    pendingCount,
                    rejectedCount,
                    tutorCount,
                    labAssistantCount,
                    fullTimeApplicants,
                    partTimeApplicants
                }
            });
        } catch (error: any) {
            console.error("Error generating course statistics:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
    
    // Get system-wide statistics (admin only)
    static async getSystemStatistics(req: Request, res: Response) {
        try {
            // Get counts from each repository
            const candidateCount = await AppDataSource.getRepository(Candidate).count();
            const courseCount = await AppDataSource.getRepository(Course).count();
            const lecturerCount = await AppDataSource.getRepository(Lecturer).count();
            
            // Get application counts by status
            const applicationCount = await AppDataSource.getRepository(CandidateApplication).count();
            const selectedCount = await AppDataSource.getRepository(CandidateApplication).count({
                where: { status: ApplicationStatus.SELECTED }
            });
            const pendingCount = await AppDataSource.getRepository(CandidateApplication).count({
                where: { status: ApplicationStatus.PENDING }
            });
            const rejectedCount = await AppDataSource.getRepository(CandidateApplication).count({
                where: { status: ApplicationStatus.REJECTED }
            });
            
            // Get top 5 courses with most applications
            const topCourses = await AppDataSource.getRepository(CandidateApplication)
                .createQueryBuilder("app")
                .leftJoinAndSelect("app.course", "course")
                .select("course.id", "courseId")
                .addSelect("course.code", "courseCode")
                .addSelect("course.name", "courseName")
                .addSelect("COUNT(app.id)", "applicationCount")
                .groupBy("course.id")
                .addGroupBy("course.code")
                .addGroupBy("course.name")
                .orderBy("applicationCount", "DESC")
                .limit(5)
                .getRawMany();
            
            return res.status(200).json({
                success: true,
                statistics: {
                    candidateCount,
                    courseCount,
                    lecturerCount,
                    applicationCount,
                    selectedCount,
                    pendingCount,
                    rejectedCount,
                    topCourses
                }
            });
        } catch (error: any) {
            console.error("Error generating system statistics:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}