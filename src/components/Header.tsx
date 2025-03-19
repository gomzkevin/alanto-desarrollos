
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">AirbnbInvest</span>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#hero" className="text-slate-700 hover:text-indigo-600 transition-colors">Inicio</a>
            <a href="#features" className="text-slate-700 hover:text-indigo-600 transition-colors">Características</a>
            <a href="#properties" className="text-slate-700 hover:text-indigo-600 transition-colors">Propiedades</a>
            <a href="#calculator" className="text-slate-700 hover:text-indigo-600 transition-colors">Calculadora</a>
            <div className="flex space-x-2">
              <Link to="/login">
                <Button variant="outline">Iniciar sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <a 
              href="#hero" 
              className="block px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inicio
            </a>
            <a 
              href="#features" 
              className="block px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Características
            </a>
            <a 
              href="#properties" 
              className="block px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Propiedades
            </a>
            <a 
              href="#calculator" 
              className="block px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Calculadora
            </a>
            <div className="flex flex-col space-y-2 px-3 py-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Iniciar sesión</Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
