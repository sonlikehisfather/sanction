# Sanction Bot

Bot de modération Discord avec gestion complète des sanctions, supportant les commandes slash et préfixe.

## Configuration

Crée un fichier `.env` à la racine du projet avec les valeurs suivantes :

```env
DISCORD_TOKEN=        # Token du bot Discord
CLIENT_ID=            # ID de l'application (Discord Developer Portal)
GUILD_ID=             # ID du serveur (optionnel, restreint les slash commands à ce serveur)
OWNER_ID=             # ID du owner principal
PREFIX=-              # Préfixe des commandes texte (défaut : -)
COLOR=#01081f         # Couleur des embeds (hex)
FOOTER=               # Texte du footer des embeds
ENABLE_PREFIX_COMMANDS=true   # Activer les commandes préfixe
ENFORCE_REASON=true           # Forcer la saisie d'une raison
```

## Installation

```powershell
npm install
```

> **Note :** `better-sqlite3` nécessite les outils de build C++ sur Windows.
> - Node.js 20 LTS recommandé.
> - Installer le workload "Desktop development with C++" depuis Visual Studio Build Tools si nécessaire.

## Démarrage

```powershell
npm run start
```

Mode développement (rechargement automatique) :

```powershell
npm run dev
```

Enregistrer les slash commands après modification :

```powershell
npm run register:slash
```

## Fonctionnalités

- **Sanctions** : Ban, kick, tempban, mute, tempmute, warn, blacklist, tempblacklist.
- **Levées** : Unban, unmute, unblacklist enregistrés en base.
- **Historique** : Historique des sanctions par membre, filtrable par type.
- **Stockage** : SQLite — auteur, cible, raison, timestamps, durée, statut.
- **Owners** : Ajout/suppression/liste des owners avec un owner principal désigné.
- **Configuration** : Rôles autorisés, cooldowns et limites journalières via `/botconfig`.
- **Expiration** : Levée automatique des sanctions temporaires (scan toutes les 60 secondes).
- **Détection de comptes alternatifs** : Ban automatique si un utilisateur blacklisté rejoint avec un autre compte.
- **Menus contextuels** : Les bans via clic droit sont enregistrés en base.
- **Système de punition** : `/punition` bloque temporairement un utilisateur des commandes de sanction.
- **Pagination** : Listes paginées avec boutons de navigation.
- **Utilisateurs protégés** : Impossible de bannir/blacklister un utilisateur protégé sans lever la protection.

## Commandes

> Le préfixe par défaut est `-`. Il est modifiable via `-setprefix` ou dans le `.env`.

### Sanctions (Préfixe)

| Commande | Description |
|---|---|
| `-ban <@user> [durée] [raison]` | Bannir un membre |
| `-unban <@user>` | Débannir un membre |
| `-blacklist <@user> [durée] [raison]` | Blacklister un membre |
| `-bl <@user> [durée] [raison]` | Alias blacklist |
| `-unblacklist <@user>` | Retirer la blacklist |
| `-warn <@user>` | Avertir un membre (menu catégorie → motif) |
| `-mute <@user> [durée] [raison]` | Mute Discord (timeout) |
| `-to <@user> [durée] [raison]` | Alias mute |
| `-tempmute <@user>` | Mute temporaire avec rôle (menu catégorie → durée) |
| `-unmute <@user>` | Retirer le mute (rôle) |
| `-unto <@user>` | Retirer le timeout Discord |
| `-clear-sanctions <@user> <raison>` | Effacer toutes les sanctions d'un membre |

### Historique (Préfixe)

| Commande | Description |
|---|---|
| `-listsanctions <@user> [type]` | Historique des sanctions d'un membre |
| `-sanctions` / `-sanction` / `-list` | Aliases listsanctions |
| `-infosanction <id> <@user>` | Détails d'une sanction par son ID membre |
| `-sanctioninfo` / `-sinfo` | Aliases infosanction |
| `-baninfo <@user>` | Infos sur le ban actif d'un membre |
| `-banuser [@user]` | Bans posés par un modérateur |
| `-blinfo <@user>` | Infos sur la blacklist active d'un membre |
| `-bluser [@user]` | Blacklists posées par un modérateur |

### Owners (Préfixe)

| Commande | Description |
|---|---|
| `-owner [@user]` | Lister les owners ou toggler le statut owner |
| `-setprefix <préfixe>` | Changer le préfixe (owner principal uniquement) |
| `-setcolor <#hex>` | Changer la couleur des embeds (owner principal uniquement) |
| `-help` | Menu d'aide interactif (owners uniquement) |

### Slash Commands

| Commande | Description |
|---|---|
| `/botconfig` | Panneau de configuration interactif (owners) |
| `/invite` | Lien d'invitation du bot (owner principal) |
| `/bl-acces` | Gérer la whitelist d'accès |
| `/punition` | Restreindre temporairement un utilisateur |
| `/del-punition` | Retirer une punition |
| `/protect-user` | Protéger un utilisateur contre les sanctions |

## Base de données

Le fichier SQLite est créé automatiquement à `data/sanctions.sqlite`. Sauvegarde ce fichier pour conserver l'historique des sanctions.
