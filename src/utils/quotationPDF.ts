
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, addDays, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Add anticipo payment (always on the current date)
  if (anticipoAmount > 0) {
    const anticipoDate = new Date(startDate); // Use the start date for anticipo
    
    amortizationTable.push({
      paymentNumber: 0,
      date: anticipoDate,
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
  // First payment is 30 days after the anticipo
  for (let i = 0; i < numberOfPayments; i++) {
    // Each payment is one month apart, starting one month after the anticipo
    const paymentDate = addMonths(startDate, i + 1);
    
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
  // Finiquito should be 30 days after the last mensualidad
  if (useFiniquito && finiquitoAmount > 0) {
    let finiquitoPaymentDate;
    
    if (finiquitoDate) {
      finiquitoPaymentDate = finiquitoDate;
    } else {
      // If no specific finiquito date provided, set it 30 days after last payment
      const lastPaymentIndex = amortizationTable.length - 1;
      const lastPaymentDate = amortizationTable[lastPaymentIndex].date;
      finiquitoPaymentDate = addDays(lastPaymentDate, 30);
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

// Function to fetch development image URL
async function getDesarrolloImage(desarrolloId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('desarrollo_imagenes')
      .select('url')
      .eq('desarrollo_id', desarrolloId)
      .eq('es_principal', true)
      .single();
    
    if (error || !data) {
      // If no principal image, try to get any image
      const { data: anyImage, error: anyImageError } = await supabase
        .from('desarrollo_imagenes')
        .select('url')
        .eq('desarrollo_id', desarrolloId)
        .limit(1)
        .single();
      
      if (anyImageError || !anyImage) return null;
      return anyImage.url;
    }
    
    return data.url;
  } catch (error) {
    console.error('Error fetching desarrollo image:', error);
    return null;
  }
}

// Function to fetch prototipo image URL
async function getPrototipoImage(prototipoId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('prototipos')
      .select('imagen_url')
      .eq('id', prototipoId)
      .single();
    
    if (error || !data || !data.imagen_url) return null;
    return data.imagen_url;
  } catch (error) {
    console.error('Error fetching prototipo image:', error);
    return null;
  }
}

// Function to fetch desarrollo amenities
async function getDesarrolloAmenities(desarrolloId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('desarrollos')
      .select('amenidades')
      .eq('id', desarrolloId)
      .single();
    
    if (error || !data || !data.amenidades) return [];
    return data.amenidades;
  } catch (error) {
    console.error('Error fetching desarrollo amenities:', error);
    return [];
  }
}

// Function to fetch prototipo features
async function getPrototipoFeatures(prototipoId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('prototipos')
      .select('caracteristicas, habitaciones, baños, superficie, estacionamientos')
      .eq('id', prototipoId)
      .single();
    
    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error('Error fetching prototipo features:', error);
    return null;
  }
}

export const generateQuotationPDF = async (
  clientName: string,
  propertyInfo: {
    desarrollo: string;
    desarrollo_id: string;
    prototipo: string;
    prototipo_id: string;
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
): Promise<jsPDF> => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Get images and additional data
  const desarrolloImageUrl = await getDesarrolloImage(propertyInfo.desarrollo_id);
  const prototipoImageUrl = await getPrototipoImage(propertyInfo.prototipo_id);
  const desarrolloAmenities = await getDesarrolloAmenities(propertyInfo.desarrollo_id);
  const prototipoFeatures = await getPrototipoFeatures(propertyInfo.prototipo_id);
  
  // Add background color
  doc.setFillColor(246, 246, 247); // Light gray background
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Add header with gradient
  doc.setFillColor(65, 84, 179); // Dark blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN', pageWidth / 2, 25, { align: 'center' });
  
  // Add date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const today = format(new Date(), 'dd/MM/yyyy', { locale: es });
  doc.text(`Fecha de emisión: ${today}`, pageWidth - 20, 35, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(33, 33, 33);
  
  // Add development image if available
  let yPos = 50;
  if (desarrolloImageUrl) {
    try {
      doc.addImage(desarrolloImageUrl, 'JPEG', 20, yPos, 80, 40);
      yPos += 45;
    } catch (error) {
      console.error('Error adding desarrollo image:', error);
    }
  }
  
  // Add client information
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, yPos, pageWidth - 40, 40, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(65, 84, 179); // Dark blue
  doc.text('Información del Cliente:', 30, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(12);
  doc.text(`Nombre: ${clientName}`, 30, yPos + 30);
  
  yPos += 50;
  
  // Add property information with better styling
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, yPos, pageWidth - 40, 70, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(65, 84, 179); // Dark blue
  doc.text('Información de la Propiedad:', 30, yPos + 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(12);
  
  // Add property details in a more structured way
  doc.text(`Desarrollo: ${propertyInfo.desarrollo}`, 30, yPos + 30);
  doc.text(`Prototipo: ${propertyInfo.prototipo}`, 30, yPos + 40);
  doc.text(`Precio Total: $${propertyInfo.precio.toLocaleString('es-MX')}`, 30, yPos + 50);
  
  // Add prototipo features if available
  if (prototipoFeatures) {
    let featureX = pageWidth - 110;
    doc.setFont('helvetica', 'bold');
    doc.text('Características:', featureX, yPos + 30);
    doc.setFont('helvetica', 'normal');
    
    let featureY = yPos + 40;
    if (prototipoFeatures.habitaciones) {
      doc.text(`${prototipoFeatures.habitaciones} Habitaciones`, featureX, featureY);
      featureY += 10;
    }
    if (prototipoFeatures.baños) {
      doc.text(`${prototipoFeatures.baños} Baños`, featureX, featureY);
      featureY += 10;
    }
    if (prototipoFeatures.superficie) {
      doc.text(`${prototipoFeatures.superficie} m²`, featureX, featureY);
      featureY += 10;
    }
    if (prototipoFeatures.estacionamientos) {
      doc.text(`${prototipoFeatures.estacionamientos} Estacionamientos`, featureX, featureY);
    }
  }
  
  // Add prototipo image if available
  if (prototipoImageUrl) {
    try {
      // Add a slight shadow effect
      doc.setFillColor(0, 0, 0, 0.1);
      doc.roundedRect(pageWidth - 91, yPos + 1, 61, 51, 3, 3, 'F');
      
      // Add the image with rounded corners (simulated with a white background)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(pageWidth - 90, yPos, 60, 50, 3, 3, 'F');
      doc.addImage(prototipoImageUrl, 'JPEG', pageWidth - 85, yPos + 5, 50, 40);
    } catch (error) {
      console.error('Error adding prototipo image:', error);
    }
  }
  
  yPos += 80;
  
  // Add amenities if available
  if (desarrolloAmenities && desarrolloAmenities.length > 0) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, yPos, pageWidth - 40, 40, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(65, 84, 179); // Dark blue
    doc.text('Amenidades:', 30, yPos + 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(10);
    
    const itemsPerRow = 3;
    const maxItemsToShow = Math.min(desarrolloAmenities.length, 9); // Show max 9 amenities
    
    for (let i = 0; i < maxItemsToShow; i++) {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      
      const xPos = 30 + col * ((pageWidth - 60) / itemsPerRow);
      const amenityYPos = yPos + 25 + (row * 10);
      
      doc.text(`• ${desarrolloAmenities[i]}`, xPos, amenityYPos);
    }
    
    yPos += 50;
  }
  
  // Add payment information with modern styling
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, yPos, pageWidth - 40, 70, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(65, 84, 179); // Dark blue
  doc.text('Condiciones de Pago:', 30, yPos + 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(12);
  
  const halfWidth = (pageWidth - 40) / 2;
  doc.text(`Anticipo: $${paymentInfo.anticipoAmount.toLocaleString('es-MX')}`, 30, yPos + 30);
  doc.text(`Número de mensualidades: ${paymentInfo.numberOfPayments}`, 30, yPos + 40);
  doc.text(`Fecha de inicio: ${format(paymentInfo.startDate, 'dd/MM/yyyy', { locale: es })}`, 30, yPos + 50);
  
  if (paymentInfo.useFiniquito && paymentInfo.finiquitoAmount) {
    doc.text(`Finiquito: $${paymentInfo.finiquitoAmount.toLocaleString('es-MX')}`, 30 + halfWidth, yPos + 30);
    if (paymentInfo.finiquitoDate) {
      doc.text(`Fecha de finiquito: ${format(paymentInfo.finiquitoDate, 'dd/MM/yyyy', { locale: es })}`, 30 + halfWidth, yPos + 40);
    }
  }
  
  yPos += 80;
  
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
  
  // Add table section title
  doc.setFillColor(65, 84, 179, 0.1); // Light blue background
  doc.rect(20, yPos, pageWidth - 40, 25, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(65, 84, 179); // Dark blue
  doc.text('Tabla de Amortización:', pageWidth / 2, yPos + 16, { align: 'center' });
  
  // Create table header and data with improved styling
  const tableHeaders = [['No. Pago', 'Fecha', 'Descripción', 'Monto', 'Saldo Restante']];
  const tableData = amortizationTable.map(row => [
    row.paymentNumber.toString(),
    format(row.date, 'dd/MM/yyyy', { locale: es }),
    row.description,
    `$${row.amount.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`,
    `$${row.remainingBalance.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`
  ]);
  
  // Add amortization table with improved styling
  autoTable(doc, {
    startY: yPos + 30,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [65, 84, 179],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [246, 246, 247]
    }
  });
  
  // Add notes (if any) with improved styling
  if (additionalNotes && additionalNotes.trim() !== '') {
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, finalY + 10, pageWidth - 40, 40, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(65, 84, 179);
    doc.text('Notas Adicionales:', 30, finalY + 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(10);
    doc.text(additionalNotes, 30, finalY + 35, {
      maxWidth: pageWidth - 60
    });
  }
  
  // Add footer
  const finalY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(65, 84, 179);
  doc.rect(0, finalY - 10, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Esta cotización es informativa y no representa un compromiso contractual.', pageWidth / 2, finalY, { align: 'center' });
  
  return doc;
};

// Helper function to save or download the PDF
export const downloadQuotationPDF = async (
  clientName: string,
  propertyInfo: {
    desarrollo: string;
    desarrollo_id: string;
    prototipo: string;
    prototipo_id: string;
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
): Promise<void> => {
  const doc = await generateQuotationPDF(clientName, propertyInfo, paymentInfo, additionalNotes);
  const filename = `Cotizacion_${clientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
};
