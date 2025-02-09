import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1>Electron + React App</h1>

      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          Count is: {count}
        </button>

        <p>
          Edit <code>src/App.jsx</code> to test Hot Module Replacement (HMR)
        </p>
      </div>

      <p className="footer">
        Built with Electron + React + Vite
      </p>
    </div>
  )
}

export default App