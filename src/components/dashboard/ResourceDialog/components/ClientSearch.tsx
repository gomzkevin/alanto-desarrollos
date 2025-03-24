
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import useLeads from '@/hooks/useLeads';

interface ClientSearchProps {
  onSelectClient: (client: any) => void;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Use the search option and a limit of 10 results
  const { leads, isLoading } = useLeads({ 
    search: searchTerm,
    limit: 10
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectClient = (client: any) => {
    onSelectClient(client);
  };

  return (
    <div>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar cliente por nombre, email o teléfono..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      {isLoading ? (
        <p>Cargando clientes...</p>
      ) : (
        <ul>
          {leads.map((lead) => (
            <li key={lead.id} className="py-2 border-b">
              <button
                className="w-full text-left hover:bg-gray-100 p-2 rounded"
                onClick={() => handleSelectClient(lead)}
              >
                {lead.nombre} ({lead.email})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientSearch;
