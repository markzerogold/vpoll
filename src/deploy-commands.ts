import { REST, Routes } from 'discord.js';
import { config } from './config';
import * as fs from 'fs';
import * as path from 'path';

const commands: any[] = [];

// Load all command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`[INFO] Loaded command: ${command.data.name}`);
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// Deploy commands
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    let data: any;

    // Deploy to specific guild (faster, for development) or globally
    if (config.guildId) {
      data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: commands }
      );
      console.log(`Successfully deployed ${data.length} commands to guild ${config.guildId}`);
    } else {
      data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands }
      );
      console.log(`Successfully deployed ${data.length} commands globally`);
    }
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
})();
