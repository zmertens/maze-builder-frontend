/// <reference types="emscripten" />
// https://ecolingui.ca/en/blog/emguide-3/
export declare class craft {
    json: string;
    set_json(): void;
    get_json(): string;
    delete(): void;
}

interface MazeBuilderModule extends EmscriptenModule {
    get_instance: (window_title: string, help: string, version: string) => craft;
}

declare const Module: EmscriptenModuleFactory<MazeBuilderModule>;
export default Module;
