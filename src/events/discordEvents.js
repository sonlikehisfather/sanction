const { Events } = require('discord.js');
const { handleGuildMemberAdd } = require('./guildMemberAdd');
const { sendAllNotifications } = require('../utils/termsOfUseNotifier');
const { SANCTION_CHECK_INTERVAL } = require('../constants');
const { setupOwnerPingEvent } = require('./ownerPingEvent');

const setupDiscordEvents = (client, db, sanctionService, configService, commandRegistry, setSchedulerHandle) => {
  
  setupOwnerPingEvent(client, configService, commandRegistry);

  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      await handleGuildMemberAdd(member, sanctionService, db);
    } catch (error) {
      console.error('member add error:', error);
    }
  });

  client.on(Events.GuildBanAdd, async (ban) => {
    try {
      const guild = ban.guild;
      const targetUser = ban.user;

      let banReason = 'Raison non spécifiée';
      try {
        const banFetch = await guild.bans.fetch(targetUser.id);
        if (banFetch && banFetch.reason) {
          banReason = banFetch.reason;
        }
      } catch (error) {
        console.error('ban reason error:', error);
      }

      const existingBan = db.findActiveSanction(guild.id, targetUser.id, ['BAN', 'TEMPBAN']);
      if (existingBan) {
        if (!existingBan.metadata) {
          db.db.prepare('UPDATE sanctions SET metadata = ? WHERE id = ?').run(JSON.stringify({ source: 'context_menu' }), existingBan.id);
        }
        return;
      }

      db.recordSanction({
        guildId: guild.id,
        type: 'BAN',
        targetId: targetUser.id,
        targetTag: targetUser.tag,
        executorId: guild.ownerId || 'SYSTEM',
        executorTag: 'System',
        reason: banReason,
        createdAt: Date.now(),
        metadata: JSON.stringify({ source: 'context_menu' })
      });

      console.log(`ban ${targetUser.id}`);
    } catch (error) {
      console.error('ban add error:', error);
    }
  });

  client.on(Events.MessageCreate, async (message) => {
    try {
      await commandRegistry.handleMessage(message);
    } catch (error) {
      console.error('command error:', error);
    }
  });

  const printStartupBanner = () => {
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const reset = '\x1b[0m';
    const dim = '\x1b[2m';
    const bold = '\x1b[1m';

    const box = {
      tl: '┌', tr: '┐', bl: '└', br: '┘',
      h: '─', v: '│', ml: '├', mr: '┤', mm: '┼'
    };

    const tag = client.user?.tag || 'Bot';
    const guilds = client.guilds?.cache?.size || 0;
    const members = client.guilds?.cache?.reduce((acc, g) => acc + (g.memberCount || 0), 0) || 0;
    const latency = client.ws?.ping || '-';

    const prefixCmdCount = commandRegistry?.prefixCommands?.size || 0;
    const slashCmdCount = commandRegistry?.slashCommands?.size || 0;
    const totalCmds = prefixCmdCount + slashCmdCount;

    const lines = [
      `${cyan}${box.tl}${box.h.repeat(38)}${box.tr}${reset}`,
      `${cyan}${box.v}${reset} ${green}${bold}${tag}${reset} est en ligne ${' '.repeat(38 - tag.length - 14)}${cyan}${box.v}${reset}`,
      `${cyan}${box.ml}${box.h.repeat(38)}${box.mr}${reset}`,
      `${cyan}${box.v}${reset} Guilds      ${dim}${guilds.toString().padStart(24)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.v}${reset} Membres     ${dim}${members.toString().padStart(24)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.v}${reset} Latence     ${dim}${(latency === '-' ? '-' : `${latency}ms`).padStart(24)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.v}${reset} Node.js     ${dim}${process.version.padStart(24)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.v}${reset} discord.js  ${dim}${require('discord.js').version.padStart(24)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.v}${reset} Env         ${dim}${(process.env.NODE_ENV || 'development').padStart(24)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.ml}${box.h.repeat(38)}${box.mr}${reset}`,
      `${cyan}${box.v}${reset} Commandes   ${dim}${`${totalCmds} total`.padStart(24)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.v}${reset} Events      ${dim}${`${client.eventNames().length} listeners`.padStart(24)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.bl}${box.h.repeat(38)}${box.br}${reset}`
    ];

    console.log('\n' + lines.join('\n') + '\n');
  };

  const printServiceDashboard = (title, items) => {
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const yellow = '\x1b[33m';
    const reset = '\x1b[0m';
    const dim = '\x1b[2m';

    const box = {
      tl: '┌', tr: '┐', bl: '└', br: '┘',
      h: '─', v: '│', ml: '├', mr: '┤'
    };

    const width = 40;
    const lines = [
      `${cyan}${box.tl}${box.h.repeat(width)}${box.tr}${reset}`,
      `${cyan}${box.v}${reset} ${green}${title.padEnd(width - 2)}${reset} ${cyan}${box.v}${reset}`,
      `${cyan}${box.ml}${box.h.repeat(width)}${box.mr}${reset}`
    ];

    items.forEach(item => {
      const [label, value] = item;
      const valStr = value ? `${dim}${value}${reset}` : '';
      const line = `${cyan}${box.v}${reset} ${label.padEnd(12)} ${valStr.padStart(width - 15)}${reset} ${cyan}${box.v}${reset}`;
      lines.push(line);
    });

    lines.push(`${cyan}${box.bl}${box.h.repeat(width)}${box.br}${reset}`);
    console.log(lines.join('\n'));
  };

  client.on(Events.ClientReady, async () => {
    printStartupBanner();

    // Lancer registerSlashCommands en arrière-plan (non-bloquant)
    (async () => {
      try {
        await Promise.race([
          commandRegistry.registerSlashCommands(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
        ]);
        console.log('commands registered');
      } catch (error) {
        printServiceDashboard('Slash Commands', [
          ['Statut', 'timeout'],
          ['Info', 'déjà enregistrées']
        ]);
      }
    })();

    const processExpirations = async (label = 'planifié') => {
      try {
        const stats = await sanctionService.processExpiredSanctions();
        if (stats.due > 0 || label === 'démarrage') {
          if (stats.due > 0) {
          printServiceDashboard('Sanctions', [
            ['Traité', `${stats.processed}`],
            ['Échoué', `${stats.failed}`],
            ['Ignoré', `${stats.skipped}`],
            ['En attente', `${stats.due}`]
          ]);
        }
        }
      } catch (error) {
        console.error('sanctions error:', error);
      }
    };

    const processPunishmentExpirations = async (label = 'planifié') => {
      try {
        const expiredPunishments = db.getExpiredPunishments();
        if (expiredPunishments.length > 0 || label === 'démarrage') {
          for (const punishment of expiredPunishments) {
            db.removePunishment(punishment.userId);
          }
          if (expiredPunishments.length > 0) {
            printServiceDashboard('Punitions', [
              ['Expirées', `${expiredPunishments.length}`],
              ['Statut', 'purged']
            ]);
          }
        }
      } catch (error) {
        console.error('punishments error:', error);
      }
    };

    await processExpirations('démarrage');
    await processPunishmentExpirations('démarrage');
    const schedulerHandle = setInterval(() => {
      processExpirations('planifié');
      processPunishmentExpirations('planifié');
    }, SANCTION_CHECK_INTERVAL);
    
    if (typeof setSchedulerHandle === 'function') {
      setSchedulerHandle(schedulerHandle);
    }

    await sendAllNotifications(client);
  });
};

module.exports = { setupDiscordEvents };
