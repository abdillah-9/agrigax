import { useNav } from '../context/NavContext';
import HomePage from '../features/home/pages/HomePage';
import AboutPage from '../features/about/pages/AboutPage';
import ServicesPage from '../features/services/pages/ServicesPage';
import ProductsPage from '../features/products/pages/ProductsPage';
import ContactPage from '../features/contact/pages/ContactPage';

function MainContent() {
  const { activeLink } = useNav();

  return (
    <div style={{ backgroundColor: 'white' }}>
      {activeLink === 'Home' ? (
        <HomePage />
      ) : activeLink === 'About Us' ? (
        <AboutPage />
      ) : activeLink === 'Business Services' ? (
        <ServicesPage />
      ) : activeLink === 'Our Products' ? (
        <ProductsPage />
      ) : (
        activeLink === 'Contacts Information' && <ContactPage />
      )}
    </div>
  );
}

export default MainContent;
