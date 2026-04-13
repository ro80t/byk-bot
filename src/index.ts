import "dotenv/config";

import { ChannelType, Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import { schedule } from "node-cron";

const token = process.env.TOKEN;
const noticeChannelId = process.env.NOTICE_CHANNEL;
const targetCategories = process.env.TARGET_CATEGORIES;
const roleId = process.env.ROLE_ID;

if (!token || !noticeChannelId || !targetCategories || !roleId) {
  throw new Error("Invalid .env");
}

process.on("uncaughtException", (error) => {
  console.error(error);
});

process.on("unhandledRejection", (error) => {
  console.error(error);
});

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

schedule(
  "30 19 * * 1-5",
  async () => {
    const targetCategoryIds = targetCategories.split(",");
    const channels = client.channels.cache.values();
    const noticeChannel = client.channels.cache.get(noticeChannelId);

    for (const channel of channels) {
      if (channel.type === ChannelType.GuildCategory && targetCategoryIds.includes(channel.id)) {
        await channel.permissionOverwrites.create(roleId, { ViewChannel: true });
      }
    }

    if (noticeChannel?.type === ChannelType.GuildText) {
      const embed = new EmbedBuilder()
        .setTitle("開会のお知らせ")
        .setDescription(
          "予定通り開会いたします。本日も萬游會をご利用いただきありがとうございます。"
        );
      await noticeChannel.send({
        content: `<@&${roleId}>`,
        embeds: [embed]
      });
    }
  },
  {
    timezone: "Asia/Tokyo"
  }
);

schedule(
  "0 5 * * 1-5",
  async () => {
    const targetCategoryIds = targetCategories.split(",");
    const channels = client.channels.cache.values();
    const noticeChannel = client.channels.cache.get(noticeChannelId);

    for (const channel of channels) {
      if (channel.type === ChannelType.GuildCategory && targetCategoryIds.includes(channel.id)) {
        await channel.permissionOverwrites.create(roleId, { ViewChannel: false });
      }
    }

    if (noticeChannel?.type === ChannelType.GuildText) {
      const embed = new EmbedBuilder()
        .setTitle("閉会のお知らせ")
        .setDescription(
          "本日はこれにて閉会です。開会は本日19:30となります。ご利用いただきありがとうございます。"
        );
      await noticeChannel.send({
        embeds: [embed]
      });
    }
  },
  {
    timezone: "Asia/Tokyo"
  }
);

await client.login(token);
