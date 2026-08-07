import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commands } from './commands/definitions.js';

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('Faltan DISCORD_TOKEN y/o DISCORD_CLIENT_ID en .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
const body = commands.map((c) => c.toJSON());

try {
  if (DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID), { body });
    console.log(`Registrados ${body.length} comandos en el servidor ${DISCORD_GUILD_ID} (instantáneo).`);
  } else {
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body });
    console.log(`Registrados ${body.length} comandos globalmente (puede tardar ~1h en propagarse).`);
  }
} catch (err) {
  console.error('Error registrando comandos:', err);
  process.exit(1);
}
