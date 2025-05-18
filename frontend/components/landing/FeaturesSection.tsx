// src/components/landing/FeaturesSection.tsx
import React from 'react';
import FeatureCard from './FeatureCard';

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-emerald-800 text-center mb-12">
          How TeachTeam Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* For Tutor Applicants */}
          <FeatureCard
            title="For Tutor Applicants"
            description="Create a profile showcasing your skills, academic credentials, and teaching experience. Apply for tutoring positions in your preferred courses."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          {/* For Lecturers */}
          <FeatureCard
            title="For Lecturers"
            description="Browse through qualified applicants, review their profiles, and select the best candidates for your courses. Add comments and rank preferred tutors."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />

          {/* Streamlined Process */}
          <FeatureCard
            title="Streamlined Process"
            description="Our efficient matching system helps lecturers find the most suitable tutors quickly, while providing applicants with opportunities to showcase their skills."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;