/*
    Command loading framework.
*/

const {
    Events,
    REST,
    Routes
} = require("discord.js");
const fs = require("fs");
const path = require("path");

class slash_command_manager {
    constructor() {
        this.commands = [];
        this.groups = {}; // for easier indexing in other operations

        client.on(Events.InteractionCreate, async (interaction) => {
            try {
                let idx = this.commands.findIndex(cmd => {
                    return cmd.data.name === interaction.commandName;
                });

                await this.commands[idx].execute(interaction);
            } catch(err) { 
                yotsugi.log(err);
                await interaction.reply("Something went wrong...");
            }
        });
    }

    async gather_commands() {
        yotsugi.log("Gathering commands from folders.");

        const files = await fs.promises.readdir(
            __dirname).catch((e) => {
                throw e;
            });
    
        const add_command = (cmd, group = "none") => {
            yotsugi.log(`-> Adding Command: \"${cmd.data.name}\", Group: \"${group}\".`)
    
            this.commands.push(
                { 
                    group: group,
                    data: cmd.data,
                    execute: cmd.execute,
                }
            );

            try {
                this.groups[group].push({
                    data: cmd.data,
                    execute: cmd.execute,
                });
            } catch {
                this.groups[group] = [{
                    data: cmd.data,
                    execute: cmd.execute,
                }];
            }   
        }
        
        for (const file of files) {
            if (file.includes("framework"))
                continue;

            let fp = __dirname + "/" + file;
    
            if (path.extname(fp) == ".js") {
                const cmd = require(fp);
    
                if (!("data" in cmd) || !("execute" in cmd))
                    throw `${fp} has no "data" or "execute" property.`
    
                add_command(cmd);
            } else {
                if ((await fs.promises.stat(fp)).isDirectory()) // check if directory
                    for (const cmd of await fs.promises.readdir(fp)) {
                        if (path.extname(fp + "/" + cmd) == ".js")
                            add_command(require(fp + "/" + cmd), file); // pass `file` as group
                    }
            }
        }
    }

    async refresh_slash_commands() {
        yotsugi.log("Refreshing {/}.");

        // oop!!!!!!!!!!! :soyjak:
        const rest = new REST().setToken(config.json["token"]);

        const create_commands_body = () => {
            let res = []

            yotsugi.log("-> Creating applicationCommands {/} body.")

            this.commands.forEach((cmd) => {
                res.push(cmd.data.toJSON());
            });

            return res;
        }

        await rest.put(
            Routes.applicationCommands(config.json["app_id"]),
            { body: create_commands_body() }
        );
    }
}

module.exports = { slash_command_manager }
