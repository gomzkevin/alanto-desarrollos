
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Properties from '@/components/Properties';
import Footer from '@/components/Footer';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add scroll reveal functionality
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    };
    
    const observer = new IntersectionObserver(revealCallback, {
      threshold: 0.1,
    });
    
    revealElements.forEach(el => observer.observe(el));
    
    // Logic for hiding loader - moved inside useEffect to prevent infinite renders
    const hideLoader = () => {
      setIsLoading(false);
    };
    
    // Use the window load event or check if already loaded
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
    }
    
    // Cleanup function to remove event listener when component unmounts
    return () => {
      window.removeEventListener('load', hideLoader);
      observer.disconnect();
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div className="min-h-screen bg-white">
      {/* Page loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Header />
      <main>
        <Hero />
        <Features />
        <Properties />
      </main>
      <Footer />
      
      {/* Back to top button */}
      <a 
        href="#" 
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors z-20"
        aria-label="Volver arriba"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </a>
    </div>
  );
};

export default Index;
