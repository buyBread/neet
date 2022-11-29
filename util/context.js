global.context = {};

async function from_interaction(inter) {
    let res = {}

    res.guild = inter.guild;
    res.channel = inter.channel;
    res.author = res.guild ? inter.member : inter.user;
    res.options = inter.options;
    res.target = {
        user: null,
        member: null,
    };

    let opt_user = res.options.get("user");

    if (opt_user) {
        if (res.guild) {
            res.target.user   = opt_user.member.user;
            res.target.member = opt_user.member;
        } else
            res.target.user = opt_user.user;
    } else { // target is the author
        if (res.guild) {
            res.target.user   = res.author.user;
            res.target.member = res.author
        } else
            res.target.user = res.author;
    }

    return res;
}

context.from_interaction = from_interaction;
