// src/components/tutor/AvailabilitySelection.tsx
import React from 'react';
import Card from '@/components/ui/Card';

interface AvailabilitySelectionProps {
  availability: 'fulltime' | 'parttime';
  onChange: (value: 'fulltime' | 'parttime') => void;
}

const AvailabilitySelection: React.FC<AvailabilitySelectionProps> = ({
  availability,
  onChange
}) => {
  return (
    <Card title="Availability">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Availability
          </label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="availability"
                value="fulltime"
                checked={availability === 'fulltime'}
                onChange={() => onChange('fulltime')}
                className="text-emerald-600"
              />
              <span className="ml-2">Full-time</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="availability"
                value="parttime"
                checked={availability === 'parttime'}
                onChange={() => onChange('parttime')}
                className="text-emerald-600"
              />
              <span className="ml-2">Part-time</span>
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AvailabilitySelection;