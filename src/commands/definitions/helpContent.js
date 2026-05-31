const helpCategories = {
  sanctions: {
    id: 'sanctions',
    label: 'Sanctions',
    description: 'Appliquer les sanctions',
  },
  revocations: {
    id: 'revocations',
    label: 'Levées de sanction',
    description: 'Lever une sanction',
  },
  history: {
    id: 'history',
    label: 'Historique',
    description: 'Consulter les sanctions',
  },
  owners: {
    id: 'owners',
    label: 'Owners',
    description: 'Gérer les owners',
  },
  config: {
    id: 'config',
    label: 'Configuration',
    description: 'Adapter les paramètres du bot',
  },
  assistance: {
    id: 'assistance',
    label: 'Assistance',
    description: 'Commandes utilitaires',
  }
};

const helpEntries = {
  ban: {
    key: 'ban',
    label: 'Ban',
    category: 'sanctions',
    description: 'Ban un membre',
    usage: {
      prefix: '&ban @utilisateur [durée] <raison>'
    },
    examples: {
      prefix: '&ban @Toto 24h Spam massif'
    },
    notes: [
      'Sans durée = ban permanent. Avec durée = unban automatique à l\'expiration.',
      'Formats durée : 60s (secondes), 30m (minutes), 24h (heures), 7j (jours).'
    ]
  },
  kick: {
    key: 'kick',
    label: 'Kick',
    category: 'sanctions',
    description: 'Kick un membre du serveur',
    usage: {
      prefix: '&kick @utilisateur <raison>'
    },
    examples: {
      prefix: '&kick @Leia Provocations répétées'
    },
    notes: [
      'Le membre doit encore être présent sur le serveur et être expulsable.',
      'La raison est obligatoire si l\'option enforceReason est active.'
    ]
  },
  unban: {
    key: 'unban',
    label: 'Unban',
    category: 'revocations',
    description: 'Débannit un membre',
    usage: {
      prefix: '&unban @utilisateur'
    },
    examples: {
      prefix: '&unban @Kira'
    },
    notes: [
      'Aucune raison requise ni affichée.',
      'Débannit sur Discord. Si la personne est blacklistée, elle reste en BL et sera re-bannie à la prochaine arrivée.',
      'Seul /unblacklist retire une blacklist.'
    ]
  },
  warn: {
    key: 'warn',
    label: 'Warn',
    category: 'sanctions',
    description: 'Avertir un membre',
    usage: {
      prefix: '&warn @utilisateur'
    },
    examples: {
      prefix: '-warn @Jay'
    },
    notes: ['Catégorie → motif : la sanction est appliquée immédiatement, sans saisie supplémentaire.']
  },
  mute: {
    key: 'mute',
    label: 'Mute',
    category: 'sanctions',
    description: 'Mute un membre (timeout Discord)',
    usage: {
      prefix: '&mute @utilisateur [durée] <raison>'
    },
    examples: {
      prefix: '&mute @Noé 30m Spam emoji'
    },
    notes: [
      'Sans durée, applique la durée maximale autorisée par Discord (28 jours).'
    ]
  },
  tempmute: {
    key: 'tempmute',
    label: 'TempMute',
    category: 'sanctions',
    description: 'Mute temporaire avec rôle',
    usage: {
      prefix: '&tempmute @utilisateur'
    },
    examples: {
      prefix: '&tempmute @Noa'
    },
    notes: ['Catégorie → durée : la sanction est appliquée immédiatement, sans saisie supplémentaire.', 'Utilise le rôle Mute, pas le timeout Discord.']
  },
  unmute: {
    key: 'unmute',
    label: 'Unmute',
    category: 'revocations',
    description: 'Retire le mute d\'un membre.',
    usage: {
      prefix: '&unmute @utilisateur'
    },
    examples: {
      prefix: '&unmute @Mina'
    },
    notes: [
      'Aucune raison requise ni affichée.',
      'Vérifie qu\'un mute actif existe avant de lever la sanction.',
      'N\'enlève pas les timeouts, utilise &unto pour ça.'
    ]
  },
  unto: {
    key: 'unto',
    label: 'Unto',
    category: 'revocations',
    description: 'Retire le timeout d\'un membre.',
    usage: {
      prefix: '&unto @utilisateur'
    },
    examples: {
      prefix: '&unto @Mina'
    },
    notes: [
      'Aucune raison requise ni affichée.',
      'Vérifie qu\'un timeout actif existe avant de lever la sanction.',
      'N\'enlève pas les mutes (rôle), utilise &unmute pour ça.'
    ]
  },
  blacklist: {
    key: 'blacklist',
    label: 'Blacklist',
    category: 'sanctions',
    description: 'Blacklist un membre',
    usage: {
      prefix: '&bl — liste paginée\n&bl <id|@user> [durée] <raison>'
    },
    examples: {
      prefix: '&bl\n&bl @Joe Récidive grave'
    },
    notes: [
      'Sans argument : affiche la liste des blacklistés (10 par page, boutons << >>).',
      'Sans durée = blacklist permanente. Avec durée = levée auto à l\'expiration.',
      'Si un Owner bot blackliste quelqu\'un, seul un Owner peut le unblacklist.',
      'Répondre à un message avec &bl ouvre la liste (ne cible pas l\'auteur).',
      'Formats durée : 60s, 30m, 24h, 7j.'
    ]
  },
  unblacklist: {
    key: 'unblacklist',
    label: 'Unblacklist',
    category: 'revocations',
    description: 'Retire la blacklist d\'un membre',
    usage: {
      prefix: '&unbl @utilisateur'
    },
    examples: {
      prefix: '&unbl @Zoé'
    },
    notes: [
      'Aucune raison requise ni affichée.',
      'Seule commande capable de lever une blacklist. Débannit du serveur.',
      'Si la blacklist a été posée par un Owner bot, seul un Owner peut la lever.'
    ]
  },
  listsanctions: {
    key: 'listsanctions',
    label: 'Liste des sanctions',
    category: 'history',
    description: 'Voir l\'historique des sanctions',
    usage: {
      prefix: '&listsanctions @utilisateur [type]'
    },
    examples: {
      prefix: '&listsanctions @Eli ban'
    },
    notes: [
      'Les Sanction ID (#1, #2, …) sont propres à chaque membre (pas globales au serveur).',
      'Affiche l\'historique complet (actives et révoquées), filtrable par type.'
    ]
  },
  owner: {
    key: 'owner',
    label: 'Owner',
    category: 'owners',
    description: 'Gérer les owners du bot',
    usage: {
      prefix: '&owner [id|@utilisateur]'
    },
    examples: {
      prefix: '&owner @Staff'
    },
    notes: ['Sans argument : liste.', 'Avec ID : ajoute ou retire (toggle).']
  },
  botconfig: {
    key: 'botconfig',
    label: 'Configuration',
    category: 'config',
    description: 'Configurer le bot',
    usage: {
      slash: '/botconfig'
    },
    notes: ['Commande slash uniquement.', 'Panneau de configuration interactif.']
  },
  clearsanctions: {
    key: 'clearsanctions',
    label: 'Clear sanctions',
    category: 'sanctions',
    description: 'Effacer toutes les sanctions d\'un membre',
    usage: {
      prefix: '&clear-sanctions @utilisateur raison'
    },
    examples: {
      prefix: '&clear-sanctions @Membre Réhabilitation'
    },
    notes: ['Efface toutes les sanctions actives de l\'utilisateur dans le serveur.', 'La raison est obligatoire.', 'Configurable via /botconfig pour les permissions.', 'Nécessite la permission sanction:clear.']
  },
  blacces: {
    key: 'blacces',
    label: 'BL Accès',
    category: 'config',
    description: 'Gérer la whitelist',
    usage: {
      slash: '/bl-acces'
    },
    notes: ['Commande slash uniquement.']
  },
  delpunition: {
    key: 'delpunition',
    label: 'Del Punition',
    category: 'sanctions',
    description: 'Retirer une punition',
    usage: {
      slash: '/del-punition'
    },
    notes: ['Commande slash uniquement.']
  },
  invite: {
    key: 'invite',
    label: 'Invite',
    category: 'assistance',
    description: 'Lien d\'invitation du bot',
    usage: {
      slash: '/invite'
    },
    notes: ['Commande slash uniquement.', 'Réservée aux owners.']
  },
  protectuser: {
    key: 'protectuser',
    label: 'Protect User',
    category: 'owners',
    description: 'Protéger un utilisateur',
    usage: {
      slash: '/protect-user'
    },
    notes: ['Commande slash uniquement.', 'Réservée aux owners.']
  },
  punition: {
    key: 'punition',
    label: 'Punition',
    category: 'sanctions',
    description: 'Punir un utilisateur',
    usage: {
      slash: '/punition'
    },
    notes: ['Commande slash uniquement.']
  },
  help: {
    key: 'help',
    label: 'Help',
    category: 'assistance',
    description: 'Menu d\'aide des commandes',
    usage: {
      prefix: '&help'
    },
    examples: {
      prefix: '&help'
    },
    notes: [
      'Utilise un menu déroulant pour naviguer entre les catégories de commandes.',
      'Affiche des exemples concrets pour chaque commande.'
    ]
  }
};

module.exports = {
  helpCategories,
  helpEntries
};
