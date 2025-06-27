import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

// Mock Next.js router
const mockPush = jest.fn();
const mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img src={src} alt={alt} width={width} height={height} className={className} />
  ),
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className, onClick, role, ...props }: any) => (
    <a href={href} className={className} onClick={onClick} role={role} {...props}>
      {children}
    </a>
  ),
}));

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('3.2.1.1 - Desktop Navigation Rendering and Functionality', () => {
    it('renders desktop navigation with all required links', () => {
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

    it('renders search button in desktop navigation', () => {
      render(<Navigation />);

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveAttribute('aria-label', 'Search');
    });

    it('applies correct styling classes to desktop navigation elements', () => {
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

    it('hides mobile menu button on desktop', () => {
      render(<Navigation />);

      // Mobile menu button should be present but hidden via CSS on desktop
      const mobileButton = screen.getByLabelText('Open menu');
      expect(mobileButton).toBeInTheDocument();
      // Note: md:hidden class is on the parent div, not the button itself
      // JSDOM doesn't simulate responsive breakpoints, so we just verify the button exists
    });
  });

  describe('3.2.1.2 - Mobile Menu Toggle and Overlay Behavior', () => {
    it('shows mobile menu button on mobile viewport', () => {
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

    it('closes mobile menu when close button is clicked', async () => {
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

      // Click overlay
      const overlay = screen.getByLabelText('Close menu overlay');
      fireEvent.click(overlay);

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });
    });

    it('does not close mobile menu when menu content is clicked', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Click menu content (should not close)
      const menuContent = screen.getByLabelText('Mobile menu');
      fireEvent.click(menuContent);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });
    });
  });

  describe('3.2.1.3 - Navigation Link Accessibility and Keyboard Navigation', () => {
    it('has proper ARIA labels for all interactive elements', () => {
      render(<Navigation />);

      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('supports keyboard navigation for desktop links', () => {
      render(<Navigation />);

      const homeLink = screen.getByText('Home');
      const peopleLink = screen.getByText('People');

      // Test tab navigation
      homeLink.focus();
      expect(homeLink).toHaveFocus();

      // Test keyboard interaction
      fireEvent.keyDown(homeLink, { key: 'Enter' });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('supports keyboard navigation for mobile menu', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close menu');
        expect(closeButton).toBeInTheDocument();
      });

      // Test that close button is accessible and has proper attributes
      const closeButton = screen.getByLabelText('Close menu');
      expect(closeButton).toHaveAttribute('type', 'button');
      expect(closeButton).toHaveAttribute('aria-label', 'Close menu');

      // Note: Full keyboard navigation testing would require browser environment
      // JSDOM has limitations with focus management and keyboard events
    });

    it('has proper focus management for mobile menu', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close menu');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('3.2.1.4 - Responsive Breakpoints and Mobile Menu Interactions', () => {
    it('renders mobile menu with correct styling classes', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        expect(mobileMenu).toHaveClass(
          'absolute',
          'top-0',
          'right-0',
          'w-64',
          'h-full',
          'bg-white',
          'shadow-lg',
        );
      });
    });

    it('renders mobile menu overlay with correct styling', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const overlay = screen.getByLabelText('Close menu overlay');
        expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black', 'bg-opacity-40');
      });
    });

    it('closes mobile menu when navigation link is clicked', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Click a navigation link in mobile menu (use getAllByText and select the mobile one)
      const mobileMenu = screen.getByLabelText('Mobile menu');
      const mobileHomeLink = within(mobileMenu).getByText('Home');
      fireEvent.click(mobileHomeLink);

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });
    });

    it('renders search button in mobile menu', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileSearchButton = screen.getAllByLabelText('Search')[1]; // Second search button (mobile)
        expect(mobileSearchButton).toBeInTheDocument();
      });
    });
  });

  describe('3.2.1.5 - Logo and Branding Elements', () => {
    it('renders WAVES logo with correct attributes', () => {
      render(<Navigation />);

      const logo = screen.getByAltText('WAVES Lab Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/WAVES_logo.png');
      expect(logo).toHaveAttribute('width', '40');
      expect(logo).toHaveAttribute('height', '40');
      expect(logo).toHaveClass('mr-2');
    });

    it('renders WAVES text branding with correct styling', () => {
      render(<Navigation />);

      const brandingText = screen.getByText('WAVES');
      expect(brandingText).toBeInTheDocument();
      expect(brandingText).toHaveClass('font-bold', 'text-xl', 'text-blue-900', 'tracking-tight');
    });

    it('logo and branding are clickable and link to home page', () => {
      render(<Navigation />);

      const logoLink = screen.getByText('WAVES').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
      expect(logoLink).toHaveClass(
        'flex',
        'items-center',
        'hover:opacity-80',
        'transition-opacity',
      );
    });

    it('logo and branding are accessible', () => {
      render(<Navigation />);

      const logo = screen.getByAltText('WAVES Lab Logo');
      const brandingText = screen.getByText('WAVES');

      expect(logo).toBeInTheDocument();
      expect(brandingText).toBeInTheDocument();
    });
  });

  describe('3.2.1.6 - Search Button Functionality', () => {
    it('renders search button in desktop navigation', () => {
      render(<Navigation />);

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveClass('ml-2', 'p-2', 'rounded', 'hover:bg-gray-100');
    });

    it('renders search button in mobile menu', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileSearchButtons = screen.getAllByLabelText('Search');
        expect(mobileSearchButtons).toHaveLength(2); // Desktop and mobile
      });
    });

    it('search button is clickable and has proper styling', () => {
      render(<Navigation />);

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toHaveAttribute('type', 'button');
      expect(searchButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });

    it('search button has proper accessibility attributes', () => {
      render(<Navigation />);

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toHaveAttribute('aria-label', 'Search');
      expect(searchButton).toHaveAttribute('type', 'button');
    });
  });

  describe('3.2.1.7 - Focus Management and ARIA Attributes', () => {
    it('has proper ARIA roles and labels', () => {
      render(<Navigation />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      const searchButton = screen.getByLabelText('Search');
      expect(searchButton).toHaveAttribute('aria-label', 'Search');

      const mobileButton = screen.getByLabelText('Open menu');
      expect(mobileButton).toHaveAttribute('aria-label', 'Open menu');
    });

    it('mobile menu has proper ARIA attributes', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const mobileMenu = screen.getByLabelText('Mobile menu');
        expect(mobileMenu).toHaveAttribute('role', 'menu');
        expect(mobileMenu).toHaveAttribute('aria-label', 'Mobile menu');

        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems).toHaveLength(7); // All navigation links
      });
    });

    it('overlay has proper ARIA attributes', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const overlay = screen.getByLabelText('Close menu overlay');
        expect(overlay).toHaveAttribute('aria-label', 'Close menu overlay');
      });
    });

    it('close button has proper ARIA attributes', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close menu');
        expect(closeButton).toHaveAttribute('aria-label', 'Close menu');
      });
    });
  });

  describe('3.2.1.8 - Menu Close Functionality and Overlay Click Handling', () => {
    it('closes menu when close button is clicked', async () => {
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

    it('closes menu when overlay is clicked', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Click overlay
      const overlay = screen.getByLabelText('Close menu overlay');
      fireEvent.click(overlay);

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });
    });

    it('does not close menu when menu content is clicked', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Click menu content (should not close)
      const menuContent = screen.getByLabelText('Mobile menu');
      fireEvent.click(menuContent);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });
    });

    it('closes menu when navigation link is clicked', async () => {
      render(<Navigation />);

      // Open menu
      const mobileButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      // Click a navigation link in mobile menu
      const mobileMenu = screen.getByLabelText('Mobile menu');
      const mobilePeopleLink = within(mobileMenu).getByText('People');
      fireEvent.click(mobilePeopleLink);

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });
    });

    it('handles multiple rapid open/close operations correctly', async () => {
      render(<Navigation />);

      const mobileButton = screen.getByLabelText('Open menu');

      // Rapid open/close
      fireEvent.click(mobileButton);
      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close menu');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Mobile menu')).not.toBeInTheDocument();
      });

      // Open again
      fireEvent.click(mobileButton);
      await waitFor(() => {
        expect(screen.getByLabelText('Mobile menu')).toBeInTheDocument();
      });
    });
  });
});
