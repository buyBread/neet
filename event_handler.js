const { Events } = require("discord.js");

client.on(Events.ClientReady, () => {
    client.user.setPresence({
        status: config.json["status"],
        activities: [{ 
            name: config.json["activity_text"],
            type: parseInt(config.json["activity"])
        }]
    });

    yotsugi.log("Client ready!")
});
