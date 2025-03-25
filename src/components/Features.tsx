
import { useEffect, useRef } from 'react';
import { BarChart3, FileText, Users, Building2, PieChart, Sliders, ClipboardList, TrendingUp, LayoutDashboard, Calendar, Building, Clock, Presentation } from 'lucide-react';

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
      description: "Control integral de desarrollos, prototipos y unidades disponibles con actualizaciones en tiempo real."
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "Pipeline de ventas",
      description: "Seguimiento del ciclo completo de ventas desde prospectos hasta escrituración."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Análisis de rendimiento",
      description: "Indicadores clave de desempeño para optimizar estrategias comerciales y maximizar resultados."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestión de equipos",
      description: "Administra vendedores, asigna metas y monitorea resultados individuales de forma efectiva."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Documentación profesional",
      description: "Genera cotizaciones, contratos y reportes con tu imagen corporativa integrada."
    },
    {
      icon: <LayoutDashboard className="h-6 w-6" />,
      title: "Dashboard ejecutivo",
      description: "Visualiza métricas clave, proyecciones y estado general de la comercialización."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Planificación comercial",
      description: "Establece metas de ventas, programación de pagos y fechas clave del proceso."
    },
    {
      icon: <Presentation className="h-6 w-6" />,
      title: "Herramientas de presentación",
      description: "Material visual optimizado para presentar proyectos y cerrar ventas efectivamente."
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
            Todo lo que necesitas para <span className="text-indigo-600">impulsar tu comercialización</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Una plataforma integral diseñada específicamente para equipos comerciales de desarrollos inmobiliarios,
            enfocada en optimizar procesos, aumentar conversiones y maximizar resultados.
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
