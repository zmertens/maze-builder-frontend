import { useEffect, useState } from "react";
import Module, { craft } from "../voxels";

const MazeBuilderComponent = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [mazeInfo, setMazeInfo] = useState<any | null>(null);
  const [lastJSONSize, setLastJSONSize] = useState<number>(0);
  const [instance, setInstance] = useState<craft | null>(null);

  let intervalId = -1;

  // Poll for maze data periodically, look only for last-generated maze
  const pollForMazeData = (mbi: craft) => {
    intervalId = setInterval(async () => {
      try {
        if (mbi) {
          const mazeInfoJson = await mbi.mazes();
          // Check if the JSON has changed, if so, update the state
          if (mazeInfoJson.length > 0 && mazeInfoJson.length !== lastJSONSize) {
            setLastJSONSize(mazeInfoJson.length);
            const mazeInfo = JSON.parse(mazeInfoJson);
            setMazeInfo(mazeInfo);
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
    const canvas = document.querySelector('canvas.emscripten');

    const loadModule = async () => {
      const activeModule = await Module();
      if (activeModule) {
        let mbi = activeModule.craft.get_instance("Maze Builder", "", 800, 600);
        if (mbi) {
          setInstance(mbi);
          pollForMazeData(mbi);
        } else {
          console.error("Failed to create instance");
        }
      }
    };

    loadModule();

    const resizeObserver = new ResizeObserver((entries) => {
      if (canvas) {
        for (let entry of entries) {
          if (entry.target === document.documentElement) {
            setWindowSize({
              width: window.innerWidth,
              height: window.innerHeight,
            });
          }
        }
      }
    });

    resizeObserver.observe(document.documentElement);

    // Cleanup function to remove the event listener
    return () => {
      if (instance) {
        resizeObserver.disconnect();
        console.log("Deleting instance");
        instance.delete();
        setInstance(null);
      }
      resizeObserver.unobserve(document.documentElement);
    }
  }, []); // useEffect

  const handleDownloadClick = async () => {
    try {
      // Check before creating a download button for the JSON
      if (mazeInfo !== null) {
        const data = atob(mazeInfo.obj64);
        const blob = new Blob([data], { type: "application/text" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${mazeInfo.algo}_${mazeInfo.seed}.obj`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset polling state
        const btn = document.querySelector('input[type=button]');
        btn?.setAttribute('disabled', 'true');
        setMazeInfo(null);
        pollForMazeData(instance as craft);
      }
    } catch (error) {
      console.error("Error creating instance:", error);
    }
  }; // handleDownloadClick

  return (
    <>
    <div>
      <span>
        <canvas id="canvas" width={windowSize.width} height={windowSize.height} />
      </span>
      <br />
      <span className="span-button">
        <input type="button" value="🚀 Download" disabled={!mazeInfo} onClick={handleDownloadClick} />
      </span>
    </div>
    </>
  );
};

export default MazeBuilderComponent;
