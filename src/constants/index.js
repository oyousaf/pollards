import {
  emma,
  denise,
  fizz,
  michael,
  rayban,
  oakley,
  porsche,
  tomford,
  glasses,
  eye,
  test,
} from "../assets";

export const navLinks = [
  {
    to: "#home",
    id: "home",
    title: "Home",
  },
  {
    to: "#about",
    id: "about",
    title: "About",
  },
  {
    to: "#team",
    id: "team",
    title: "Team",
  },

  {
    to: "#review",
    id: "review",
    title: "Reviews",
  },
  {
    to: "#info",
    id: "info",
    title: "Info",
  },
  {
    to: "#contact",
    id: "contact",
    title: "Contact",
  },
];

export const features = [
  {
    id: "feature-1",
    icon: glasses,
    title: "Spectacles",
    content:
      "We offer a comprehensive selection of glasses and frames to meet every need, accompanied by thorough fitting sessions to ensure the perfect match for your style and comfort.",
  },
  {
    id: "feature-2",
    icon: eye,
    title: "Contact Lenses",
    content:
      "We supply a variety of contact lenses, including disposable, extended-wear, hard, and soft lenses. Additionally, we provide specialist contact lenses tailored for different conditions such as Keratoconus, ensuring personalised solutions for all your eye care requirements.",
  },
  {
    id: "feature-3",
    icon: test,
    title: "Vision Assessments",
    content:
      "We offer thorough sight tests, featuring advanced 3D Ocular Coherence Tomography (OCT) examinations. During this process, we capture high-resolution digital images of the inner surface of your eyes. Our comprehensive sight tests ensure a detailed and precise evaluation of your eye health, allowing us to provide the most accurate and personalised care.",
  },
];

export const feedback = [
  {
    id: "feedback-1",
    content: `Fantastic knowledge and care shown by Pollards Opticians. They have gone above and beyond in assisting my dry eye condition and I would highly recommend them!`,
    name: "Scott Jackson",
    title: "Fantastic knowledge",
  },
  {
    id: "feedback-2",
    content: `Fantastic professional service. The team really put you at ease here. After only two visits I now have vision in my left eye after 8 years of blurred vision!`,
    name: "Mick Cleeve",
    title: "Fantastic professional service",
  },
  {
    id: "feedback-3",
    content: `Absolutely fantastic! My son has Nystagmus as well as an eye drift. All of the team at Pollards were absolutely brilliant with him from his eye test with Matthew, review with Fizz,
    glasses choice with Denise, and glasses fitting with Emma; nothing was too much trouble - we will be back!! Thank you for everything you did to help!`,
    name: "Sara O'Hara",
    title: "Absolutely brilliant",
  },
];

export const stats = [
  {
    id: "stats-1",
    title: "2009",
    value: "EST.",
  },
  {
    id: "stats-2",
    title: "In Wakefield",
    value: "BASED",
  },
  {
    id: "stats-3",
    title: "Professional Experience",
    value: `${new Date().getFullYear() - 2009}Y+`,
  },
];

export const clients = [
  {
    id: "client-1",
    logo: oakley,
  },
  {
    id: "client-2",
    logo: porsche,
  },
  {
    id: "client-3",
    logo: rayban,
  },
  {
    id: "client-4",
    logo: tomford,
  },
];

export const team = [
  {
    id: 1,
    image: denise,
    name: "Denise",
  },
  {
    id: 2,
    image: emma,
    name: "Emma",
  },
  {
    id: 3,
    image: fizz,
    name: "Fizz",
  },
  {
    id: 4,
    image: michael,
    name: "Matty",
  },
];
