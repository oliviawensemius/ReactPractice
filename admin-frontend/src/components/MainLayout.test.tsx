import React from 'react';
import { render, screen } from '@testing-library/react';
import MainLayout from './MainLayout';
import * as auth from '@/lib/auth';
import * as data from '@/lib/data';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  isUserLoggedIn: jest.fn(),
  getUserRoleDisplay: jest.fn(),
  getUserName: jest.fn(),
}));

// Mock the data module where initializeUsers is located
jest.mock('@/lib/data', () => ({
  initializeUsers: jest.fn(),
}));

// Mock the layout components
jest.mock('./Header', () => {
  const Header = () => <div data-testid="header">Header</div>;
  Header.displayName = 'Header';
  return Header;
});

jest.mock('./Navbar', () => {
  const Navbar = () => <div data-testid="navbar">Navbar</div>;
  Navbar.displayName = 'Navbar';
  return Navbar;
});

jest.mock('./Footer', () => {
  const Footer = () => <div data-testid="footer">Footer</div>;
  Footer.displayName = 'Footer';
  return Footer;
});

describe('MainLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the layout with children', () => {
    (auth.isUserLoggedIn as jest.Mock).mockReturnValue(true);
    (auth.getUserRoleDisplay as jest.Mock).mockReturnValue('applicant');
    (auth.getUserName as jest.Mock).mockReturnValue('John Doe');

    render(
      <MainLayout>
        <div data-testid="child">Child Content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('initializes users on mount', () => {
    render(
      <MainLayout>
        <div>Child Content</div>
      </MainLayout>
    );

    // This should now work with the correct module
    expect(data.initializeUsers).toHaveBeenCalled();
  });

  it('updates authentication state based on auth functions', () => {
    (auth.isUserLoggedIn as jest.Mock).mockReturnValue(true);
    (auth.getUserRoleDisplay as jest.Mock).mockReturnValue('lecturer');
    (auth.getUserName as jest.Mock).mockReturnValue('Jane Doe');

    render(
      <MainLayout>
        <div>Child Content</div>
      </MainLayout>
    );

    expect(auth.isUserLoggedIn).toHaveBeenCalled();
    expect(auth.getUserRoleDisplay).toHaveBeenCalled();
    expect(auth.getUserName).toHaveBeenCalled();
  });
});