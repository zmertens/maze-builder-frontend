/// <reference types="emscripten" />
// https://ecolingui.ca/en/blog/emguide-3/
export declare class craft {
  mazes(): string;
  delete(): void;
}

interface MazeBuilderModule extends EmscriptenModule {
  get_instance: (v: string, h: string, w: number, h: number) => craft;
}

export type MazeResponse = {
  obj64: string;
  algorithm: string;
  num_rows: number;
  num_cols: number;
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
  obj64: string;
  algorithm: string;
  num_rows: number;
  num_cols: number;
  height: number;
  seed: number;
};

declare const Module: EmscriptenModuleFactory<MazeBuilderModule>;
export default Module;
