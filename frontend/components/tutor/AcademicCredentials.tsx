// src/components/tutor/AcademicCredentials.tsx
import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AcademicCredential } from '@/lib/types';

interface AcademicCredentialsProps {
  credentials: AcademicCredential[];
  onAddCredential: (credential: Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string }) => void;
  onRemoveCredential: (credentialId: string) => void;
}

const AcademicCredentials: React.FC<AcademicCredentialsProps> = ({
  credentials,
  onAddCredential,
  onRemoveCredential
}) => {
  const [newCredential, setNewCredential] = useState<Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string }>({
    degree: '',
    institution: '',
    year: new Date().getFullYear(),
    gpa: ''
  });

  const handleAddCredential = () => {
    if (newCredential.degree && newCredential.institution) {
      onAddCredential(newCredential);
      // Reset form
      setNewCredential({
        degree: '',
        institution: '',
        year: new Date().getFullYear(),
        gpa: ''
      });
    }
  };

  return (
    <Card title="Academic Credentials">
      <div className="space-y-6">
        <div className="space-y-4">
          {credentials.map(credential => (
            <div key={credential.id} className="border rounded-md p-4 bg-gray-50 relative">
              <button
                type="button"
                onClick={() => onRemoveCredential(credential.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              >
                &times;
              </button>
              <div className="font-semibold">{credential.degree}</div>
              <div className="text-sm text-gray-600">{credential.institution}, {credential.year}</div>
              {credential.gpa !== undefined && <div className="text-sm text-gray-600">GPA: {credential.gpa}</div>}
            </div>
          ))}
          
          {credentials.length === 0 && (
            <div className="text-gray-500 italic">No credentials added yet.</div>
          )}
        </div>
        
        <div className="border rounded-md p-4 bg-white">
          <h4 className="font-medium mb-3">Add an Academic Credential</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree/Qualification
              </label>
              <input
                type="text"
                value={newCredential.degree}
                onChange={(e) => setNewCredential({...newCredential, degree: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Bachelor of Computer Science, PhD, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution
              </label>
              <input
                type="text"
                value={newCredential.institution}
                onChange={(e) => setNewCredential({...newCredential, institution: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="RMIT University, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={newCredential.year}
                onChange={(e) => setNewCredential({...newCredential, year: parseInt(e.target.value) || new Date().getFullYear()})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA (optional)
              </label>
              <input
                type="number"
                value={newCredential.gpa}
                onChange={(e) => setNewCredential({...newCredential, gpa: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                step="0.1"
                min="0"
                max="4"
                placeholder="3.5"
              />
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleAddCredential}
          >
            Add Credential
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AcademicCredentials;