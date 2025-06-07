import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (criteria: SearchCriteria) => void;
  onReset: () => void;
  showCourseSearch?: boolean;
}

export interface SearchCriteria {
  courseName: string;
  tutorName: string;
  availability: string;
  skillSet: string;
  sessionType: string;
  sortBy: 'courseName' | 'candidateName';
  sortDirection: 'asc' | 'desc';
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onReset,
  showCourseSearch = true,
}) => {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    courseName: '',
    tutorName: '',
    availability: '',
    skillSet: '',
    sessionType: '',
    sortBy: 'courseName',
    sortDirection: 'asc',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // validation helpers
  const isValidCourseCodeOrName = (input: string) =>
    /^COSC\d{4}$/.test(input) || input.trim().length >= 3;
  const isValidName = (input: string) => input.trim().length >= 2;
  const isValidSkill = (input: string) => input.trim().length > 0;
  const isValidAvailability = (input: string) =>
    ['', 'fulltime', 'parttime', 'both'].includes(input);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // prepare search payload for shipping to backend
    const payload: {
      courseCode?: string;
      name?: string;
      availability?: string;
      skills?: string[];
      sessionType?: string; // Add this line
    } = {};

    if (showCourseSearch && criteria.courseName.trim()) {
      if (!isValidCourseCodeOrName(criteria.courseName.trim())) {
        setError('Enter a valid course code (COSCxxxx) or course name (min 3 chars)');
        return;
      }
      payload.courseCode = criteria.courseName.trim();
    }
    if (criteria.tutorName.trim()) {
      if (!isValidName(criteria.tutorName.trim())) {
        setError('Tutor name must be at least 2 characters');
        return;
      }
      payload.name = criteria.tutorName.trim();
    }
    if (criteria.availability) {
      if (!isValidAvailability(criteria.availability)) {
        setError('Availability must be fulltime, parttime, or both');
        return;
      }
      payload.availability = criteria.availability;
    }
    if (criteria.sessionType && ['tutor', 'lab_assistant'].includes(criteria.sessionType)) {
      payload.sessionType = criteria.sessionType;
    }
    console.log('Payload being sent to backend:', payload); // <-- Add this line

    if (criteria.skillSet.trim()) {
      const skillArray = criteria.skillSet
        .split(',')
        .map((s) => s.trim())
        .filter((s) => isValidSkill(s));
      if (skillArray.length === 0) {
        setError('Please enter at least one skill.');
        return;
      }
      payload.skills = skillArray;
    }

    // require at LEAST one search criteria
    if (
      !payload.courseCode &&
      !payload.name &&
      !payload.availability &&
      (!payload.skills || payload.skills.length === 0) &&
      !payload.sessionType
    ) {
      setError('Please enter at least one search criteria.');
      return;
    }

    setIsLoading(true);
    try {
      // No backend call here, just pass criteria up
      onSearch(criteria);
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCriteria({
      courseName: '',
      tutorName: '',
      availability: '',
      skillSet: '',
      sessionType: '',
      sortBy: 'courseName',
      sortDirection: 'asc',
    });
    setError(null);
    onReset();
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mb-4">
      <h3 className="text-lg font-semibold text-emerald-800 mb-3">Search Applicants</h3>
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course search field */}
          {showCourseSearch && (
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                Course Code or Name
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={criteria.courseName}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="e.g. COSC2758 or Programming"
              />
            </div>
          )}

          <div>
            <label htmlFor="tutorName" className="block text-sm font-medium text-gray-700 mb-1">
              Candidate Name
            </label>
            <input
              type="text"
              id="tutorName"
              name="tutorName"
              value={criteria.tutorName}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="e.g. John Smith"
            />
          </div>

          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              id="availability"
              name="availability"
              value={criteria.availability}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="">Any Availability</option>
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
            </select>
          </div>

          <div>
            <label htmlFor="skillSet" className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <input
              type="text"
              id="skillSet"
              name="skillSet"
              value={criteria.skillSet}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="e.g. React"
            />
          </div>

          <div>
            <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 mb-1">
              Session Type
            </label>
            <select
              id="sessionType"
              name="sessionType"
              value={criteria.sessionType}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="">Any Session Type</option>
              <option value="tutor">Tutor</option>
              <option value="lab_assistant">Lab Assistant</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={criteria.sortBy}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="courseName">Course Name</option>
              <option value="candidateName">Candidate Name</option>
            </select>
          </div>
          <div>
            <label htmlFor="sortDirection" className="block text-sm font-medium text-gray-700 mb-1">
              Sort Direction
            </label>
            <select
              id="sortDirection"
              name="sortDirection"
              value={criteria.sortDirection}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-2">{error}</div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;