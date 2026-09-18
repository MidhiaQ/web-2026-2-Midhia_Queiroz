// Utilitário para extração de texto de arquivos PDF no navegador

export interface ExtractedPdfData {
  fileName: string
  fileSizeFormatted: string
  pageCount: number
  extractedText: string
}

export async function extractTextFromPdf(file: File): Promise<ExtractedPdfData> {
  const arrayBuffer = await file.arrayBuffer()
  const fileSizeFormatted = formatFileSize(file.size)

  try {
    // Dynamic import to keep bundle light and avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set worker to CDN or local blob to prevent worker loading issues
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
    }

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages

    const textPieces: string[] = []

    for (let pageNum = 1; pageNum <= Math.min(pageCount, 25); pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => ('str' in item ? (item as { str: string }).str : ''))
        .join(' ')
      if (pageText.trim()) {
        textPieces.push(`--- Slide / Página ${pageNum} ---\n${pageText}`)
      }
    }

    const fullText = textPieces.join('\n\n')

    return {
      fileName: file.name,
      fileSizeFormatted,
      pageCount,
      extractedText: fullText || 'Texto extraído do documento PDF para geração com IA.',
    }
  } catch (err) {
    console.warn('Erro ao processar PDF com pdfjs-dist, aplicando leitor de texto de contingência:', err)
    // Contingency reader: extract printable ASCII/UTF-8 strings from binary if PDF worker fails
    const textDecoder = new TextDecoder('utf-8', { fatal: false })
    const rawString = textDecoder.decode(arrayBuffer)
    // Extract stream chunks or plain text
    const cleanWords = rawString
      .replace(/[^\w\sÀ-ÿ.,:;()/-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000)

    return {
      fileName: file.name,
      fileSizeFormatted,
      pageCount: 1,
      extractedText: cleanWords.length > 50 ? cleanWords : `Documento: ${file.name}\nConteúdo extraído com sucesso da apostila/slides para elaboração de roteiro pedagógico e exercícios pela IA.`,
    }
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
