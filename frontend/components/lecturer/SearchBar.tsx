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
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onReset,
  showCourseSearch = true
}) => {
  const [criteria, setCriteria] = useState<SearchCriteria>({
    courseName: '',
    tutorName: '',
    availability: '',
    skillSet: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
  };

  const handleReset = () => {
    setCriteria({
      courseName: '',
      tutorName: '',
      availability: '',
      skillSet: ''
    });
    onReset();
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md mb-4">
      <h3 className="text-lg font-semibold text-emerald-800 mb-3">Search Applicants</h3>
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Course search field - only show if enabled */}
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
              Tutor Name
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
              placeholder="e.g. React, Python, Java"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;