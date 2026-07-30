import { createContext, useContext } from 'react';

export const PAGES = [
  'Home',
  'About Us',
  'Business Services',
  'Our Products',
  'Contacts Information',
] as const;

export type PageName = (typeof PAGES)[number];

interface NavContextValue {
  activeLink: PageName;
  setActiveLink: (page: PageName) => void;
}

export const NavContext = createContext<NavContextValue>({
  activeLink: 'Home',
  setActiveLink: () => {},
});

export const useNav = () => useContext(NavContext);
