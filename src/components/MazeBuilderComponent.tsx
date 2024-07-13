import React, { useEffect, useState } from 'react';

const MazeBuilderComponent = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isModuleReady, setIsModuleReady] = useState(false);
  const [mazeInfo, setMazeInfo] = useState(null);

  let intervalId: number = -1;

  const pollForMazeData = () => {
    if (window.Module && window.Module.craft) {
      try {
        let instance = new window.Module.craft("Maze Builder", "Web", "NA");
        if (!instance) {
          console.error('Failed to create instance');
          return;
        }

        // Polling for data readiness
        intervalId = setInterval(() => {
        if (instance.is_json_rdy()) {
          const mazeInfoStr = instance.get_json();
          if (mazeInfoStr) {
            const mazeInfo = JSON.parse(mazeInfoStr);
            // Check if user create a unique maze name
            if (mazeInfo.name[0] !== '.') {
              setMazeInfo(mazeInfo);
              setIsModuleReady(true);
              console.log('Maze data is ready:', mazeInfo.name);
              console.log('Maze data:', mazeInfo.data);
              // Stop polling, got the data
              clearInterval(intervalId);
            }
          }
          instance.delete();
        }
      }, 1000); // Check every 1 second
      } catch (error) {
        console.error('Error creating instance:', error);
      }
    }
   }; // pollForMazeData

  useEffect(() => {
    loadWASM();
    
    // Poll every 1 second to check if the maze data is ready
    const intervalId = setInterval(() => {
      pollForMazeData();
    }, 1000);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalId);
    }
  }, []);

  const loadWASM = async () => {
      const script = document.createElement("script");
      script.src = "/maze_builder.js";
      document.body.appendChild(script);
  
      // This was pretty tricky because of how React handles component lifecycles
      // WASM files are asynchronous, so we need to load the script asynchronously
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
  
    if (window.Module && window.Module.craft) {
      try {
        let instance = new window.Module.craft("Maze Builder", "Web", "NA");
        if (!instance) {
          console.error('Failed to create instance');
          return;
        }
  
        // Polling for data readiness
        intervalId = setInterval(() => {
          if (instance.is_json_rdy()) {
            clearInterval(intervalId); // Stop polling
            const mazeInfoStr = instance.get_json();
            const mazeInfo = JSON.parse(mazeInfoStr);
            console.log("Maze Name:", mazeInfo.name);
            console.log("Maze Data:", mazeInfo.data);
            setMazeInfo(mazeInfo);
            // Proceed with creating a download button for the JSON
            const dataStr = JSON.stringify(mazeInfo.data);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${mazeInfo.name}`;
            document.body.appendChild(a);
            a.click(); // Trigger download
            document.body.removeChild(a); // Cleanup
            URL.revokeObjectURL(url); // Free up memory
          }
        }, 1000); // Check every 100 milliseconds
        instance.delete();
      } catch (error) {
        console.error('Error creating instance:', error);
      }
    } else {
      console.error('Module.craft is not available');
    }
  }; // handleDownloadClick

  return (
      <div>
        <h1> Build and Download Mazes</h1>
        <canvas id="canvas" width={windowWidth} style={{ backgroundColor : 'blue'}} onContextMenu={ (event) => event.preventDefault() } />            
        <br />
        <button onClick={handleDownloadClick} disabled={!isModuleReady || !mazeInfo} >Download Maze</button>
      </div>
  );

};

export default MazeBuilderComponent;
