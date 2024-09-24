import { useEffect, useState } from "react";
import Module, { craft } from "../maze_builder";

const MazeBuilderComponent = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [mazeInfo, setMazeInfo] = useState<any | null>(null);
  const [instance, setInstance] = useState<craft | null>(null);

  let intervalId = -1;

  const pollForMazeData = (mbi: craft) => {
    // Polling for data readiness
    intervalId = setInterval(() => {
      
      try {
        const mazeInfoJson = mbi.mazes();
        if (mazeInfoJson !== "") {
          const mazeInfo = JSON.parse(mazeInfoJson);
          // Check if user creates a unique maze name
          if (mazeInfo && mazeInfo.name[0] !== ".") {
            setMazeInfo(mazeInfo);
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }, 1000); // Check every 1 second
  }; // pollForMazeData

  useEffect(() => {
    const loadModule = async () => {
      const activeModule = await Module();
      if (activeModule) {
        let mbi = activeModule.craft.get_instance("Maze Builder", "", 0, 0);
        if (mbi) {
          setInstance(mbi);
          pollForMazeData(mbi);
        } else {
          console.error("Failed to create instance");
        }
      }
    };

    loadModule();

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
        setInstance(null);
      }
      window.removeEventListener("resize", handleResize);
    }
  }, []); // useEffect

  const requestFullscreen = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    }
  }; // requestFullscreen

  const toggleAudio = () => {
    const audioButton = document.getElementById("btn-audio") as HTMLInputElement;
    if (audioButton.value === "🔊 UNMUTE") {
      audioButton.value = "🔇 MUTE";
    } else {
      audioButton.value = "🔊 UNMUTE";
    }
  }; // toggleAudio

  const handleDownloadClick = async () => {
    try {
      // Check before creating a download button for the JSON
      if (mazeInfo !== null) {
        const data = JSON.stringify(mazeInfo.data).split(",");
        let dataCombined = "";
        for (let i = 0; i < data.length; i++) {
          dataCombined += data[i].replace(/\"|\]|\[/g, '') + "\n";
        }
        const blob = new Blob([dataCombined], { type: "application/text" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${mazeInfo.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setMazeInfo(null);
        instance?.set_json("");
        pollForMazeData(instance as craft);
      };
    } catch (error) {
      console.error("Error creating instance:", error);
    }
  }; // handleDownloadClick

  return (
    <>
    <div id="header">
      <a id="logo" href="https://www.github.com/zmertens/MazeBuilder"></a>

      <span id='controls'>
        <span><input type="button" id="btn-mouse" value="🐁 MOUSE"/></span>
        <span><input type="button" value="🖵 FULLSCREEN" onClick={requestFullscreen}/></span>
        <span><input type="button" id="btn-audio" value="🔇 MUTE" onClick={toggleAudio}/></span>
      </span>

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
    </>
  );
};

export default MazeBuilderComponent;
