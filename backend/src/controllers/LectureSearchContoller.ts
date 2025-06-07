import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { CandidateApplication } from '../entity/CandidateApplication';

export class LectureSearchController {
  static async searchLecturerCandidates(req: Request, res: Response) {
    try {
      const {
        applicationIds, // array of application IDs to filter from (optional)
        name,           // candidate name search (optional)
        availability,   // 'fulltime' | 'parttime' (optional)
        skills,         // array of skills (optional)
        sessionType,    // 'tutor' | 'lab_assistant' (optional)
        sort_by,        // 'courseName' | 'candidateName' (optional)
        sort_direction  // 'asc' | 'desc' (optional)
      } = req.body;

      // lot of info needs to be checked, thus creating a query builder
      let qb = AppDataSource.getRepository(CandidateApplication)
        .createQueryBuilder('application')
        .leftJoin('application.candidate', 'candidate')
        .leftJoin('candidate.user', 'user')
        .leftJoin('application.course', 'course');

      // filter by application IDs if provided
      if (Array.isArray(applicationIds) && applicationIds.length > 0) {
        qb = qb.andWhere('application.id IN (:...applicationIds)', { applicationIds });
      }

      // filter by candidate name (case-insensitive, partial match)
      if (name && name.trim() !== '') {
        qb = qb.andWhere('LOWER(user.name) LIKE :name', { name: `%${name.toLowerCase()}%` });
      }

      // filter by availability
      if (availability && ['fulltime', 'parttime'].includes(availability)) {
        qb = qb.andWhere('application.availability = :availability', { availability });
      }

      // filter by skills (any match, MySQL JSON_CONTAINS)
      if (skills && Array.isArray(skills) && skills.length > 0) {
        // skills is an array of strings, check if any skill is present in the JSON array
        const skillConditions = skills.map((_, idx) => `JSON_CONTAINS(application.skills, :skill${idx})`).join(' OR ');
        const skillParams = Object.fromEntries(skills.map((skill, idx) => [`skill${idx}`, JSON.stringify(skill)]));
        qb = qb.andWhere(`(${skillConditions})`, skillParams);
      }

      // filter by session type
      if (sessionType && ['tutor', 'lab_assistant'].includes(sessionType)) {
        qb = qb.andWhere('application.session_type = :sessionType', { sessionType });
      }

      // sorting
      let sortField = '';
      if (sort_by === 'courseName') {
        sortField = 'course.name';
      } else if (sort_by === 'candidateName') {
        sortField = 'user.name';
      }
      if (sortField) {
        qb = qb.orderBy(sortField, sort_direction === 'desc' ? 'DESC' : 'ASC');
      }

      // get matching applications
      const applications = await qb.select(['application.id']).getMany();

      // return array of application IDs
      const applicationIdsResult = applications.map(app => app.id);

      return res.json({ application_ids: applicationIdsResult });
    } catch (err) {
      console.error('Error in searchLecturerCandidates:', err);
      return res.status(500).json({ message: 'Server error during search' });
    }
  }
}