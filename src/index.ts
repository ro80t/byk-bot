import "dotenv/config";

import { Client, GatewayIntentBits } from "discord.js";

const token = process.env.TOKEN;

if (!token) {
  throw new Error("Token not found.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent
  ]
});

await client.login(token);
