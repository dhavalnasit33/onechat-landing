/**
 * Client-side script loader for PDF.js (CDN-based, exact same approach as Flutter web index.html).
 * This completely avoids Turbopack / Webpack / Next.js bundler attempting to bundle Node-only 'canvas'.
 */

let pdfjsLoadingPromise: Promise<any> | null = null;

export async function loadPdfJsLib(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("PDF.js can only be loaded in the browser.");
  }

  // Already loaded on window
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  if (pdfjsLoadingPromise) {
    return pdfjsLoadingPromise;
  }

  pdfjsLoadingPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="pdf.min.js"]');
    if (existingScript && (window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.async = true;

    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        resolve(pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not available on window after load"));
      }
    };

    script.onerror = (e) => {
      pdfjsLoadingPromise = null;
      reject(new Error(`Failed to load PDF.js script from CDN: ${e}`));
    };

    document.head.appendChild(script);
  });

  return pdfjsLoadingPromise;
}

/**
 * Extract readable text from various file formats (PDF, TXT, CSV, JSON, MD, etc.).
 * Uses the exact Flutter file_text_extractor.dart logic with pdfjsLib.getDocument().
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const maxCharacters = 200000;

  // 1. Text/CSV/JSON/Code files
  if (["txt", "csv", "json", "md", "tsv", "log", "xml", "html"].includes(ext)) {
    try {
      const text = await file.text();
      return text.slice(0, maxCharacters);
    } catch (e) {
      return `Error reading text file: ${e}`;
    }
  }

  // 2. PDF Files via client-side PDF.js (Matches Flutter file_text_extractor.dart)
  if (ext === "pdf") {
    try {
      const pdfjsLib = await loadPdfJsLib();
      const arrayBuffer = await file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      });

      const pdf = await loadingTask.promise;
      const numPages = Math.min(pdf.numPages, 500);
      const textParts: string[] = [];
      let totalLength = 0;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item.str ? item.str : ""))
          .join(" ");

        textParts.push(`--- Page ${i} ---\n${pageText}`);
        totalLength += pageText.length;
        if (totalLength > maxCharacters) break;
      }

      const extracted = textParts.join("\n\n").trim();
      return extracted.length > 0
        ? extracted
        : "PDF file uploaded (no readable text found in document).";
    } catch (err: any) {
      console.error("PDF extraction error:", err);
      return `PDF file: ${file.name}`;
    }
  }

  // 3. Fallback for other file types
  try {
    const text = await file.text();
    if (!text.includes("\0")) {
      return text.slice(0, maxCharacters);
    }
  } catch (_) {}

  return `File uploaded: ${file.name} (${ext.toUpperCase()})`;
}
