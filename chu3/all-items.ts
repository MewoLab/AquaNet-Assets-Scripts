/*

    Chunithm All-Items generator
    Run this with Bun, with all options (including A000) in a folder named `option`
    It will spit out `all-items.json`

*/

import { XMLParser } from "fast-xml-parser";
import ora from "ora";
import fs from "fs";

const options = fs.readdirSync("option");

interface Item {
    name: string,
    disable: "false" | "true",
    style?: string, // For SymbolChat and Trophy items
    category?: string // For AvatarAccessory items
}

let data: Record<string, Record<string, Item>> = {
    trophy: {},
    chara: {},
    event: {},
    frame: {},
    ticket: {},
    mapIcon: {},
    systemVoice: {},
    namePlate: {},
    avatarAccessory: {},
    symbolChat: {}
};

function getXmlContents(file: string) {
    if (!fs.existsSync(file))
        return;
    if (!fs.statSync(file).isFile())
        return;
    const data = fs.readFileSync(file).toString();
    const parser = new XMLParser();
    return parser.parse(data);
}

for (const option of options) {
    const spinner = ora(`Processing ${option}`).start();
    for (const category of fs.readdirSync(`option/${option}`)) {
        if (!fs.statSync(`option/${option}/${category}`).isDirectory())
            continue;
        const children = fs.readdirSync(`option/${option}/${category}`);
        switch (category) {
            case "symbolChat":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/SymbolChat.xml`);
                    if (xmlData)
                        data.symbolChat[xmlData.SymbolChatData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.SymbolChatData.text,
                            style: xmlData.SymbolChatData.balloonID
                        }
                }
                break;
            case "trophy":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/Trophy.xml`);
                    if (xmlData)
                        data.trophy[xmlData.TrophyData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.TrophyData.name.str,
                            style: xmlData.TrophyData.rareType
                        }
                }
                break; 
            case "chara":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/Chara.xml`);
                    if (xmlData)
                        data.chara[xmlData.CharaData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.CharaData.name.str
                        }
                }
                break; 
            case "namePlate":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/NamePlate.xml`);
                    if (xmlData)
                        data.namePlate[xmlData.NamePlateData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.NamePlateData.name.str
                        }
                }
                break; 
            case "avatarAccessory":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/AvatarAccessory.xml`);
                    if (xmlData)
                        data.avatarAccessory[xmlData.AvatarAccessoryData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.AvatarAccessoryData.name.str,
                            category: xmlData.AvatarAccessoryData.category
                        }
                }
                break;
            case "mapIcon":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/MapIcon.xml`);
                    if (xmlData)
                        data.mapIcon[xmlData.MapIconData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.MapIconData.name.str
                        }
                }
                break;
            case "systemVoice":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/SystemVoice.xml`);
                    if (xmlData)
                        data.systemVoice[xmlData.SystemVoiceData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.SystemVoiceData.name.str
                        }
                }
                break;
            case "ticket":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/Ticket.xml`);
                    if (xmlData)
                        data.ticket[xmlData.TicketData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.TicketData.name.str,
                            style: xmlData.TicketData.type
                        }
                }
                break;
            case "frame":
                for (const child of children) {
                    const xmlData = getXmlContents(`option/${option}/${category}/${child}/Frame.xml`);
                    if (xmlData)
                        data.frame[xmlData.FrameData.name.id.toString()] = {
                            disable: "false",
                            name: xmlData.FrameData.name.str
                        }
                }
                break;
        }
    };
    spinner.stop();
}

fs.writeFileSync(`all-items.json`, JSON.stringify(data))