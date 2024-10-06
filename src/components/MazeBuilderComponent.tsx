import { useEffect, useState, useRef } from "react";
import Module, { craft } from "../maze_builder";
import "./MazeBuilderComponent.css";

const MazeBuilderComponent = () => {
  const [isMouseCaptured, setIsMouseCaptured] = useState(false);
  const [mazeInfo, setMazeInfo] = useState<any | null>(null);
  const [instance, setInstance] = useState<craft | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pollForMazeData = (mbi: craft) => {
    // Polling for data readiness
    let intervalId = setInterval(() => {
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

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(canvas);
    
    flipMouse();
    handleResize();

    // Cleanup function to remove the event listener
    return () => {
      if (instance) {
        resizeObserver.disconnect();
        console.log("Deleting instance");
        instance.delete();
        setInstance(null);
      }
    
    };
  }, []); // useEffect

  const requestFullscreen = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.requestFullscreen) {
      canvas.requestFullscreen();
      instance?.fullscreen(true);
    }
  }; // requestFullscreen

  const flipMouse = () => {
    setIsMouseCaptured(!isMouseCaptured);
    instance?.mouse(isMouseCaptured);
    const mouseBtn = document.getElementById("mouseBtn") as HTMLInputElement;
    if (isMouseCaptured) mouseBtn.value = "🐁 MOUSE";
    else mouseBtn.value = "🔒 MOUSE";
  };

  const handleDownloadClick = async () => {
    try {
      // Check before creating a download button for the JSON
      if (mazeInfo !== null) {
        const data = JSON.stringify(mazeInfo.data).split(",");
        let dataCombined = "";
        for (let i = 0; i < data.length; i++) {
          dataCombined += data[i].replace(/\"|\]|\[/g, "") + "\n";
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
        pollForMazeData(instance as craft);
      }
    } catch (error) {
      console.error("Error creating instance:", error);
    }
  }; // handleDownloadClick

  return (
    <>
      <div className="container">
        <div className="banner">
          <span className="span-button">
            <input
              type="button"
              value="🖵 FULLSCREEN"
              onClick={requestFullscreen}
            />
          </span>
          <span className="span-button">
            <input id="mouseBtn" type="button" value="🐁 MOUSE" onClick={flipMouse} />
          </span>
          <span className="span-button">
            <input
              type="button"
              disabled={!mazeInfo}
              onClick={handleDownloadClick}
              value="🚀 DOWNLOAD"
            />
          </span>
        </div>
        <span className="canvas-container">
            <canvas
              id="canvas"
              className="canvas"
              ref={canvasRef}
              style={{ backgroundColor: "blue" }}
              onContextMenu={(event) => event.preventDefault()}
            />
          </span>
      </div>
    </>
  );
};

export default MazeBuilderComponent;
