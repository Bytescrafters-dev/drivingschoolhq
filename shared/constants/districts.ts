/** Sri Lankan districts (backend `District` enum). Send the value; display the label. */
export const DISTRICTS = [
  "AMPARA",
  "ANURADHAPURA",
  "BADULLA",
  "BATTICALOA",
  "COLOMBO",
  "GALLE",
  "GAMPAHA",
  "HAMBANTOTA",
  "JAFFNA",
  "KALUTARA",
  "KANDY",
  "KEGALLE",
  "KILINOCHCHI",
  "KURUNEGALA",
  "MANNAR",
  "MATALE",
  "MATARA",
  "MONARAGALA",
  "MULLAITIVU",
  "NUWARA_ELIYA",
  "POLONNARUWA",
  "PUTTALAM",
  "RATNAPURA",
  "TRINCOMALEE",
  "VAVUNIYA",
] as const;

export type District = (typeof DISTRICTS)[number];

/** `NUWARA_ELIYA` → "Nuwara Eliya". */
export const districtLabel = (district: string): string =>
  district
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
