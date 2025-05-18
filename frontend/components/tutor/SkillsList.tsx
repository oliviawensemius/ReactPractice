// src/components/tutor/SkillsList.tsx
import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface SkillsListProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

const SkillsList: React.FC<SkillsListProps> = ({
  skills,
  onAddSkill,
  onRemoveSkill
}) => {
  const [newSkill, setNewSkill] = useState<string>('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onAddSkill(newSkill.trim());
      setNewSkill('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Card title="Skills">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, index) => (
            <div key={index} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center">
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                className="ml-2 text-emerald-600 hover:text-emerald-800"
              >
                &times;
              </button>
            </div>
          ))}
          
          {skills.length === 0 && (
            <div className="text-gray-500 italic">No skills added yet.</div>
          )}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a skill (e.g. Python, Java, React)"
            className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
          <Button
            variant="secondary"
            onClick={handleAddSkill}
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SkillsList;