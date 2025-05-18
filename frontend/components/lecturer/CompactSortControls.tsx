// src/components/lecturer/CompactSortControls.tsx
import React from 'react';

export type SortField = 'courseName' | 'availability' | 'none';
export type SortDirection = 'asc' | 'desc';

interface CompactSortControlsProps {
  currentSort: {
    field: SortField;
    direction: SortDirection;
  };
  onSort: (field: SortField, direction: SortDirection) => void;
}

const CompactSortControls: React.FC<CompactSortControlsProps> = ({ 
  currentSort, 
  onSort 
}) => {
  const handleSortClick = (field: SortField) => {
    const newDirection = 
      field === currentSort.field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    onSort(field, newDirection);
  };


  return (
    <div className="flex items-center mb-3 text-sm">
      <span className="mr-2 font-medium text-gray-600">Sort by:</span>
      <button
        onClick={() => handleSortClick('courseName')}
        className={`px-3 py-1 rounded-md mr-2 ${
          currentSort.field === 'courseName'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Course Name
      </button>
      <button
        onClick={() => handleSortClick('availability')}
        className={`px-3 py-1 rounded-md mr-2 ${
          currentSort.field === 'availability'
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Availability
      </button>
      {currentSort.field !== 'none' && (
        <button
          onClick={() => onSort('none', 'asc')}
          className="px-3 py-1 text-red-600 hover:text-red-700 hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default CompactSortControls;