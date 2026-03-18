/*

    maimai All-Music generator
    Run this with Bun, with all options (including A000) in a folder named `option`
    It will spit out `all-music.json`
    Jackets are not included, you must use `jacket.ts` for song jackets

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
    utageKanjiName: string,
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
                xmlData.MusicData.name.id
            ] = {
                name: xmlData.MusicData.name.str,
                ver: xmlData.MusicData.releaseTagName.str,
                composer: xmlData.MusicData.artistName.str,
                utageKanjiName: xmlData.MusicData.utageKanjiName,
                genre: xmlData.MusicData.genreName.str ?? null,
                notes: xmlData.MusicData.notesData.Notes.filter(v => v.isEnable).map(v => ({
                    lv: parseInt(v.level) + (parseInt(v.levelDecimal ?? 0) / 10)
                } as {lv: number}))
            }
        }
    }
    spinner.stop();
}

fs.writeFileSync(`all-music.json`, JSON.stringify(allMusic));
