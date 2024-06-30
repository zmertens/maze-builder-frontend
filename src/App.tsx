import { useState } from 'react'
import MazeBuilderCanvas from './components/MazeBuilderCanvas'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Maze Builder</h1>
      <div className="card">
       <MazeBuilderCanvas />
      </div>
      <p className="read-the-docs">
        Click on the About to learn more about this project.
      </p>
    </>
  )
}

export default App
