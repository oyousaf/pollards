import styles, { layout } from "../style";
import { Tooltip, Button, Grid } from "@nextui-org/react";

const Info = () => (
  <section id="info" className={layout.section}>
    <div className={layout.sectionInfo}>
      <h2 className={styles.heading2}>Common eye conditions</h2>
    </div>
    <Grid.Container gap={3} justify="center" alignContent="center">
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`(AMD) is a form of macular dystrophy. The macular, which is part of the retina at the back of the 
                eye, contains millions of cone cells. These cone cells allow you to see fine detail for things like reading, writing and recognising colours.
                When someone develops AMD, the cone cells become damaged and stop working as they should.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Age-related Macular Degeneration (AMD)
          </Button>
        </Tooltip>
      </Grid>
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`Birdshot Chorioretinopathy is a rare, progressive inflammation of the iris, choroid and cilary body, which together 
              make up a part of the eye known as the uvea. If left undiagnosed or untreated, the condition can cause blindness.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Birdshot Uveitis
          </Button>
        </Tooltip>
      </Grid>
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`Cataracts are a common eye condition in which the lens inside the eye gradually becomes less transparent with age. Over time, a 
                cataract can become worse, making vision cloudier, but it is usually treatable with a straightforward operation.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Cataracts
          </Button>
        </Tooltip>
      </Grid>
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`Charles Bonnet Syndrome (CBS) is a condition which causes vivid, silent, visual hallucinations. It can develop in a person of any age 
                – children are not exempt – when over 60% of sight is lost. Not everyone who loses sight develops CBS.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Charles Bonnet Syndrome
          </Button>
        </Tooltip>
      </Grid>
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`Diabetic Retinopathy is a complication of diabetes that damages the tiny blood vessels that deliver blood to the retinas. The condition 
                can cause blindness if left undiagnosed and untreated.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Diabetic Retinopathy
          </Button>
        </Tooltip>
      </Grid>
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`Glaucoma is the name given to a group of eye conditions that cause sight loss by damaging your optic nerve. Sight loss caused by glaucoma 
                is permanent but there are methods of prevention.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Glaucoma
          </Button>
        </Tooltip>
      </Grid>
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`Hemianopia can be caused by brain trauma, the most common of which is related to stroke.  The extent of sight loss varies from person to 
                person and depends on the area of the brain that has been affected by the stroke. Around two thirds of people who have a stroke experience some form of vision 
                loss or difficulty in seeing, including Hemianopia.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Hemianopia
          </Button>
        </Tooltip>
      </Grid>
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`Keratoconus is a progressive eye condition where the normally dome-shaped cornea thins and begins to bulge into a cone-like shape. This 
                distortion deflects light as it enters the eye on the way to the retina, which causes distorted vision.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Keratoconus
          </Button>
        </Tooltip>
      </Grid>
      <Grid css={{ dflex: "center" }}>
        <Tooltip
          color="secondary"
          content={`Retinitis Pigmentosa (RP) is the name given to a group of inherited eye conditions called retinal dystrophies. These conditions cause a 
                slow loss of vision, beginning with night vision and peripheral (side) vision and eventually affecting central, colour and reading vision.`}
        >
          <Button
            className="bg-[#63B7B7] hover:bg-[#008080] text-[#9f34b5] hover:text-[#C3B1E1] font-bold py-2 px-4 rounded shadow-md shadow-[#008080] 
              hover:scale-110 duration-500"
          >
            Retinitis Pigmentosa
          </Button>
        </Tooltip>
      </Grid>
    </Grid.Container>
  </section>
);

export default Info;
