[![Netlify Status](https://api.netlify.com/api/v1/badges/be13537b-f604-447a-beaf-a6d63496fb8e/deploy-status)](https://app.netlify.com/sites/jade-semifreddo-f24ef0/deploys?branch=main)

# maze-builder-frontend

Deployed on [Netlify](https://668145265561420d1369a177--jade-semifreddo-f24ef0.netlify.app/) - distribute securely using `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

Public files are generated using [https://www.github.com/zmertens/MazeBuilder](https://www.github.com/zmertens/MazeBuilder).
The steps to spin up the frontend is a multi-step process:
1. Generate JavaScript and WebAssembly files from MazeBuilder's C++ codebase. This is done with Emscripten toolchain and CMake.
   - [https://github.com/zmertens/MazeBuilder/blob/dev/README.md#cmake](https://github.com/zmertens/MazeBuilder/blob/dev/README.md#cmake)
2. Put the generated JS/WASM files in the frontend repo under the `/public/` folder.
   - [https://github.com/zmertens/maze-builder-frontend/tree/main/public](https://github.com/zmertens/maze-builder-frontend/tree/main/public)
3. From the root of the frontend source code, run `npm i` and then `npm run dev`.
   1. This should start the Vite server, open a browser with the specified port. For example, `localhost:5173`
4. The application should be running in the browser.

Additionally, one can run a local Python server directly from MazeBuilder's C++ repo using `secure_python_server.py`.
  - [https://github.com/zmertens/MazeBuilder/blob/dev/secure_http_server.py](https://github.com/zmertens/MazeBuilder/blob/dev/secure_http_server.py)
