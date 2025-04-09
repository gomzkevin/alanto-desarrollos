
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import SubscriptionPackages from '@/components/SubscriptionPackages';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export function PlanesPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ChevronLeft size={16} />
              Volver
            </Button>
          </div>
          <SubscriptionPackages />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PlanesPage;
