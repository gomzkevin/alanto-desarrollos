
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type AmortizationRow = {
  paymentNumber: number;
  date: Date;
  amount: number;
  remainingBalance: number;
  description: string;
};

export const generateAmortizationTable = (
  totalPrice: number,
  anticipoAmount: number,
  finiquitoAmount: number = 0,
  numberOfPayments: number,
  startDate: Date,
  useFiniquito: boolean = false,
  finiquitoDate?: Date
): AmortizationRow[] => {
  const amortizationTable: AmortizationRow[] = [];
  
  // Initial remaining balance is the total price
  let remainingBalance = totalPrice;
  
  // Add anticipo payment (if any)
  if (anticipoAmount > 0) {
    amortizationTable.push({
      paymentNumber: 0,
      date: new Date(), // Current date for anticipo
      amount: anticipoAmount,
      remainingBalance: remainingBalance - anticipoAmount,
      description: 'Anticipo'
    });
    
    remainingBalance -= anticipoAmount;
  }

  // Calculate remaining amount to be paid in installments
  const remainingAmountForInstallments = useFiniquito 
    ? remainingBalance - finiquitoAmount 
    : remainingBalance;
  
  // Calculate monthly payment
  const monthlyPayment = remainingAmountForInstallments / numberOfPayments;
  
  // Generate monthly payments
  for (let i = 0; i < numberOfPayments; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    remainingBalance -= monthlyPayment;
    
    amortizationTable.push({
      paymentNumber: i + 1,
      date: paymentDate,
      amount: monthlyPayment,
      remainingBalance: remainingBalance,
      description: `Mensualidad ${i + 1}`
    });
  }
  
  // Add finiquito payment (if applicable)
  if (useFiniquito && finiquitoAmount > 0) {
    const finiquitoPaymentDate = finiquitoDate || new Date(startDate);
    if (finiquitoDate) {
      finiquitoPaymentDate.setMonth(finiquitoPaymentDate.getMonth() + numberOfPayments);
    }
    
    amortizationTable.push({
      paymentNumber: numberOfPayments + 1,
      date: finiquitoPaymentDate,
      amount: finiquitoAmount,
      remainingBalance: 0, // After finiquito, balance should be 0
      description: 'Finiquito'
    });
  }
  
  return amortizationTable;
};

export const generateQuotationPDF = (
  clientName: string,
  propertyInfo: {
    desarrollo: string;
    prototipo: string;
    precio: number;
  },
  paymentInfo: {
    anticipoAmount: number;
    numberOfPayments: number;
    startDate: Date;
    useFiniquito: boolean;
    finiquitoAmount?: number;
    finiquitoDate?: Date;
  },
  additionalNotes?: string
): jsPDF => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add title
  doc.setFontSize(18);
  doc.text('COTIZACIÓN', pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  const today = format(new Date(), 'dd/MM/yyyy', { locale: es });
  doc.text(`Fecha de emisión: ${today}`, pageWidth - 20, 30, { align: 'right' });
  
  // Add client information
  doc.setFontSize(12);
  doc.text('Información del Cliente:', 20, 40);
  doc.setFontSize(11);
  doc.text(`Nombre: ${clientName}`, 30, 50);
  
  // Add property information
  doc.setFontSize(12);
  doc.text('Información de la Propiedad:', 20, 70);
  doc.setFontSize(11);
  doc.text(`Desarrollo: ${propertyInfo.desarrollo}`, 30, 80);
  doc.text(`Prototipo: ${propertyInfo.prototipo}`, 30, 90);
  doc.text(`Precio Total: $${propertyInfo.precio.toLocaleString('es-MX')}`, 30, 100);
  
  // Add payment information
  doc.setFontSize(12);
  doc.text('Condiciones de Pago:', 20, 120);
  doc.setFontSize(11);
  doc.text(`Anticipo: $${paymentInfo.anticipoAmount.toLocaleString('es-MX')}`, 30, 130);
  doc.text(`Número de mensualidades: ${paymentInfo.numberOfPayments}`, 30, 140);
  doc.text(`Fecha de inicio: ${format(paymentInfo.startDate, 'dd/MM/yyyy', { locale: es })}`, 30, 150);
  
  if (paymentInfo.useFiniquito && paymentInfo.finiquitoAmount) {
    doc.text(`Finiquito: $${paymentInfo.finiquitoAmount.toLocaleString('es-MX')}`, 30, 160);
    if (paymentInfo.finiquitoDate) {
      doc.text(`Fecha de finiquito: ${format(paymentInfo.finiquitoDate, 'dd/MM/yyyy', { locale: es })}`, 30, 170);
    }
  }
  
  // Generate amortization table
  const amortizationTable = generateAmortizationTable(
    propertyInfo.precio,
    paymentInfo.anticipoAmount,
    paymentInfo.finiquitoAmount || 0,
    paymentInfo.numberOfPayments,
    paymentInfo.startDate,
    paymentInfo.useFiniquito,
    paymentInfo.finiquitoDate
  );
  
  // Create table header and data
  const tableHeaders = [['No. Pago', 'Fecha', 'Descripción', 'Monto', 'Saldo Restante']];
  const tableData = amortizationTable.map(row => [
    row.paymentNumber.toString(),
    format(row.date, 'dd/MM/yyyy', { locale: es }),
    row.description,
    `$${row.amount.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`,
    `$${row.remainingBalance.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`
  ]);
  
  // Add amortization table
  doc.setFontSize(12);
  doc.text('Tabla de Amortización:', 20, 190);
  
  autoTable(doc, {
    startY: 200,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 10 }
  });
  
  // Add notes (if any)
  if (additionalNotes && additionalNotes.trim() !== '') {
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.setFontSize(12);
    doc.text('Notas Adicionales:', 20, finalY + 20);
    doc.setFontSize(10);
    doc.text(additionalNotes, 30, finalY + 30);
  }
  
  // Add footer
  const finalY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(10);
  doc.text('Esta cotización es informativa y no representa un compromiso contractual.', pageWidth / 2, finalY, { align: 'center' });
  
  return doc;
};

// Helper function to save or download the PDF
export const downloadQuotationPDF = (
  clientName: string,
  propertyInfo: {
    desarrollo: string;
    prototipo: string;
    precio: number;
  },
  paymentInfo: {
    anticipoAmount: number;
    numberOfPayments: number;
    startDate: Date;
    useFiniquito: boolean;
    finiquitoAmount?: number;
    finiquitoDate?: Date;
  },
  additionalNotes?: string
): void => {
  const doc = generateQuotationPDF(clientName, propertyInfo, paymentInfo, additionalNotes);
  const filename = `Cotizacion_${clientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
};
