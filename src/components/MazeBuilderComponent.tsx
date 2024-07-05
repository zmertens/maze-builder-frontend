import React, { useEffect, useState } from 'react';

const MazeBuilderComponent = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadWASM = async () => {
    // Check if the script is already loaded
    if (!document.querySelector('script[src="/public/maze_builder.js"]')) {
      const script = document.createElement("script");
      script.src = "/public/maze_builder.js";
      script.async = true;
  
      document.body.appendChild(script);
  
      script.onload = () => {
        if (typeof Module === 'function') {
          window.Module = Module({ canvas: document.getElementById("canvas") });
        } else {
          console.error('Module is not defined or not a function');
        }
      };
    }
  };

  useEffect(() => {
      loadWASM();
  }, []);

  return (
      <div>
        <h1> Build - Download Mazes</h1>
        <canvas id="canvas" width={windowWidth} style={{ backgroundColor : 'blue'}} onContextMenu={ (event) => event.preventDefault() } />            
      </div>
  );

};

export default MazeBuilderComponent;
