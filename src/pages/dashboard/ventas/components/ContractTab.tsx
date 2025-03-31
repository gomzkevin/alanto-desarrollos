
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExportPDFButton } from "@/components/dashboard/ExportPDFButton";
import { Printer, FileText } from "lucide-react";
import { Comprador, VentaWithDetail } from "@/hooks/useVentaDetail";
import { Pago } from "@/hooks/usePagos";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ContractTabProps {
  venta: VentaWithDetail;
  compradores: Comprador[];
  pagos: Pago[];
}

export const ContractTab = ({ venta, compradores, pagos }: ContractTabProps) => {
  const [contractType, setContractType] = useState<'preventa' | 'venta'>('preventa');
  
  // Format the date to a more readable format
  const formattedFechaInicio = formatDate(venta.fecha_inicio);
  
  // Get the first buyer or default to empty data if none exists
  const comprador = compradores.length > 0 ? compradores[0] : {
    nombre: 'No hay comprador asignado',
    porcentaje: 0
  };

  // Total amount paid
  const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={contractType === 'preventa' ? 'default' : 'outline'} 
            onClick={() => setContractType('preventa')}
          >
            Contrato de Pre-Venta
          </Button>
          <Button 
            variant={contractType === 'venta' ? 'default' : 'outline'} 
            onClick={() => setContractType('venta')}
          >
            Contrato de Venta
          </Button>
        </div>
        <ExportPDFButton 
          resourceName={contractType === 'preventa' ? "contrato de pre-venta" : "contrato de venta"}
          elementId="contrato-content"
          fileName={`${contractType === 'preventa' ? 'Contrato_Preventa' : 'Contrato_Venta'}_${venta.id}`}
          variant="default"
        />
      </div>

      <Card className="border-2">
        <CardHeader className="text-center border-b bg-slate-50">
          <CardTitle className="text-xl">
            {contractType === 'preventa' ? 'CONTRATO DE PROMESA DE COMPRAVENTA' : 'CONTRATO DE COMPRAVENTA'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6" id="contrato-content">
          <div className="space-y-6 text-sm">
            <div className="text-center font-bold mb-4">
              {contractType === 'preventa' ? 'CONTRATO DE PROMESA DE COMPRAVENTA' : 'CONTRATO DE COMPRAVENTA'}
            </div>
            
            <p>
              En la ciudad de [CIUDAD], a los {new Date().getDate()} días del mes de {new Date().toLocaleString('es-MX', { month: 'long' })} de {new Date().getFullYear()}, comparecen por una parte <span className="font-semibold">LA INMOBILIARIA</span>, representada legalmente por [REPRESENTANTE LEGAL], a quien en lo sucesivo se le denominará como <span className="font-semibold">"EL VENDEDOR"</span>, y por otra parte <span className="font-semibold">{comprador.nombre}</span>, a quien en lo sucesivo se le denominará como <span className="font-semibold">"EL COMPRADOR"</span>, para celebrar el presente {contractType === 'preventa' ? 'CONTRATO DE PROMESA DE COMPRAVENTA' : 'CONTRATO DE COMPRAVENTA'}, al tenor de las siguientes declaraciones y cláusulas:
            </p>
            
            <div className="font-semibold mt-6">DECLARACIONES</div>
            
            <div className="ml-4">
              <p className="mb-2">I. Declara "EL VENDEDOR":</p>
              <p className="ml-4 mb-2">a) Que es propietario del inmueble denominado {venta.unidad?.prototipo?.desarrollo?.nombre || '[NOMBRE DEL DESARROLLO]'}, que se encuentra ubicado en [UBICACIÓN COMPLETA].</p>
              <p className="ml-4 mb-2">b) Que la propiedad está libre de todo gravamen y al corriente en el pago de impuestos y servicios.</p>
              <p className="ml-4 mb-2">c) Que es su voluntad {contractType === 'preventa' ? 'prometer en venta' : 'vender'} a "EL COMPRADOR" la unidad {venta.unidad?.numero || '[NÚMERO]'} del modelo {venta.unidad?.prototipo?.nombre || '[MODELO]'}.</p>
            </div>
            
            <div className="ml-4">
              <p className="mb-2">II. Declara "EL COMPRADOR":</p>
              <p className="ml-4 mb-2">a) Que es su voluntad {contractType === 'preventa' ? 'prometer adquirir' : 'adquirir'} el inmueble descrito en la declaración I, inciso c).</p>
              <p className="ml-4 mb-2">b) Que cuenta con los recursos económicos suficientes para cumplir con las obligaciones derivadas de este contrato.</p>
            </div>
            
            <div className="font-semibold mt-6">CLÁUSULAS</div>
            
            <div className="ml-4">
              <p className="mb-2">PRIMERA. OBJETO DEL CONTRATO.</p>
              <p className="ml-4 mb-2">"EL VENDEDOR" {contractType === 'preventa' ? 'promete vender' : 'vende'} a "EL COMPRADOR" y éste {contractType === 'preventa' ? 'promete adquirir' : 'adquiere'} la unidad {venta.unidad?.numero || '[NÚMERO]'} del modelo {venta.unidad?.prototipo?.nombre || '[MODELO]'} ubicada en el desarrollo {venta.unidad?.prototipo?.desarrollo?.nombre || '[NOMBRE DEL DESARROLLO]'}.</p>
            </div>
            
            <div className="ml-4">
              <p className="mb-2">SEGUNDA. PRECIO Y FORMA DE PAGO.</p>
              <p className="ml-4 mb-2">El precio pactado por ambas partes para la compraventa es de {formatCurrency(venta.precio_total)} ({convertirNumeroALetras(venta.precio_total)} PESOS 00/100 M.N.).</p>
              <p className="ml-4 mb-2">Hasta la fecha, "EL COMPRADOR" ha pagado la cantidad de {formatCurrency(totalPagado)} ({convertirNumeroALetras(totalPagado)} PESOS 00/100 M.N.)</p>
              <p className="ml-4 mb-2">El monto restante de {formatCurrency(venta.precio_total - totalPagado)} será pagado de acuerdo al plan de pagos establecido entre ambas partes.</p>
            </div>
            
            {contractType === 'preventa' && (
              <div className="ml-4">
                <p className="mb-2">TERCERA. PLAZO PARA LA ENTREGA.</p>
                <p className="ml-4 mb-2">"EL VENDEDOR" se compromete a entregar la unidad terminada a "EL COMPRADOR" en un plazo no mayor a [PLAZO DE ENTREGA] a partir de la firma del presente contrato.</p>
              </div>
            )}
            
            <div className="ml-4">
              <p className="mb-2">{contractType === 'preventa' ? 'CUARTA' : 'TERCERA'}. OBLIGACIONES DEL VENDEDOR.</p>
              <p className="ml-4 mb-2">"EL VENDEDOR" se obliga a entregar la unidad en condiciones óptimas, libre de gravámenes y al corriente en el pago de impuestos y servicios.</p>
            </div>
            
            <div className="ml-4">
              <p className="mb-2">{contractType === 'preventa' ? 'QUINTA' : 'CUARTA'}. OBLIGACIONES DEL COMPRADOR.</p>
              <p className="ml-4 mb-2">"EL COMPRADOR" se obliga a pagar el precio pactado en los términos y plazos establecidos en el presente contrato.</p>
            </div>
            
            <div className="ml-4">
              <p className="mb-2">{contractType === 'preventa' ? 'SEXTA' : 'QUINTA'}. PENALIZACIONES.</p>
              <p className="ml-4 mb-2">En caso de incumplimiento por cualquiera de las partes, la parte afectada podrá exigir el cumplimiento forzoso del contrato o su rescisión, así como el pago de una pena convencional equivalente al 10% del valor total de la operación.</p>
            </div>
            
            <div className="ml-4">
              <p className="mb-2">{contractType === 'preventa' ? 'SÉPTIMA' : 'SEXTA'}. JURISDICCIÓN.</p>
              <p className="ml-4 mb-2">Para la interpretación y cumplimiento del presente contrato, las partes se someten a la jurisdicción de los tribunales de [CIUDAD], renunciando a cualquier otro fuero que pudiera corresponderles por razón de sus domicilios presentes o futuros.</p>
            </div>
            
            <div className="mt-12 pt-8">
              <div className="grid grid-cols-2 gap-12 mt-8">
                <div className="text-center border-t border-black pt-4">
                  <p>"EL VENDEDOR"</p>
                  <p className="mt-4">_________________________</p>
                  <p className="mt-2">[NOMBRE DEL REPRESENTANTE LEGAL]</p>
                </div>
                <div className="text-center border-t border-black pt-4">
                  <p>"EL COMPRADOR"</p>
                  <p className="mt-4">_________________________</p>
                  <p className="mt-2">{comprador.nombre}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 mt-12">
                <div className="text-center border-t border-black pt-4">
                  <p>TESTIGO</p>
                  <p className="mt-4">_________________________</p>
                  <p className="mt-2">[NOMBRE DEL TESTIGO]</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Función para convertir números a letras (versión simplificada)
