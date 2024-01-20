import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Snowfall from "react-snowfall";

import styles from "./style";
import {
  Nav,
  Hero,
  Stats,
  About,
  Info,
  Team,
  Endorsements,
  CTA,
  Footer,
  Clients,
} from "./components";

const App = () => (
  <Router>
    <div className="bg-primary w-full overflow-hidden">
      {/*<Snowfall
        snowflakeCount={100}
        style={{ bottom: 0, position: "fixed", width: "100%" }}
/>*/}
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Nav />
        </div>
      </div>

      <div className={`bg-primary ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <Hero />
        </div>
      </div>

      <div className={`bg-primary ${styles.paddingX} ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <Stats />
          <About />
          <Team />
          <Endorsements />
          <Info />
          <Clients />
          <CTA />
          <Footer />
        </div>
      </div>
    </div>
  </Router>
);

export default App;
