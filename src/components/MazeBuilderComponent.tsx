import React, { useEffect, useState } from 'react';

const MazeBuilderComponent = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isModuleReady, setIsModuleReady] = useState(false);

  useEffect(() => {
    loadWASM();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadWASM = async () => {
    // Check if the script is already loaded

      const script = document.createElement("script");
      script.src = "/maze_builder.js";
      // script.async = true;
  
      document.body.appendChild(script);
  
      script.onload = () => {
          window.Module = {
            canvas: document.getElementById("canvas"),
            onRuntimeInitialized: () => {
              setIsModuleReady(true);
              console.log('Module is ready');    
            }
          };
      };
  }; // loadWASM

  const handleDownloadClick = () => {
    if (!isModuleReady || !window.Module.do_stuff()) {
        console.error('Module is not ready');
        return;
    }
    const mazeInfoStr = window.Module.do_stuff();
    const mazeInfo = JSON.parse(mazeInfoStr);
    console.log("Maze Name:", mazeInfo.name);
    console.log("Maze Data:", mazeInfo.data);
  };

  return (
      <div>
        <h1> Build and Download Mazes</h1>
        <canvas id="canvas" width={windowWidth} style={{ backgroundColor : 'blue'}} onContextMenu={ (event) => event.preventDefault() } />            
        <br />
        <button id="buildButton" onClick={handleDownloadClick} disabled={!isModuleReady}>Build!</button>
      </div>
  );

};

export default MazeBuilderComponent;
