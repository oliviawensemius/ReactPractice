// src/components/landing/FeatureCard.tsx
import React from 'react';
import Card from '../ui/Card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description,
  icon
}) => {
  return (
    <Card className="h-full">
      <div className="flex flex-col items-center text-center">
        {icon && <div className="text-emerald-600 mb-4">{icon}</div>}
        <h3 className="text-xl font-semibold text-emerald-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Card>
  );
};

export default FeatureCard;