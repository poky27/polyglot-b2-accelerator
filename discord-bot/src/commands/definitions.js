import { SlashCommandBuilder } from 'discord.js';

const languageOption = (builder) =>
  builder
    .addStringOption((opt) =>
      opt
        .setName('idioma')
        .setDescription('Idioma a practicar')
        .setRequired(true)
        .addChoices({ name: '🇬🇧 English (A2 → B1)', value: 'english' }, { name: '🇩🇪 Deutsch (A2)', value: 'german' })
    );

export const commands = [
  languageOption(
    new SlashCommandBuilder().setName('practice').setDescription('Inicia (o continúa) una sesión de conversación con el tutor en este canal')
  ),
  languageOption(
    new SlashCommandBuilder().setName('vocab').setDescription('Recibe 5 palabras nuevas de vocabulario a tu nivel actual')
  ),
  languageOption(new SlashCommandBuilder().setName('quiz').setDescription('Genera un mini-quiz de 5 preguntas a tu nivel actual')),
  languageOption(
    new SlashCommandBuilder()
      .setName('correct')
      .setDescription('Corrige una frase tuya con explicación de la regla')
      .addStringOption((opt) => opt.setName('texto').setDescription('La frase que quieres que se corrija').setRequired(true))
  ),
  languageOption(
    new SlashCommandBuilder()
      .setName('roleplay')
      .setDescription('Simula un escenario real (pedir café, entrevista, etc.) para practicar producción oral/escrita')
  ).addStringOption((opt) => opt.setName('escenario').setDescription('Ej: "pedir un café", "entrevista de trabajo"').setRequired(false)),
  languageOption(
    new SlashCommandBuilder()
      .setName('say')
      .setDescription('El bot pronuncia un texto en voz alta (audio) para que entrenes el oído')
  ).addStringOption((opt) => opt.setName('texto').setDescription('Texto a pronunciar').setRequired(true)),
  new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Practica de voz: el bot se une a tu canal y te escucha')
    .addSubcommand((sub) =>
      languageOption(sub.setName('join').setDescription('Une el bot a tu canal de voz actual y empieza a escucharte'))
    )
    .addSubcommand((sub) => sub.setName('leave').setDescription('El bot sale del canal de voz')),
  new SlashCommandBuilder().setName('progress').setDescription('Muestra tu progreso guardado en ambos idiomas'),
  languageOption(
    new SlashCommandBuilder()
      .setName('setlevel')
      .setDescription('Ajusta manualmente tu nivel de partida')
      .addStringOption((opt) =>
        opt
          .setName('nivel')
          .setDescription('Nivel CEFR')
          .setRequired(true)
          .addChoices({ name: 'A1', value: 'A1' }, { name: 'A2', value: 'A2' }, { name: 'A2+', value: 'A2+' }, { name: 'B1', value: 'B1' })
      )
  ),
  new SlashCommandBuilder().setName('stop').setDescription('Termina tu sesión de práctica activa en este canal'),
];
