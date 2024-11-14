import { useState } from 'react'
import './App.css'
import ClassroomSimulation from './components/ClassroomSim'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ClassroomSimulation />
    </>
  )
}

export default App
