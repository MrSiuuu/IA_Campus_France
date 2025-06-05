const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'API Campus France en ligne' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = process.env.PORT || 3000;

// Démarrage du serveur avec gestion d'erreur
try {
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });
} catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
} 