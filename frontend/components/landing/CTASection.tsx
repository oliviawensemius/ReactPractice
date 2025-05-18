import React from 'react';
import Button from '../ui/Button';

const CTASection: React.FC = () => {
  return (
    <section className="bg-emerald-600 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Sign in to TeachTeam to apply as a tutor or lab assistant, or to review applicants as a lecturer.
          You must have an account to access the platform&apos;s features.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <a href="/signup">
            <Button 
              variant="primary" 
              className="bg-white text-emerald-600 hover:bg-gray-100"
            >
              Sign Up
            </Button>
          </a>
          <a href="/signin">
            <Button 
              variant="secondary"
              className="border-white text-white hover:bg-emerald-700" 
            >
              Sign In
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;