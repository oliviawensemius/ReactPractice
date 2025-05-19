// components/tutor/AcademicCredentials.tsx - Enhanced with validation
import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AcademicCredential } from '@/lib/types';

interface AcademicCredentialsProps {
  credentials: AcademicCredential[];
  onAddCredential: (credential: Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string }) => void;
  onRemoveCredential: (credentialId: string) => void;
}

// Validation functions
const validateCredential = (credential: Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string }): string | null => {
  if (!credential.degree.trim()) {
    return 'Degree/Qualification is required';
  }
  if (credential.degree.trim().length < 2) {
    return 'Degree must be at least 2 characters long';
  }
  if (!credential.institution.trim()) {
    return 'Institution is required';
  }
  if (credential.institution.trim().length < 2) {
    return 'Institution must be at least 2 characters long';
  }
  if (!credential.year || credential.year < 1950 || credential.year > new Date().getFullYear()) {
    return `Year must be between 1950 and ${new Date().getFullYear()}`;
  }
  if (credential.gpa && credential.gpa.trim()) {
    const gpaNum = parseFloat(credential.gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
      return 'GPA must be a number between 0 and 4';
    }
  }
  return null;
};

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
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCredential = () => {
    setIsAdding(true);
    setErrors({});
    
    // Validate the credential
    const validationError = validateCredential(newCredential);
    if (validationError) {
      setErrors({ general: validationError });
      setIsAdding(false);
      return;
    }
    
    // Check for duplicate credentials
    const isDuplicate = credentials.some(cred => 
      cred.degree.toLowerCase() === newCredential.degree.toLowerCase() &&
      cred.institution.toLowerCase() === newCredential.institution.toLowerCase() &&
      cred.year === newCredential.year
    );
    
    if (isDuplicate) {
      setErrors({ general: 'This credential already exists' });
      setIsAdding(false);
      return;
    }
    
    try {
      onAddCredential(newCredential);
      // Reset form
      setNewCredential({
        degree: '',
        institution: '',
        year: new Date().getFullYear(),
        gpa: ''
      });
      setErrors({});
    } catch (error) {
      setErrors({ general: 'Failed to add credential. Please try again.' });
    } finally {
      setIsAdding(false);
    }
  };

  // Handle field changes with real-time validation
  const handleFieldChange = (field: string, value: string | number) => {
    setNewCredential(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear general error when any field changes
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  // Predefined degree options for better UX
  const degreeOptions = [
    'Bachelor of Computer Science',
    'Bachelor of Information Technology',
    'Bachelor of Software Engineering',
    'Bachelor of Data Science',
    'Master of Computer Science', 
    'Master of Information Technology',
    'Master of Software Engineering',
    'Master of Data Science',
    'PhD in Computer Science',
    'PhD in Information Technology',
    'Other'
  ];

  // Predefined institution options for Australia
  const institutionOptions = [
    'RMIT University',
    'University of Melbourne',
    'Monash University',
    'Australian National University',
    'University of Sydney',
    'University of New South Wales',
    'University of Queensland',
    'University of Western Australia',
    'University of Adelaide',
    'Deakin University',
    'Griffith University',
    'Other'
  ];

  return (
    <Card title="Academic Credentials">
      <div className="space-y-6">
        {/* Existing credentials */}
        <div className="space-y-4">
          {credentials.map(credential => (
            <div key={credential.id} className="border rounded-md p-4 bg-gray-50 relative">
              <button
                type="button"
                onClick={() => onRemoveCredential(credential.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove credential"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="pr-8">
                <div className="font-semibold text-gray-900">{credential.degree}</div>
                <div className="text-gray-700">{credential.institution}</div>
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span>Year: {credential.year}</span>
                  {credential.gpa !== undefined && (
                    <span className="font-medium">GPA: {credential.gpa.toFixed(1)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {credentials.length === 0 && (
            <div className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-md">
              No academic credentials added yet.
            </div>
          )}
        </div>
        
        {/* Add new credential form */}
        <div className="border rounded-md p-4 bg-white">
          <h4 className="font-medium mb-3">Add an Academic Credential</h4>
          
          {/* Error display */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree/Qualification *
              </label>
              <div className="space-y-2">
                <select
                  value={degreeOptions.includes(newCredential.degree) ? newCredential.degree : 'Other'}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      handleFieldChange('degree', '');
                    } else {
                      handleFieldChange('degree', e.target.value);
                    }
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isAdding}
                >
                  <option value="">Select a degree...</option>
                  {degreeOptions.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
                {(newCredential.degree === '' || !degreeOptions.includes(newCredential.degree)) && (
                  <input
                    type="text"
                    value={newCredential.degree}
                    onChange={(e) => handleFieldChange('degree', e.target.value)}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ${
                      errors.degree ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your degree/qualification"
                    maxLength={100}
                    disabled={isAdding}
                  />
                )}
              </div>
              {errors.degree && (
                <p className="mt-1 text-sm text-red-600">{errors.degree}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution *
              </label>
              <div className="space-y-2">
                <select
                  value={institutionOptions.includes(newCredential.institution) ? newCredential.institution : 'Other'}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      handleFieldChange('institution', '');
                    } else {
                      handleFieldChange('institution', e.target.value);
                    }
                  }}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isAdding}
                >
                  <option value="">Select an institution...</option>
                  {institutionOptions.map(institution => (
                    <option key={institution} value={institution}>{institution}</option>
                  ))}
                </select>
                {(newCredential.institution === '' || !institutionOptions.includes(newCredential.institution)) && (
                  <input
                    type="text"
                    value={newCredential.institution}
                    onChange={(e) => handleFieldChange('institution', e.target.value)}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ${
                      errors.institution ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter institution name"
                    maxLength={100}
                    disabled={isAdding}
                  />
                )}
              </div>
              {errors.institution && (
                <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year of Completion *
              </label>
              <input
                type="number"
                value={newCredential.year}
                onChange={(e) => handleFieldChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ${
                  errors.year ? 'border-red-500' : ''
                }`}
                min="1950"
                max={new Date().getFullYear()}
                disabled={isAdding}
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPA (optional)
              </label>
              <input
                type="number"
                value={newCredential.gpa}
                onChange={(e) => handleFieldChange('gpa', e.target.value)}
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ${
                  errors.gpa ? 'border-red-500' : ''
                }`}
                step="0.1"
                min="0"
                max="4"
                placeholder="e.g., 3.7 (out of 4.0)"
                disabled={isAdding}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your GPA on a 4.0 scale
              </p>
              {errors.gpa && (
                <p className="mt-1 text-sm text-red-600">{errors.gpa}</p>
              )}
            </div>
          </div>
          
          <Button
            variant="secondary"
            onClick={handleAddCredential}
            disabled={isAdding || !newCredential.degree.trim() || !newCredential.institution.trim()}
          >
            {isAdding ? 'Adding Credential...' : 'Add Credential'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AcademicCredentials;