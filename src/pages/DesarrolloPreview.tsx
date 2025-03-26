
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Users, 
  Calendar, 
  Check, 
  Award, 
  Palmtree, 
  ShoppingBag, 
  Car, 
  Utensils, 
  Dumbbell 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PrototipoCard from '@/components/landing/PrototipoCard';

// Datos simulados de desarrollos
const desarrollosData = [
  {
    id: 1,
    title: "Residencial Costa Azul",
    location: "Puerto Vallarta, Jalisco",
    price: "Desde $3,500,000 MXN",
    description: "Un exclusivo desarrollo residencial con vistas panorámicas al océano Pacífico, diseñado para ofrecer el máximo confort y estilo de vida.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    developer: "Grupo Inmobiliario Del Pacífico",
    completionDate: "Diciembre 2024",
    totalUnits: 45,
    amenities: ["Piscina infinita", "Spa", "Gimnasio", "Restaurante", "Acceso a playa", "Seguridad 24/7", "Club de playa", "Estacionamiento"],
    prototipos: [
      {
        id: 101,
        title: "Suite Vista Mar",
        price: "$3,500,000 MXN",
        bedrooms: 1,
        bathrooms: 1,
        area: 75,
        description: "Suite de lujo con vista al mar, perfecta para inversión en renta vacacional.",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Disponible"
      },
      {
        id: 102,
        title: "Departamento Familiar",
        price: "$4,800,000 MXN",
        bedrooms: 2,
        bathrooms: 2,
        area: 95,
        description: "Amplio departamento con terraza privada y hermosas vistas al océano.",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Disponible"
      },
      {
        id: 103,
        title: "Penthouse Premium",
        price: "$7,200,000 MXN",
        bedrooms: 3,
        bathrooms: 3,
        area: 145,
        description: "Espectacular penthouse con jacuzzi privado y vistas panorámicas al océano.",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Pocas unidades"
      }
    ]
  },
  {
    id: 2,
    title: "Altaria Towers",
    location: "Zapopan, Jalisco",
    price: "Desde $4,200,000 MXN",
    description: "Un impresionante desarrollo vertical en el corazón de la zona financiera, con espacios diseñados para un estilo de vida urbano y sofisticado.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    developer: "Desarrollos Metropolitanos",
    completionDate: "Junio 2025",
    totalUnits: 120,
    amenities: ["Sky lounge", "Piscina", "Gimnasio", "Área de coworking", "Salón de eventos", "Jardín zen", "Pet park", "Concierge"],
    prototipos: [
      {
        id: 201,
        title: "Loft Ejecutivo",
        price: "$4,200,000 MXN",
        bedrooms: 1,
        bathrooms: 1,
        area: 85,
        description: "Moderno loft con excelente ubicación, ideal para ejecutivos y profesionistas.",
        image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Disponible"
      },
      {
        id: 202,
        title: "Departamento Estándar",
        price: "$5,700,000 MXN",
        bedrooms: 2,
        bathrooms: 2,
        area: 105,
        description: "Elegante departamento con acabados de lujo y amplia sala-comedor.",
        image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Disponible"
      },
      {
        id: 203,
        title: "Departamento Premium",
        price: "$6,900,000 MXN",
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        description: "Amplio departamento con balcón privado y vistas espectaculares de la ciudad.",
        image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Disponible"
      }
    ]
  },
  {
    id: 3,
    title: "Parque Central Lofts",
    location: "Ciudad de México, CDMX",
    price: "Desde $2,800,000 MXN",
    description: "Desarrollo de usos mixtos ubicado junto a uno de los parques más emblemáticos de la ciudad, combinando perfectamente naturaleza y vida urbana.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    developer: "Grupo Constructor Reforma",
    completionDate: "Marzo 2025",
    totalUnits: 80,
    amenities: ["Terraza verde", "Área de yoga", "Huerto urbano", "Ciclovía", "Cafetería", "Librería", "Centro comercial", "Estacionamiento"],
    prototipos: [
      {
        id: 301,
        title: "Micro Loft",
        price: "$2,800,000 MXN",
        bedrooms: 1,
        bathrooms: 1,
        area: 55,
        description: "Eficiente espacio diseñado con concepto abierto y aprovechamiento máximo.",
        image: "https://images.unsplash.com/photo-1529408686214-b48b8532f72c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Pocas unidades"
      },
      {
        id: 302,
        title: "Loft Estándar",
        price: "$3,500,000 MXN",
        bedrooms: 1,
        bathrooms: 1,
        area: 75,
        description: "Amplio loft con vista al parque y excelente iluminación natural.",
        image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Disponible"
      }
    ]
  },
  {
    id: 4,
    title: "Mirador Residencial",
    location: "San Miguel de Allende, Guanajuato",
    price: "Desde $5,100,000 MXN",
    description: "Exclusivo conjunto residencial que combina el encanto colonial con todas las comodidades contemporáneas en una de las ciudades más bellas de México.",
    image: "https://images.unsplash.com/photo-1602941525421-8f8b81d3edbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    developer: "Colonial Developers",
    completionDate: "Octubre 2024",
    totalUnits: 35,
    amenities: ["Jardines", "Piscina", "Casa club", "Acceso controlado", "Terraza panorámica", "Bodega de vinos", "Spa", "Concierge"],
    prototipos: [
      {
        id: 401,
        title: "Casa Jardín",
        price: "$5,100,000 MXN",
        bedrooms: 2,
        bathrooms: 2,
        area: 120,
        description: "Hermosa casa con jardín privado y terraza, perfecta para disfrutar del clima de San Miguel.",
        image: "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Disponible"
      },
      {
        id: 402,
        title: "Villa Colonial",
        price: "$7,800,000 MXN",
        bedrooms: 3,
        bathrooms: 3,
        area: 180,
        description: "Amplia villa con arquitectura colonial contemporánea y acabados de lujo.",
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Disponible"
      },
      {
        id: 403,
        title: "Residencia Premium",
        price: "$9,500,000 MXN",
        bedrooms: 4,
        bathrooms: 4,
        area: 240,
        description: "Exclusiva residencia con amplios espacios, chimenea y vistas panorámicas de la ciudad.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        status: "Pocas unidades"
      }
    ]
  }
];

