import React, { useState } from "react"

export default function Home() {
    const [count, setCount] = useState(0)
    
    return (
        <div>
            <h1>Home</h1>
            <p>{count}</p>
            <button onClick={() => setCount(count => count + 1)}>Click me</button>
        </div>
    )
}