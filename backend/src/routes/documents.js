const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const documentAnalyzer = require('../services/documentAnalyzer');
const multer = require('multer');
const upload = multer(); // Pas de stockage local, tout reste en mémoire

// Middleware d'authentification
router.use(authenticateToken);

// GET /documents - Liste des documents de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /documents - Création d'une entrée document (après upload dans Supabase Storage)
router.post('/', async (req, res) => {
  try {
    const { file_name, file_type, file_url, file_size } = req.body;
    
    if (!file_name || !file_type || !file_url) {
      return res.status(400).json({ error: 'Informations manquantes' });
    }

    // Enregistrement en BDD
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: req.user.id,
        file_name,
        file_url,
        file_size,
        file_type,
        tokens_required: 0
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /documents/:id - Suppression d'un document
router.delete('/:id', async (req, res) => {
  try {
    // Récupérer le document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (docError || !doc) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Supprimer le fichier du bucket Supabase
    const { error: storageError } = await supabase
      .storage
      .from('documents')
      .remove([`${req.user.id}/${doc.file_name}`]);

    if (storageError) throw storageError;

    // Supprimer l'entrée en BDD
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Document supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /documents/:id/analyze - Analyse IA d'un document
router.post('/:id/analyze', async (req, res) => {
  try {
    // Récupérer le document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (docError || !doc) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Télécharger le fichier depuis Supabase Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download(doc.file_path);

    if (downloadError) throw downloadError;

    // Conversion du Blob en Buffer (pour Node.js)
    let fileBuffer;
    if (fileData instanceof Buffer) {
      fileBuffer = fileData;
    } else if (fileData.arrayBuffer) {
      fileBuffer = Buffer.from(await fileData.arrayBuffer());
    } else {
      throw new Error('Format de fichier non supporté pour le parsing');
    }

    // Déduire l'extension réelle du fichier
    const extension = doc.file_name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(extension)) {
      throw new Error('Type de document non supporté');
    }
    // Analyser le contenu avec l'IA
    const analysis = await documentAnalyzer.analyzeDocument(fileBuffer, extension);

    res.json({ analysis });
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /documents/upload - Upload d'un fichier, stockage dans Supabase Storage, enregistrement en BDD
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    const fileType = req.body.file_type;

    if (!file || !fileType) {
      return res.status(400).json({ error: 'Fichier ou type manquant' });
    }

    // Générer un chemin unique pour le fichier dans le bucket
    const filePath = `${userId}/${Date.now()}_${file.originalname}`;

    // Upload dans Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype
      });

    if (uploadError) throw uploadError;

    // Enregistrement en BDD
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        file_name: file.originalname,
        file_path: filePath,
        file_size: file.size,
        file_type: fileType,
        tokens_required: 0
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ id: data.id });
  } catch (error) {
    console.error('Erreur upload document:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 