import React, { useEffect, useRef } from 'react';

const MazeBuilderCanvas = () => {
  const loadWASM = async () => {
    const script = document.createElement("script");
    script.src = "/public/maze_builder.js";
    script.async = true;

    document.body.appendChild(script);

    script.onload = async() => {
        window.Module = await Module({ canvas : document.getElementById("canvas")});
    }
 }

  useEffect(() => {
      loadWASM();
  }, []);

  return (
      <div>
          <h1> FileSystemTest</h1>
          <canvas id="canvas" style={{ backgroundColor : 'blue'}} onContextMenu={ (event) => event.preventDefault() } />            
      </div>
  );

};

export default MazeBuilderCanvas;
