
import { ChevronRight, ClipboardList, TrendingUp, BarChart4, Calendar, Building, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Hero = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const isMobile = useIsMobile();
  
  const testimonials = [
    { name: "Carlos Rodríguez", company: "Grupo Desarrolla", quote: "Incrementamos 37% nuestras ventas en el primer trimestre" },
    { name: "Ana Martínez", company: "Constructora Horizonte", quote: "La gestión centralizada revolucionó nuestra operación" },
    { name: "Roberto González", company: "Inmobiliaria Cenit", quote: "El mejor ROI en cualquier herramienta que hemos usado" }
  ];
  
  // Hero Image component for mobile
  const HeroImage = () => (
    <div className="relative my-6 w-full max-w-md mx-auto">
      <div className="relative bg-white rounded-xl shadow-xl overflow-hidden transition-all">
        <div className="h-8 bg-slate-100 flex items-center px-4 border-b border-slate-200">
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-400"></div>
            <div className="h-3 w-3 rounded-full bg-amber-400"></div>
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src="/lovable-uploads/e28fa15b-8bda-489e-8e7e-51bf381aaf4a.png" 
            alt="Desarrollo inmobiliario de lujo" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/40 to-transparent"></div>
        </div>
        
        {/* Floating stats card - Positioned inside the image */}
        <div className="absolute top-16 right-4 bg-white p-3 rounded-lg shadow-lg transform rotate-6 z-40 animate-float scale-75">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Ventas de Departamentos</p>
              <p className="text-lg font-bold text-green-600">+24%</p>
            </div>
          </div>
        </div>
        
        {/* Calendar card - Positioned inside the image */}
        <div className="absolute bottom-16 left-4 bg-white p-3 rounded-lg shadow-lg z-40 animate-subtle-bounce scale-75">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Próximo</p>
              <p className="text-sm font-medium text-slate-800">Pago de cuota mensual</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <section className="relative pt-28 pb-20 md:pt-32 md:pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-indigo-50/70 to-white z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-teal-100/30 rounded-full filter blur-3xl opacity-60"></div>
      
      <div className="container relative z-10 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Two column layout for desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left column: Main content */}
            <div>
              {/* Industry label with scarcity */}
              <div className="inline-block animate-fade-in opacity-0">
                <div className="flex items-center px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full">
                  <span className="flex items-center justify-center w-4 h-4 mr-1.5 rounded-full bg-indigo-600 text-white text-[10px]">
                    <Building className="h-2.5 w-2.5" />
                  </span>
                  <span>Plataforma para desarrolladores inmobiliarios</span>
                </div>
              </div>
              
              {/* Social proof counter */}
              <div className="mt-4 inline-block bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-slate-100 text-sm text-slate-600 opacity-0 animate-fade-in stagger-1">
                <span className="font-semibold text-indigo-600">+120</span> desarrolladores confían en nosotros
              </div>
              
              {/* Show hero image on mobile between chips and heading */}
              {isMobile && <HeroImage />}
              
              {/* Main heading with benefit */}
              <h1 className="mt-5 text-4xl md:text-5xl font-bold leading-tight text-slate-800 opacity-0 animate-fade-in stagger-1">
                Incrementa tus ventas hasta un <span className="text-indigo-600 relative">
                  35% 
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-100 -z-10" viewBox="0 0 100 15" preserveAspectRatio="none">
                    <path d="M0,15 Q50,0 100,15" fill="currentColor" />
                  </svg>
                </span> con nuestra plataforma de gestión comercial
              </h1>
              
              {/* Key benefits checkmarks */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 opacity-0 animate-fade-in stagger-3">
                {[
                  "Inventario en tiempo real para todos tus brokers", 
                  "Cotizaciones automatizadas sin usar Excel", 
                  "Generación de contratos con un solo clic", 
                  "Control total del proceso de pagos"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in stagger-4">
                <Link to="/auth">
                  <Button className="py-6 px-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
                    <span className="font-medium">Prueba gratuita 14 días</span>
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="https://wa.me/15557340499" target="_blank" rel="noopener noreferrer" className="group">
                  <Button variant="outline" className="py-6 px-8 rounded-full border-slate-300 hover:border-indigo-600 transition-all hover:text-indigo-600 w-full sm:w-auto group-hover:bg-indigo-50/50">
                    <Phone className="mr-2 h-5 w-5" />
                    <span>Agenda una demo</span>
                  </Button>
                </a>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-8 opacity-0 animate-fade-in stagger-5">
                <p className="text-sm text-slate-500 mb-2">Sin tarjeta de crédito requerida · Cancela cuando quieras</p>
              </div>
            </div>
            
            {/* Right column: Visual elements - Only show on desktop */}
            <div className="hidden lg:block relative">
              {/* Modern apartment building in a "window" frame */}
              <div className="relative bg-white rounded-xl shadow-xl overflow-hidden transition-all hover:shadow-2xl transform hover:-translate-y-2 duration-500">
                <div className="h-8 bg-slate-100 flex items-center px-4 border-b border-slate-200">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src="/lovable-uploads/e28fa15b-8bda-489e-8e7e-51bf381aaf4a.png" 
                    alt="Desarrollo inmobiliario de lujo" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/40 to-transparent"></div>
                </div>
                
                {/* Floating stats card - Positioned inside the image */}
                <div className="absolute top-28 right-8 bg-white p-4 rounded-lg shadow-lg transform rotate-6 z-40 animate-float">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Ventas de Departamentos</p>
                      <p className="text-lg font-bold text-green-600">+24%</p>
                    </div>
                  </div>
                </div>
                
                {/* Calendar card - Positioned inside the image */}
                <div className="absolute bottom-28 left-8 bg-white p-4 rounded-lg shadow-lg z-40 animate-subtle-bounce">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Próximo</p>
                      <p className="text-sm font-medium text-slate-800">Pago de cuota mensual</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Testimonial floating element - Positioned to overlap the image edge */}
              <div className="absolute -bottom-4 right-10 bg-white p-4 rounded-lg shadow-lg max-w-xs z-40 animate-fade-in stagger-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">CR</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-slate-600 italic">"{testimonials[0].quote}"</p>
                    <p className="text-xs font-medium text-slate-800 mt-1">{testimonials[0].name}</p>
                    <p className="text-xs text-slate-500">{testimonials[0].company}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Industry recognition - UPDATED with logos instead of text */}
          <div className="mt-16 md:mt-20 border-t border-slate-200 pt-8 opacity-0 animate-fade-in stagger-5">
            <p className="text-sm text-slate-500 text-center mb-6">Especialistas en el sector inmobiliario</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center">
              {/* Replaced text with logos */}
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center">
                {/* CMIC Logo */}
                <div className="h-10 md:h-12">
                  <img 
                    src="/lovable-uploads/166cf195-ba28-4803-a473-65ab461b18f8.png" 
                    alt="CMIC Logo" 
                    className="h-full object-contain"
                  />
                </div>
                
                {/* CANADEVI Logo */}
                <div className="h-8 md:h-10">
                  <img 
                    src="/lovable-uploads/8fe483e9-c61f-4943-86fa-dab3ada19699.png" 
                    alt="CANADEVI Logo" 
                    className="h-full object-contain"
                  />
                </div>
                
                {/* AMPI Logo */}
                <div className="h-12 md:h-14">
                  <img 
                    src="/lovable-uploads/0dbca38f-020c-4766-a6e2-e67b654fa775.png" 
                    alt="AMPI Logo" 
                    className="h-full object-contain"
                  />
                </div>
                
                {/* ADI Logo */}
                <div className="h-10 md:h-12">
                  <img 
                    src="/lovable-uploads/d73a70e5-4a0c-4031-b72d-6f434321e742.png" 
                    alt="Asociación de Desarrolladores Inmobiliarios Logo" 
                    className="h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Features highlights - 3 columns */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 animate-fade-in stagger-6">
            <div className="flex items-start p-5 rounded-xl border border-slate-200 bg-white shadow-soft transition-all hover:shadow-medium hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Gestión centralizada</h3>
                <p className="mt-1 text-sm text-slate-500">Unifica inventario, ventas y seguimiento comercial</p>
              </div>
            </div>
            
            <div className="flex items-start p-5 rounded-xl border border-slate-200 bg-white shadow-soft transition-all hover:shadow-medium hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-teal-50 text-teal-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Incrementa conversiones</h3>
                <p className="mt-1 text-sm text-slate-500">Aumenta tus cierres de venta con herramientas especializadas</p>
              </div>
            </div>
            
            <div className="flex items-start p-5 rounded-xl border border-slate-200 bg-white shadow-soft transition-all hover:shadow-medium hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-amber-50 text-amber-600">
                <BarChart4 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Reportes avanzados</h3>
                <p className="mt-1 text-sm text-slate-500">Toma decisiones basadas en datos en tiempo real</p>
              </div>
            </div>
          </div>
          
          {/* Final CTA */}
          <div className="mt-16 text-center">
            <Link to="/auth" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700">
              <span>Ver todas las características</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
