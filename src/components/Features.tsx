
import { useEffect, useRef } from 'react';
import { BarChart3, FileText, Users, Building2, PieChart, Sliders, ClipboardEdit, TrendingUp } from 'lucide-react';

const Features = () => {
  const revealRefs = useRef<HTMLDivElement[]>([]);
  
  const addToRefs = (el: HTMLDivElement) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };
  
  useEffect(() => {
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
    
    revealRefs.current.forEach(ref => observer.observe(ref));
    
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Gestión de inventario",
      description: "Administra desarrollos, prototipos y unidades disponibles desde una interfaz intuitiva."
    },
    {
      icon: <ClipboardEdit className="h-6 w-6" />,
      title: "Cotizaciones personalizables",
      description: "Crea planes de pago flexibles con anticipos, mensualidades y finiquitos configurables."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Proyecciones financieras",
      description: "Genera análisis de rentabilidad a 10 años con comparativas de inversión."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "CRM integrado",
      description: "Seguimiento de leads desde el primer contacto hasta el cierre de la venta."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Generación de PDFs",
      description: "Exporta cotizaciones y proyecciones financieras con diseño profesional."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Dashboard analítico",
      description: "Visualiza métricas de ventas, conversiones y proyecciones en tiempo real."
    },
    {
      icon: <Sliders className="h-6 w-6" />,
      title: "Parámetros configurables",
      description: "Personaliza tasas, comisiones y otros valores para proyecciones precisas."
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: "Comparativas de inversión",
      description: "Demuestra el valor de la inversión inmobiliaria frente a otras alternativas."
    }
  ];

  return (
    <section id="features" className="section bg-gradient-to-b from-white to-slate-50 relative">
      <div className="container px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal" ref={addToRefs}>
          <div className="inline-block px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
            Características
          </div>
          <h2 className="text-slate-800">
            Todo lo que necesitas para <span className="text-indigo-600">impulsar tus ventas</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Una plataforma integral diseñada específicamente para equipos de venta de desarrollos inmobiliarios 
            enfocados en inversionistas de propiedades vacacionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 bg-white rounded-xl border border-slate-100 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1 reveal"
              ref={addToRefs}
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative blurs */}
      <div className="absolute top-40 right-0 w-64 h-64 bg-teal-100/30 rounded-full filter blur-3xl opacity-60 z-0"></div>
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-indigo-100/30 rounded-full filter blur-3xl opacity-60 z-0"></div>
    </section>
  );
};

export default Features;
