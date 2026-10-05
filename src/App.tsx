import { Navbar } from './components/nav/Navbar'
import { HeroScene } from './components/hero/HeroScene'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <HeroScene />
        {/* Placeholder anchors for nav — full sections later */}
        <div id="shop" className="app__anchor" hidden />
        <div id="about" className="app__anchor" hidden />
      </main>
    </div>
  )
}

export default App
