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
      const script = document.createElement("script");
      script.src = "/maze_builder.js";
      document.body.appendChild(script);
  
      // This was pretty tricky because of how React handles component lifecycles
      // WASM files are asynchronous, so we need to wait for the script to load
      script.onload = async () => {
        window.Module = await Module({ canvas : document.getElementById("canvas")});
        setIsModuleReady(true);
        }
   }; // loadWASM

  const handleDownloadClick = () => {
    if (!isModuleReady) {
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
        <button onClick={handleDownloadClick} disabled={!isModuleReady} >Download Maze</button>
      </div>
  );

};

export default MazeBuilderComponent;
