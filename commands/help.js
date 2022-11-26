const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
data: 

    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows all commands."),

    async execute(interaction) {
        let groups = {};

        command_manager.commands
            .forEach((obj, _) => {
                let group = obj.group;

                if (group != "none") {
                    try {
                        groups.find(element => element == group)
                    } catch { 
                        groups[group] = [];
                    }
                    
                    groups[group].push({
                        "name": obj.cmd.data.name,
                        "description": obj.cmd.data.description
                    });
                }
            });

        const embed = new EmbedBuilder() // default color
            .setThumbnail(client.user.avatarURL({size: 512}))
            .setTitle("Help 📝");

        for (const [k, v] of Object.entries(groups)) {
            let cmds = "";

            v.forEach((cmd, _) => {
                cmds += `**${cmd["name"]}**`;
                cmds += " ~ ";
                cmds += cmd["description"];
                cmds += "\n";
            });

            embed.addFields(
                {
                    name: k.charAt(0).toUpperCase() + k.slice(1),
                    value: cmds,
                    inline: false
                }
            );
        }

        await interaction.reply({embeds: [ embed ]});
    }
};