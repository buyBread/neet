const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unload")
        .setDescription("Unoads a Command.")
        .addStringOption(
            (opt) => opt.setName("command")
                        .setDescription("Name of command.")),

    async execute(interaction) {
        let owner_id = -1;

        if (client.application.owner === null) // because discord is epic!!!!!!!!!!!
            owner_id = config.json["owner_id"];
        else
            owner_id = client.application.owner.id;

        if (owner_id != interaction.user.id) {
            await interaction.reply("You are not allowed to use this command.");
            return;
        }

        const cmd = interaction.options.get("command").value;

        try {
            if (await command_manager.unload_command(cmd))
                await interaction.reply(`**${cmd}** Unloaded.`);
            else
                await interaction.reply(`Failed to Unload **${cmd}**.`);
        } catch {
            await interaction.reply("Timed out.");
        }
    }
}
