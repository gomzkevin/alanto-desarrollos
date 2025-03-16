
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportToPDFOptions {
  elementId: string;
  fileName?: string;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  quality?: number;
}

/**
 * Exports an HTML element to a PDF with proper page breaks
 */
export const exportToPDF = async ({
  elementId,
  fileName = 'document',
  margins = { top: 10, right: 10, bottom: 10, left: 10 },
  quality = 2
}: ExportToPDFOptions): Promise<boolean> => {
  try {
    // Get the HTML element to be captured
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }
    
    // Create a cloned element to avoid affecting the UI
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.backgroundColor = 'white';
    clone.style.padding = '20px';
    
    // Temporarily add the clone to the document to capture it
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);
    
    // Capture the element using html2canvas with higher quality
    const canvas = await html2canvas(clone, {
      scale: quality, // Higher scale for better quality
      useCORS: true,  // Handle cross-origin images
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Clean up the temporary clone
    document.body.removeChild(clone);
    
    // Initialize a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Get PDF page dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate available content area considering margins
    const contentWidth = pdfWidth - (margins.left || 0) - (margins.right || 0);
    const contentHeight = pdfHeight - (margins.top || 0) - (margins.bottom || 0);
    
    // Calculate image dimensions and scaling
    const imgWidth = contentWidth;
    const ratio = canvas.width / imgWidth;
    const imgHeight = canvas.height / ratio;
    
    // Calculate how many pages we'll need
    const totalPages = Math.ceil(imgHeight / contentHeight);
    
    // For each page, calculate the portion of the canvas to use
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
      // Calculate vertical position for this page's segment
      const sourceY = page * contentHeight * ratio;
      const sourceHeight = Math.min(contentHeight * ratio, canvas.height - sourceY);
      
      // Create a temporary canvas for this segment
      const segmentCanvas = document.createElement('canvas');
      segmentCanvas.width = canvas.width;
      segmentCanvas.height = sourceHeight;
      
      // Draw the segment to the temporary canvas
      const ctx = segmentCanvas.getContext('2d');
      if (!ctx) continue;
      
      ctx.drawImage(
        canvas, 
        0, sourceY, canvas.width, sourceHeight,
        0, 0, canvas.width, sourceHeight
      );
      
      // Convert segment to image data
      const imgData = segmentCanvas.toDataURL('image/jpeg', 1.0);
      
      // Calculate destination height based on the source segment height
      const destHeight = sourceHeight / ratio;
      
      // Add the image segment to the PDF page
      pdf.addImage(
        imgData, 
        'JPEG', 
        margins.left || 0, 
        margins.top || 0, 
        imgWidth, 
        destHeight
      );
    }
    
    // Save the PDF
    pdf.save(`${fileName}.pdf`);
    return true;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
