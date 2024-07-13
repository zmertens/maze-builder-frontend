[![Netlify Status](https://api.netlify.com/api/v1/badges/be13537b-f604-447a-beaf-a6d63496fb8e/deploy-status)](https://app.netlify.com/sites/jade-semifreddo-f24ef0/deploys?branch=main)

# maze-builder-frontend

Provides the Maze Builder application with a web interface.


Deployed on [Netlify](https://668145265561420d1369a177--jade-semifreddo-f24ef0.netlify.app/) - distributed securely using `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

## Build and Run

JavaScript glue code and files are generated using [Emscripten](https://emscripten.org/index.html) and [https://github.com/zmertens/MazeBuilder?tab=readme-ov-file#cmake](https://github.com/zmertens/MazeBuilder?tab=readme-ov-file#cmake).

There is a multi-step process to spin up the frontend with [Vite](https://vitejs.dev/):
1. Generate JavaScript and WebAssembly files from MazeBuilder's C++ codebase. This is done with Emscripten and CMake.
   - Please note that there are different performances and optimizations between the build configurations.
2. Move these generated files from the C++ repo to this one:
     - `maze_builder.js` under `src/`
    - `maze_builder.wasm` under `src/`
    - `maze_builder.wasm.map` under `src/`
    - `maze_builder.worker.js` under `src/`
    - `maze_builder.data` under `/public`
3. From the root of this repo, run `npm i` and then `npm run dev` , this will cause Vite to spin up a local server.
     - Open a browser with the specified port. For example, `localhost:5173`
4. The application should be running in the browser - verify with Dev Tools and console output.

Additionally, one can run a local Python server directly from MazeBuilder's C++ build repo using [secure_http_server.py](https://github.com/zmertens/MazeBuilder/blob/dev/secure_http_server.py).
