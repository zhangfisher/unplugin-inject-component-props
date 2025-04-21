import { useState } from 'react'
import { AlignEndVertical, Apple, Armchair, Bug, CassetteTape, Citrus, Fan } from "lucide-react"
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div style={{width:'800px', minHeight:'200px',display:'flex', justifyContent:'center', alignItems:'center'}}>     
      <AlignEndVertical /><Apple /><Armchair /><Bug /><Citrus /><CassetteTape /><Fan />
      </div>
      <h1>unplugin-inject-props</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
