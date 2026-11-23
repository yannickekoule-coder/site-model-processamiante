# Process’Amiante — modèle de démonstration (non publié)

Maquette visuelle : un **cube de confinement amiante** en 3D, animé au défilement (Three.js + GSAP ScrollTrigger).

**Ce n’est pas le site en service.** Rien n’a été mis en ligne sur processamiante.fr.

## Ouvrir

Une connexion internet est utile pour Three.js, GSAP et les polices (CDN).

```bash
cd /workspace/site-model-processamiante
python3 -m http.server 8765
```

Puis [http://localhost:8765](http://localhost:8765), ou ouvrir `index.html` dans le navigateur.

## Interactions

- Au départ : faire glisser pour faire tourner le volume.
- Défiler : montage du confinement (SS3) → mise en dépression (SS4) → traversée du sas (formation) → sas déchets (conseil) → vue éclatée puis refermeture (restitution).
- Survoler le logo du pied de page : le logo se disperse puis se reforme.

Le formulaire ne transmet aucune donnée. Pas de SIRET ni d’adresse inventés.
