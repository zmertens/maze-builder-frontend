import { useEffect, useRef } from "react";
// @ts-ignore - Emscripten factory function with adjacent .d.ts
import ModuleFactory from "../Breaking_Walls_App";

// Types from Breaking_Walls_App.d.ts
interface craft {
  get_version(): string;
  begin_export(): void;
  is_export_ready(): boolean;
  get_export(): string;
  get_export_status(): string;
  set_maze_rows(rows: number): void;
  set_maze_columns(cols: number): void;
  set_maze_algo(algo: string): void;
  set_maze_seed(seed: number): void;
  delete?(): void;
}

interface MainModule {
  get(): craft | null;
}

interface ModuleConfig {
  canvas?: HTMLCanvasElement;
  print?(...args: any[]): void;
  onRuntimeInitialized?(): void;
  requestFullscreen?: undefined;
}

const MazeBuilderComponent = () => {
  const verboseWasmLogs = false;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<craft | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const exportStatusRef = useRef<string>("idle");

  useEffect(() => {
    let isUnmounted = false;

    const setExportStatus = (next: string) => {
      if (exportStatusRef.current !== next) {
        exportStatusRef.current = next;
      }
    };

    const loadModule = async () => {
      try {
        if (!canvasRef.current) {
          console.error(
            "Canvas ref is not set. Canvas element may not be mounted yet."
          );
          return;
        }

        const c = canvasRef.current;
        console.log(
          `Canvas ref set. Dimensions: width=${c.width}, height=${c.height}, clientWidth=${c.clientWidth}, clientHeight=${c.clientHeight}`
        );

        // Set canvas size to match window dimensions once
        // This should NOT be reactive to window resize to avoid disrupting WebGL context
        c.width = window.innerWidth;
        c.height = window.innerHeight;

        // Define initialization function before creating ModuleConfig
        let activeModule: MainModule | null = null;

        const initializeEngine = () => {
          try {
            if (isUnmounted) {
              return;
            }
            if (!activeModule) {
              console.error(
                "Active module is not initialized"
              );
              return;
            }
            const mbi = activeModule.get();
            if (!mbi) {
              console.error(
                "Failed to create instance from activeModule.get()"
              );
              return;
            }

            console.log("[WASM] Engine instance acquired:", mbi);
            console.log("[WASM] Engine version:", mbi.get_version?.());

            instanceRef.current = mbi;

            // Expose export trigger globally so UI can trigger exports
            // @ts-ignore
            window.triggerExport = (opts?: { rows?: number; cols?: number; algo?: string; seed?: number }) => {
              if (!mbi || isUnmounted) {
                return;
              }

              opts = opts || {};
              if (opts.rows != null) mbi.set_maze_rows(opts.rows | 0);
              if (opts.cols != null)
                mbi.set_maze_columns(opts.cols | 0);
              if (opts.algo != null) mbi.set_maze_algo(String(opts.algo));
              if (opts.seed != null) mbi.set_maze_seed(opts.seed | 0);

              if (intervalIdRef.current != null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
              }

              setExportStatus("running");
              mbi.begin_export();

              let pollCount = 0;
              intervalIdRef.current = window.setInterval(() => {
                pollCount++;
                try {
                  if (!mbi.is_export_ready()) {
                    if (pollCount % 4 === 0) {
                      const status = mbi.get_export_status();
                      console.log(
                        `[WASM] Export in progress... (${status})`
                      );
                      setExportStatus(status);
                    }
                    return;
                  }

                  if (intervalIdRef.current != null) {
                    clearInterval(intervalIdRef.current);
                    intervalIdRef.current = null;
                  }

                  const mazeObjData = mbi.get_export();

                  if (!mazeObjData || mazeObjData.length === 0) {
                    console.warn(
                      "[WASM] Export produced empty OBJ data"
                    );
                    setExportStatus("idle");
                    return;
                  }

                  console.log(
                    `[WASM] Export ready: ${mazeObjData.length} bytes`
                  );
                  setExportStatus("ready");

                  // Trigger download
                  const blob = new Blob([mazeObjData], {
                    type: "text/plain",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download =
                    "maze_" +
                    new Date().toISOString().replace(/[:.]/g, "-") +
                    ".obj";
                  document.body.appendChild(a);
                  a.click();

                  setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    console.log("[WASM] Maze downloaded successfully");
                    setExportStatus("idle");
                  }, 100);
                } catch (err) {
                  if (intervalIdRef.current != null) {
                    clearInterval(intervalIdRef.current);
                    intervalIdRef.current = null;
                  }
                  console.error("[WASM] Export poll error:", err);
                  setExportStatus("error");
                }
              }, 250); // Poll every 250ms like the HTML version
            };
          } catch (err) {
            console.error("[WASM] Engine initialization error:", err);
          }
        };

        // Create the Module configuration object after initializeEngine is defined
        // @ts-ignore - requestFullscreen is set by Emscripten/SDL3 at runtime
        const moduleConfig: ModuleConfig = {
          // Ensure SDL can safely override this hook during runtime init
          requestFullscreen: undefined,
          canvas: c,
          print: (...args: any[]) => {
            if (verboseWasmLogs) {
              console.log("[WASM]", ...args);
            }
          },
          onRuntimeInitialized: () => {
            console.log("[WASM] Runtime initialized");
            initializeEngine();
          },
        };

        // Call the Emscripten factory function with pre-configured Module object
        console.log("Loading WASM module...");
        activeModule = await ModuleFactory(moduleConfig);
        if (isUnmounted) {
          try {
            (activeModule as any).emscripten_cancel_main_loop?.();
          } catch (cleanupErr) {
            console.warn("[WASM] Cleanup warning:", cleanupErr);
          }
          return;
        }
        console.log("WASM module loaded:", activeModule);
      } catch (err) {
        console.error("Error loading WASM module:", err);
      }
    };

    loadModule();

    // Cleanup function
    return () => {
      isUnmounted = true;
      if (intervalIdRef.current != null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      try {
        instanceRef.current?.delete?.();
      } catch (cleanupErr) {
        console.warn("[WASM] Instance cleanup warning:", cleanupErr);
      }
      instanceRef.current = null;
      // @ts-ignore
      window.triggerExport = undefined;
    };
  }, []); // useEffect

  return (
    <>
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <canvas
          id="canvas"
          className="emscripten"
          ref={canvasRef}
          style={{ display: "block", flex: 1 }}
        />
      </div>
    </>
  );
};

export default MazeBuilderComponent;
