<img src="https://img.shields.io/github/license/pix3lpirat3/mineprompt_rewritten">
<img src="https://img.shields.io/github/package-json/v/pix3lpirat3/mineprompt_rewritten">
<img src="https://img.shields.io/github/repo-size/pix3lpirat3/mineprompt_rewritten">
<img src="https://img.shields.io/github/downloads/pix3lpirat3/mineprompt_rewritten/total">
<img src="https://img.shields.io/github/issues/pix3lpirat3/mineprompt_rewritten">
<br>
<img src="https://img.shields.io/discord/413438066984747026?label=Discord">

# MinePrompt v5

As of version 5.0.0 MinePrompt's gone under a whole rewrite from the ground up. Thanks to the people in the PrismarineJS community, I've been able to clean up a lot of the design and code.

---
## Requirements

#### Development 
This project is written in `NodeJS`, and as such requires `NodeJS`, alongside `ElectronJS`.

Open the directory, then run `electron .` to launch the application
```SH
cd C:/Users/Minecrafter/Documents/mineprompt_rewritten
electron .
```

#### Standalone (Executable)
The program comes ready out of the box. If you want to add your own commands you just need to find the appropriate `/commands/` directory, add your file `my_command.js`, and follow the command structure.

```
module.exports = {
  version: '0.0.1',
  description: 'This command has a function..',
  author: 'Me, Myself, I',
  repository: '',
  usage: ``,
  command: 'my_command',
  aliases: ['mycmd'],
  execute: function(sender, command, args) {
  	// sender: true (if console), or username if player
  }
}
```

## Configuration

#### Add Accounts
You can add accounts via the UI (User Interface) by clicking the "PLUS" player head (top left corner), filling out the required fields, and pressing submit. (Stored: `/storage/accounts.json)`

#### Account Cache
Caching is handled by node-minecraft-protocol, and on most systems the folder will be in `.minecraft/nmp-cache`