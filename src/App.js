import About from "./components/About";
import Contact from "./components/Contact";
import Gallery from "./components/Gallery";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Team from "./components/Team";

function App() {
  return (
    <div>
      <Navbar />
      <Home />
      <About />
      <Team />
      <Gallery />
      <Contact />
    </div>
  );
}

export default App;
