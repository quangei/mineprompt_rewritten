module.exports = {
  command: 'useitem',
  usage: 'useitem',
  description: 'Use the item in hand.',
  usage: 'useitem [offhand]',
  requiresEntity: true,
  author: 'Pix3lPirat3',
  execute: function(sender, command, args) {
    var useOffhand = (args[0] === 'true');
    sender.reply(`[UseItem] Using item ${bot.heldItem?.name} (Offhand: ${useOffhand})`);
    bot.activateItem(useOffhand)
  }
}