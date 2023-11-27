import { Tooltip, Button, Grid } from "@nextui-org/react";
import { layout } from "../style";
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
            <Button
              className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
                hover:scale-110 duration-500"
            >
              {condition.title}
            </Button>
          </Tooltip>
        </Grid>
      ))}
    </Grid.Container>
  </section>
);

export default Info;
