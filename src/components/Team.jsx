import styles, { layout } from "../style";

import Bubbles from "./Bubbles";

const Team = () => (
  <section id="team" className={layout.section}>
    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>
        Meet our lovely team
        <br className="sm:block hidden" />
      </h2>
      <p className={`${styles.paragraph} max-w-[480px] mt-5`}>
        At Pollards Opticians, we believe in fostering a warm and welcoming
        environment. Each member of our team is passionate about providing
        comprehensive eye care solutions tailored to meet your individual needs.
        Whether you're seeking routine eye examinations, specialised treatments,
        or personalised advice on eyewear, our experienced team is here to
        support you every step of the way. We take pride in staying at the
        forefront of advancements in eye care technology, allowing us to deliver
        cutting-edge solutions. Your vision is our priority, and we strive to
        exceed your expectations by combining expertise with a patient-centric
        approach. Trust our team to deliver excellence in eye care, and let us
        be your partners in maintaining optimal vision and eye health. Together,
        we look forward to enhancing and preserving the beauty of your eyesight.
      </p>
    </div>
    <div className={layout.sectionImg}>
      <Bubbles />
    </div>
  </section>
);

export default Team;
