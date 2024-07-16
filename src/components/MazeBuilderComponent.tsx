import { useEffect, useState } from "react";

import Module from "../maze_builder";
import MazeBuilderModule from "../maze_builder";

const MazeBuilderComponent = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isModuleReady, setIsModuleReady] = useState(false);
  const [mazeInfo, setMazeInfo] = useState(null);
  let wasmModuleInitialized = false;
  let mazeBuilderInstance: typeof MazeBuilderModule | null = null;

  async function getMazeBuilderInstance() {
    if (!mazeBuilderInstance) {
      let mazeBuilderModule = await Module();
      mazeBuilderInstance = new mazeBuilderModule.craft("Maze Builder", "Web", "NA");
    }
    return mazeBuilderInstance;
  }

  async function initWASM() {
    if (wasmModuleInitialized) {
      console.log("WASM module already initialized");
      return;
    }
    wasmModuleInitialized = true;
    try {
      const instance = await getMazeBuilderInstance();
      if (!instance) {
        console.error("Failed to create instance");
      }
      setIsModuleReady(true);
    } catch (error) {
      console.error("Error creating instance:", error);
    }
  } // initWASM

  const pollForMazeData = async () => {
      try {
        const instance = await getMazeBuilderInstance();
        if (!instance) {
          console.error("Failed to create instance");
          return;
        }

        // Polling for data readiness
        const intervalId = setInterval(() => {
          if (instance && instance.is_json_rdy()) {
            const mazeInfoStr = instance.get_json();
            if (mazeInfoStr) {
              const mazeInfo = JSON.parse(mazeInfoStr);
              // Check if user creates a unique maze name
              if (mazeInfo.name[0] !== ".") {
                setMazeInfo(mazeInfo);
                console.log("Maze data is ready:", mazeInfo.name);
                console.log("Maze data:", mazeInfo.data);
              }
            }
          } // is_json_rdy
          // Stop polling
          clearInterval(intervalId);
        }, 1000); // Check every 1 second
      } catch (error) {
        console.error("Error creating instance:", error);
      }
  }; // pollForMazeData

  useEffect(() => {
    initWASM();

    pollForMazeData();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("resize", handleResize);
      resetMazebuilderInstance();
    };
  }, []);

  function resetMazebuilderInstance() {
    mazeBuilderInstance = null;
  }

  const handleDownloadClick = async () => {
    if (!isModuleReady) {
      console.error("Module is not ready");
      return;
    }

    try {
      const instance = await getMazeBuilderInstance();
      if (!instance) {
        console.error("Failed to create instance");
        return;
      }

      const mazeInfoStr = instance.get_json();
      const mazeInfo = JSON.parse(mazeInfoStr);
      console.log("Maze Name:", mazeInfo.name);
      console.log("Maze Data:", mazeInfo.data);
      setMazeInfo(mazeInfo);
      // Proceed with creating a download button for the JSON
      const dataStr = JSON.stringify(mazeInfo.data);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mazeInfo.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      instance.delete();
    } catch (error) {
      console.error("Error creating instance:", error);
    }
  }; // handleDownloadClick

  return (
    <div>
      <h1> Build and Download Mazes</h1>
      <canvas
        id="canvas"
        width={windowWidth}
        style={{ backgroundColor: "blue" }}
        onContextMenu={(event) => event.preventDefault()}
      />
      <br />
      <button
        disabled={!isModuleReady || !mazeInfo}
        onClick={handleDownloadClick}
      >
        Download Maze
      </button>
    </div>
  );
};

export default MazeBuilderComponent;
