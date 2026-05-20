# Sanction Bot



Discord moderation bot with full sanction management, supporting both slash and prefix commands.



## Configuration



1. Copy `config.js` and replace the placeholder values:

   - `token`: Discord bot token.

   - `clientId`: application client ID.

   - `guildId`: optional, restricts slash command registration to a specific guild.

   - `ownerId`: primary owner ID.

   - `prefix`: prefix for text commands (default: `&`).

   - `color` and `footer`: embed customization.

2. Adjust feature toggles if needed: `enableSlashCommands`, `enablePrefixCommands`, `enforceReason`.



## Installation



```powershell

npm install

```



> **Note:** `better-sqlite3` requires C++ build tools on Windows.

> - Recommended: use Node.js 20 LTS.

> - Otherwise install the "Desktop development with C++" workload from Visual Studio Build Tools.



## Usage



```powershell

npm run start

```



Re-register slash commands after any modification:



```powershell

npm run register:slash

```



## Core Features



- **Sanctions**: Ban, kick, tempban, mute, tempmute, warn, blacklist, and tempblacklist.

- **Reversals**: Unban, unmute, and unblacklist actions recorded in the database.

- **History**: Sanction history per user with filtering options.

- **Storage**: Detailed SQLite storage: actor, target, reason, timestamps, duration, status.

- **Owner Management**: Add/remove/list owners with a designated primary owner.

- **Prefix Commands**: All sanction commands use prefix (default `&`).

- **Slash Commands**: Administrative commands for configuration and owner-only features.

- **Configuration**: Fine-grained configuration of authorized roles, cooldowns, and daily limits via `/botconfig`.

- **Customization**: Consistent embeds using the color and footer defined in `config.js`.

- **Blacklist**: User blacklist to prevent access to bot commands.

- **Expiration**: Automatic expiration handling for temporary sanctions.

- **Alt Account Detection**: Automatic ban when a blacklisted user tries to rejoin with another account.

- **Context Menu Support**: Bans via right-click are automatically recorded in the database.

- **Punishment System**: `/punition` command to temporarily restrict users from ban/blacklist/unblacklist actions.

- **User Sanction History**: `&bluser` and `&banuser` commands to view sanctions performed by a user.

- **Pagination**: Sanction lists display 5 items per page with navigation buttons.

- **Protected Users**: Owners cannot ban/blacklist protected users without removing protection first.



## Commands



### Sanction Commands (Prefix)



- `&ban <user> [duration] [reason]` - Ban a user

- `&unban <user>` - Unban a user

- `&baninfo <user>` - View ban information for a user

- `&banuser [user]` - View bans performed by a user (defaults to self)

- `&blacklist <user> [duration] [reason]` - Blacklist a user
- `&bl <user> [duration] [reason]` - Alias for blacklist

- `&unblacklist <user>` - Remove blacklist from a user

- `&blinfo <user>` - View blacklist information for a user

- `&bluser [user]` - View blacklists performed by a user (defaults to self)

- `&to <user> <duration> [reason]` - Timeout a user

- `&tempmute <user> <duration> [reason]` - Temporarily mute a user

- `&unmute <user>` - Unmute a user

- `&unto <user>` - Remove timeout from a user

- `&warn <user> [reason]` - Warn a user



### Administrative Commands (Slash)



- `/botconfig` - Open the interactive bot configuration panel (owners only)

- `/invite` - Get the bot invite link (primary owner only)

- `/bl-acces` - Manage server whitelist access (administrator only)

- `/protect-user` - Toggle protected user status (owners only)

- `/punition` - Apply a temporary punishment blocking ban/blacklist/unblacklist (owners only)



### History & Lookup Commands (Prefix)



- `&listsanctions <user> [type]` - View sanction history for a user
- `&sanctions <user> [type]` - Alias for listsanctions
- `&sanction <user> [type]` - Alias for listsanctions
- `&list <user> [type]` - Alias for listsanctions
- `&infosanction <id> <@user>` - View detailed sanction information
- `&sanctioninfo <id> <@user>` - Alias for infosanction
- `&sinfo <id> <@user>` - Alias for infosanction

### Administrative Commands (Prefix)

- `&owner [id|@user]` - List owners or toggle owner status
- `&backup` - Open the backup management panel (owners only)
- `&clear-sanctions <user> [reason]` - Clear all sanctions for a user
- `&clearsanctions <user> [reason]` - Alias for clear-sanctions
- `&clearsanction <user> [reason]` - Alias for clear-sanctions



## Database



The SQLite file is created at `data/sanctions.sqlite`. Back up this file to preserve sanction history.



## Development



- Nodemon available via `npm run dev`.

- The sanction service scans every 60 seconds to lift expired temporary sanctions.

- Punishments are automatically expired every 60 seconds.

