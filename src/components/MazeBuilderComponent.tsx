import { useEffect, useRef, useState } from "react";
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
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [instance, setInstance] = useState<craft | null>(null);
  const [exportStatus, setExportStatus] = useState<string>("idle");

  let intervalId = -1;

  useEffect(() => {
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

        // Define initialization function before creating ModuleConfig
        let activeModule: MainModule | null = null;

        const initializeEngine = () => {
          try {
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

            setInstance(mbi);

            // Expose export trigger globally so UI can trigger exports
            // @ts-ignore
            window.triggerExport = (opts?: { rows?: number; cols?: number; algo?: string; seed?: number }) => {
              if (mbi) {
                opts = opts || {};
                if (opts.rows != null) mbi.set_maze_rows(opts.rows | 0);
                if (opts.cols != null)
                  mbi.set_maze_columns(opts.cols | 0);
                if (opts.algo != null) mbi.set_maze_algo(String(opts.algo));
                if (opts.seed != null) mbi.set_maze_seed(opts.seed | 0);

                setExportStatus("running");
                mbi.begin_export();

                let pollCount = 0;
                intervalId = window.setInterval(() => {
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

                    clearInterval(intervalId);
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
                    clearInterval(intervalId);
                    console.error("[WASM] Export poll error:", err);
                    setExportStatus("error");
                  }
                }, 250); // Poll every 250ms like the HTML version
              }
            };
          } catch (err) {
            console.error("[WASM] Engine initialization error:", err);
          }
        };

        // Create the Module configuration object after initializeEngine is defined
        // @ts-ignore - requestFullscreen is set by Emscripten/SDL3 at runtime
        const ModuleConfig: any = {
          // Ensure SDL can safely override this hook during runtime init
          requestFullscreen: undefined,
          canvas: c,
          print: (...args: any[]) => {
            console.log("[WASM]", ...args);
          },
          onRuntimeInitialized: () => {
            console.log("[WASM] Runtime initialized");
            initializeEngine();
          },
        };

        // Call the Emscripten factory function with pre-configured Module object
        console.log("Loading WASM module...");
        activeModule = await ModuleFactory(ModuleConfig);
        console.log("WASM module loaded:", activeModule);
      } catch (err) {
        console.error("Error loading WASM module:", err);
      }
    };

    loadModule();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === document.documentElement) {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }
      }
    });

    resizeObserver.observe(document.documentElement);

    // Cleanup function
    return () => {
      if (intervalId !== -1) {
        clearInterval(intervalId);
      }
      resizeObserver.disconnect();
      resizeObserver.unobserve(document.documentElement);
    };
  }, []); // useEffect

  return (
    <>
      <div>
        <span>
          <canvas
            id="canvas"
            className="emscripten"
            ref={canvasRef}
            width={windowSize.width}
            height={windowSize.height}
          />
        </span>
      </div>
    </>
  );
};

export default MazeBuilderComponent;
