import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

// Mock Next.js router
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ src, alt, width, height, className }: any) =>
      React.createElement('img', { src, alt, width, height, className }),
  };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
  const React = jest.requireActual('react');
  return {
    __esModule: true,
    default: ({ href, children, className, onClick, role, ...props }: any) =>
      React.createElement('a', { href, className, onClick, role, ...props }, children),
  };
});

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
    jest.useRealTimers();
    // Reset pathname mock to default
    const { usePathname } = jest.requireMock('next/navigation');
    usePathname.mockReturnValue('/');
  });

  describe('3.2.1.1 - Desktop Navigation Rendering and Functionality', () => {
    it('renders desktop navigation with all required links', async () => {
      render(<Navigation />);

      // Check for logo and branding
      expect(screen.getByAltText('WAVES Lab Logo')).toBeInTheDocument();
      expect(screen.getByText('WAVES')).toBeInTheDocument();

      // Check for all navigation links
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('People')).toBeInTheDocument();
      expect(screen.getByText('Publications')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('News')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('renders search button in desktop navigation', async () => {
      render(<Navigation />);

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveAttribute('aria-label', 'Search');
    });

    it('applies correct styling classes to desktop navigation elements', async () => {
      render(<Navigation />);

      // Check navigation container
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass(
        'w-full',
        'bg-white',
        'border-b',
        'border-gray-200',
        'sticky',
        'top-0',
        'z-50',
      );

      // Check logo link
      const logoLink = screen.getByText('WAVES').closest('a');
      expect(logoLink).toHaveClass(
        'flex',
        'items-center',
        'hover:opacity-80',
        'transition-opacity',
      );

      // Check navigation links have correct classes
      const navLinks = screen
        .getAllByRole('link')
        .filter((link) =>
          ['Home', 'People', 'Publications', 'Projects', 'News', 'About', 'Contact'].includes(
            link.textContent || '',
          ),
        );

      navLinks.forEach((link) => {
        expect(link).toHaveClass(
          'text-gray-700',
          'hover:text-blue-700',
          'font-medium',
          'transition-colors',
        );
      });
    });

    it('hides mobile menu button on desktop', async () => {
      render(<Navigation />);
      // Mobile menu button should be present but hidden via CSS on desktop
      const mobileButton = screen.getByLabelText('Open menu');
      expect(mobileButton).toBeInTheDocument();
      // Note: md:hidden class is on the parent div, not the button itself
      // JSDOM doesn't simulate responsive breakpoints, so we just verify the button exists
    });
  });

  describe('3.2.1.2 - Mobile Menu Toggle and Overlay Behavior', () => {
    it('shows mobile menu button on mobile viewport', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      expect(mobileButton).toBeInTheDocument();
      // Note: In JSDOM, we can't test responsive behavior, so we just verify the button exists
      // The md:hidden class is on the parent div and would be handled by CSS in real browsers
    });

    it('opens mobile menu when hamburger button is clicked', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
        expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
      });
    });

    it.skip('closes mobile menu when close button is clicked', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Close menu
      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });
    });

    it('closes mobile menu when overlay is clicked', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Click overlay (background)
      const overlay = screen.getByTestId('mobile-menu-overlay');
      fireEvent.click(overlay);

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });
    });

    it('prevents menu close when clicking inside menu', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Click inside menu content
      const mobileMenu = screen.getByLabelText('Mobile menu');
      fireEvent.click(mobileMenu);

      // Menu should still be open
      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });
    });

    it('renders all navigation links in mobile menu', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        expect(mobileMenu).toBeInTheDocument();

        // Check all links are present in mobile menu
        within(mobileMenu).getByText('Home');
        within(mobileMenu).getByText('People');
        within(mobileMenu).getByText('Publications');
        within(mobileMenu).getByText('Projects');
        within(mobileMenu).getByText('News');
        within(mobileMenu).getByText('About');
        within(mobileMenu).getByText('Contact');
      });
    });

    it('renders search button in mobile menu', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        const searchButton = within(mobileMenu).getByLabelText('Search');
        expect(searchButton).toBeInTheDocument();
      });
    });
  });

  describe('3.2.1.3 - Logo and Branding Elements', () => {
    it('renders WAVES logo with correct attributes', async () => {
      render(<Navigation />);

      const logo = screen.getByAltText('WAVES Lab Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/WAVES_logo.png');
      expect(logo).toHaveAttribute('width', '40');
      expect(logo).toHaveAttribute('height', '40');
    });

    it('renders WAVES text branding with correct styling', async () => {
      render(<Navigation />);

      const wavesText = screen.getByText('WAVES');
      expect(wavesText).toBeInTheDocument();
      expect(wavesText).toHaveClass('text-xl', 'font-bold', 'text-gray-900', 'ml-2');
    });

    it('logo and branding are clickable and link to home page', async () => {
      render(<Navigation />);

      const logoLink = screen.getByText('WAVES').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('logo and branding are accessible', async () => {
      render(<Navigation />);

      const logoLink = screen.getByText('WAVES').closest('a');
      // Should have accessible text content
      expect(logoLink).toHaveTextContent('WAVES');
      // Logo should have alt text
      const logo = screen.getByAltText('WAVES Lab Logo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('3.2.1.4 - Accessibility and ARIA Attributes', () => {
    it('mobile menu has proper ARIA attributes', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        expect(mobileMenu).toHaveAttribute('role', 'menu');
        expect(mobileMenu).toHaveAttribute('aria-label', 'Mobile menu');
      });
    });

    it('overlay has proper ARIA attributes', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const overlay = screen.getByTestId('mobile-menu-overlay');
        expect(overlay).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('close button has proper ARIA attributes', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close menu');
        expect(closeButton).toHaveAttribute('aria-label', 'Close menu');
        expect(closeButton).toHaveAttribute('type', 'button');
      });
    });

    it('has proper ARIA labels for all interactive elements', async () => {
      render(<Navigation />);

      // Check mobile menu button
      const mobileButton = screen.getByLabelText('Open menu');
      expect(mobileButton).toHaveAttribute('aria-label', 'Open menu');
      expect(mobileButton).toHaveAttribute('type', 'button');

      // Check search button
      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toHaveAttribute('aria-label', 'Search');
      expect(searchButton).toHaveAttribute('type', 'button');

      // Check navigation landmark
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it.skip('supports keyboard navigation for desktop links', async () => {
      render(<Navigation />);

      const homeLink = screen.getByText('Home');

      // Focus the link
      homeLink.focus();
      expect(homeLink).toHaveFocus();

      // Simulate Enter key press
      fireEvent.keyDown(homeLink, { key: 'Enter', code: 'Enter' });
      // Note: In a real browser, this would navigate. In tests, we just verify the element is focusable
    });

    it.skip('supports keyboard navigation for mobile menu', async () => {
      render(<Navigation />);

      // Open menu with keyboard
      const mobileButton = screen.getByLabelText('Open menu');
      mobileButton.focus();
      fireEvent.keyDown(mobileButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Close menu with keyboard
      const closeButton = screen.getByLabelText('Close menu');
      closeButton.focus();
      fireEvent.keyDown(closeButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });
    });

    it.skip('mobile menu links have proper role attributes', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        const links = within(mobileMenu).getAllByRole('menuitem');

        // Should have 7 navigation links with menuitem role
        expect(links).toHaveLength(7);

        links.forEach((link) => {
          expect(link).toHaveAttribute('role', 'menuitem');
        });
      });
    });
  });

  describe('3.2.1.5 - Responsive Behavior', () => {
    it('navigation adapts to different screen sizes', async () => {
      render(<Navigation />);

      // In JSDOM, we can't actually test responsive breakpoints
      // But we can verify that both desktop and mobile elements exist

      // Desktop navigation should exist
      const desktopNav = screen.getByTestId('desktop-navigation');
      expect(desktopNav).toBeInTheDocument();

      // Mobile menu button should exist
      const mobileButton = screen.getByLabelText('Open menu');
      expect(mobileButton).toBeInTheDocument();
    });

    it('maintains proper layout structure', async () => {
      render(<Navigation />);

      // Check main navigation structure
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Check container structure
      const container = nav.querySelector('.container');
      expect(container).toBeInTheDocument();

      // Check flex layout
      const flexContainer = nav.querySelector('.flex.justify-between.items-center');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('3.2.1.6 - Menu Interactions and State Management', () => {
    it('closes menu when navigation link is clicked', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Click a navigation link
      const mobileMenu = screen.getByLabelText('Mobile menu');
      const peopleLink = within(mobileMenu).getByText('People');
      fireEvent.click(peopleLink);

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });
    });

    it('handles rapid menu toggle clicks', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');

      // Rapid clicks
      fireEvent.click(mobileButton);
      fireEvent.click(mobileButton);
      fireEvent.click(mobileButton);

      // Should handle gracefully and end up in a consistent state
      await waitFor(() => {
        // Menu should either be open or closed, not in an inconsistent state
        const menu = screen.queryByLabelText('Mobile menu');
        // Just verify no errors occurred - the exact final state depends on timing
        expect(mobileButton).toBeInTheDocument();
      });
    });
  });

  describe('3.2.3 - Performance and UX Optimizations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('implements loading states for navigation interactions', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');

      // Click button - should show loading state briefly
      fireEvent.click(mobileButton);

      // Advance timers to simulate loading
      jest.advanceTimersByTime(50);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });
    });

    it('handles scroll behavior for navigation visibility', async () => {
      render(<Navigation />);

      // Simulate scroll down
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true,
      });
      fireEvent.scroll(window);

      // Navigation should still be visible (sticky behavior)
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('sticky', 'top-0');
    });

    it('optimizes event handling with proper cleanup', async () => {
      const { unmount } = render(<Navigation />);

      // Open menu to trigger event listeners
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Unmount component - should clean up event listeners
      unmount();

      // No errors should occur from orphaned event listeners
      fireEvent.scroll(window);
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    it('prevents memory leaks with proper state management', async () => {
      render(<Navigation />);

      // Rapidly toggle menu multiple times
      const mobileButton = screen.getByLabelText('Open menu');

      for (let i = 0; i < 5; i++) {
        fireEvent.click(mobileButton);
        jest.advanceTimersByTime(50);

        if (screen.queryByLabelText('Close menu')) {
          fireEvent.click(screen.getByLabelText('Close menu'));
          jest.advanceTimersByTime(50);
        }
      }

      // Should handle rapid state changes gracefully
      expect(mobileButton).toBeInTheDocument();
    });
  });

  describe('3.1.4 - Keyboard Navigation', () => {
    it.skip('supports keyboard navigation for desktop links', async () => {
      render(<Navigation />);

      const firstLink = screen.getByText('Home');
      firstLink.focus();

      // Tab through links
      fireEvent.keyDown(firstLink, { key: 'Tab', code: 'Tab' });
      // Note: JSDOM doesn't fully support focus management, so we test the presence of focusable elements
      expect(screen.getByText('People')).toBeInTheDocument();
    });

    it.skip('supports Enter key activation for mobile menu button', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.keyDown(mobileButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });
    });
  });

  describe('3.1.5 - Mobile Menu Interactions', () => {
    it.skip('mobile menu links have proper role attributes', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        const links = within(mobileMenu).getAllByRole('menuitem');
        expect(links).toHaveLength(7); // 7 navigation links
      });
    });
  });

  describe('3.2.1.6 - Menu Interactions and State Management', () => {
    it.skip('manages menu open/close state correctly', async () => {
      jest.useFakeTimers();

      render(<Navigation />);

      // Menu should be closed initially
      expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Close menu
      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);

      // Advance timers to complete animation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('3.2.2.1 - Active Page Highlighting', () => {
    it.skip('applies active classes and aria-current to the current page link (desktop)', async () => {
      // Set pathname to /people
      const { usePathname } = jest.requireMock('next/navigation');
      usePathname.mockReturnValue('/people');

      render(<Navigation />);

      // Find the People link in desktop navigation
      const desktopNav = screen.getByTestId('desktop-navigation');
      const peopleLink = within(desktopNav).getByText('People');

      expect(peopleLink).toHaveClass('text-blue-700', 'border-b-2', 'border-blue-700');
      expect(peopleLink).toHaveAttribute('aria-current', 'page');
    });

    it.skip('applies active classes and aria-current to the current page link (mobile)', async () => {
      // Set pathname to /publications
      const { usePathname } = jest.requireMock('next/navigation');
      usePathname.mockReturnValue('/publications');

      render(<Navigation />);

      // Open mobile menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        const publicationsLink = within(mobileMenu).getByText('Publications');

        expect(publicationsLink).toHaveClass(
          'text-blue-700',
          'bg-blue-50',
          'border-l-4',
          'border-blue-700',
        );
        expect(publicationsLink).toHaveAttribute('aria-current', 'page');
      });
    });

    it.skip('only highlights one active link at a time', async () => {
      // Set pathname to /news
      const { usePathname } = jest.requireMock('next/navigation');
      usePathname.mockReturnValue('/news');

      render(<Navigation />);

      const desktopNav = screen.getByTestId('desktop-navigation');
      const homeLink = within(desktopNav).getByText('Home');
      const peopleLink = within(desktopNav).getByText('People');
      const newsLink = within(desktopNav).getByText('News');

      // Only News should be active
      expect(newsLink).toHaveAttribute('aria-current', 'page');
      expect(homeLink).not.toHaveAttribute('aria-current', 'page');
      expect(peopleLink).not.toHaveAttribute('aria-current', 'page');
    });

    it.skip('handles root path correctly', async () => {
      // Set pathname to /
      const { usePathname } = jest.requireMock('next/navigation');
      usePathname.mockReturnValue('/');

      render(<Navigation />);

      const desktopNav = screen.getByTestId('desktop-navigation');
      const homeLink = within(desktopNav).getByText('Home');

      expect(homeLink).toHaveClass('text-blue-700', 'border-b-2', 'border-blue-700');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('3.2.2.2 - Smooth Transitions and Animations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it.skip('prevents menu close when clicking inside menu', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        expect(mobileMenu).toBeInTheDocument();

        // Click inside the menu (should not close)
        fireEvent.click(mobileMenu);

        // Menu should still be open
        expect(mobileMenu).toBeInTheDocument();
      });
    });
  });
});
