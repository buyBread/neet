NAME    = "neet"
VERSION = "1.0.0"

require("./util/yotsugi"); // main logging utility
                           // have to include b4 main
                           // breaks style, but w/e

yotsugi.log(`Starting ${NAME}, Version: ${VERSION}.`);

const fs = require("fs");
const os = require("os");

async function setup_config() {
    yotsugi.log("-> Reading config file...");

    global.config = {};
    global.config.fp = os.homedir() + "/.config/" + NAME;
    
    let fname = "config.json";

    await fs.promises.stat(config.fp).catch((e) => {
        if (e.code === "ENOENT") { // create base files
            fs.mkdir(
                dir,
                { recursive: true },
                (err) => { if (err) throw err; } );

            fs.writeFile(
                config.fp + "/" + fname,
                JSON.stringify({ 
                    "token": "",
                    "app_id": "",
                    "status": "online",
                    "activity": "3",
                    "activity_text": "stuff",
                    "spotify_client_id": "",
                    "spotify_client_secret": ""
                }, null, "\t"),
                "utf8", // encoding
                (err) => { if (err) throw err; }
            );

            throw `Empty config created at ${config.fp + "/" + fname}.`;
        } else { 
            throw e;
        }
    });

    config.json = JSON.parse(
        await fs.promises.readFile(config.fp + "/" + fname, "utf8").catch((e) => { throw e; }));
}

async function populate_global_context() {
    yotsugi.log("Populating \"global\" context...")

    await setup_config()
        .then(() => {
            yotsugi.log("-> Config setup complete.")
        });

    if (config.json["token"] === "")
        throw "Token field empty."

    if (config.json["app_id"] === "")
        throw "Application ID field empty."

    const {
        Client,
        GatewayIntentBits,
        version: djs_version
    } = require("discord.js");

    yotsugi.log(`-> discord.js version: ${djs_version}`)
    
    global.client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildBans,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.GuildInvites,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildScheduledEvents,
            GatewayIntentBits.AutoModerationConfiguration,
            GatewayIntentBits.AutoModerationExecution
        ] // all
    });

    const { slash_command_manager } = 
        require("./commands/framework");

    global.command_manager = new slash_command_manager();

    // util
    require("./util/context");
}

const main = async () => {
    await populate_global_context()
        .then(() => {
            yotsugi.log("\"global\" populated.")
        })
    .catch((err) => {
        throw err;
    });

    await command_manager.gather_commands()
        .then(() => {
            yotsugi.log("Commands gathered.")
        })
    .catch((err) => {
        throw err;
    });

    await command_manager.refresh_slash_commands()
        .then(() => {
            yotsugi.log("{/} refreshed.")
        })
    .catch((err) => {
        throw err;
    });

    require("./event_handler");

    await client.login(config.json["token"]);
}

main().then(() => {
    yotsugi.log("Client started.")
});
