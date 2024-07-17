import { useEffect, useState } from "react";
import Module, { craft } from "../maze_builder";

const MazeBuilderComponent = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mazeInfo, setMazeInfo] = useState<any | null>(null);
  const [instance, setInstance] = useState<craft | null>(null);

  useEffect(() => {
    let intervalId = -1;
    const loadModule = async () => {
      const activeModule = await Module();
      if (activeModule) {
        let mbi = activeModule.craft.get_instance("Maze Builder", "Web", "NA");
        if (mbi) {
          setInstance(mbi);
          pollForMazeData(mbi);
        } else {
          console.error("Failed to create instance");
        }
      }
    };

    loadModule();

    const pollForMazeData = (mbi: craft) => {
      // Polling for data readiness
      intervalId = setInterval(() => {
        
        try {
          // const mazeInfoJson = instance.get_json()!;
          const mazeInfoJson = mbi.get_json();
          if (mazeInfoJson !== "") {
            const mazeInfo = JSON.parse(mazeInfoJson);
            // Check if user creates a unique maze name
            if (mazeInfo && mazeInfo.name[0] !== ".") {
              setMazeInfo(mazeInfo);
              // Stop polling
              clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }, 1000); // Check every 1 second
    }; // pollForMazeData

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function to remove the event listener
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (instance) {
        console.log("Deleting instance");
        instance.delete();
      }
      window.removeEventListener("resize", handleResize);
    }
  }, []); // useEffect

  const handleDownloadClick = async () => {
    try {
      // Check before creating a download button for the JSON
      if (mazeInfo !== null) {
        const dataStr = JSON.stringify(mazeInfo.data);
        let dataCombined = "";
        for (let i = 0; i < dataStr.length; i++) {
          dataCombined += dataStr[i].replace(/[\[|\]|\"|\n,]/, "");
        }
        console.log(dataCombined);
        const blob = new Blob([dataCombined], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${mazeInfo.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setMazeInfo(null);
      };
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
        disabled={!mazeInfo}
        onClick={handleDownloadClick}
      >
        Download Maze
      </button>
    </div>
  );
};

export default MazeBuilderComponent;
