import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, MessageFlags } from 'discord.js';
import { handlers } from './commands/handlers.js';
import { getSession } from './session.js';
import { tutorTurn } from './tutor.js';

const { DISCORD_TOKEN } = process.env;
if (!DISCORD_TOKEN) {
  console.error('Falta DISCORD_TOKEN en .env (ver .env.example).');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

client.once('clientReady', () => {
  console.log(`Hermes language tutor bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const handler = handlers[interaction.commandName];
  if (!handler) return;
  try {
    await handler(interaction);
  } catch (err) {
    console.error(`Error en /${interaction.commandName}:`, err);
    const payload = { content: `⚠️ Ocurrió un error inesperado: ${err.message}`, flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const session = getSession(message.author.id, message.channelId);
  if (!session) return;

  await message.channel.sendTyping().catch(() => {});
  try {
    const clean = await tutorTurn({
      userId: message.author.id,
      channelId: message.channelId,
      language: session.language,
      userText: message.content,
    });
    await message.reply(clean.slice(0, 1900));
  } catch (err) {
    console.error('Error en sesión de práctica:', err);
    await message.reply(`⚠️ Tuve un problema respondiendo: ${err.message}`).catch(() => {});
  }
});

client.login(DISCORD_TOKEN);

process.on('SIGINT', () => {
  console.log('\nCerrando bot...');
  client.destroy();
  process.exit(0);
});
