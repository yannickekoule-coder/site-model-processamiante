# Process’Amiante — modèle de démonstration (non publié)

Maquette visuelle inspirée d’un site en 3D au défilement (scrollytelling).  
**Ce n’est pas le site en service.** Aucune mise en ligne n’a été faite. Les fichiers du site actuel n’ont pas été écrasés.

## Ouvrir le modèle

Une connexion internet est utile pour charger Three.js, GSAP et les polices (CDN).

**Option 1 — fichier local**

Ouvrir dans le navigateur :

`/workspace/site-model-processamiante/index.html`

**Option 2 — petit serveur local (recommandé)**

```bash
cd /workspace/site-model-processamiante
python3 -m http.server 8765
```

Puis ouvrir [http://localhost:8765](http://localhost:8765).

## Interactions

- Au hero : faire glisser pour faire tourner le nuage de points.
- Défiler pour suivre le caisson de confinement : chantier → transport → traitement (la caméra passe d’une vue de côté à une vue de dessus).
- Survoler les cartes Services : particules or / cyan.
- Survoler le logo du pied de page : le logo se disperse puis se reforme.

## Contenu

Textes repris du site Process’Amiante (conseil, AMO, sensibilisation, formation non certifiante, SS3 / SS4).  
Pas de SIRET ni d’adresse inventés. Le formulaire ne transmet aucune donnée.
