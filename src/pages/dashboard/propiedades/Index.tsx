import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminResourceDialog from '@/components/dashboard/AdminResourceDialog';

// Datos de ejemplo para propiedades
const properties = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    title: 'Torre Mirador - Unidad A1',
    location: 'Puerto Vallarta, Jalisco',
    price: '$2,850,000 MXN',
    bedrooms: 2,
    bathrooms: 2,
    area: 85,
    category: 'Premium'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    title: 'Loft Urbano - Unidad B3',
    location: 'Playa del Carmen, Q. Roo',
    price: '$3,200,000 MXN',
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    category: 'Loft'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
    title: 'Residencias Costa - Unidad C2',
    location: 'Los Cabos, BCS',
    price: '$4,500,000 MXN',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    category: 'Lujo'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
    title: 'Pent Garden - Unidad PH1',
    location: 'Tulum, Q. Roo',
    price: '$5,900,000 MXN',
    bedrooms: 3,
    bathrooms: 3,
    area: 150,
    category: 'Penthouse'
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d',
    title: 'Mirador Maya - Unidad M2',
    location: 'Mérida, Yucatán',
    price: '$2,400,000 MXN',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    category: 'Estándar'
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1600607687644-a24c75f8b507',
    title: 'Bosque Eleva - Unidad E4',
    location: 'Valle de Bravo, EdoMex',
    price: '$3,800,000 MXN',
    bedrooms: 2,
    bathrooms: 2,
    area: 110,
    category: 'Premium'
  },
];

const PropertiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Aquí conectaríamos con Supabase para cargar las propiedades reales
    // const fetchProperties = async () => {
    //   const { data, error } = await supabase
    //     .from('propiedades')
    //     .select('*');
    //   
    //   if (data) setFilteredProperties(data);
    // };
    
    // fetchProperties();
    
    // Simular carga
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filtrar propiedades basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProperties(properties);
    } else {
      const filtered = properties.filter(
        property => 
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  }, [searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Propiedades</h1>
            <p className="text-slate-600">Gestiona y visualiza el inventario de propiedades disponibles.</p>
          </div>
          <Button>Nueva propiedad</Button>
        </div>
        
        {/* Filtros y buscador */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Buscar propiedades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Select>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="loft">Loft</SelectItem>
                <SelectItem value="estandar">Estándar</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="lujo">Lujo</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select>
              <SelectTrigger>
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ordenar por" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recientes">Más recientes</SelectItem>
                <SelectItem value="precio-asc">Precio: menor a mayor</SelectItem>
                <SelectItem value="precio-desc">Precio: mayor a menor</SelectItem>
                <SelectItem value="area">Área</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Lista de propiedades */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
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
        )}
        
        {filteredProperties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-slate-500">No se encontraron propiedades que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PropertiesPage;
