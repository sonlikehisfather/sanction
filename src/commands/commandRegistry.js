const { Collection, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

const commandModules = require('./commandModules');

const botconfigModule = require('./config/botconfig');
const inviteModule = require('./invite');
const wlblModule = require('./whitelist/wlbl');
const protectUserModule = require('./owner/protectUser');
const punitionModule = require('./owner/punition');
const delPunitionModule = require('./owner/delPunition');

const { formatDuration } = require('../utils/time');
const { resolveCommandTarget } = require('./helpers/resolveCommandTarget');
const { replyCommandError } = require('./helpers/usageMessages');
const { parseUserSanctionListButtonId, buildUserSanctionListEmbed, buildUserSanctionPaginationRow } = require('../utils/userSanctionListHelpers');



const BOTCONFIG_SLASH_NAME = 'botconfig';
const INVITE_SLASH_NAME = 'invite';
const BL_ACCES_SLASH_NAME = 'bl-acces';
const PUNITION_SLASH_NAME = 'punition';
const DEL_PUNITION_SLASH_NAME = 'del-punition';

const replyGuardError = async (configService, { message, interaction }, text) => {
  const guildId = message?.guild?.id || interaction?.guild?.id;
  const payload = replyCommandError(configService, text, configService.getPrefix(guildId));
  if (interaction) {
    await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral }).catch(() => {});
  } else if (message) {
    await message.reply(payload).catch(() => {});
  }
};

const handleSlashCommand = async (module, commandName, context) => {
  if (typeof module.handleSlash !== 'function') {
    return;
  }

  try {
    await module.handleSlash(context);
  } catch (error) {
    console.error(`command error ${commandName}:`, error);

    if (!context.interaction.replied) {
      await context.interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true }).catch(() => {});
    }
  }
};

class CommandRegistry {

  constructor({ client, configService, sanctionService, permissionService, cooldownService, db }) {
    this.client = client;
    this.configService = configService;
    this.sanctionService = sanctionService;
    this.permissionService = permissionService;
    this.cooldownService = cooldownService;
    this.db = db;
    this.commandModules = Array.isArray(commandModules) ? commandModules : [];
    this.prefixCommands = new Collection();
    this.prefixGroups = new Map();
    this.registerModules();

  }



  registerModules() {
    this.prefixCommands.clear();
    this.prefixGroups.clear();

    for (const module of this.commandModules) {
      if (!module) {
        continue;
      }
      this.registerPrefixModule(module);
    }
  }



  getCommandKey(module) {
    if (!module) {
      return null;
    }

    if (module.help && module.help.key) {
      return module.help.key;
    }

    if (module.prefix && Array.isArray(module.prefix.aliases) && module.prefix.aliases.length > 0) {
      return module.prefix.aliases[0];
    }

    if (module.prefix && module.prefix.group && Array.isArray(module.prefix.group.baseAliases) && module.prefix.group.baseAliases.length > 0) {
      return module.prefix.group.baseAliases[0];
    }

    return null;
  }



  isCommandEnabledForPrefix(module) {
    const key = this.getCommandKey(module);
    if (!key) {
      return true;
    }
    return this.configService.getCommandMode(key) !== 'none';
  }



  registerPrefixModule(module) {
    if (!this.isCommandEnabledForPrefix(module)) {
      return;
    }
    const prefix = module.prefix;
    if (!prefix) {
      return;
    }
    if (Array.isArray(prefix.aliases)) {
      for (const alias of prefix.aliases) {
        if (typeof alias === 'string' && alias.trim().length > 0) {
          this.prefixCommands.set(alias.toLowerCase(), module);
        }
      }
    }
    if (prefix.group && Array.isArray(prefix.group.baseAliases)) {
      const triggers = Array.isArray(prefix.group.triggers) ? prefix.group.triggers : [];
      const entry = {
        module,
        triggers: triggers.map((token) => token.toLowerCase()),
        default: Boolean(prefix.group.default)
      };
      for (const baseAlias of prefix.group.baseAliases) {
        if (typeof baseAlias !== 'string' || baseAlias.trim().length === 0) {
          continue;
        }
        const key = baseAlias.toLowerCase();
        if (!this.prefixGroups.has(key)) {
          this.prefixGroups.set(key, []);
        }
        this.prefixGroups.get(key).push(entry);
      }
    }
  }

  getSlashCommandData() {
    const botconfigBuilder = new SlashCommandBuilder()
      .setName(BOTCONFIG_SLASH_NAME)
      .setDescription('Configuration du bot');

    const inviteBuilder = new SlashCommandBuilder()
      .setName(INVITE_SLASH_NAME)
      .setDescription('Lien d\'invitation du bot');

    const wlblBuilder = wlblModule.data;
    const protectUserBuilder = protectUserModule.data;
    const punitionBuilder = punitionModule.data;
    const delPunitionBuilder = delPunitionModule.data;

    return [botconfigBuilder.toJSON(), inviteBuilder.toJSON(), wlblBuilder.toJSON(), protectUserBuilder.toJSON(), punitionBuilder.toJSON(), delPunitionBuilder.toJSON()];
  }

