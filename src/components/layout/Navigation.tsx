'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

// TODO: Replace with actual logo import
// import Logo from 'public/images/site/waves_logo.svg';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'People', href: '/people' },
  { name: 'Publications', href: '/publications' },
  { name: 'Projects', href: '/projects' },
  { name: 'News', href: '/news' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnimating, setMenuAnimating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Open menu
  const openMenu = () => {
    setMobileOpen(true);
  };

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

  // Close menu with animation
  const closeMenu = () => {
    setMenuAnimating(false);
    setTimeout(() => setMobileOpen(false), 300); // match transition duration
  };

  // Handle navigation with loading state
  const handleNavigation = (href: string) => {
    setIsNavigating(true);
    setNavigatingTo(href);
    closeMenu();

    // Simulate navigation delay (remove this when real navigation is implemented)
    setTimeout(() => {
      setIsNavigating(false);
      setNavigatingTo(null);
    }, 500);
  };

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
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo and Name */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image
              src="/WAVES_logo.png"
              alt="WAVES Lab Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <span className="font-bold text-xl text-blue-900 tracking-tight">WAVES</span>
          </Link>
        </div>
        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 items-center">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const isLoading = isNavigating && navigatingTo === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={
                  `text-gray-700 hover:text-blue-700 font-medium transition-colors flex items-center space-x-1` +
                  (isActive ? ' text-blue-700 underline underline-offset-4 font-bold' : '') +
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
          {/* Search Icon Stub */}
          <button
            type="button"
            aria-label="Search"
            className="ml-2 p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
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
                className="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {(mobileOpen || menuAnimating) && (
        <div
          className={`fixed inset-0 z-50 bg-black transition-colors duration-300 ease-in-out ${menuAnimating ? 'bg-black/60' : 'bg-black/0'}`}
          onClick={closeMenu}
          aria-label="Close menu overlay"
        >
          <div
            className={`absolute top-0 right-0 w-64 h-full bg-white shadow-lg flex flex-col p-6 transform transition-transform duration-300 ease-in-out ${menuAnimating ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
            role="menu"
            aria-label="Mobile menu"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              disabled={!menuAnimating}
              className={`self-end mb-6 p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity ${!menuAnimating ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const isLoading = isNavigating && navigatingTo === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={
                    `block py-2 text-lg text-gray-800 hover:text-blue-700 font-medium transition-colors flex items-center justify-between` +
                    (isActive ? ' text-blue-700 underline underline-offset-4 font-bold' : '') +
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
            {/* Search Icon Stub */}
            <button
              type="button"
              aria-label="Search"
              className="mt-6 p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 self-start"
            >
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
