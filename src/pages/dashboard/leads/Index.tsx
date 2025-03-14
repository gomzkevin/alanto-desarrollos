
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AdminResourceDialog } from '@/components/dashboard/AdminResourceDialog';

const LeadsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Leads</h1>
            <p className="text-slate-600">Gestiona y da seguimiento a tus leads de ventas</p>
          </div>
          <AdminResourceDialog 
            resourceType="lead" 
            buttonText="Nuevo lead" 
          />
        </div>
        
        <div className="text-center py-12">
          <p className="text-slate-500">Esta sección está en construcción.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
