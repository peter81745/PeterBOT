'use strict'

const vec3 = require("vec3");
var Bot = require("./bot.js");
var FileLoader = require('./fileloader.js');
var Sleep = require('./sleep.js');

class MacroEngine {
    constructor(bot_obj) {
        this.bot_obj = bot_obj;
        this.prefix = " {MacroEngineV1.0} ";

        this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "loading file...");

        this.macro = null;
        try {
            this.macro = new FileLoader(bot_obj.macro).toArray();
            this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "loaded file successfully. Executing macro");
            this.exec(this);
        } catch (e) {
            this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "error loading file | Error: " + e);
        }
        // obj.mineflayer_instance.chat("Macro Engine V1")
    }

    async exec() {
        for (let i=0; i<this.macro.length; i++) {
            if (this.macro[i].startsWith("//")) {
                continue;
            }
            try {
                let method = this.macro[i].split("=>")[0].toString();
                let value = this.macro[i].split("=>")[1];
                switch (method) {
                    case "chat":
                        try {
                            this.bot_obj.mineflayer_instance.chat(value);
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(chat=>) success.");
                        } catch (e) {
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(chat=>) threw an error | Error: " + e);
                        } finally {
                            break;
                        }
                    case "sleep":
                        try {
                            await new Sleep(value);
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(sleep=>) success.");
                        } catch (e) {
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(sleep=>) threw an error | Error: " + e);
                        } finally {
                            break;
                        }
                    case "move":
                        try {
                            let x = value.split("/")[0];
                            let y = value.split("/")[1];
                            let z = value.split("/")[2];
                            await this.bot_obj.mineflayer_instance.navigate.promise.to(vec3(x,y,z));
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(move=>) success.");
                        } catch (e) {
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(move=>) threw an error | Error: " + e);
                        } finally {
                            break;
                        }
                    case "lookAt":
                        try {
                            let x = value.split("/")[0];
                            let y = value.split("/")[1];
                            let z = value.split("/")[2];
                            await this.bot_obj.mineflayer_instance.lookAt(vec3(x,y,z));
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(lookAt=>) success.");
                        } catch (e) {
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(lookAt=>) threw an error | Error: " + e);
                        } finally {
                            break;
                        }
                    case "attack":
                        try {
                            let x = value.split("/")[0];
                            let y = value.split("/")[1];
                            let z = value.split("/")[2];
                            await this.bot_obj.mineflayer_instance.attack(vec3(x,y,z));
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(attack=>) success.");
                        } catch (e) {
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(attack=>) threw an error | Error: " + e);
                        } finally {
                            break;
                        }
                    case "dig":
                        try {
                            let x = value.split("/")[0];
                            let y = value.split("/")[1];
                            let z = value.split("/")[2];
                            await this.bot_obj.mineflayer_instance.dig(this.bot_obj.mineflayer_instance.blockAt(vec3(x,y,z)));
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(dig=>) success.");
                        } catch (e) {
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(dig=>) threw an error | Error: " + e);
                        } finally {
                            break;
                        }
                    case "setQuickBarSlot":
                        try {
                            await this.bot_obj.mineflayer_instance.setQuickBarSlot(value);
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(setQuickBarSlot=>) success.");
                        } catch (e) {
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(setQuickBarSlot=>) threw an error | Error: " + e);
                        } finally {
                            break;
                        }
                    case "eat":
                        try {
                            await this.bot_obj.mineflayer_instance.consume();
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(eat=>) success.");
                        } catch (e) {
                            await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(eat=>) threw an error | Error: " + e);
                        } finally {
                            break;
                        }
                    case "disconnect":
                        await this.bot_obj.disconnect();
                        await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "(disconnect=>) success.");
                        break;
                    default:
                        await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "Method("+method+"=>) does not exist.");
                }
            } catch (e) {
                await this.bot_obj.addLog("Bot["+this.bot_obj.name+"]" + this.prefix + "line " + (i+1) + " cannot be read properly, skipping line | Error: " + e);
            }
        }
    }
}

module.exports = MacroEngine;