
import { jsPDF } from "jspdf";
import { FormattedHistoricalEntity } from "@/types/supabase";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface PDFExportOptions {
  entities: FormattedHistoricalEntity[];
  title?: string;
  description?: string;
  visualizationType: "graph" | "timeline" | "story";
  containerElement?: HTMLElement | null;
}

/**
 * Generates a sophisticated PDF document from the visualization data
 */
export const exportToPDF = async ({
  entities,
  title = "Historical Analysis",
  description = "Visualization of historical connections",
  visualizationType,
  containerElement,
}: PDFExportOptions): Promise<void> => {
  try {
    // Create new PDF document (A4 format in landscape for better visualization)
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    
    // Add metadata
    pdf.setProperties({
      title: title,
      subject: "Historical Data Visualization",
      creator: "Cosmic Connections",
      author: "Cosmic Connections",
      keywords: "history, visualization, connections",
    });
    
    // Define page dimensions
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 10;
    
    // Add decorative header with gradient
    pdf.setFillColor(30, 30, 60);
    pdf.rect(0, 0, pageWidth, 20, "F");
    pdf.setFillColor(40, 40, 80);
    pdf.rect(0, 15, pageWidth, 5, "F");
    
    // Add title
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(title, margin, 12);
    
    // Add visualization type and date
    pdf.setFontSize(8);
    pdf.text(`${visualizationType.charAt(0).toUpperCase() + visualizationType.slice(1)} View | ${new Date().toLocaleDateString()}`, margin, 18);
    
    // Capture the visualization with background using html2canvas
    if (containerElement) {
      try {
        toast.info("Preparing visualization for export...");
        
        // Capture the visualization container with html2canvas
        const canvas = await html2canvas(containerElement, {
          backgroundColor: null,
          scale: 2, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          logging: false,
        });
        
        // Convert the canvas to an image
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions to fit in PDF while maintaining aspect ratio
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', margin, 25, imgWidth, imgHeight);
        
        // Add caption below the visualization
        const captionY = 25 + imgHeight + 5;
        pdf.setTextColor(60, 60, 100);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        pdf.text(description, margin, captionY);
        
        // Add page number
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page 1 of 1 | Generated on ${new Date().toLocaleDateString()}`, pageWidth - 60, pageHeight - 5);
        
        // Save the PDF with a descriptive filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
        pdf.save(`cosmic-visualization-${visualizationType}-${timestamp}.pdf`);
        
        toast.success("Visualization exported successfully!");
      } catch (error) {
        console.error("Error capturing visualization:", error);
        toast.error("Failed to capture visualization. Please try again.");
      }
    } else {
      toast.error("Visualization container not found. Please try again.");
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to export PDF. Please try again.");
  }
};
