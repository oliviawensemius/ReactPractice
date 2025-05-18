import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicantDetails from './ApplicantDetails';
import { ApplicantDisplay } from '@/lib/types';

const mockApplicant: ApplicantDisplay = {
  id: 'app-1',
  tutorName: 'John Doe',
  tutorEmail: 'john.doe@example.com',
  courseId: 'COSC2801',
  courseCode: 'COSC2801',
  courseName: 'Introduction to Programming',
  role: 'tutor',
  skills: ['JavaScript', 'React'],
  previousRoles: [
    {
      id: '1',
      position: 'Teaching Assistant',
      organisation: 'RMIT University',
      startDate: '2021-06-01',
      endDate: '2021-12-31',
    },
  ],
  academicCredentials: [
    {
      id: '1',
      degree: 'BSc Computer Science',
      institution: 'RMIT University',
      year: 2022,
    },
  ],
  availability: 'fulltime',
  status: 'Pending',
  comments: ['Great candidate'],
};

describe('ApplicantDetails Component', () => {
  let mockOnUpdate: jest.Mock;

  beforeEach(() => {
    mockOnUpdate = jest.fn();
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock window.alert
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders applicant details correctly', () => {
    render(<ApplicantDetails selectedApplicant={mockApplicant} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('COSC2801 - Introduction to Programming')).toBeInTheDocument();
    expect(screen.getByText('Tutor')).toBeInTheDocument();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Great candidate')).toBeInTheDocument();
  });

  it('handles status change to "Selected"', () => {
    render(<ApplicantDetails selectedApplicant={mockApplicant} onUpdate={mockOnUpdate} />);

    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockApplicant,
      status: 'Selected',
    });
    expect(window.alert).toHaveBeenCalledWith('John Doe has been accepted for COSC2801.');
  });

  it('handles status change to "Rejected"', () => {
    render(<ApplicantDetails selectedApplicant={mockApplicant} onUpdate={mockOnUpdate} />);

    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockApplicant,
      status: 'Rejected',
    });
    expect(window.alert).toHaveBeenCalledWith('John Doe has been rejected for COSC2801.');
  });

  it('adds a new comment', () => {
    render(<ApplicantDetails selectedApplicant={mockApplicant} onUpdate={mockOnUpdate} />);

    const commentInput = screen.getByPlaceholderText('Add a comment');
    const addButton = screen.getByText('Add');

    fireEvent.change(commentInput, { target: { value: 'Excellent communication skills' } });
    fireEvent.click(addButton);

    expect(mockOnUpdate).toHaveBeenCalledWith({
      ...mockApplicant,
      comments: [...(mockApplicant.comments ?? []), 'Excellent communication skills'], // Ensure comments is not undefined
    });
    expect(commentInput).toHaveValue('');
  });

  it('shows a message when no applicant is selected', () => {
    render(<ApplicantDetails selectedApplicant={null} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Click on an applicant to see more details')).toBeInTheDocument();
  });
});