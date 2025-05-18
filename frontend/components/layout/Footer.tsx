import React from 'react';
import Link from 'next/link';

interface FooterProps {
    webName?: string;
}

const Footer: React.FC<FooterProps> = ({
    webName = 'TeachTeam'
}) => {
    return (
        <footer className="bg-lime-200 text-emerald-800 py-4 text-center mt-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <div className="font-bold">
                        <h2>Quick Links</h2>
                    </div>
                    <nav>
                        <p><Link href="/">Home</Link></p>
                        <p><Link href="/signin">Sign in</Link></p>
                    </nav>
                </div>
                <div>
                    <div className="font-bold">
                        <h2>Developers</h2>
                    </div>
                    <ul>
                        <li>Olivia Wensemius</li>
                        <li>Fatima Hubail</li>
                    </ul>
                </div>
                <div>
                    <div className="font-bold">
                        <h2>TeachTeam</h2>
                    </div>
                    <p>A platform for selecting and hiring tutors for the School of Computer Science.</p>
                </div>
            </div>
            <p className="mt-4">&copy; {new Date().getFullYear()} {webName}. All rights reserved.</p>
        </footer>
    ) 
};

export default Footer;