const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de base
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'API Campus France en ligne' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur non gérée:', err);
    
    // Ne pas exposer les détails de l'erreur en production
    const isProd = process.env.NODE_ENV === 'production';
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Données invalides',
            details: isProd ? undefined : err.details
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Non autorisé'
        });
    }
    
    res.status(500).json({
        error: 'Erreur serveur',
        details: isProd ? undefined : err.message
    });
});

// Middleware pour les routes non trouvées
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 