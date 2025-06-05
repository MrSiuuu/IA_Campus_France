const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Configuration Supabase manquante. Vérifiez votre fichier .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);



// Vérification de la connexion
supabase.auth.getSession()
    .then(({ data, error }) => {
        if (error) {
            console.error('Erreur de connexion à Supabase:', error.message);
        } else {
            console.log('Connexion à Supabase établie avec succès');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la vérification de la connexion Supabase:', error);
    });

module.exports = supabase; 