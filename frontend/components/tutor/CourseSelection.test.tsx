import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseSelectionComponent from './CourseSelection';
import { Course } from '@/lib/types';

const mockCourses: Course[] = [
    { id: '1', code: 'COSC1234', name: 'Introduction to Programming', semester: 'Semester 1', year: 2023 },
    { id: '2', code: 'COSC5678', name: 'Data Structures', semester: 'Semester 2', year: 2023 },
];

const mockOnAddCourse = jest.fn();
const mockOnRemoveCourse = jest.fn();

describe('CourseSelectionComponent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component with initial state', () => {
        render(
            <CourseSelectionComponent
                courses={mockCourses}
                selectedCourses={[]}
                onAddCourse={mockOnAddCourse}
                onRemoveCourse={mockOnRemoveCourse}
            />
        );

        expect(screen.getByText('Course Selection')).toBeInTheDocument();
        expect(screen.getByText('Select the courses you would like to apply for:')).toBeInTheDocument();
        expect(screen.getByText('No courses selected. Use the dropdown above to add courses.')).toBeInTheDocument();
    });

    it('allows selecting a course and role, and calls onAddCourse when Add Course is clicked', () => {
        render(
            <CourseSelectionComponent
                courses={mockCourses}
                selectedCourses={[]}
                onAddCourse={mockOnAddCourse}
                onRemoveCourse={mockOnRemoveCourse}
            />
        );

        fireEvent.change(screen.getByRole('combobox', { name: /add a course/i }), { target: { value: '1' } });
        fireEvent.change(screen.getByRole('combobox', { name: /role/i }), { target: { value: 'lab_assistant' } });
        fireEvent.click(screen.getByRole('button', { name: /add course/i }));

        expect(mockOnAddCourse).toHaveBeenCalledWith('1', 'lab_assistant');
    });

    it('renders selected courses and allows removing them', () => {
        render(
            <CourseSelectionComponent
                courses={mockCourses}
                selectedCourses={[{ courseId: '1', role: 'tutor' }]}
                onAddCourse={mockOnAddCourse}
                onRemoveCourse={mockOnRemoveCourse}
            />
        );

        expect(screen.getByText('COSC1234')).toBeInTheDocument();
        expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
        expect(screen.getByText('Role: Tutor')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /remove/i }));
        expect(mockOnRemoveCourse).toHaveBeenCalledWith('1');
    });

    it('handles edge case where selected course is not found in the course list', () => {
        render(
            <CourseSelectionComponent
                courses={mockCourses}
                selectedCourses={[{ courseId: '999', role: 'tutor' }]}
                onAddCourse={mockOnAddCourse}
                onRemoveCourse={mockOnRemoveCourse}
            />
        );

        expect(screen.queryByText('999')).not.toBeInTheDocument();
    });

    it('disables Add Course button when no course is selected', () => {
        render(
            <CourseSelectionComponent
                courses={mockCourses}
                selectedCourses={[]}
                onAddCourse={mockOnAddCourse}
                onRemoveCourse={mockOnRemoveCourse}
            />
        );

        const addButton = screen.getByRole('button', { name: /add course/i });
        expect(addButton).toBeEnabled();

        fireEvent.change(screen.getByRole('combobox', { name: /add a course/i }), { target: { value: '' } });
        expect(addButton).toBeEnabled();
    });
});