
import React, { useState } from 'react';
import { Check, BarChart, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateCheckout } from '@/hooks/useCreateCheckout';
import { toast } from '@/components/ui/use-toast';

interface PlanProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId: string;
  productId: string;
  popular?: boolean;
  onSelect: () => void;
  isSelected: boolean;
}

const PlanCard: React.FC<PlanProps> = ({
  name,
  price,
  description,
  features,
  priceId,
  productId,
  popular,
  onSelect,
  isSelected
}) => {
  return (
    <div
      className={`relative border rounded-xl p-6 ${
        isSelected
          ? 'border-2 border-indigo-600 bg-indigo-50'
          : popular
          ? 'border-indigo-300 bg-white'
          : 'border-gray-200 bg-white'
      } cursor-pointer hover:shadow-md transition-all`}
      onClick={onSelect}
    >
      {popular && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            Recomendado
          </span>
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 text-center">{name}</h3>
      <div className="mt-4 text-center">
        <span className="text-3xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-500 ml-1">/mes</span>
      </div>

      <p className="mt-3 text-sm text-gray-500 text-center min-h-[40px]">{description}</p>

      <ul className="mt-6 space-y-4">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          variant={isSelected ? 'default' : 'outline'}
          className={`w-full ${isSelected ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
          onClick={onSelect}
        >
          {isSelected ? 'Plan seleccionado' : 'Seleccionar plan'}
        </Button>
      </div>
    </div>
  );
};

export function SubscriptionSelection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { createCheckoutSession, isLoading } = useCreateCheckout();
  
  const plans = [
    {
      name: "Básico",
      price: "$89",
      description: "Ideal para pequeños desarrolladores inmobiliarios",
      features: [
        "Hasta 1 desarrollo",
        "Hasta 2 prototipos",
        "Hasta 2 vendedores",
        "Soporte por email"
      ],
      priceId: "price_1R4sdgAmHdZStjAGho30y55V",
      productId: "prod_S6JeOdnRQLuPxV",
      icon: <BarChart className="h-8 w-8 text-indigo-600" />
    },
    {
      name: "Intermedio",
      price: "$190",
      description: "Para desarrolladores en crecimiento",
      features: [
        "Hasta 2 desarrollos",
        "Hasta 5 prototipos",
        "Hasta 5 vendedores",
        "Soporte prioritario"
      ],
      priceId: "price_1R4sfRAmHdZStjAGBiqhMf0q",
      productId: "prod_S6Jf7bfigy1c1v",
      popular: true,
      icon: <Users className="h-8 w-8 text-indigo-600" />
    },
    {
      name: "Empresarial",
      price: "$490",
      description: "Solución integral para desarrolladores establecidos",
      features: [
        "Hasta 4 desarrollos",
        "Hasta 20 prototipos",
        "Hasta 10 vendedores",
        "Soporte 24/7"
      ],
      priceId: "price_1R4sgRAmHdZStjAGiOLRYlXp",
      productId: "prod_S6JfAXjNpoiwTl",
      icon: <Building2 className="h-8 w-8 text-indigo-600" />
    }
  ];

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast({
        title: "Selecciona un plan",
        description: "Por favor, selecciona un plan antes de continuar",
        variant: "destructive"
      });
      return;
    }

    const plan = plans.find(p => p.priceId === selectedPlan);
    if (!plan) return;

    try {
      await createCheckoutSession({
        priceId: plan.priceId,
        planId: plan.productId,
        successPath: "/dashboard/configuracion"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la suscripción. Intenta más tarde.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Selecciona tu plan
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Elige el plan que mejor se adapte a las necesidades de tu negocio inmobiliario.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.priceId}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            priceId={plan.priceId}
            productId={plan.productId}
            popular={plan.popular}
            onSelect={() => setSelectedPlan(plan.priceId)}
            isSelected={selectedPlan === plan.priceId}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button 
          onClick={handleSubscribe} 
          disabled={!selectedPlan || isLoading} 
          className="px-8 py-2"
        >
          {isLoading ? "Procesando..." : "Continuar con la suscripción"}
        </Button>
      </div>
    </div>
  );
}

export default SubscriptionSelection;
