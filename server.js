const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy sécurisé vers l'API Groq (100% gratuit, sans carte bancaire)
// La clé API reste côté serveur, jamais exposée au navigateur
app.post('/api/generate', async (req, res) => {
  const { plant } = req.body;

  if (!plant || plant.trim().length < 2) {
    return res.status(400).json({ error: 'Nom de plante invalide.' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Clé API Groq non configurée sur le serveur.' });
  }

  const systemPrompt = `Tu es un expert botaniste, nutritionniste et ethnopharmacologue spécialisé en pharmacopée africaine. Tu génères des fiches JSON structurées et rigoureuses. Ne génère AUCUN texte en dehors du JSON. Réponds UNIQUEMENT avec un objet JSON valide, sans balises markdown, sans commentaires, sans texte avant ou après le JSON.`;

  const userPrompt = `Génère une fiche complète pour : ${plant.trim()}

Respecte EXACTEMENT cette structure JSON :
{
  "identification": {
    "nom_commun": "Nom usuel principal",
    "noms_locaux_africains": [{"langue_ethnie": "ex: Yoruba / Fon / Wolof", "nom": "Nom local"}],
    "nom_scientifique": "Genre species",
    "famille_botanique": "Nom de la famille",
    "categorie": "Fruit | Légume | Tubercule | Herbe / Plante médicinale | Épice | Racine",
    "origine_geographique": ["Régions ou pays"]
  },
  "apports_nutritionnels": {
    "valeur_energetique_100g": "X kcal",
    "macronutriments": {"glucides": "X g","proteines": "X g","lipides": "X g","fibres": "X g"},
    "micronutriments_cles": ["Vitamines et minéraux clés"],
    "profil_glycemique": "Faible | Moyen | Élevé"
  },
  "vertus_et_usages_medecine_africaine": {
    "proprietes_therapeutiques": ["Propriété 1","Propriété 2"],
    "maladies_et_maux_traites": ["Affections ciblées"],
    "organes_utilises": ["Feuilles","Écorce","Racines","Graines","Fruits"],
    "modes_de_preparation_traditionnels": [{"forme": "Décoction | Infusion | Poultice | Macération","recette_usage": "Description précise","partie_utilisee": "Partie de la plante"}],
    "precautions_et_contre_indications": ["Précautions importantes"]
  },
  "communaute_et_evaluation": {
    "note_moyenne": "4.5",
    "nombre_avis": "247",
    "criteres_d_evaluation": ["Efficacité ressentie (1 à 5)","Facilité de préparation (1 à 5)","Goût / Appétabilité (1 à 5)"],
    "temoignages_types": [{"utilisateur": "Pseudonyme","origine": "Pays africain","note": 5,"commentaire": "Témoignage réaliste sur l'usage."}]
  }
}

Mets l'accent sur les savoirs ancestraux d'Afrique de l'Ouest, Centrale, Orientale, Australe et du Nord. Inclus les noms vernaculaires authentiques dans au moins 4 langues africaines différentes. Sois précis sur les préparations traditionnelles.`;

  try {
    // Groq utilise une API 100% compatible OpenAI
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',  // Modèle gratuit le plus puissant de Groq
        max_tokens: 2000,
        temperature: 0.3,                   // Faible température = JSON plus fiable et précis
        response_format: { type: 'json_object' }, // Force la sortie JSON pure
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Erreur API Groq: ${err}` });
    }

    const data = await response.json();

    // Format OpenAI : data.choices[0].message.content
    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({ success: true, data: parsed });

  } catch (err) {
    console.error('Erreur génération fiche:', err.message);
    res.status(500).json({ error: 'Erreur lors de la génération. Réessayez.' });
  }
});

// Toutes les routes inconnues renvoient l'app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Pharmacopée Africaine - Serveur démarré sur le port ${PORT}`);
});
