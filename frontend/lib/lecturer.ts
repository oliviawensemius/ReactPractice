import { SearchCriteria } from '@/components/lecturer/SearchBar';
import { ApplicantDisplay } from '@/lib/types';

/**
 * Filter applicants based on search criteria
 */
export const filterApplicantDisplays = (
  applicants: ApplicantDisplay[],
  courseId: string,
  criteria: SearchCriteria
): ApplicantDisplay[] => {
  return applicants.filter(applicant => {
    // Filter by course name/code
    if (criteria.courseName && criteria.courseName.trim() !== '') {
      const searchTerm = criteria.courseName.toLowerCase().trim();
      const courseCodeMatch = applicant.courseCode.toLowerCase().includes(searchTerm);
      const courseNameMatch = applicant.courseName.toLowerCase().includes(searchTerm);

      if (!courseCodeMatch && !courseNameMatch) {
        return false;
      }
    }

    // Filter by tutor name
    if (criteria.tutorName && criteria.tutorName.trim() !== '') {
      if (!applicant.tutorName.toLowerCase().includes(criteria.tutorName.toLowerCase().trim())) {
        return false;
      }
    }

    // Filter by availability
    if (criteria.availability && criteria.availability.trim() !== '') {
      if (applicant.availability !== criteria.availability) {
        return false;
      }
    }

    // Filter by skill set
    if (criteria.skillSet && criteria.skillSet.trim() !== '') {
      const hasSkill = applicant.skills.some(skill =>
        skill.toLowerCase().includes(criteria.skillSet.toLowerCase().trim())
      );
      if (!hasSkill) {
        return false;
      }
    }

    return true;
  });
};

