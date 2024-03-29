import React from "react";
import { features } from "../constants";
import styles, { layout } from "../style";
import Button from "./Button";

const FeatureCard = ({ icon, title, content, index }) => (
  <div
    className={`flex flex-row p-6 rounded-[20px] ${
      index !== features.length - 1 ? "mb-6" : "mb-0"
    } feature-card`}
  >
    <div
      className={`w-[64px] h-[64px] rounded-full ${styles.flexCenter} bg-dimWhite`}
    >
      <img src={icon} alt="icon" className="w-[50%] h-[50%] object-contain" />
    </div>
    <div className="flex-1 flex flex-col ml-3">
      <h3 className="font-semibold text-gray-100 text-[18px] leading-[23px] mb-1">
        {title}
      </h3>
      <p className="font-normal text-white text-[16px] leading-[24px] mb-1">
        {content}
      </p>
    </div>
  </div>
);

const About = () => {
  return (
    <section id="about" className={layout.section}>
      <div className={layout.sectionInfo}>
        <h2 className={styles.heading2}>Welcome!</h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          We are an independent opticians located in the heart of Wakefield.
          With strong links to Pinderfields Hospital and our investment in the
          latest technology, we thrive on delivering personalised eye care and
          vision correction to the highest possible standard.
        </p>
        <Button styles="mt-10" />
      </div>

      <div className={`${layout.sectionImg} flex-col`}>
        {features.map((feature, index) => (
          <FeatureCard key={feature.id} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
};

export default About;
