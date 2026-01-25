/*

    Chunithm Jacket ripper
    Run this with Bun, with all options (including A000) in a folder named `option`
    It will output to a folder `music`

    Nijika is used to natively decode the DDS assets, it will be fetched from GitHub automatically.

*/

import fs from "fs";
import ora from "ora";

const options = fs.readdirSync("./option");

class Nijika {
    constructor(wasmBuffer: ArrayBuffer) {
        this.loaded = new Promise<void>(async complete => {
            this.wasmModule = await WebAssembly.instantiate(
                wasmBuffer, {
                    env: {
                        emscripten_notify_memory_growth: () => {
                            this.memory = new Uint8Array(
                                this.wasmModule!.instance.exports.memory.buffer
                            );
                        }
                    }
                }
            ) as typeof this.wasmModule;
            this.memory = new Uint8Array(
                this.wasmModule!.instance.exports.memory.buffer
            );
            complete();
        })
    };

    dds(input: ArrayBuffer | Uint8Array): Uint8Array | undefined {
        const pointer = this.getInputBuffer(input);
        if (!this.wasmModule.instance.exports.getDDS(pointer))
            return;
        this.free(pointer);
        return this.getOutputBuffer()
    }

    private getInputBuffer(input: ArrayBuffer | Uint8Array) {
        const pointer = this.wasmModule.instance.exports.malloc(input.byteLength);
        this.memory.set(
            new Uint8Array(input), pointer
        );
        return pointer;
    };

    private free(pointer: number) {
        this.wasmModule.instance.exports.free(pointer);
    }

    private getOutputBuffer() {
        const size = this.wasmModule.instance.exports.fifoOutputSize();
        const pointer = this.wasmModule.instance.exports.fifoOutput();
        return this.memory.slice(pointer, pointer + size);
    }

    loaded: Promise<void> | undefined;

    private memory: Uint8Array;
    private wasmModule: WebAssembly.WebAssemblyInstantiatedSource & {
        instance: {
            exports: {
                fifoOutputSize: () => number,
                fifoOutput: () => number,

                getDDS: (ptr: number) => boolean,

                malloc: (size: number) => number,
                free: (ptr: number) => void,

                memory: {
                    buffer: ArrayBuffer
                }
            }
        }
    }
}

let nijika = new Nijika(
    await fetch(`https://github.com/MewoLab/nijika-wasm/releases/download/v1.2a/main.wasm`)
        .then(_ => _.arrayBuffer())
);
await nijika.loaded;

if (!fs.existsSync("music"))
    fs.mkdirSync("music")

for (const option of options) {
    const spinner = ora(`Processing`).start();
    if (fs.existsSync(`option/${option}/music`)) {
        for (const songFolder of fs.readdirSync(`option/${option}/music`)
            .filter(v => fs.statSync(`option/${option}/music/${v}`).isDirectory())
        ) {
            let songId = songFolder.substring(5);
            let ddsPath = `option/${option}/music/${songFolder}/CHU_UI_Jacket_${songId}.dds`;
            if (!fs.existsSync(ddsPath))
                continue;
            let dds = Buffer.from(
                fs.readFileSync(ddsPath)
            );
            if (!dds) continue;
            spinner.text = `Processing ${songId}`;
            let png = nijika.dds(dds);
            if (png)
                fs.writeFileSync(`music/${songId.padStart(6, "0")}.png`, png);
        }
    }
    spinner.stop();
}