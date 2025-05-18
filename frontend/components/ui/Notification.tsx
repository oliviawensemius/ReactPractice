import React from 'react';
import { useEffect, useState } from 'react';

//Interface for the notification to use later in const Notification
interface NotificationProps {
    type: 'success' | 'error';
    message: string;
    duration?: number; // in milliseconds
    onClose?: () => void;   //function called after notification is closed
}

// Notification component. Checks if is error or success and displays the relevant message
const Notification: React.FC<NotificationProps> = ({
    type,
    message,
    duration = 3000,       //Closes after 3 seconds
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(true); // Starts as true, so the notification is visible

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);    // Hides the notification after the duration
            if (onClose) {
                onClose();      // Calls the onClose function if passed
            }
        }, duration);

        return () => clearTimeout(timer);   // Cleanup the timer on unmount for no memory leaks
    }, [duration, onClose]);

    if (!isVisible) return null;  // dont render if not visible

    return (
        <div
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${
                type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
        >
            <p>{message}</p>
            <button
                className="absolute top-2 right-2 text-white"
                onClick={() => {
                    setIsVisible(false);
                    if (onClose) {
                        onClose();
                    }
                }}
            >
                &times;
            </button>
        </div>
    );
}
export default Notification;