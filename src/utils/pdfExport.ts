
import { jsPDF } from "jspdf";
import { FormattedHistoricalEntity } from "@/types/supabase";
import { toast } from "sonner";

interface PDFExportOptions {
  entities: FormattedHistoricalEntity[];
  title?: string;
  description?: string;
  visualizationType: "graph" | "timeline" | "story";
  svgElement?: SVGSVGElement | null;
}

/**
 * Generates a sophisticated PDF document from the visualization data
 */
export const exportToPDF = async ({
  entities,
  title = "Historical Analysis",
  description = "Visualization of historical connections",
  visualizationType,
  svgElement,
}: PDFExportOptions): Promise<void> => {
  try {
    // Create new PDF document (A4 format)
    const pdf = new jsPDF({
      orientation: "portrait",
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
    
    // Define page dimensions and margins
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Add decorative header with gradient
    pdf.setFillColor(30, 30, 60);
    pdf.rect(0, 0, pageWidth, 35, "F");
    pdf.setFillColor(40, 40, 80);
    pdf.rect(0, 30, pageWidth, 10, "F");
    
    // Add title
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text(title, margin, 20);
    
    // Add visualization type and date
    pdf.setFontSize(10);
    pdf.text(`${visualizationType.charAt(0).toUpperCase() + visualizationType.slice(1)} View | ${new Date().toLocaleDateString()}`, margin, 28);
    
    // Add description
    pdf.setTextColor(60, 60, 60);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const descriptionLines = pdf.splitTextToSize(description, contentWidth);
    pdf.text(descriptionLines, margin, 50);
    
    let yPosition = 50 + (descriptionLines.length * 7);
    
    // Add visualization image if SVG is provided
    if (svgElement) {
      try {
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svg64 = btoa(unescape(encodeURIComponent(svgData)));
        const imgSrc = `data:image/svg+xml;base64,${svg64}`;
        
        // Add image with proper sizing and centering
        const imageWidth = contentWidth;
        const imageHeight = 100;
        pdf.addImage(imgSrc, "SVG", margin, yPosition, imageWidth, imageHeight);
        
        yPosition += imageHeight + 10;
      } catch (error) {
        console.error("Error adding visualization to PDF:", error);
      }
    }
    
    // Add entities table
    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 80);
    pdf.setFont("helvetica", "bold");
    pdf.text("Historical Entities", margin, yPosition);
    yPosition += 10;
    
    // Table header
    const tableHeaders = ["Name", "Type", "Date", "Significance"];
    const columnWidths = [70, 35, 40, 30];
    
    // Draw table header
    pdf.setFillColor(240, 240, 250);
    pdf.rect(margin, yPosition - 6, contentWidth, 8, "F");
    pdf.setTextColor(60, 60, 100);
    pdf.setFontSize(10);
    
    let xPosition = margin;
    for (let i = 0; i < tableHeaders.length; i++) {
      pdf.text(tableHeaders[i], xPosition + 2, yPosition);
      xPosition += columnWidths[i];
    }
    yPosition += 6;
    
    // Draw table rows
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    let rowCount = 0;
    
    for (const entity of entities) {
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
        
        // Add page header on new page
        pdf.setFillColor(30, 30, 60);
        pdf.rect(0, 0, pageWidth, 15, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("Cosmic Connections - Historical Analysis", margin, 10);
        
        // Reset position for table continuation
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(10);
      }
      
      // Background color for alternating rows
      if (rowCount % 2 === 0) {
        pdf.setFillColor(250, 250, 255);
        pdf.rect(margin, yPosition - 6, contentWidth, 8, "F");
      }
      
      // Write entity data
      xPosition = margin;
      
      // Name (truncate if too long)
      const name = entity.name.length > 25 ? entity.name.substring(0, 22) + "..." : entity.name;
      pdf.text(name, xPosition + 2, yPosition);
      xPosition += columnWidths[0];
      
      // Type
      pdf.text(entity.type || "Unknown", xPosition + 2, yPosition);
      xPosition += columnWidths[1];
      
      // Date
      const dateText = entity.startDate 
        ? new Date(entity.startDate).getFullYear().toString() +
          (entity.endDate ? " - " + new Date(entity.endDate).getFullYear() : "")
        : "N/A";
      pdf.text(dateText, xPosition + 2, yPosition);
      xPosition += columnWidths[2];
      
      // Significance
      pdf.text(entity.significance?.toString() || "N/A", xPosition + 2, yPosition);
      
      yPosition += 8;
      rowCount++;
    }
    
    // Add page numbers
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 25, pageHeight - 10);
    }
    
    // Save the PDF with a descriptive filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
    pdf.save(`historical-data-${visualizationType}-${timestamp}.pdf`);
    
    toast.success("PDF exported successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to export PDF. Please try again.");
  }
};
