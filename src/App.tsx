import React, { useEffect, useState, Suspense } from "react";

function App() {
  const [isDomAvailable, setIsDomAvailable] = useState(false);

  useEffect(() => {
    setIsDomAvailable(true);
  }, []);

  const DynamicComponent = React.lazy(() =>
    isDomAvailable
      ? import("./components/MazeBuilderComponent")
      : Promise.resolve({ default: () => <div /> })
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isDomAvailable && <DynamicComponent />}
    </Suspense>

  
  );
}

export default App;