  async handleSlashInteraction(interaction) {
    const context = this.createSlashContext(interaction);

    if (interaction.commandName === BOTCONFIG_SLASH_NAME) {
      await handleSlashCommand(botconfigModule, 'botconfig', context);
    } else if (interaction.commandName === INVITE_SLASH_NAME) {
      await handleSlashCommand(inviteModule, 'invite', context);
    } else if (interaction.commandName === BL_ACCES_SLASH_NAME) {
      await handleSlashCommand(wlblModule, 'bl-acces', context);
    } else if (interaction.commandName === 'protect-user') {
      await handleSlashCommand(protectUserModule, 'protect-user', context);
    } else if (interaction.commandName === PUNITION_SLASH_NAME) {
      await handleSlashCommand(punitionModule, 'punition', context);
    } else if (interaction.commandName === DEL_PUNITION_SLASH_NAME) {
      await handleSlashCommand(delPunitionModule, 'del-punition', context);
    }
  }

  async handleMessage(message) {
    if (!this.configService.arePrefixCommandsEnabled()) {
      return;
    }

    if (message.author.bot || !message.guild) {
      return;
    }

    const prefix = this.configService.getPrefix(message.guild.id);

    if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) {
      return;
    }

    if (
      this.sanctionService.isUserBlacklisted(message.guild.id, message.author.id)
      && !this.permissionService.isOwner(message.author.id)
    ) {
      await message.reply('Vous êtes blacklisté du serveur.').catch(() => {});
      return;
    }

    const withoutPrefix = message.content.slice(prefix.length).trim();

    if (!withoutPrefix) {
      return;
    }

    const tokens = withoutPrefix.split(/\s+/);
    const commandAlias = tokens.shift().toLowerCase();
    const args = tokens;

    const directModule = this.prefixCommands.get(commandAlias);

    if (directModule && typeof directModule.handlePrefix === 'function') {
      try {
        await directModule.handlePrefix(this.createPrefixContext(message, args));
      } catch (error) {
        console.error(`command error ${commandAlias}:`, error);
        await message.reply('Une erreur est survenue lors de l\'exécution de cette commande.').catch(() => {});
      }
      return;
    }

    const groupedModules = this.prefixGroups.get(commandAlias);

    if (!groupedModules || groupedModules.length === 0) {
      return;
    }

    const triggerToken = args.length > 0 ? args.shift().toLowerCase() : '';

    let entry = groupedModules.find((candidate) => candidate.triggers.includes(triggerToken));

    if (!entry) {
      entry = groupedModules.find((candidate) => candidate.default);

      if (!entry) {
        await message.reply('Sous-commande inconnue.');
        return;
      }

      if (triggerToken) {
        args.unshift(triggerToken);
      }
    }

    if (typeof entry.module.handlePrefix !== 'function') {
      return;
    }

