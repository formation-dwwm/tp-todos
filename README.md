# TP: Todos REST

## API

### Quick-Start

Clonez le repository, puis pensez à effectuer un `npm install` afin de récupérer les dépendances.

Vous pourrez ensuite démarrer le serveur avec la commande `npm run server:start`, celui-ci communique en http sur le port 3000.

L'adresse de votre serveur sera donc `http://localhost:3000`;

### Description

L'API fournie est une API REST, proposant une unique collection de `todos`.

L'URI de base de l'API est `<domain>/api/v1/`.

Un Todo a le schéma suivant :
```typescript
interface Todo {
    id: number;
    title: string;
    content: string;
    done: boolean;
    createdAt: Date;
}
```

### Résumé

**`/api/v1/todos`**

**GET** Récupérer la liste des Todos (deux options get: limit et offset)
**POST** Créer un Todo avec les options fournies: title & content dans un objet JSON

**`/api/v1/todos/1`**

**GET** Récupère informations du Todo avec id=1  
**PATCH** Met à jour le Todo avec id=1 avec les champs fournis: title & content & done dans un objet JSON 
**DELETE** Supprime le Todo avec id=1  

**Forme des réponses**  
Si succès:  
Liste des todos -> [{Todos}]  
Un Todo -> voir schéma  
PATCH et DELETE -> { success: true }  

Si erreur:  
{ error: string }

## Application Client

Réaliser le côté Front-End d'une Application Web de gestion des tâches en vous basant sur l'API proposée.

### Technologie, Architecture et Instructions

Aucune technologie n'est imposée, choisissez la plus pertinente d'après le besoin et vos compétences. Celle-ci peut être en Web 1.0 ou 2.0, SSR ou SPA, ...  
Il en va de même pour l'architecture et la structure du code à adopter. Une seule consigne pour cette dernière toutefois, l'objectif principal doit être la maintenabilité.  
Pensez donc à utiliser un code structuré, à séparer les responsabilités, à utiliser des noms de fonctions et variables choisis avec soin, et ne pas hésiter à placer des commentaires...

### Travail à réaliser

L'application doit présenter au minimum trois interfaces à l'utilisateur, selon les modalités de votre choix :
- Accès à la liste des Todos
- Accès aux détails d'un Todo
- Création/Modification/Suppression d'un Todo

#### Elements demandés

**Make it real**  
Concevoir et développer l'application client avec les trois interfaces demandées.

**Todo or not to do**  
Le statut "terminé" des Todos doit pouvoir être modifié depuis la liste des todos comme depuis les details de l'un. De la même façon il doit pouvoir être modifié et supprimé au moins depuis les détails.

**What's in the box**  
Cliquer sur le titre d'un Todo depuis la liste doit afficher les détails de celui-ci.

**Come as you are**  
Afin d'être utilisable par le plus grand nombre, l'application web devra être adaptable (responsive), et au minimum suivre les critères d'accessibilité immédiats (WCAG level A).

#### [Bonus]

**Filtrage**  
Proposer à l'utilisateur une interface claire sur la liste des posts afin de filtrer ceux-ci selon leur statut (afficher tout, n'afficher que les terminés, n'afficher que les en cours).

**Too many things to do**  
Gérer gracieusement les cas où trop de Todos sont enregistrés pour être tous chargés par défaut: pagination, infinite scroll, "Charger plus"...

**My String is Rich...**  
La description d'un Todo (le champ `content`) profiterait à pouvoir être du texte riche (gras, italique, images, liens, ...). Mettre en place un système permettant d'interpréter ce contenu pour le transformer en HTML valide. Un bon format pourrait être le Markdown.

**...But my Users are Poor**  
Si vous avez mis en place un format de contenu riche (cf bonus précédent), une élément de sympathie pour nos utilisateurs pourrait être de leur fournir un éditeur graphique.

**Accepter, Suivant, Suivant**  
Rendre l'application installable: PWA ou appli mobile hybride par exemple.