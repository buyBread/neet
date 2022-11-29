const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { execute } = require("../help");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("guild")
        .setDescription("Displays a Guild's information.")
        .addStringOption( // addNumberOption doesn't allow for big numbers?
                          // and the builder doesnt have setMaxValue like the docs say...
            (opt) => opt.setName("guild")
                        .setDescription("A guild's ID")),

    async execute(interaction) {
        const ctx = await context.from_interaction(interaction);
        const guild_preview = client.fetchGuildPreview(parseInt(
            interaction.options.get("guild").value));

        const embed = new EmbedBuilder();

        await interaction.reply("lazy");
    }
}