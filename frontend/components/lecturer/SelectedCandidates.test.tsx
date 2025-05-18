import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectedCandidates from './SelectedCandidates';
import { ApplicantDisplay } from '@/lib/types';
import * as applicantList from '@/lib/applicantList';

jest.mock('@/lib/applicantList', () => ({
    getSelectedApplicants: jest.fn(),
    updateRanking: jest.fn(),
}));

describe('SelectedCandidates Component', () => {
    const mockOnSelectApplicant = jest.fn();
    const mockOnRankingUpdated = jest.fn();

    const mockApplicants: ApplicantDisplay[] = [
        {
            id: '1',
            tutorName: 'John Doe',
            tutorEmail: 'john@example.com',
            courseId: '2',
            courseCode: '2',
            courseName: 'Introduction to Programming',
            role: 'tutor',
            skills: ['JavaScript', 'React'],
            previousRoles: [],
            academicCredentials: [],
            availability: 'fulltime',
            status: 'Selected',
            ranking: 1,
        },
        {
            id: '2',
            tutorName: 'Jane Smith',
            tutorEmail: 'jane@example.com',
            courseId: '3',
            courseCode: '3',
            courseName: 'Data Structures',
            role: 'lab_assistant',
            skills: ['Python', 'Algorithms'],
            previousRoles: [],
            academicCredentials: [],
            availability: 'parttime',
            status: 'Selected',
            ranking: 2,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (applicantList.getSelectedApplicants as jest.Mock).mockReturnValue(mockApplicants);
    });

    it('renders the component with applicants', () => {
        render(
            <SelectedCandidates
                onSelectApplicant={mockOnSelectApplicant}
                onRankingUpdated={mockOnRankingUpdated}
            />
        );

        expect(screen.getByText('Selected Candidates')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('displays "No selected applicants yet" when there are no applicants', () => {
        (applicantList.getSelectedApplicants as jest.Mock).mockReturnValue([]);
        render(
            <SelectedCandidates
                onSelectApplicant={mockOnSelectApplicant}
                onRankingUpdated={mockOnRankingUpdated}
            />
        );

        expect(screen.getByText('No selected applicants yet')).toBeInTheDocument();
    });

    it('calls onSelectApplicant when an applicant row is clicked', () => {
        render(
            <SelectedCandidates
                onSelectApplicant={mockOnSelectApplicant}
                onRankingUpdated={mockOnRankingUpdated}
            />
        );

        fireEvent.click(screen.getByText('John Doe'));
        expect(mockOnSelectApplicant).toHaveBeenCalledWith(mockApplicants[0]);
    });

    it('allows editing and saving the rank of an applicant', () => {
        (applicantList.updateRanking as jest.Mock).mockReturnValue(true);

        render(
            <SelectedCandidates
                onSelectApplicant={mockOnSelectApplicant}
                onRankingUpdated={mockOnRankingUpdated}
            />
        );

        fireEvent.click(screen.getAllByText('Adjust Rank')[0]);

        const input = screen.getByDisplayValue('1');
        fireEvent.change(input, { target: { value: '3' } });

        fireEvent.click(screen.getByText('Save'));

        expect(applicantList.updateRanking).toHaveBeenCalledWith('1', 3);
        expect(mockOnRankingUpdated).toHaveBeenCalled();
    });

    it('cancels rank editing when cancel button is clicked', () => {
        render(
            <SelectedCandidates
                onSelectApplicant={mockOnSelectApplicant}
                onRankingUpdated={mockOnRankingUpdated}
            />
        );

        fireEvent.click(screen.getAllByText('Adjust Rank')[0]);

        const input = screen.getByDisplayValue('1');
        expect(input).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));

        expect(screen.queryByDisplayValue('1')).not.toBeInTheDocument();
    });
});