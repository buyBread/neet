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

        this.unloaded = [];

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

    async gather_slash_commands() {
        yotsugi.log("Gathering commands from folders.");

        // reset
        this.commands = [];
        this.groups = {};

        const files = await fs.promises.readdir(
            __dirname).catch((e) => {
                throw e;
            });
    
        const add_command = (cmd, group = "none", hidden = false) => {
            if (!("data" in cmd) || !("execute" in cmd))
                return;

            yotsugi.log(`-> Adding Command: \"${cmd.data.name}\", Group: \"${group}\".`)
    
            this.commands.push(
                { 
                    group: group,
                    data: cmd.data,
                    execute: cmd.execute,
                    hidden: hidden,
                }
            );

            try {
                this.groups[group].push({
                    data: cmd.data,
                    execute: cmd.execute,
                    hidden: hidden,
                });
            } catch {
                this.groups[group] = [{
                    data: cmd.data,
                    execute: cmd.execute,
                    hidden: hidden,
                }];
            }   
        }
        
        for (const file of files) {
            if (file.includes("framework"))
                continue;

            let fp = __dirname + "/" + file;
    
            if (path.extname(fp) == ".js")
                add_command(require(fp));
            else {
                if ((await fs.promises.stat(fp)).isDirectory()) { // check if directory
                    let hidden = false;

                    for (const cmd of await fs.promises.readdir(fp)) {
                        if (cmd === ".hidden")
                            hidden = true;
                        else {
                            if (path.extname(fp + "/" + cmd) == ".js")
                                add_command(require(fp + "/" + cmd), file, hidden); // pass `file` as group
                        }
                    }
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

    async load_command(command_name) {
        const idx = this.unloaded.findIndex(cmd => {
            return cmd.data.name === command_name;
        });

        if (idx === -1)
            return false;

        const backup = this.unloaded[idx];

        this.commands.push(backup);
        this.groups[backup.group].push({
            data: backup.data,
            execute: backup.execute,
            hidden: backup.hidden,
        });

        await this.refresh_slash_commands()
            .then(() => {
                yotsugi.log("{/} refreshed.")
            });

        this.unloaded.splice(idx, 1);

        return true;
    }

    async unload_command(command_name) {
        const idx = this.commands.findIndex(cmd => {
            return cmd.data.name === command_name;
        });

        if (idx === -1)
            return false;

        const backup = this.commands[idx];

        this.commands.splice(idx, 1);
        this.groups[backup.group].splice(
            this.groups[backup.group].findIndex(cmd => {
                return cmd.data.name === command_name;
        }), 1);

        await this.refresh_slash_commands()
            .then(() => {
                yotsugi.log("{/} refreshed.")
            });

        this.unloaded.push(backup);

        return true;
    }
}

module.exports = { slash_command_manager }
