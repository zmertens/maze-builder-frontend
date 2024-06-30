import React, { useEffect } from 'react';

const MazeBuilderCanvas = () => {
  useEffect(() => {
    // Define a temporary Module object to hold configurations
    const moduleConfig = {
      canvas: () => document.getElementById('canvas'),
      // Add other configurations or callbacks needed by the Emscripten module
    };

    // Attach the temporary Module object to window
    window.Module = moduleConfig;

    // Load the Emscripten module script
    const script = document.createElement('script');
    script.src = '/maze_builder.js'; // Adjust the path if necessary
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function to remove the script and Module object
    return () => {
      document.body.removeChild(script);
      delete window.Module; // Consider resetting it to a previous state if needed
    };
  }, []);

  return <canvas id="canvas"></canvas>;
};

export default MazeBuilderCanvas;
