'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { name: 'Research', href: '/research' },
  { name: 'People', href: '/people' },
  { name: 'Publications', href: '/publications' },
  { name: 'Join the Lab', href: '/opportunities' },
  { name: 'About', href: '/about' },
];
const UTILITY_LINKS = [
  { name: 'News', href: '/news' },
  { name: 'Contact', href: '/contact' },
  { name: 'Search', href: '/search' },
];
const linkClass =
  'rounded px-2 py-2 text-gray-700 dark:text-gray-100 hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:focus-visible:outline-blue-300';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  const homeLink = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const reset = () => {
      if (desktop.matches) {
        // Resizing/zooming must not leave focus on a now-hidden mobile control.
        if (
          document.activeElement === trigger.current ||
          mobileNav.current?.contains(document.activeElement)
        ) {
          homeLink.current?.focus();
        }
        setMobileOpen(false);
      }
    };
    desktop.addEventListener('change', reset);
    return () => desktop.removeEventListener('change', reset);
  }, []);

  function closeMenu() {
    setMobileOpen(false);
  }
  useEffect(() => {
    if (!mobileOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);
  function renderLinks(mobile = false) {
    return [...NAV_LINKS, ...UTILITY_LINKS].map(({ name, href }) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return (
        <Link
          key={href}
          href={href}
          onClick={mobile ? closeMenu : undefined}
          aria-current={active ? (pathname === href ? 'page' : 'true') : undefined}
          className={`${linkClass} ${active ? 'font-semibold underline decoration-2' : 'font-medium'} ${mobile ? 'block' : 'whitespace-nowrap text-sm'}`}
        >
          {name}
        </Link>
      );
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2">
          <Link
            ref={homeLink}
            href="/"
            className={`${linkClass} flex min-w-0 items-center gap-2`}
            aria-label="WAVES UC Santa Barbara — home"
          >
            <Image
              src="/images/site/WAVES_logo.png"
              alt=""
              width={36}
              height={36}
              className="shrink-0"
            />
            <span className="text-base font-bold leading-tight text-gray-900 dark:text-white sm:text-lg">
              WAVES <span className="block text-sm font-normal">UC Santa Barbara</span>
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden xl:flex items-center gap-1"
            data-testid="desktop-navigation"
          >
            {renderLinks()}
          </nav>
          <button
            ref={trigger}
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className={`${linkClass} xl:hidden shrink-0 border border-gray-500 dark:border-slate-400 px-3 min-h-11`}
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <nav
          ref={mobileNav}
          id="mobile-navigation"
          aria-label="Mobile navigation"
          hidden={!mobileOpen}
          className="xl:hidden max-h-[65vh] overflow-y-auto border-t border-gray-200 dark:border-slate-700 py-3"
        >
          {renderLinks(true)}
        </nav>
      </div>
    </header>
  );
}
