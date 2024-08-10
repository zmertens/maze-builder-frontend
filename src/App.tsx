import './App.css'
import React, { useEffect, useState, CSSProperties, Suspense } from 'react';

function App() {
  const [isDomAvailable, setIsDomAvailable] = useState(false);

  useEffect(() => {
    setIsDomAvailable(true)
  }, []);

  const headerStyle: CSSProperties = {
    width: '100%',
    height: '60px',
    backgroundColor: '#333',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    flexWrap: 'nowrap',
  }

  const DynamicComponent = React.lazy(() => isDomAvailable ? import('./components/MazeBuilderComponent') : Promise.resolve({ default: () => <div /> }));

  return (
    <>
      <div style={headerStyle}> 
      </div>
      <h1>Maze Builder</h1>
      <div className="card">
        <Suspense fallback={<div>Loading...</div>}>
          {isDomAvailable && <DynamicComponent />}
       </Suspense>
      </div>

    </>
  )
}

export default App