function convertirNumeroALetras(numero: number): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  
  // Redondear a enteros
  numero = Math.floor(numero);
  
  if (numero === 0) return 'CERO';
  if (numero < 0) return 'MENOS ' + convertirNumeroALetras(Math.abs(numero));
  
  let letras = '';
  
  // Millones
  if (numero >= 1000000) {
    const millones = Math.floor(numero / 1000000);
    if (millones === 1) {
      letras += 'UN MILLÓN ';
    } else {
      letras += convertirNumeroALetras(millones) + ' MILLONES ';
    }
    numero %= 1000000;
  }
  
  // Miles
  if (numero >= 1000) {
    const miles = Math.floor(numero / 1000);
    if (miles === 1) {
      letras += 'MIL ';
    } else {
      letras += convertirNumeroALetras(miles) + ' MIL ';
    }
    numero %= 1000;
  }
  
  // Centenas
  if (numero >= 100) {
    if (numero === 100) {
      letras += 'CIEN ';
    } else {
      letras += centenas[Math.floor(numero / 100)] + ' ';
    }
    numero %= 100;
  }
  
  // Decenas y unidades
  if (numero >= 10 && numero < 20) {
    // Especial para números del 11 al 19
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    letras += especiales[numero - 10] + ' ';
  } else {
    if (numero >= 20) {
      if (numero % 10 === 0) {
        letras += decenas[Math.floor(numero / 10)] + ' ';
      } else {
        letras += decenas[Math.floor(numero / 10)] + ' Y ' + unidades[numero % 10] + ' ';
      }
    } else if (numero > 0) {
      letras += unidades[numero] + ' ';
    }
  }
  
  return letras.trim();
}

export default ContractTab;
