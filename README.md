# 🌿 Pharmacopée Africaine — SaaS

Plateforme de référence sur la flore médicinale africaine, la nutrition et la pharmacopée traditionnelle.

## Stack technique
- **Backend** : Node.js + Express (proxy sécurisé vers l'API Groq)
- **Frontend** : HTML/CSS/JS vanille (aucun framework requis)
- **IA** : Llama 3.3 70B via l'API Groq (100% gratuit, sans carte bancaire)
- **Hébergement** : Render (free tier)

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/VOTRE_USER/pharmacopee-africaine.git
cd pharmacopee-africaine

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env
cp .env.example .env
# Renseignez ANTHROPIC_API_KEY dans .env

# 4. Lancer le serveur
npm start
# → http://localhost:3000
```

## Déploiement sur Render

1. Pusher ce repo sur GitHub
2. Créer un nouveau **Web Service** sur render.com
3. Connecter le repo GitHub
4. Configurer :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Environment Variable** : `GROQ_API_KEY=gsk_...` (obtenez-la sur console.groq.com)
5. Deploy !

## Structure du projet

```
pharmacopee-africaine/
├── server.js          # Serveur Express + proxy API Anthropic
├── package.json       # Dépendances Node.js
├── .env.example       # Template variables d'environnement
├── .gitignore         # Exclut node_modules et .env
├── README.md
└── public/
    └── index.html     # Application frontend complète
```
