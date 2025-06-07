// src/components/tutor/PreviousRoles.tsx
import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PreviousRole {
  id: string;
  position: string;
  organisation: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
interface PreviousRolesProps {
  roles: PreviousRole[];
  onAddRole: (role: Omit<PreviousRole, 'id'>) => void;
  onRemoveRole: (roleId: string) => void;
}

const PreviousRoles: React.FC<PreviousRolesProps> = ({
  roles,
  onAddRole,
  onRemoveRole
}) => {
  const [newRole, setNewRole] = useState<Omit<PreviousRole, 'id'>>({
    position: '',
    organisation: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const handleAddRole = () => {
    if (newRole.position && newRole.organisation && newRole.startDate) {
      onAddRole(newRole);
      // Reset form
      setNewRole({
        position: '',
        organisation: '',
        startDate: '',
        endDate: '',
        description: ''
      });
    }
  };

  return (
    <Card title="Previous Roles">
      <div className="space-y-6">
        <div className="space-y-4">
          {roles.map(role => (
            <div key={role.id} className="border rounded-md p-4 bg-gray-50 relative">
              <button
                type="button"
                onClick={() => onRemoveRole(role.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              >
                &times;
              </button>
              <div className="font-semibold">{role.position}</div>
              <div className="text-sm text-gray-600">{role.organisation}</div>
              <div className="text-sm text-gray-600">
                {role.startDate} {role.endDate ? `- ${role.endDate}` : '- Present'}
              </div>
              {role.description && <div className="mt-2 text-sm">{role.description}</div>}
            </div>
          ))}
          
          {roles.length === 0 && (
            <div className="text-gray-500 italic">No previous roles added yet.</div>
          )}
        </div>
        
        <div className="border rounded-md p-4 bg-white">
          <h4 className="font-medium mb-3">Add a Previous Role</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={newRole.position}
                onChange={(e) => setNewRole({...newRole, position: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Tutor, Teaching Assistant, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organisation
              </label>
              <input
                type="text"
                value={newRole.organisation}
                onChange={(e) => setNewRole({...newRole, organisation: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="University, Company, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={newRole.startDate}
                onChange={(e) => setNewRole({...newRole, startDate: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (leave blank if current)
              </label>
              <input
                type="date"
                value={newRole.endDate}
                onChange={(e) => setNewRole({...newRole, endDate: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={newRole.description}
              onChange={(e) => setNewRole({...newRole, description: e.target.value})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              rows={2}
              placeholder="Brief description of your responsibilities"
            ></textarea>
          </div>
          <Button
            variant="secondary"
            onClick={handleAddRole}
          >
            Add Role
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PreviousRoles;