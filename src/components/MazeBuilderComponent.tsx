import { useEffect, useRef, useState } from "react";
import Module, { craft } from "../mazebuildervoxels";

const MazeBuilderComponent = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [lastJSONSize, setLastJSONSize] = useState<number>(0);
  const [instance, setInstance] = useState<craft | null>(null);

  let intervalId = -1;

  // Poll for maze data periodically, look only for last-generated maze
  const pollForMazeData = (mbi: craft) => {
    intervalId = setInterval(async () => {
      try {
        if (mbi) {
          const downloadReady = await mbi.is_download_ready();
          if (downloadReady === false) {
            return;
          }
          const mazeInfoJson = await mbi.artifacts();
          if (mazeInfoJson.length > 0 && mazeInfoJson.length !== lastJSONSize) {
            setLastJSONSize(mazeInfoJson.length);
            // const mazeInfo = JSON.parse(mazeInfoJson);
            // setMazeInfo(mazeInfo);

            // Create a blob from the artifacts string
            const blob = new Blob([mazeInfoJson], { type: "text/plain" });

            // Create a download link and trigger download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download =
              "artifacts_" +
              new Date().toISOString().replace(/[:.]/g, "-") +
              ".obj";
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
              mbi.reset_download_flag();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              Module.print("Artifacts downloaded successfully!");
              console.log("Download triggered, cleanup complete");
            }, 100);

            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        clearInterval(intervalId);
      }
    }, 1000); // Check every 1 second
  }; // pollForMazeData

  useEffect(() => {
    const loadModule = async () => {
      try {
        // Assign the canvas to the global Module object before loading WASM

        if (canvasRef.current) {
          const c = canvasRef.current;
          console.log(
            `Canvas ref set. Dimensions: width=${c.width}, height=${c.height}, clientWidth=${c.clientWidth}, clientHeight=${c.clientHeight}`
          );
          // @ts-ignore
          window.Module = { canvas: c };
        } else {
          console.error(
            "Canvas ref is not set. Canvas element may not be mounted yet."
          );
        }

        console.log("Loading WASM module...");
        const activeModule = await Module();
        console.log("WASM module loaded:", activeModule);
        if (activeModule) {
          let mbi = null;
          try {
            mbi = await activeModule.get();
            console.log("Module.get() returned:", mbi);
          } catch (e) {
            console.error("Error calling activeModule.get():", e);
          }
          if (mbi) {
            setInstance(mbi);
            pollForMazeData(mbi);
          } else {
            console.error("Failed to create instance from activeModule.get()");
          }
        } else {
          console.error("Module() did not return an active module");
        }
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

    // Cleanup function to remove the event listener
    return () => {
      if (instance) {
        resizeObserver.disconnect();
        console.log("Deleting instance");
        setInstance(null);
      }
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
