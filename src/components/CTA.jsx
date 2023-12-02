import styles from "../style";
import Button from "./Button";

const CTA = () => (
  <section
    className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}
  >
    <div className="flex-1 flex flex-col">
      <h2 className={styles.heading2}>Embark on a spectacle safari with us!</h2>
      <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
        We await your call between the refined hours of 8:30 am and 5:30 pm,
        Monday through Saturday. Let's frame your elegance with a touch of
        optical finesse.
      </p>
    </div>
    <div className={`${styles.flexCenter} sm:ml-10 ml-0 sm:mt-0 mt-10`}>
      <Button />
    </div>
  </section>
);

export default CTA;
