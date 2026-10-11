export const GenderOptions = ["Male", "Female", "Other"] as const;

export const IdentificationTypes = [
  "Passport",
  "Driving Licence",
  "National Identity Card",
  "Birth Certificate",
  "Medical Insurance Card/Policy",
  "Military ID Card",
] as const;

// NOTE: these are internationally known ophthalmologists inherited from the original template.
// Replace with Pollards' own clinicians (and photos used with their consent) before going live.
export const Doctors = [
  { image: "/assets/images/iqbal-ahmed.jpg", name: `Iqbal "Ike" K. Ahmed` },
  { image: "/assets/images/david-chang.jpg", name: "David F. Chang" },
  { image: "/assets/images/felipe-medeiros.jpg", name: "Felipe A. Medeiros" },
  { image: "/assets/images/joel-schuman.jpg", name: "Joel S. Schuman" },
  { image: "/assets/images/keith-martin.jpg", name: "Keith R. Martin" },
  { image: "/assets/images/dennis-lam.jpg", name: "Dennis S. C. Lam" },
  { image: "/assets/images/julia-haller.jpg", name: "Julia A. Haller" },
  { image: "/assets/images/charles-mcghee.jpg", name: "Charles N. J. McGhee" },
  { image: "/assets/images/jost-jonas.jpg", name: "Jost B. Jonas" },
  { image: "/assets/images/keith-barton.jpg", name: "Keith Barton" },
] as const;

export const doctorByName = (name?: string | null) =>
  Doctors.find((doctor) => doctor.name === name);

export const AppointmentReasons = [
  "Eye examination",
  "Contact lens fitting",
  "Keratoconus review",
  "Glasses collection",
  "Children's eye test",
  "Dry eye assessment",
] as const;

/**
 * Bookable hours in practice-local time (Europe/London). Adjust to real opening times.
 * Index = day of week (0 = Sunday). `null` = closed.
 */
export const OpeningHours: ReadonlyArray<{ open: number; close: number } | null> = [
  null,
  { open: 9, close: 17.5 },
  { open: 9, close: 17.5 },
  { open: 9, close: 17.5 },
  { open: 9, close: 17.5 },
  { open: 9, close: 17.5 },
  { open: 9, close: 13 },
];

export const SLOT_MINUTES = 30;
export const BOOKING_WINDOW_DAYS = 90;

export const MAX_ID_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_ID_DOCUMENT_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
} as const;

export const STATUSES = ["scheduled", "pending", "cancelled"] as const;
