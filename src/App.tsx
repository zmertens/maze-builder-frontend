import { CSSProperties } from 'react'
import MazeBuilderComponent from './components/MazeBuilderComponent'
import './App.css'
import Header from './components/HeaderComponent'
import { BrowserRouter as Router } from 'react-router-dom';

function App() {

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

  return (
    <>
      <div style={headerStyle}> 
        <Router>
          <Header />
        </Router>
      </div>
      <h1>Maze Builder</h1>
      <div className="card">
       <MazeBuilderComponent />
      </div>

    </>
  )
}

export default App
