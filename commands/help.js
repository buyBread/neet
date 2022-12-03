const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function command_format(cmd) {
    return `**${cmd.data.name}** ~ ${cmd.data.description}\n`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows all commands."),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setThumbnail(client.user.avatarURL({size: 2048}))
            .setTitle("Available Commands");

        for (const [group, commands] of Object.entries(command_manager.groups)) {
            if (group === "none")
                continue; // "help" is the only command without a group

            let group_name = group.charAt(0).toUpperCase() + group.slice(1);

            embed.addFields({
                name: group_name,
                value: "placeholder",
                inline: false,
            });
    
            let idx = embed.data.fields.findIndex(field => {
                return field.name === group_name;
            })
    
            // EmbedBuilder doesn't allow "unsafe" behaviour
            embed.data.fields[idx].value = "";
    
            for (const cmd of commands) {
                if (!cmd.hidden)
                    embed.data.fields[idx].value += command_format(cmd);
            }

            if (embed.data.fields[idx].value === "")
                embed.data.fields.pop(idx);
        }

        await interaction.reply({embeds: [ embed ]});
    }
}
