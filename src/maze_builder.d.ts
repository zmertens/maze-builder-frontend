/// <reference types="emscripten" />
// https://ecolingui.ca/en/blog/emguide-3/
declare class craft {
    is_json_rdy(): boolean;
    get_json(): string;
    delete(): void;
}

interface MazeBuilderModule extends EmscriptenModule {
    craft: {
        new(window_title: string, help: string, version: string): craft;
    }
}

declare const Module: EmscriptenModuleFactory<MazeBuilderModule>;
export default Module;
