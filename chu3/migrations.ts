/*

    Chunithm Migrations generator
    Run this with Bun, with all options (including A000) in a folder named `option`
    It will spit out migrations that include events into a folder named `migrations`
    
    **PLEASE** join events together whenever possible. 
    Do not clutter up the migration directory unnecessarily.

*/

import { XMLParser } from "fast-xml-parser";
import ora from "ora";
import fs from "fs";

const options = fs.readdirSync("option");

if (!fs.existsSync("migrations"))
    fs.mkdirSync("migrations")

interface Event {
    id: number,
    type: number
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

function getMigration(events: Event[]) {
    return `
INSERT INTO chusan_game_event (id, type, end_date, start_date, enable)
VALUES
${events.map(event => `    (${event.id}, ${event.type}, '2029-01-01 00:00:00.000000','2019-01-01 00:00:00.000000',true)`).join(",\n")}
ON DUPLICATE KEY UPDATE
    type = VALUES(type),
    end_date = VALUES(end_date),
    start_date = VALUES(start_date),
    enable = VALUES(enable);`
}

for (const option of options) {
    const spinner = ora(`Processing ${option}`).start();
    if (fs.existsSync(`option/${option}/event`)) {
        let events: Event[] = [];
        for (const eventFolder of fs.readdirSync(`option/${option}/event`)
            .filter(v => fs.statSync(`option/${option}/event/${v}`).isDirectory())
        ) {
            let xmlData = getXmlContents(`option/${option}/event/${eventFolder}/Event.xml`);
            if (!xmlData) continue;
            let event: Event = {
                id: xmlData.EventData.name.id,
                type: xmlData.EventData.substances.type
            };
            events.push(event);
            fs.writeFileSync(`migrations/${option}.sql`, getMigration(events))
        }
    }
    spinner.stop();
};
