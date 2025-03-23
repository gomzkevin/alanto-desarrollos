
import { useToast } from "@/hooks/use-toast";

/**
 * Exports data to Excel format and triggers a download
 * @param data Array of objects to export
 * @param sheetName Name of the sheet in the Excel file
 * @param fileName Name of the file to download (without extension)
 */
export const exportToExcel = (
  data: Record<string, any>[],
  sheetName: string = 'Sheet1',
  fileName: string = 'export'
): void => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  try {
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
      const row = headers.map(header => {
        // Handle values that may contain commas, quotes, etc.
        const cellValue = item[header] === null || item[header] === undefined ? '' : String(item[header]);
        const escapedValue = cellValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Export to Excel completed successfully');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};
