/// <reference types="emscripten" />
// https://ecolingui.ca/en/blog/emguide-3/
export declare class craft {
  set_json(string): void;
  get_json(): string;
  delete(): void;
}

interface MazeBuilderModule extends EmscriptenModule {
  get_instance: (window_title: string, help: string, version: string) => craft;
}

export type MazeResponse = {
  file: string;
  algorithm: string;
  width: number;
  length: number;
  height: number;
  seed: number;
  _links: {
    self: {
      href: string;
    };
    maze: {
      href: string;
    };
  };
};

export type Maze = {
  file: string;
  algorithm: string;
  width: number;
  length: number;
  height: number;
  seed: number;
};

export type MazeEntry = {
  maze: Maze;
  url: string;
};

declare const Module: EmscriptenModuleFactory<MazeBuilderModule>;
export default Module;
