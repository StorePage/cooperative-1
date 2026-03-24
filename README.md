# Template Site E-commerce / Vitrine — Guide de Personnalisation

## Structure des fichiers

```
/
├── index.html          ← Page d'accueil (Hero + Produits phares + CTA)
├── produits.html       ← Catalogue avec filtre par catégorie
├── livraison.html      ← Modes et zones de livraison
├── apropos.html        ← Histoire, équipe, adresses
├── contact.html        ← Formulaire WhatsApp + coordonnées
├── cgv.html            ← Conditions Générales de Vente
├── application.html    ← Page téléchargement APK Android
├── style.css           ← Feuille de style partagée (système de design)
├── main.js             ← JavaScript partagé (nav, filtres, form)
└── images/
    ├── logo.png        ← Logo principal (rond, 150×150 min)
    ├── pre_logo.png    ← Logo secondaire/partenaire (optionnel)
    ├── honey.jpg       ← Image pour catégorie 1
    ├── amlou.jpg       ← Image pour catégorie 2
    └── oil.jpg         ← Image pour catégorie 3
```

---

## Personnalisation rapide

### 1. Informations de base (toutes les pages)
Rechercher et remplacer dans tous les fichiers HTML :
- `Nom de l'Entreprise` → Nom réel
- `Produits Naturels · Région` → Slogan réel
- `www.nom-entreprise.com` → URL réelle
- `contact@entreprise.com` → Email réel
- `+XX XXX XXX XXX` → Numéro réel
- `Adresse complète, Ville` → Adresse réelle
- `[Année]` → Année de création

### 2. Numéro WhatsApp (main.js, ligne ~46)
```js
const WHATSAPP_NUMBER = '212600000000'; // Remplacer par le vrai numéro
```

### 3. Liens réseaux sociaux (footer + index.html)
Remplacer les `href="#"` par les vrais liens Facebook, Instagram, YouTube, WhatsApp.

### 4. Produits (produits.html)
- Remplacer les noms/descriptions des produits
- Adapter les catégories dans `.filter-btn[data-filter]`
- Adapter `data-category` sur chaque `.product-card`
- Remplacer les prix `XX MAD` par les vrais prix

### 5. Couleurs (style.css, lignes 1-30)
```css
:root {
    --color-green:       #2a6a47;  /* Couleur principale */
    --color-gold:        #b8832a;  /* Couleur accent */
    --color-cream:       #faf8f3;  /* Fond général */
    /* ... */
}
```

### 6. Typographie (style.css)
```css
--font-display: 'Playfair Display', serif; /* Titres */
--font-body:    'Jost', sans-serif;        /* Corps */
```
Modifier également les imports Google Fonts dans le `<head>` de chaque page.

### 7. Lien de téléchargement APK (application.html)
```html
<a href="LIEN_APK_ICI" class="btn btn--primary" download>
```

### 8. CGV (cgv.html)
Compléter toutes les zones `[À compléter]` avec les informations juridiques réelles.

---

## Fonctionnalités JavaScript incluses

| Fonctionnalité | Description |
|---|---|
| Menu mobile | Hamburger responsive avec animation |
| Filtres produits | Filtrage par catégorie côté client |
| Animations scroll | Apparition progressive des éléments |
| Formulaire WhatsApp | Génère un message formaté et ouvre WhatsApp |

---

## Points d'amélioration suggérés pour un client

1. **Panier d'achat** — Intégration d'une solution e-commerce (Shopify, WooCommerce, Snipcart)
2. **Paiement en ligne** — Connexion à une passerelle de paiement (Stripe, PayPal, CMI)
3. **CMS** — Gestion de contenu sans code (WordPress, Webflow)
4. **SEO** — Ajout de balises meta, Schema.org, sitemap.xml
5. **Analytics** — Google Analytics / Plausible
6. **Multilingue** — Version arabe / anglaise

---

*Template conçu pour démonstration — 100 % générique et adaptable.*
Ce projet est sous licence  – interdit d’utilisation et de modification.

## 👥 Auteur

Coopérative Al Hikma – Taliouine, Maroc  
Contact : `hicham.gr90@gmail.com` Tel +212 6 33 54 86 05 
