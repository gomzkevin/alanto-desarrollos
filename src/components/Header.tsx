
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-3 bg-white/90 backdrop-blur-md shadow-sm' : 'py-5 bg-transparent'
    }`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500">
              AirProp
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <a href="#features" className="nav-link">Características</a>
            <a href="#properties" className="nav-link">Propiedades</a>
            <a href="#calculator" className="nav-link">Calculadora</a>
            <a href="#contact" className="nav-link">Contacto</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" className="rounded-full px-5 transition-all hover:text-indigo-600 hover:border-indigo-600">
              Iniciar sesión
            </Button>
            <Button className="rounded-full px-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white button-glow">
              Registrarse
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? 
              <X className="w-6 h-6 text-slate-800" /> : 
              <Menu className="w-6 h-6 text-slate-800" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col p-6 h-full">
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500">
              AirProp
            </span>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6 text-slate-800" />
            </button>
          </div>

          <nav className="flex flex-col space-y-4 mb-8">
            <a href="#features" className="text-lg font-medium text-slate-800 hover:text-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>Características</a>
            <a href="#properties" className="text-lg font-medium text-slate-800 hover:text-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>Propiedades</a>
            <a href="#calculator" className="text-lg font-medium text-slate-800 hover:text-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>Calculadora</a>
            <a href="#contact" className="text-lg font-medium text-slate-800 hover:text-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>Contacto</a>
          </nav>

          <div className="mt-auto space-y-3">
            <Button variant="outline" className="w-full justify-center rounded-full">
              Iniciar sesión
            </Button>
            <Button className="w-full justify-center rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500">
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
