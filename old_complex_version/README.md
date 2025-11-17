# Ancienne version complexe

Ce dossier contient l'ancienne version complexe de l'application avec tous les fichiers qui ont été supprimés lors de la simplification.

## Fichiers archivés

- `ConfigurationService.js` - Service de configuration avec injection de dépendances
- `DataManager.js` - Gestionnaire de données complexe avec cache LRU et optimisations
- `ErrorHandler.js` - Système de gestion d'erreurs élaboré
- `ErrorNotification.js` - Notifications d'erreur dans l'UI
- `EventBus.js` - Pattern Publisher/Subscriber pour la communication entre modules
- `EventHandler.js` - Gestionnaire d'événements (créait des boucles infinies)
- `MapRenderer.js` - Rendu de carte séparé
- `UIController.js` - Contrôleur d'interface utilisateur séparé
- `constants.js` - Constantes centralisées
- `utils.js` - Fonctions utilitaires
- `validators.js` - Validation de données
- `config.js` - Configuration globale
- `sw.js` - Service Worker pour le cache offline

## Raison de l'archivage

Ces fichiers créaient une architecture trop complexe pour les besoins réels de l'application:
- 13 classes interconnectées
- ~3000 lignes de code
- Bugs causés par la complexité (boucles d'événements, callbacks manquants)
- Difficile à maintenir et débugger

## Nouvelle version

La nouvelle version simplifiée contient tout dans un seul fichier `app.js` avec:
- 1 classe simple
- ~400 lignes de code
- Toutes les fonctionnalités essentielles
- Facile à comprendre et maintenir
- **Tous les bugs corrigés**

## Restauration

Si vous souhaitez restaurer l'ancienne version, déplacez simplement ces fichiers dans leurs emplacements d'origine et restaurez l'ancien `index.html` et `app.js` depuis Git.
