import About from "./components/About";
import Contact from "./components/Contact";
import Gallery from "./components/Gallery";
import Home from "./components/Home";
import Info from "./components/Info";
import Navbar from "./components/Navbar";
import Team from "./components/Team";

function App() {
  return (
    <div>
      <Navbar />
      <Home />
      <About />
      <Team />
      <Info />
      <Gallery />
      <Contact />
    </div>
  );
}

export default App;
