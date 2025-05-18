import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Course } from '@/lib/types';

interface CourseSelectionType {
  courseId: string;
  role: 'tutor' | 'lab_assistant';
}

interface CourseSelectionProps {
  courses: Course[];
  selectedCourses?: CourseSelectionType[];
  onAddCourse: (courseId: string, role: 'tutor' | 'lab_assistant') => void;
  onRemoveCourse: (courseId: string) => void;
}

const CourseSelectionComponent: React.FC<CourseSelectionProps> = ({
  courses,
  selectedCourses = [],
  onAddCourse,
  onRemoveCourse
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'lab_assistant'>('tutor');

  const handleAddCourse = () => {
    if (selectedCourseId) {
      onAddCourse(selectedCourseId, selectedRole);
      setSelectedCourseId('');
    }
  };

  return (
    <Card title="Course Selection">
      <p className="mb-4">Select the courses you would like to apply for:</p>
      
      {/* Course dropdown */}
      <div className="mb-6">
        <label
          htmlFor="course-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Add a course
        </label>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 mb-2">
          <select
            id="course-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="">Select a course...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
          
          <label
            htmlFor="role-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as 'tutor' | 'lab_assistant')}
            className="rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          >
            <option value="tutor">Tutor</option>
            <option value="lab_assistant">Lab Assistant</option>
          </select>
          
          <Button
            variant="secondary"
            onClick={handleAddCourse}
            className="whitespace-nowrap"
          >
            Add Course
          </Button>
        </div>
      </div>
      
      {/* Selected courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedCourses.map(cs => {
          const course = courses.find(c => c.id === cs.courseId);
          if (!course) return null;
          
          return (
            <div key={cs.courseId} className="border rounded-md p-4 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{course.code}</span>
                <span className="text-sm text-gray-600">{course.semester}</span>
              </div>
              <div className="mb-2">{course.name}</div>
              <div className="mb-3 text-sm text-emerald-700 font-medium">
                Role: {cs.role === 'tutor' ? 'Tutor' : 'Lab Assistant'}
              </div>
              
              <Button
                variant="outline"
                onClick={() => onRemoveCourse(cs.courseId)}
                className="text-sm py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
          );
        })}
        
        {selectedCourses.length === 0 && (
          <div className="col-span-full p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
            No courses selected. Use the dropdown above to add courses.
          </div>
        )}
      </div>
    </Card>
  );
};

export default CourseSelectionComponent;