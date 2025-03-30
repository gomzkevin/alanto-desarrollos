
import { ChevronRight, ClipboardList, TrendingUp, BarChart4 } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-indigo-50/70 to-white z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full filter blur-3xl opacity-50"></div>
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-teal-100/30 rounded-full filter blur-3xl opacity-60"></div>
      
      <div className="container relative z-10 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Pill label */}
          <div className="inline-block animate-fade-in opacity-0">
            <div className="flex items-center px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full">
              <span className="flex items-center justify-center w-4 h-4 mr-1.5 rounded-full bg-indigo-600 text-white text-[10px]">
                ✦
              </span>
              Plataforma para desarrolladores inmobiliarios
            </div>
          </div>
          
          {/* Main heading */}
          <h1 className="mt-5 text-slate-800 opacity-0 animate-fade-in stagger-1">
            Despega tus ventas con lo más moderno en <span className="text-indigo-600">gestión comercial</span>
          </h1>
          
          {/* Subheading */}
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl opacity-0 animate-fade-in stagger-2">
            Plataforma integral que optimiza la gestión comercial de desarrollos inmobiliarios, 
            aumentando conversiones y simplificando el seguimiento de ventas para maximizar el ROI.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in stagger-3">
            <Button className="py-6 px-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white button-glow">
              <span>Solicitar demostración</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="py-6 px-8 rounded-full border-slate-300 hover:border-indigo-600 transition-all hover:text-indigo-600">
              Ver cómo funciona
            </Button>
          </div>
          
          {/* Stats/features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-0 animate-fade-in stagger-4">
            <div className="flex items-start p-5 rounded-xl border border-slate-200 bg-white/50 shadow-soft transition-all hover:shadow-medium hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Gestión centralizada</h3>
                <p className="mt-1 text-sm text-slate-500">Unifica inventario, ventas y seguimiento comercial</p>
              </div>
            </div>
            
            <div className="flex items-start p-5 rounded-xl border border-slate-200 bg-white/50 shadow-soft transition-all hover:shadow-medium hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-teal-50 text-teal-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Incrementa conversiones</h3>
                <p className="mt-1 text-sm text-slate-500">Aumenta tus cierres de venta con herramientas especializadas</p>
              </div>
            </div>
            
            <div className="flex items-start p-5 rounded-xl border border-slate-200 bg-white/50 shadow-soft transition-all hover:shadow-medium hover:-translate-y-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-amber-50 text-amber-600">
                <BarChart4 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">Reportes avanzados</h3>
                <p className="mt-1 text-sm text-slate-500">Toma decisiones basadas en datos en tiempo real</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
