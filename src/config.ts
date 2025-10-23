import dotenv from 'dotenv';

dotenv.config();

export const config = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '', // Optional: for development guild-specific commands
  masterTemplateUrl: process.env.MASTER_TEMPLATE_URL || 'https://docs.google.com/spreadsheets/d/1Le5xZjpKjBykwPGZ54sEFfwDmjPtb59JFQh4sZJ7t6k/edit',
};

// Validate required environment variables
if (!config.token) {
  throw new Error('Missing DISCORD_TOKEN in environment variables');
}

if (!config.clientId) {
  throw new Error('Missing CLIENT_ID in environment variables');
}
