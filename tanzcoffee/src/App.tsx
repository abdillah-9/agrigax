import { useState } from 'react';
import Header from './layouts/Header';
import MainContent from './layouts/MainContent';
import Footer from './layouts/Footer';
import { NavContext, PAGES, type PageName } from './context/NavContext';

const appStyle = { width: '100vw', height: '100vh' };

// Allows opening a page directly via URL hash, e.g. /#Our%20Products
const pageFromHash = (): PageName => {
  const hash = decodeURIComponent(window.location.hash.slice(1)) as PageName;
  return PAGES.includes(hash) ? hash : 'Home';
};

function App() {
  const [activeLink, setActiveLink] = useState<PageName>(pageFromHash);

  return (
    <NavContext.Provider value={{ activeLink, setActiveLink }}>
      <div style={appStyle}>
        <div style={{ zIndex: 5, position: 'fixed', gap: '0px' }}>
          <Header />
        </div>
        <MainContent />
        <Footer />
      </div>
    </NavContext.Provider>
  );
}

export default App;
