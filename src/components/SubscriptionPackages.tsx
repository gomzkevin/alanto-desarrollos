
import React from 'react';
import { Check, X, BarChart, Users, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  icon: React.ReactNode;
  popular?: boolean;
  buttonText: string;
  buttonLink: string;
  buttonVariant?: "default" | "outline" | "secondary" | "success";
}

const SubscriptionPackages = () => {
  const plans: PricingPlan[] = [
    {
      name: "Básico",
      price: "$199 USD/mes",
      description: "Ideal para pequeños desarrolladores inmobiliarios",
      icon: <BarChart className="h-8 w-8 text-indigo-600" />,
      features: [
        { name: "Hasta 3 desarrollos", included: true },
        { name: "Hasta 5 prototipos", included: true },
        { name: "Hasta 2 vendedores", included: true },
        { name: "Soporte por email", included: true },
        { name: "Personalización avanzada", included: false },
        { name: "API de integración", included: false },
      ],
      buttonText: "Comenzar",
      buttonLink: "/auth",
    },
    {
      name: "Intermedio",
      price: "$499 USD/mes",
      description: "Para desarrolladores en crecimiento",
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      popular: true,
      features: [
        { name: "Hasta 10 desarrollos", included: true },
        { name: "Hasta 20 prototipos", included: true },
        { name: "Hasta 5 vendedores", included: true },
        { name: "Soporte prioritario", included: true },
        { name: "Personalización básica", included: true },
        { name: "API de integración", included: false },
      ],
      buttonText: "Comenzar prueba",
      buttonLink: "/auth",
      buttonVariant: "default",
    },
    {
      name: "Completo",
      price: "$999 USD/mes",
      description: "Solución integral para desarrolladores establecidos",
      icon: <Building2 className="h-8 w-8 text-indigo-600" />,
      features: [
        { name: "Desarrollos ilimitados", included: true },
        { name: "Prototipos ilimitados", included: true },
        { name: "Hasta 15 vendedores", included: true },
        { name: "Soporte 24/7", included: true },
        { name: "Personalización completa", included: true },
        { name: "API de integración", included: true },
      ],
      buttonText: "Comenzar",
      buttonLink: "/auth",
    },
    {
      name: "Empresarial",
      price: "Personalizado",
      description: "Soluciones a medida para grandes desarrolladores",
      icon: <Briefcase className="h-8 w-8 text-indigo-600" />,
      features: [
        { name: "Infraestructura dedicada", included: true },
        { name: "Vendedores ilimitados", included: true },
        { name: "Integraciones a medida", included: true },
        { name: "Gerente de cuenta dedicado", included: true },
        { name: "Formación para equipos", included: true },
        { name: "SLA garantizado", included: true },
      ],
      buttonText: "Contáctanos",
      buttonLink: "https://api.whatsapp.com/send/?phone=+15557340499&text&type=phone_number&app_absent=0",
      buttonVariant: "success",
    },
  ];

  return (
    <section id="planes" className="py-20 bg-slate-50">
      <div className="container px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Planes adaptados a tu negocio
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Elige el plan que mejor se adapte a las necesidades de tu desarrollo inmobiliario
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                plan.popular ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Más popular
                  </span>
                </div>
              )}
              
              <div className="flex justify-center mb-6">
                {plan.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-center text-slate-900">{plan.name}</h3>
              
              <div className="mt-4 text-center">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
              </div>
              
              <p className="mt-2 text-sm text-slate-500 text-center h-12">{plan.description}</p>
              
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 shrink-0 mr-2" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                {plan.name === "Empresarial" ? (
                  <a href={plan.buttonLink} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button 
                      variant={plan.buttonVariant || "default"} 
                      className="w-full"
                    >
                      {plan.buttonText}
                    </Button>
                  </a>
                ) : (
                  <Link to={plan.buttonLink} className="w-full">
                    <Button 
                      variant={plan.buttonVariant || "default"} 
                      className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPackages;
