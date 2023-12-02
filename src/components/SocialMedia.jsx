import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

const socialMedia = [
  {
    id: "Facebook",
    icon: <FaFacebook />,
    link: "https://www.facebook.com/pollardsopticianswakefield/",
    target: "_blank",
  },
  {
    id: "Instagram",
    icon: <FaInstagram />,
    link: "https://instagram.com/pollards.opticians",
    target: "_blank",
  },
  {
    id: "Linkedin",
    icon: <FaLinkedin />,
    link: "https://uk.linkedin.com/in/pollards-opticians-66716ba7",
    target: "_blank",
  },
  {
    id: "Twitter",
    icon: <BsTwitterX />,
    link: "https://x.com/pollardsopti",
    target: "_blank",
  },
];

export default socialMedia;
