import { card } from "../assets";
import styles, { layout } from "../style";

const Team = () => (
  <section id="team" className={layout.section}>
    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>
        Meet our lovely team
        <br className="sm:block hidden" />
      </h2>
      <p className={`${styles.paragraph} max-w-[480px] mt-5`}>
        With our expertise and attention to detail, we are committed to guiding
        you through a seamless and enjoyable eye care journey.
      </p>
    </div>
    <div className={layout.sectionImg}>
      <img src={card} alt="card" className="w-full h-full" />
    </div>
  </section>
);

export default Team;
