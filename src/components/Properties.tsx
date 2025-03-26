
import { useRef, useEffect } from 'react';
import PropertyCard from './PropertyCard';

const Properties = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Sample property data - updated to reflect real estate developments
  const properties = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Residencial Costa Azul",
      location: "Puerto Vallarta, Jalisco",
      price: "$3,500,000 MXN",
      bedrooms: 2,
      bathrooms: 2,
      area: 95,
      category: "Desarrollo residencial"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Altaria Towers",
      location: "Zapopan, Jalisco",
      price: "$4,200,000 MXN",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      category: "Desarrollo vertical"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Parque Central Lofts",
      location: "Ciudad de México, CDMX",
      price: "$2,800,000 MXN",
      bedrooms: 1,
      bathrooms: 1,
      area: 75,
      category: "Desarrollo mixto"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      title: "Mirador Residencial",
      location: "San Miguel de Allende, Guanajuato",
      price: "$5,100,000 MXN",
      bedrooms: 3,
      bathrooms: 3,
      area: 140,
      category: "Desarrollo premium"
    }
  ];

  return (
    <section id="properties" className="section bg-white relative">
      <div className="container px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal" ref={sectionRef}>
          <div className="inline-block px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
            Desarrollos
          </div>
          <h2 className="text-slate-800">
            Optimiza la comercialización de tus <span className="text-indigo-600">proyectos inmobiliarios</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Potencia las ventas de cualquier tipo de desarrollo, desde residenciales horizontales hasta 
            torres de usos mixtos, con herramientas diseñadas para maximizar cada oportunidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 reveal" ref={sectionRef}>
          {properties.map((property) => (
            <PropertyCard 
              key={property.id}
              id={property.id}
              image={property.image}
              title={property.title}
              location={property.location}
              price={property.price}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={property.area}
              category={property.category}
            />
          ))}
        </div>
      </div>
      
      {/* Decorative blurs */}
      <div className="absolute -top-20 right-0 w-72 h-72 bg-teal-100/30 rounded-full filter blur-3xl opacity-60 z-0"></div>
      <div className="absolute bottom-40 left-10 w-80 h-80 bg-indigo-100/30 rounded-full filter blur-3xl opacity-60 z-0"></div>
    </section>
  );
};

export default Properties;
