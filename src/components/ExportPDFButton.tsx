import { createSignal } from "solid-js";
import { FaRegularFilePdf } from "solid-icons/fa";

interface ExportPDFButtonProps {
  postTitle: string;
  postContent: string;
  postDate?: string;
  author?: string;
}

export function ExportPDFButton(props: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = createSignal(false);

  const exportToPDF = async () => {
    if (typeof window === "undefined") return;

    setIsExporting(true);

    try {
      // Use browser's print functionality for PDF export
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Please allow popups to export PDF");
        return;
      }

      // Create print-friendly HTML content
      const printContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${props.postTitle}</title>
          <style>
            @page {
              margin: 1in;
              size: A4;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 20pt;
            }
            
            .article-title {
              font-size: 24pt;
              font-weight: bold;
              margin-bottom: 20pt;
              text-align: center;
              page-break-after: avoid;
            }
            
            .article-meta {
              text-align: center;
              margin-bottom: 30pt;
              font-size: 11pt;
              color: #666;
              border-bottom: 1px solid #ccc;
              padding-bottom: 10pt;
            }
            
            .content {
              text-align: justify;
              max-width: 100%;
            }
            
            h1, h2, h3, h4, h5, h6 {
              font-weight: bold;
              margin-top: 16pt;
              margin-bottom: 8pt;
              page-break-after: avoid;
            }
            
            h1 { font-size: 20pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
            h4, h5, h6 { font-size: 12pt; }
            
            p {
              margin-bottom: 8pt;
              text-align: justify;
              orphans: 3;
              widows: 3;
            }
            
            pre, code {
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              background: #f5f5f5;
              border: 1px solid #ddd;
              padding: 4pt;
              page-break-inside: avoid;
            }
            
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              margin: 8pt 0;
            }
            
            ul, ol {
              margin: 8pt 0;
              padding-left: 20pt;
            }
            
            li {
              margin-bottom: 4pt;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 8pt 0;
              page-break-inside: avoid;
            }
            
            th, td {
              border: 1px solid #000;
              padding: 4pt;
              text-align: left;
            }
            
            th {
              background: #f0f0f0;
              font-weight: bold;
            }
            
            img {
              max-width: 100%;
              height: auto;
              page-break-inside: avoid;
              margin: 8pt 0;
            }
            
            a {
              color: #000;
              text-decoration: underline;
            }
            
            blockquote {
              margin: 8pt 20pt;
              padding: 4pt 8pt;
              border-left: 2px solid #000;
              font-style: italic;
              page-break-inside: avoid;
            }
            
            hr {
              border: none;
              border-top: 1px solid #000;
              margin: 16pt 0;
            }
          </style>
        </head>
        <body>
          <h1 class="article-title">${props.postTitle}</h1>
          
          ${
            props.postDate || props.author
              ? `
            <div class="article-meta">
              ${props.author ? `<div>By ${props.author}</div>` : ""}
              ${props.postDate ? `<div>Published: ${props.postDate}</div>` : ""}
            </div>
          `
              : ""
          }
          
          <div class="content">
            ${extractTextContent(props.postContent)}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isExporting()}
      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
      title="Export to PDF"
    >
      <FaRegularFilePdf class="w-4 h-4" />
      {isExporting() ? "Exporting..." : "Export PDF"}
    </button>
  );
}

// Utility function to extract clean text content from HTML
export function extractTextContent(htmlContent: string): string {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll("script, style");
  scripts.forEach((el) => el.remove());

  // Convert to clean HTML with proper formatting
  const content = tempDiv.innerHTML
    .replace(
      /<h([1-6])([^>]*)>/gi,
      '<h$1 style="font-weight: bold; margin-top: 16pt; margin-bottom: 8pt; page-break-after: avoid;">',
    )
    .replace(
      /<p([^>]*)>/gi,
      '<p style="margin-bottom: 8pt; text-align: justify;">',
    )
    .replace(
      /<pre([^>]*)>/gi,
      '<pre style="font-family: Courier, monospace; background: #f5f5f5; padding: 8pt; border: 1px solid #ddd; margin: 8pt 0; white-space: pre-wrap; page-break-inside: avoid;">',
    )
    .replace(
      /<code([^>]*)>/gi,
      '<code style="font-family: Courier, monospace; background: #f5f5f5; padding: 2pt;">',
    )
    .replace(
      /<blockquote([^>]*)>/gi,
      '<blockquote style="margin: 8pt 20pt; padding: 4pt 8pt; border-left: 2px solid #000; font-style: italic; page-break-inside: avoid;">',
    )
    .replace(/<ul([^>]*)>/gi, '<ul style="margin: 8pt 0; padding-left: 20pt;">')
    .replace(/<ol([^>]*)>/gi, '<ol style="margin: 8pt 0; padding-left: 20pt;">')
    .replace(/<li([^>]*)>/gi, '<li style="margin-bottom: 4pt;">')
    .replace(
      /<table([^>]*)>/gi,
      '<table style="width: 100%; border-collapse: collapse; margin: 8pt 0; page-break-inside: avoid;">',
    )
    .replace(
      /<th([^>]*)>/gi,
      '<th style="border: 1px solid #000; padding: 4pt; background: #f0f0f0; font-weight: bold;">',
    )
    .replace(
      /<td([^>]*)>/gi,
      '<td style="border: 1px solid #000; padding: 4pt;">',
    )
    .replace(
      /<img([^>]*?)>/gi,
      '<img$1 style="max-width: 100%; height: auto; margin: 8pt 0; page-break-inside: avoid;">',
    )
    .replace(
      /<a([^>]*?)>/gi,
      '<a$1 style="color: #000; text-decoration: underline;">',
    );

  return content;
}
