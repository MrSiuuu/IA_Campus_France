const { OpenAI } = require('openai');
const { parseFile } = require('../utils/fileParser');

class DocumentAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeDocument(fileData, fileType) {
    try {
      // 1. Extraire le texte du document
      const text = await parseFile(fileData, fileType);

      // 2. Définir le prompt selon le type de document
      const prompt = this.getPromptForDocumentType(fileType);

      // 3. Analyser avec OpenAI
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en analyse de documents pour Campus France. Ta tâche est d'aider les candidats à améliorer leurs documents pour maximiser leurs chances d'être acceptés."
          },
          {
            role: "user",
            content: `${prompt}\n\nDocument à analyser :\n${text}`
          }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Erreur lors de l\'analyse du document:', error);
      throw error;
    }
  }

  getPromptForDocumentType(fileType) {
    const prompts = {
      cv: `Analyse ce CV dans le contexte de Campus France et donne des conseils pour l'améliorer :
        - Points forts actuels
        - Points à améliorer
        - Suggestions concrètes pour chaque point à améliorer
        - Conseils pour mettre en valeur les compétences pertinentes pour les études en France
        Format : Réponse structurée et directe`,
      
      letter: `Analyse cette lettre de motivation dans le contexte de Campus France :
        - Structure et clarté
        - Motivation pour les études en France
        - Cohérence avec le projet d'études
        - Points forts
        - Points à améliorer
        - Suggestions d'amélioration concrètes
        Format : Réponse structurée et directe`
    };

    return prompts[fileType] || 'Analyse ce document et donne des conseils pour l\'améliorer dans le contexte de Campus France.';
  }
}

module.exports = new DocumentAnalyzer(); 