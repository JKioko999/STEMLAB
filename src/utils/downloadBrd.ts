import { BRD_DOCX_BASE64 } from './brdDocxBase64';

/**
 * Downloads the full Corporate BRD / DRD Specification Word Document (.docx)
 * using client-side in-memory decoding. This completely bypasses any network /
 * proxy / iframe HTML interception issues, guaranteeing that Microsoft Word
 * and Google Docs open the exact 100% valid .docx binary without corruption.
 */
export function downloadBrdDocxFile() {
  try {
    const byteCharacters = atob(BRD_DOCX_BASE64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const fileName = 'STEM_SPARK_VIRTUAL_LAB_BRD_DRD_SPECIFICATION.docx';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    }, 1000);
  } catch (error) {
    console.error('Error generating docx download directly:', error);
    // Fallback: try direct server route
    window.location.href = '/api/download-brd';
  }
}
