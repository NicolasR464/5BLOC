## Contexte

Les innovations technologiques liées à la blockchain permettent de décentraliser la gestion et la validation de nombreuses interactions économiques et sociales.  
Ce projet invite les étudiants à imaginer une application pratique tirant parti des principes du Web3.

**Votre mission :**  
Concevoir une DApp innovante répondant à un cas d’usage que vous définirez vous-mêmes.  
Celui-ci doit toutefois intégrer des contraintes métiers précises pour guider la conception technique.

---

## Objectifs

Par groupe de **2 à 3 étudiants** :

- Définir un cas d'usage justifiant l'utilisation de la blockchain  
  _(exemples : gestion décentralisée d'actifs numériques, jeu compétitif avec tokenisation, système de récompenses décentralisé, etc.)_
- Développer une DApp permettant d’interagir avec ces actifs numériques selon des règles métiers claires.
- Respecter les contraintes techniques suivantes.

---

## Contraintes techniques et fonctionnelles

Vous pourrez choisir la blockchain de votre choix : **Ethereum** ou **Solana**.

### 1. Tokenisation des ressources

- Les ressources manipulées doivent être représentées sous forme de tokens.
- Elles doivent posséder différents niveaux ou catégories  
  _(exemple : "maison", "gare", "hôtel" dans Monopoly)_.

### 2. Échanges de tokens

- Implémentation d'un mécanisme d'échange de tokens entre utilisateurs.
- Définition de règles précises pour valider les transactions  
  _(exemple : conversion entre types de tokens)_.

### 3. Limites de possession

- Chaque utilisateur ne peut posséder qu'un nombre limité de ressources  
  _(exemple : maximum de 4 ressources)_.

### 4. Contraintes temporelles

- **Cooldown** : délai défini entre deux transactions successives  
  _(exemple : 5 minutes)_.
- **Lock temporaire** après une action critique  
  _(exemple : 10 minutes après une acquisition)_.

### 5. Utilisation d’IPFS

- Les métadonnées des ressources (documents numériques, images, etc.) doivent être stockées sur **IPFS**.

### 6. Tests unitaires avec Hardhat ou Anchor

- L'ensemble des smart contracts doit être testé avec une couverture significative.
- Utilisation obligatoire de **Hardhat** (Ethereum) ou **Anchor** (Solana).

---

## Format des métadonnées

Les tokens doivent contenir au minimum les informations suivantes :

```json
{
    "name": "Nom de la ressource",
    "type": "Type de ressource (défini par votre cas d'usage)",
    "value": "Valeur associée à la ressource",
    "hash": "Hash IPFS du document lié",
    "previousOwners": ["Liste des adresses des anciens propriétaires"],
    "createdAt": "Timestamp de création",
    "lastTransferAt": "Timestamp du dernier transfert"
    // ... vos autres attributs
}
```

## Livrables

- Définition du cas d’usage choisi (document de présentation).
- Code source de la DApp (incluant smart contracts).
- Tests unitaires réalisés avec Hardhat ou Anchor.
- Rapport technique expliquant les choix de conception et le respect des contraintes métiers.
