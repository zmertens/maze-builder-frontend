import React, { useEffect, useState, Suspense } from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Mazelist from "./components/Mazelist";

const queryClient = new QueryClient();

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
    <Container maxWidth="xl">
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Mazes</Typography>
        </Toolbar>
      </AppBar>
      <QueryClientProvider client={queryClient}>
        <Mazelist />
        <Container className="card">
          <Suspense fallback={<Container>Loading...</Container>}>
            {isDomAvailable && <DynamicComponent />}
          </Suspense>
        </Container>
      </QueryClientProvider>
    </Container>
  );
}

export default App;
