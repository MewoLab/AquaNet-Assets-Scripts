/*

    Ongeki All-music Generator
    Run this with Bun, with all options (including A000) in a folder named `option`
    It will spit out `all-music.json`
    Jackets are not included

*/

import { XMLParser } from "fast-xml-parser";
import ora from "ora";
import fs from "fs";

const options = fs.readdirSync("option");

interface Song {
    name: string,
    ver: string, 
    composer: string,
    genre?: string,
    lunatic: boolean,
    notes: {
        lv: number
    }[]
}

let allMusic: Record<string, Song> = {};

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
    if (fs.existsSync(`option/${option}/music`)) {
        for (const songFolder of fs.readdirSync(`option/${option}/music`)
            .filter(v => fs.statSync(`option/${option}/music/${v}`).isDirectory())
        ) {
            let xmlData = getXmlContents(`option/${option}/music/${songFolder}/Music.xml`);
            if (!xmlData) continue;
            allMusic[
                xmlData.MusicData.Name.id
            ] = {
                name: xmlData.MusicData.Name.str,
                ver: xmlData.MusicData.VersionID.id,
                composer: xmlData.MusicData.ArtistName.str,
                genre: xmlData.MusicData.Genre?.str ?? null,
                lunatic: xmlData.MusicData.IsLunatic,
                notes: (() => {
                    const levels = xmlData.MusicData.FumenData.FumenData
                        .filter(v => (parseInt(v.FumenConstIntegerPart) + (parseInt(v.FumenConstFractionalPart ?? "0") / 100)) >= 1)
                        .map(v => ({
                            lv: parseInt(v.FumenConstIntegerPart) + (parseInt(v.FumenConstFractionalPart ?? "0") / 100)
                        }));
                    return levels.length > 0 ? levels : [{lv: 0}];
                })()
            }
        }
    }
    spinner.stop();
}

fs.writeFileSync(`all-music.json`, JSON.stringify(allMusic));