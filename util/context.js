global.context = {};

function from_interaction(inter) {
    let guild = inter.guild;
    let author = guild ? inter.member : inter.user;
    let user = inter.options.get("user"); // incase 
    let member = null;
    // let cmd = inter.command;
    let channel = inter.channel;

    if (user == null)
        user = guild ? 
            inter.member : inter.user;
    else
        user = guild ?
            user["member"] : user["user"];

    if (guild) {
        member = user;
        user   = user.user;
    }

    return {
        author,
        target: { user: user, member: member }, 
        guild,
        channel,
        self: global.client
    };
}

context.from_interaction = from_interaction;
