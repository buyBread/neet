const { get_prominent_color } = require("./util/color");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("guild")
        .setDescription("Displays a Guild's information.")
        .setDMPermission(false)
        .addStringOption( // addNumberOption doesn't allow for big numbers?
                          // and the builder doesnt have setMaxValue like the docs say...
            (opt) => opt.setName("guild")
                        .setDescription("A guild's ID")),

    async execute(interaction) {
        const ctx = await context.from_interaction(interaction);
    
        let guild = null;
        let guild_id = interaction.options.get("guild");

        if (guild_id) {
            try {
                guild = await client.fetchGuildPreview(guild_id.value);
            } catch {
                await interaction.reply("Cannot fetch that Guild...");
                return;
            }
        } else
            guild = ctx.guild;

        const embed = new EmbedBuilder();
        embed.setThumbnail(guild.iconURL({size: 2048}));
        embed.setColor(await get_prominent_color(guild.iconURL({
            size: 64, extension: "jpg", forceStatic: true})
        ));
        embed.setTitle(guild.name);
        embed.setDescription(
`${guild.description ? guild.description + "\n" : ""}**ID**: ${guild.id}\n${guild.approximateMemberCount ? "**Member Count**: " + guild.approximateMemberCount : ""}`
        );
        embed.addFields({
            name: "Guild Created",
            value: guild.createdAt.toDateString(),
            inline: false,
        });
        
        await interaction.reply({embeds: [ embed ]});
    }
}