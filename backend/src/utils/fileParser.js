const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Parse un fichier et extrait son contenu textuel
 * @param {Buffer} fileData - Données du fichier
 * @param {string} fileType - Type de fichier (pdf, doc, docx)
 * @returns {Promise<string>} Contenu textuel du document
 */
async function parseFile(fileData, fileType) {
  try {
    switch (fileType) {
      case 'pdf':
        const pdfData = await pdfParse(fileData);
        return pdfData.text;

      case 'doc':
      case 'docx':
        const result = await mammoth.extractRawText({ buffer: fileData });
        return result.value;

      default:
        throw new Error('Type de document non supporté');
    }
  } catch (error) {
    console.error('Erreur lors du parsing du fichier:', error);
    throw new Error('Impossible de lire le contenu du document');
  }
}

module.exports = {
  parseFile
}; 