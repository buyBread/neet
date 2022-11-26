const { get_prominent_color } = require("./util/color");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
data:

    new SlashCommandBuilder()
        .setName("user")
        .setDescription("Displays a User's information.")
        .addUserOption(
            (opt) => opt.setName("user")
                        .setDescription("Select a User or enter their ID.")),

    async execute(interaction) {
        const ctx = context.from_interaction(interaction);

        const embed = new EmbedBuilder();
        embed.setThumbnail(ctx.target.user.displayAvatarURL({size: 1024}))
        embed.setColor(await get_prominent_color(
            ctx.target.user.avatarURL({ 
                size: 64, extension: "jpg", forceStatic: true})
        ));
        embed.setTitle(
                ctx.guild ? 
                    ((ctx.target.member.nickname === null) ? // no nick
                        ctx.target.user.username : ctx.target.member.nickname) : 
                    ctx.target.user.username
        );
        embed.setDescription(`**ID**: ${ctx.target.user.id}` +
                (ctx.guild ? 
                    `\n**Full Credentials**: ${ctx.target.user.username}#${ctx.target.user.discriminator}` : "") +
                (ctx.target.user.bot ?
                    "\n**Bot**: Yes" : "")
        );
        embed.addFields({ 
            name: "Account Created", 
            value: `${(ctx.guild ? 
                ctx.target.user.createdAt : ctx.target.user.createdAt).toDateString()}`,
            inline: ctx.guild ? true : false
        });
        if (ctx.guild) {
            embed.addFields({
                name: "Guild Joined",
                value: `${ctx.target.member.joinedAt.toDateString()}`,
                inline: true
            });
            embed.addFields({
                name: "Stats",
                value: "TBA"
            });
        }

        await interaction.reply({embeds: [ embed ]});
    }

};