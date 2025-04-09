
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { isAuthenticated } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const auth = await isAuthenticated();
        setIsLoggedIn(auth);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#hero" className="flex items-center cursor-pointer">
              {/* Logo con tamaño más grande que el original */}
              <div className="w-auto h-auto">
                <img 
                  src="/lovable-uploads/b85c95f1-cfe4-4a8f-9176-4b3b3539146b.png" 
                  alt="Alanto Logo" 
                  className="h-28 md:h-32 w-auto object-contain"
                />
              </div>
            </a>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#hero" className="text-slate-700 hover:text-indigo-600 transition-colors">Inicio</a>
            <a href="#features" className="text-slate-700 hover:text-indigo-600 transition-colors">Características</a>
            <a href="#properties" className="text-slate-700 hover:text-indigo-600 transition-colors">Propiedades</a>
            <a href="#planes" className="text-slate-700 hover:text-indigo-600 transition-colors">Precios</a>
            {isCheckingAuth ? (
              <Button disabled className="opacity-75">Cargando...</Button>
            ) : isLoggedIn ? (
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button>Acceder</Button>
              </Link>
            )}
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
              href="#planes" 
              className="block px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Precios
            </a>
            {isCheckingAuth ? (
              <Button disabled className="w-full opacity-75">Cargando...</Button>
            ) : isLoggedIn ? (
              <Link to="/dashboard" className="block px-3 py-2">
                <Button 
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth" className="block px-3 py-2">
                <Button 
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Acceder
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;