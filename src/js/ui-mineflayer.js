let createBot;
let pathfinder, Movements;
let ChatMessage;

    // pos: Vec3
    // {x: 145, y: 102, z: 30}
    function getMapAt(pos, base64) {
      let map_entities = Object.values(bot.entities).filter(ent => ent.name === 'item_frame');
      let index = map_entities.findIndex(ent => ent.position.equals(pos));
      console.log('Index:', index)
      if(!index < 0) return console.log(`There is no map entity at that position.`);
      let map = Object.values(bot.mapDownloader.maps)[index];
      return new Buffer(map).toString('base64');
    }

let mineflayer = {
  startClient: async function(options) {
    commander.setCommands('mineflayer');
    if(!createBot) {
      createBot = require('mineflayer').createBot;
      let pathfinder_module = require('mineflayer-pathfinder');

      if(!pathfinder) pathfinder = pathfinder_module.pathfinder;
      if(!Movements) Movements = pathfinder_module.Movements;
    }

    if (bot) await bot.end();
    interface.reset();
    
    bot = await createBot(options);

    bot.lastOptions = options;

    bot.once('login', async function() {
      interface.startSession(bot.username);

      // The version and bot.registry is avaliable on login
      ChatMessage = require('prismarine-chat')(bot.registry)

      if(i18n.__('mineflayer.events.login')) console.log(i18n.__('mineflayer.events.login', { bot: bot }));

      // Update where an option other than the bot's username is set (eg. email)
      const stmt = await database.db.prepare('UPDATE accounts SET username = ? WHERE username = ?;')
      await stmt.bind({ 1: bot.username, 2: options.username })
      return await stmt.get();
    })

    // Pathfinder Defaults
    bot.loadPlugin(pathfinder)
    bot.once('spawn', function() {
      interface.resetRuntime();
      const defaultMove = new Movements(bot)
      defaultMove.allow1by1towers = false;
      defaultMove.canDig = false;
      defaultMove.allowFreeMotion = true;
      defaultMove.scafoldingBlocks = [];
      bot.pathfinder.setMovements(defaultMove)
    })


    bot.once('spawn', function() {
      interface.startRuntime();
      if(i18n.__('mineflayer.events.spawn')) console.log(i18n.__('mineflayer.events.spawn', { bot: bot }));

      // These events are moved inside the 'spawn' event so UI events are registered at the same time
      // UI Event : Position
      let pos_str = Object.values(bot.entity.position.floored()).join(', ')
      interface.setPosition(pos_str);
      bot.on('move', function() {
        if (!bot?.entity) return;
        pos_str = Object.values(bot.entity.position.floored()).join(', ');
        interface.setPosition(pos_str);
      })

      // UI Event : Health
      bot.on('health', function() {
        interface.setHealth(bot.health);
        interface.setHunger(bot.food);
      })

      bot.on('windowOpen', function(window) {
        // TODO: 1.8-1.13 support
        console.log(`[Window] A window has opened: ${JSON.parse(bot.currentWindow.title).text}`)
      })

    })

    // UI Event : Session End : Empty Health, Skin, Username
    bot.once('end', function() {
      if(i18n.__('mineflayer.events.spawn')) console.log(i18n.__('mineflayer.events.end', { bot: bot, username: bot?.username || options.username }));
      interface.reset();
      interface.stopRuntime();
      bot = null;
    })

    // UI Event : Entity Effects
    let potionEffectsTimer = setInterval(function() {
        interface.resetPotionEffects();
        if (!bot) clearInterval(potionEffectsTimer);
        if(!bot?.entity) return;
        // [{"effect": "Speed", "displayName": "Speed"}, {"effect": "JumpBoost", "displayName": "Jump Boost"}]
        interface.setPotionEffects(Object.values(bot.entity.effects).map(e => bot.registry.effects[e.id]).map(effect => ({ effect: effect.name, displayName: effect.displayName })))
      }, 1000) // Every 1s

    bot.once('end', function() {
      clearInterval(potionEffectsTimer)
    })

    // TODO : Add a setting for colors on/off


    let chat_use_colors = i18n.__('mineflayer.events.message.colors');
    bot.on('message', function(jsonMsg, position) {
      if(position === 'game_info') return;
      // TODO: Implement "Don't use colors"
      //if(!chat_use_colors && jsonMsg.getText()) return console.log(i18n.__('mineflayer.events.message.format', { message: toTerminal(jsonMsg.getText()) }));

      let datestr = new Date().toTimeString().split(' ')[0]

      console.log(i18n.__('mineflayer.events.message.format', { datestr: datestr, message: jsonMsg.toAnsi(bot.registry.language, {
        '§0': '\u001b[38;5;240m',
        '§1': '\u001b[38;5;19m',
        '§2': '\u001b[38;5;34m',
        '§3': '\u001b[38;5;37m',
        '§4': '\u001b[38;5;124m',
        '§5': '\u001b[38;5;127m',
        '§6': '\u001b[38;5;214m',
        '§7': '\u001b[38;5;250m',
        '§8': '\u001b[38;5;245m',
        '§9': '\u001b[38;5;63m',
        '§a': '\u001b[38;5;83m',
        '§b': '\u001b[38;5;87m',
        '§c': '\u001b[38;5;203m',
        '§d': '\u001b[38;5;207m',
        '§e': '\u001b[38;5;227m',
        '§f': '\u001b[97m',
        '§l': '\u001b[1m',
        '§o': '\u001b[3m',
        '§n': '\u001b[4m',
        '§m': '\u001b[9m',
        '§k': '\u001b[6m',
        '§r': '\u001b[0m'
      })}));
    })

    bot.on('error', function(error) {
      switch(error.code) {
        case "EAI_AGAIN":
          console.log(`EAI_AGAIN - a network connectivity error or proxy related error`)
          break;
        case "ENOTFOUND":
          console.log;

          break;
        default:
          console.log(error)
          break;
      }
      console.log('ERR CODE:', error.code)
    });
    bot.on('kicked', console.log);

    // Chat Listener for Commands
    bot.on('chat', function(sender, message) {
      //TODO: config.commands.chat.enabled
      //TODO: config.commands.chat.masters
      if(sender === bot.username) return;
      if (!message.startsWith('!')) return;
      const args = message.trim().split(/ +/g);
      const command = args.shift().substring(1)//.toLowerCase();
      let command_module = commander.getCommand(command);
      if (!command_module) return bot.chat(`/msg ${sender} ${i18n.__('commander.unknown_command')}`);
      if (!bot && command_module.requires?.entity) return console.log(i18n.__('commander.requires_entity', { command: command }));
      if(command_module.requires?.console) return bot.chat(`/msg ${sender} ${i18n.__('commands.generic.console_only')}`);
      command_module.execute({type: 'player', player: sender, reply: commander.reply.toPlayer}, command, args);
    })

    // Resource Pack Handling: https://github.com/PrismarineJS/mineflayer/issues/1888#issuecomment-833206221
    bot._client.on('resource_pack_send', (data) => {
      const { url, hash } = data
      bot.emit('resourcepack', { url, hash })
    })

    const TEXTURE_PACK_RESULTS = {
      SUCCESSFULLY_LOADED: 0,
      DECLINED: 1,
      FAILED_DOWNLOAD: 2,
      ACCEPTED: 3
    }

    bot.acceptResourcePack = () => {
      bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.ACCEPTED
      })
      bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED
      })
    }

    bot.denyResourcePack = () => {
      bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.DECLINED
      })
    }

    bot.on('resourcepack', function() {
      bot.acceptResourcePack();
    })

  },
  reload: function() {
    if(bot) {
      bot.pathfinder?.stop();
      bot.stopDigging();
      bot.clearControlStates();
    }
  }
}