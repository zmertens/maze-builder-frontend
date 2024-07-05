import React, { useState, useEffect} from 'react';

const DownloadComponent = () => {
  const [isModuleReady, setIsModuleReady] = useState(false);

  useEffect(() => {
    const checkModuleReadiness = () => {
      if (window.Module && typeof window.Module.get_vertex_data === 'function') {
        setIsModuleReady(true);
      } else {
        // Retry after a delay if Module is not ready
        setTimeout(checkModuleReadiness, 100); // Check every 100ms
      }
    };

    checkModuleReadiness();
    // Check if the script is already loaded
    if (!document.querySelector('script[src="/public/maze_builder.js"]')) {
      const script = document.createElement("script");
      script.src = "/maze_builder.js";
      script.async = true;
      script.onload = () => {
        // Initialization or configuration code here
        // For example, if you need to initialize a module similar to MazeBuilderComponent
        if (typeof Module === 'function') {
          window.Module = Module({ /* configuration options */ });
        }
      }
      document.body.appendChild(script);

      // Cleanup function to remove the script when the component unmounts
      return () => {
        document.body.removeChild(script);
      };
    };
  }, []);

  const handleDownloadClick = () => {
    if (!isModuleReady) {
        console.error('Module is not ready');
        return;
    }
    const mazeInfoStr = window.Module.craft.get_vertex_data();
    const mazeInfo = JSON.parse(mazeInfoStr);
    console.log("Maze Name:", mazeInfo.name);
    console.log("Maze Data:", mazeInfo.data);
  };

  return (
    <button id="buildButton" onClick={handleDownloadClick} disabled={!isModuleReady}>Build!</button>
  );
};

export default DownloadComponent;
