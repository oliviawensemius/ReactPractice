import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Signin from './page';
import { useRouter } from 'next/navigation';

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('Signin Page', () => {
    let mockPush: jest.Mock;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        // Mock localStorage
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
            if (key === 'lecturer@gmail.com') {
                return JSON.stringify({
                    name: 'Dummy Lecturer',
                    email: 'lecturer@gmail.com',
                    role: 'lecturer',
                    password: 'dummyLecturer.123',
                });
            }
            if (key === 'tutor@gmail.com') {
                return JSON.stringify({
                    name: 'Dummy Tutor',
                    email: 'tutor@gmail.com',
                    role: 'tutor',
                    password: 'dummyTutor.123',
                });
            }
            return null;
        });
    });

    it('renders the sign-in form', () => {
        render(<Signin />);
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('shows an error when fields are empty', () => {
        render(<Signin />);
        const submitButton = screen.getByRole('button', { name: 'Sign In' });
        fireEvent.click(submitButton);
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    });

    it('shows an error for invalid email or password', async () => {
        render(<Signin />);
        const emailInput = screen.getByPlaceholderText('you@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
        fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);
    
        // Use waitFor to handle dynamic rendering
        await waitFor(() => {
            expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
        });
    });

    it('shows a success notification and redirects to the lecturer dashboard on valid login', async () => {
        render(<Signin />);
        const emailInput = screen.getByPlaceholderText('you@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: 'Sign In' });

        fireEvent.change(emailInput, { target: { value: 'lecturer@gmail.com' } });
        fireEvent.change(passwordInput, { target: { value: 'dummyLecturer.123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Login successful, redirecting now')).toBeInTheDocument();
        });

        setTimeout(() => {
            expect(mockPush).toHaveBeenCalledWith('/lecturer');
        }, 1500);
    });

    it('shows a success notification and redirects to the tutor dashboard on valid login', async () => {
        render(<Signin />);
        const emailInput = screen.getByPlaceholderText('you@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: 'Sign In' });

        fireEvent.change(emailInput, { target: { value: 'tutor@gmail.com' } });
        fireEvent.change(passwordInput, { target: { value: 'dummyTutor.123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Login successful, redirecting now')).toBeInTheDocument();
        });

        setTimeout(() => {
            expect(mockPush).toHaveBeenCalledWith('/tutor');
        }, 1500);
    });
});