'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Logo import resolved - using WAVES logo from images/site/WAVES_logo.png

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'People', href: '/people' },
  { name: 'Publications', href: '/publications' },
  { name: 'News', href: '/news' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnimating, setMenuAnimating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  // Refs for focus management
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const lastMenuItemRef = useRef<HTMLAnchorElement>(null);

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show navigation at the top of the page
      if (currentScrollY <= 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && isVisible) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY && !isVisible) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY, isVisible]);

  // Focus management for mobile menu
  useEffect(() => {
    if (mobileOpen && menuAnimating) {
      // Focus the close button when menu opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else if (!mobileOpen) {
      // Return focus to hamburger button when menu closes
      hamburgerButtonRef.current?.focus();
    }
  }, [mobileOpen, menuAnimating]);

  // Open menu
  const openMenu = useCallback(() => {
    setMobileOpen(true);
  }, []);

  // Close menu with animation
  const closeMenu = useCallback(() => {
    setMenuAnimating(false);
    setTimeout(() => setMobileOpen(false), 300); // match transition duration
  }, []);

  // Animate in when mobileOpen becomes true
  useEffect(() => {
    if (mobileOpen) {
      // Wait for the menu to mount, then trigger animation
      const id = requestAnimationFrame(() => setMenuAnimating(true));
      return () => cancelAnimationFrame(id);
    } else {
      setMenuAnimating(false);
    }
  }, [mobileOpen]);

  // Keyboard navigation for mobile menu
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!mobileOpen || !menuAnimating) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
        case 'Tab':
          // Handle focus trapping
          if (e.shiftKey) {
            // Shift + Tab: move backwards
            if (document.activeElement === firstMenuItemRef.current) {
              e.preventDefault();
              closeButtonRef.current?.focus();
            }
          } else {
            // Tab: move forwards
            if (document.activeElement === closeButtonRef.current) {
              e.preventDefault();
              firstMenuItemRef.current?.focus();
            } else if (document.activeElement === lastMenuItemRef.current) {
              e.preventDefault();
              closeButtonRef.current?.focus();
            }
          }
          break;
      }
    },
    [mobileOpen, menuAnimating, closeMenu],
  );

  // Handle navigation with loading state
  const handleNavigation = useCallback(
    (href: string) => {
      setIsNavigating(true);
      setNavigatingTo(href);
      closeMenu();

      // Simulate navigation delay (remove this when real navigation is implemented)
      setTimeout(() => {
        setIsNavigating(false);
        setNavigatingTo(null);
      }, 500);
    },
    [closeMenu],
  );

  // Loading spinner component
  const LoadingSpinner = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  return (
    <>
      <nav
        className={`w-full bg-white dark:bg-slate-950 border-b border-gray-200 sticky top-0 z-50 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Name */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Image
                  src="/images/site/WAVES_logo.png"
                  alt="WAVES Lab Logo"
                  width={40}
                  height={40}
                  className="mr-2 mt-1.5"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-gray-50 ml-2">
                  WAVES @ UC Santa Barbara
                </span>
              </Link>
            </div>
            {/* Desktop Links */}
            <div className="hidden md:flex space-x-6 items-center" data-testid="desktop-navigation">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const isLoading = isNavigating && navigatingTo === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={
                      `text-gray-700 dark:text-gray-200 hover:text-blue-700 font-medium transition-colors` +
                      (isActive ? ' text-blue-700 border-b-2 border-blue-700' : '') +
                      (isLoading ? ' opacity-50 pointer-events-none' : '')
                    }
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => {
                      if (isLoading) {
                        e.preventDefault();
                        return;
                      }
                      handleNavigation(link.href);
                    }}
                  >
                    <span>{link.name}</span>
                    {isLoading && <LoadingSpinner size="sm" />}
                  </Link>
                );
              })}
              {/* Search Icon */}
              <Link
                href="/search"
                aria-label="Search"
                className="ml-2 p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </Link>
            </div>
            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              <button
                ref={hamburgerButtonRef}
                type="button"
                aria-label="Open menu"
                onClick={openMenu}
                disabled={menuAnimating}
                className={`p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity ${menuAnimating ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {menuAnimating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <svg
                    className="h-6 w-6 text-gray-700 dark:text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Outside nav for full screen coverage */}
      {(mobileOpen || menuAnimating) && (
        <div
          className={`fixed inset-0 z-[60] transition-all duration-300 ease-in-out ${menuAnimating ? 'bg-black/60' : 'bg-black/0'}`}
          onClick={closeMenu}
          aria-hidden="true"
          data-testid="mobile-menu-overlay"
        >
          <div
            ref={mobileMenuRef}
            className={`absolute top-0 right-0 w-64 h-full bg-white dark:bg-slate-950 shadow-lg flex flex-col p-6 transform transition-transform duration-300 ease-in-out ${menuAnimating ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            role="menu"
            aria-label="Mobile menu"
          >
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              disabled={!menuAnimating}
              className={`self-end mb-6 p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity ${!menuAnimating ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <svg
                className="h-6 w-6 text-gray-700 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {NAV_LINKS.map((link, index) => {
              const isActive = pathname === link.href;
              const isLoading = isNavigating && navigatingTo === link.href;
              const isFirst = index === 0;
              const isLast = index === NAV_LINKS.length - 1;

              return (
                <Link
                  key={link.name}
                  ref={isFirst ? firstMenuItemRef : isLast ? lastMenuItemRef : undefined}
                  href={link.href}
                  className={
                    `block py-2 text-lg text-gray-800 hover:text-blue-700 font-medium transition-colors flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset` +
                    (isActive ? ' text-blue-700 bg-blue-50 border-l-4 border-blue-700' : '') +
                    (isLoading ? ' opacity-50 pointer-events-none' : '')
                  }
                  onClick={(e) => {
                    if (isLoading) {
                      e.preventDefault();
                      return;
                    }
                    handleNavigation(link.href);
                  }}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{link.name}</span>
                  {isLoading && <LoadingSpinner size="sm" />}
                </Link>
              );
            })}
            {/* Search Icon */}
            <Link
              href="/search"
              aria-label="Search"
              className="mt-6 p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 self-start transition-colors"
              onClick={closeMenu}
            >
              <svg
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
