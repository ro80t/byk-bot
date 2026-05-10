import "dotenv/config";

import { ChannelType, Client, EmbedBuilder, GatewayIntentBits } from "discord.js";
import { schedule } from "node-cron";

const token = process.env.TOKEN;
const noticeChannelId = process.env.NOTICE_CHANNEL;
const targetCategories = process.env.TARGET_CATEGORIES;
const roleId = process.env.ROLE_ID;
const noticeRoleId = process.env.NOTICE_ROLE_ID;

if (!token || !noticeChannelId || !targetCategories || !roleId || !noticeRoleId) {
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

async function open(targetCategoryIds: string[], roleId: string) {
  const channels = client.channels.cache.values();

  for (const channel of channels) {
    if (channel.type === ChannelType.GuildCategory && targetCategoryIds.includes(channel.id)) {
      await channel.permissionOverwrites.create(roleId, { ViewChannel: true });
    }
  }
}

async function close(targetCategoryIds: string[], roleId: string) {
  const channels = client.channels.cache.values();
  for (const channel of channels) {
    if (channel.type === ChannelType.GuildCategory && targetCategoryIds.includes(channel.id)) {
      await channel.permissionOverwrites.create(roleId, { ViewChannel: false });
    }
  }
}

schedule(
  "30 16 * * 1-5",
  async () => {
    const targetCategoryIds = targetCategories.split(",");
    const noticeChannel = client.channels.cache.get(noticeChannelId);

    await open(targetCategoryIds, roleId);

    if (noticeChannel?.type === ChannelType.GuildText) {
      const embed = new EmbedBuilder()
        .setTitle("開会のお知らせ")
        .setDescription(
          "予定通り開会いたします。本日も萬游會をご利用いただきありがとうございます。"
        );
      await noticeChannel.send({
        content: `<@&${noticeRoleId}>`,
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
    const noticeChannel = client.channels.cache.get(noticeChannelId);

    await close(targetCategoryIds, roleId);

    if (noticeChannel?.type === ChannelType.GuildText) {
      const embed = new EmbedBuilder()
        .setTitle("閉会のお知らせ")
        .setDescription(
          "本日はこれにて閉会です。開会は本日16:30となります。ご利用いただきありがとうございます。"
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
