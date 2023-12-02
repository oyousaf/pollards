import { Tooltip, Grid } from "@nextui-org/react";
import styles, { layout } from "../style";
import eyeConditions from "./eyeConditions";

const Info = () => (
  <section id="info" className={layout.section}>
    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>Common eye conditions</h2>
    </div>
    <Grid.Container gap={3} justify="center" alignContent="center">
      {eyeConditions.map((condition, index) => (
        <Grid key={index} css={{ dflex: "center" }}>
          <Tooltip color="secondary" content={condition.description}>
            <button
              className="bg-[#C3B1E1] hover:bg-[#002D04] text-[#002D04] hover:text-white shadow-md shadow-[#C3B1E1] hover:shadow-[#002D04] font-bold py-2 px-4 rounded 
                hover:scale-110 duration-500"
            >
              {condition.title}
            </button>
          </Tooltip>
        </Grid>
      ))}
    </Grid.Container>
  </section>
);

export default Info;