    try {
      await entry.module.handlePrefix(this.createPrefixContext(message, args));
    } catch (error) {
      console.error(`command error ${commandAlias}:`, error);
      await message.reply('Une erreur est survenue lors de l\'exécution de cette commande.').catch(() => {});
    }

  }

  createSlashContext(interaction) {
    return {
      interaction,
      registry: this,
      sanctionService: this.sanctionService,
      permissionService: this.permissionService,
      configService: this.configService,
      cooldownService: this.cooldownService,
      db: this.db,
      client: this.client
    };
  }

  createPrefixContext(message, args) {
    return {
      message,
      args,
      registry: this,
      sanctionService: this.sanctionService,
      permissionService: this.permissionService,
      configService: this.configService,
      cooldownService: this.cooldownService,
      db: this.db,
      client: this.client
    };
  }



  async runActionWithGuards({ actionKey, commandKey, executorMember, interaction, message, reason, durationMs, skipLimits = false }) {

    if (!actionKey) {

      return { blocked: false };

    }



    if (!executorMember) {
      await replyGuardError(this.configService, { message, interaction }, 'Impossible de déterminer le membre exécutant');
      return { blocked: true };
    }

    if (this.permissionService.isOwner(executorMember.id)) {
      return { blocked: false, ownerBypass: true };
    }

    const allowed = await this.permissionService.canExecute(executorMember, actionKey);

    if (!allowed || (allowed && !allowed.allowed)) {
      if (allowed && allowed.reason === 'punished') {
        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
          .setColor(this.configService.getColor())
          .setDescription('✗ Vous êtes puni. Vous ne pouvez pas utiliser cette commande.')
          .setFooter({ text: this.configService.get('footer') });
        
        if (message) {
          await message.reply({ embeds: [embed] });
        } else if (interaction) {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      } else {
        await replyGuardError(
          this.configService,
          { message, interaction },
          "Vous n'avez pas la permission d'exécuter cette action"
        );
      }
      return { blocked: true };
    }

    const actionConfig = this.permissionService.getActionConfig(actionKey);

    if (!skipLimits) {
      const guildId = executorMember.guild.id;
      const whitelistLimits = this.permissionService.getWhitelistedUserLimits(guildId, executorMember, actionKey);

      const cooldownMs = whitelistLimits?.cooldownMs ?? actionConfig.cooldownMs;
      const dailyLimit = whitelistLimits?.dailyLimit ?? actionConfig.dailyLimit;

      const cooldownResult = this.cooldownService.checkAndConsume(actionKey, executorMember.id, {

        cooldownMs,

        dailyLimit,

        limitWindowSeconds: actionConfig.limitWindowSeconds

      });



      if (!cooldownResult.allowed) {

        const retryAfter = cooldownResult.retryAfter

          ? formatDuration(cooldownResult.retryAfter)

          : 'plus tard';

        const reply = cooldownResult.limitReached

          ? `Limite quotidienne atteinte. Réessayez dans ${retryAfter}`

          : `Action en cooldown. Réessayez dans ${retryAfter}`;

        await replyGuardError(this.configService, { message, interaction }, reply);
        return { blocked: true };
      }
    }

    const shouldRequireReason = this.configService.isReasonRequired(commandKey);

    const bypassRoleIds = commandKey ? this.configService.getCommandReasonBypassRoles(commandKey) : [];

    const bypassed = bypassRoleIds.length > 0

      && executorMember.roles?.cache?.some((role) => bypassRoleIds.includes(role.id));



    if (shouldRequireReason && !bypassed) {

      const hasReason = typeof reason === 'string' && reason.trim().length > 0;

      if (!hasReason) {
        await replyGuardError(this.configService, { message, interaction }, 'Raison manquante');
        return { blocked: true };
      }

    }



    return { blocked: false, actionConfig };

  }



  async ensureOwnerPermissions(member) {

    if (!member) {

      return false;

    }

    if (this.permissionService.isOwner(member.id)) {

      return true;

    }

    return member.permissions.has(PermissionFlagsBits.Administrator);

  }



  async registerSlashCommands() {

    const token = this.configService.get('token');
    const clientId = this.configService.get('clientId');
    const guildId = this.configService.get('guildId');

    console.log(`[Startup] Register slash commands - guildId: ${guildId}, clientId: ${clientId ? 'OK' : 'MISSING'}`);

    if (!clientId) {
      console.warn('clientId non défini; enregistrement de /botconfig ignoré.');
      return;
    }

    if (!token || token.startsWith('REPLACE')) {
      console.warn('Token Discord invalide; enregistrement de /botconfig ignoré.');
      return;
    }

    const rest = new REST({ version: '10' }).setToken(token);
    const commandsData = this.getSlashCommandData();

    console.log(`[Startup] Deploying ${commandsData.length} commands...`);

    try {
      if (guildId) {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsData });
        console.log(`[Startup] Successfully registered ${commandsData.length} commands to guild ${guildId}`);
      } else {
        await rest.put(Routes.applicationCommands(clientId), { body: commandsData });
        console.log(`[Startup] Successfully registered ${commandsData.length} commands globally`);
      }
    } catch (error) {
      console.error('[Startup] Register error:', error.message);
    }
  }

  async registerSlashCommandsForGuild(guildId) {
    const token = this.configService.get('token');
    const clientId = this.configService.get('clientId');

    if (!clientId || !token || token.startsWith('REPLACE')) {
      throw new Error('ClientId ou Token invalide');
    }

    const rest = new REST({ version: '10' }).setToken(token);
    const commandsData = this.getSlashCommandData();

    try {
      console.log(`[Deploy] Starting deployment for guild ${guildId}...`);
      console.log(`[Deploy] ClientId: ${clientId}, Commands: ${commandsData.length}`);
      
      // Timeout de 15 secondes pour l'appel API
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      // Le PUT remplace automatiquement toutes les commandes existantes
      const result = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { 
        body: commandsData,
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      console.log(`[Deploy] Success! Deployed ${result.length} commands`);
      return { success: true, count: commandsData.length };
    } catch (error) {
      console.error(`[Deploy] Error :`, error.message, error.code);
      throw new Error(`Erreur d'enregistrement: ${error.message}`);
    }
  }



  async resolveCommandTarget(message, args, options) {
    return resolveCommandTarget(message, args, this, options);
  }

  extractUserId(token) {

    if (!token) {

      return null;

    }

    const match = token.match(/^(?:<@!?(\d+)>|(\d+))$/);

    if (!match) {

      return null;

    }

    return match[1] || match[2] || null;

  }



  extractRoleId(token) {

    if (!token) {

      return null;

    }

    const match = token.match(/^(?:<@&(\d+)>|(\d+))$/);

    if (!match) {

      return null;

    }

    return match[1] || match[2] || null;

  }

}



module.exports = { CommandRegistry };

