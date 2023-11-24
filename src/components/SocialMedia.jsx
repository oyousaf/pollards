import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

const socialMedia = [
  {
    id: "fb",
    icon: <FaFacebook />,
    link: "https://www.facebook.com/pollardsopticianswakefield/",
    target: "_blank",
  },
  {
    id: "insta",
    icon: <FaInstagram />,
    link: "https://instagram.com/pollards.opticians",
    target: "_blank",
  },
  {
    id: "linkedin",
    icon: <FaLinkedin />,
    link: "https://uk.linkedin.com/in/pollards-opticians-66716ba7",
    target: "_blank",
  },
  {
    id: "x",
    icon: <BsTwitterX />,
    link: "https://x.com/pollardsopti",
    target: "_blank",
  },
];

export default socialMedia;
