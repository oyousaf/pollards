export const GenderOptions = ["Male", "Female", "Other"];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "Male" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's Licence",
  "Medical Insurance Card/Policy",
  "Military ID Card",
  "National Identity Card",
  "Passport",
];

export const Doctors = [
  {
    image: "/assets/images/iqbal-ahmed.jpg",
    name: `Iqbal "Ike" K. Ahmed`,
  },
  {
    image: "/assets/images/david-chang.jpg",
    name: "David F. Chang",
  },
  {
    image: "/assets/images/felipe-medeiros.jpg",
    name: "Felipe A. Medeiros",
  },
  {
    image: "/assets/images/joel-schuman.jpg",
    name: "Joel S. Schuman",
  },
  {
    image: "/assets/images/keith-martin.jpg",
    name: "Keith R. Martin",
  },
  {
    image: "/assets/images/dennis-lam.jpg",
    name: "Dennis S. C. Lam",
  },
  {
    image: "/assets/images/julia-haller.jpg",
    name: "Julia A. Haller",
  },
  {
    image: "/assets/images/charles-mcghee.jpg",
    name: "Charles N. J. McGhee",
  },
  {
    image: "/assets/images/jost-jonas.jpg",
    name: "Jost B. Jonas",
  },
  {
    image: "/assets/images/keith-barton.jpg",
    name: "Keith Barton"
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