const DesarrolloPreview = () => {
  const { id } = useParams<{ id: string }>();
  const [desarrollo, setDesarrollo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simular carga de datos
    setIsLoading(true);
    
    // Encontrar el desarrollo por ID
    const desarrolloFound = desarrollosData.find(d => d.id === parseInt(id || '0'));
    
    if (desarrolloFound) {
      setTimeout(() => {
        setDesarrollo(desarrolloFound);
        setIsLoading(false);
      }, 800); // Simular tiempo de carga
    } else {
      // Redirigir a la página principal si no se encuentra
      window.location.href = '/';
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!desarrollo) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Desarrollo no encontrado</h1>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero section */}
        <div className="relative h-[60vh] w-full">
          <div className="absolute inset-0">
            <img 
              src={desarrollo.image} 
              alt={desarrollo.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-40"></div>
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-8">
            <div className="container mx-auto">
              <Link to="/#properties">
                <Button variant="outline" className="mb-6 bg-white/90 hover:bg-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a desarrollos
                </Button>
              </Link>
              
              <Badge className="px-3 py-1 text-sm font-medium bg-indigo-600 text-white mb-4">
                {desarrollosData.find(d => d.id === parseInt(id || '0'))?.prototipos.length} Prototipos disponibles
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{desarrollo.title}</h1>
              
              <div className="flex items-center text-white mb-6">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="text-lg">{desarrollo.location}</span>
              </div>
              
              <p className="text-xl text-white max-w-3xl">{desarrollo.description}</p>
            </div>
          </div>
        </div>
        
        {/* Info section */}
        <div className="container mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex items-start p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Desarrollador</h3>
                <p className="mt-1 text-slate-600">{desarrollo.developer}</p>
              </div>
            </div>
            
            <div className="flex items-start p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Fecha de entrega</h3>
                <p className="mt-1 text-slate-600">{desarrollo.completionDate}</p>
              </div>
            </div>
            
            <div className="flex items-start p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Unidades totales</h3>
                <p className="mt-1 text-slate-600">{desarrollo.totalUnits} unidades</p>
              </div>
            </div>
          </div>
          
          {/* Amenities section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Amenidades</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {desarrollo.amenities.map((amenity: string, index: number) => {
                // Iconos para diferentes amenidades
                const getIcon = (amenity: string) => {
                  if (amenity.includes('Piscina')) return <Palmtree className="h-5 w-5" />;
                  if (amenity.includes('Gimnasio')) return <Dumbbell className="h-5 w-5" />;
                  if (amenity.includes('Restaurante') || amenity.includes('Cafetería')) return <Utensils className="h-5 w-5" />;
                  if (amenity.includes('Estacionamiento')) return <Car className="h-5 w-5" />;
                  if (amenity.includes('Centro comercial')) return <ShoppingBag className="h-5 w-5" />;
                  if (amenity.includes('Seguridad')) return <Award className="h-5 w-5" />;
                  // Icono predeterminado
                  return <Check className="h-5 w-5" />;
                };
                
                return (
                  <div key={index} className="flex items-center p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 mr-3">
                      {getIcon(amenity)}
                    </div>
                    <span className="text-slate-700">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Prototipos section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Prototipos disponibles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {desarrollo.prototipos.map((prototipo: any) => (
                <PrototipoCard 
                  key={prototipo.id}
                  id={prototipo.id}
                  image={prototipo.image}
                  title={prototipo.title}
                  price={prototipo.price}
                  bedrooms={prototipo.bedrooms}
                  bathrooms={prototipo.bathrooms}
                  area={prototipo.area}
                  description={prototipo.description}
                  status={prototipo.status}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DesarrolloPreview;
