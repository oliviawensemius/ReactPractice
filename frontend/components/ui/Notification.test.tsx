import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Notification from './Notification';

describe('Notification Component', () => {
    it('renders the notification with the correct message and type', () => {
        render(<Notification type="success" message="Success message" />);
        expect(screen.getByText('Success message')).toBeInTheDocument();
        expect(screen.getByText('Success message').parentElement).toHaveClass('bg-green-500');
    });

    it('renders error notification with the correct styling', () => {
        render(<Notification type="error" message="Error message" />);
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.getByText('Error message').parentElement).toHaveClass('bg-red-500');
    });

    it('closes the notification after the specified duration', () => {
        jest.useFakeTimers();
        render(<Notification type="success" message="Auto close message" duration={2000} />);
        expect(screen.getByText('Auto close message')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(screen.queryByText('Auto close message')).not.toBeInTheDocument();
        jest.useRealTimers();
    });

    it('calls the onClose callback when the notification is closed', () => {
        const onCloseMock = jest.fn();
        render(<Notification type="success" message="Close callback" onClose={onCloseMock} />);

        fireEvent.click(screen.getByText('×'));
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('does not render the notification if isVisible is false', () => {
        jest.useFakeTimers();
        render(<Notification type="success" message="Hidden message" duration={1000} />);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
        jest.useRealTimers();
    });

    it('renders and allows manual close via the close button', () => {
        render(<Notification type="error" message="Manual close" />);
        expect(screen.getByText('Manual close')).toBeInTheDocument();

        fireEvent.click(screen.getByText('×'));
        expect(screen.queryByText('Manual close')).not.toBeInTheDocument();
    });
});