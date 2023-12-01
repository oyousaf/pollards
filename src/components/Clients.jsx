import { clients } from "../constants";
import styles from "../style";

const Clients = () => (
  <section className={`${styles.flexCenter} my-4`}>
    <div className={`${styles.flexCenter} flex-wrap w-full`}>
      {clients.map((client) => (
        <div
          key={client.id}
          className={`flex-1 ${styles.flexCenter} sm:min-w-[200px] min-w-[100px]`}
        >
          <img
            src={client.logo}
            alt="client"
            width={100}
            height="100%"
            className="sm:w-[200px] object-contain"
          />
        </div>
      ))}
    </div>
  </section>
);

export default Clients;
