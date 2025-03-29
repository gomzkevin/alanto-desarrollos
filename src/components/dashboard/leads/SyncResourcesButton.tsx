
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SyncResourcesButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Sincronización completada",
        description: "Los datos han sido actualizados correctamente.",
      });
    }, 1500);
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSync}
      disabled={isSyncing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
    </Button>
  );
};

export default SyncResourcesButton;
