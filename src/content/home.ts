export const whatsappBase = "https://wa.me/255789113131";

export function whatsappHref(message: string) {
  return `${whatsappBase}?text=${encodeURIComponent(message)}`;
}

export const consultationHref = whatsappHref(
  "Hello VastuVibe Group, I'm interested in Dubai properties.",
);

export const trustMarquee = [
  "VASTUVIBE GROUP",
  "DAR ES SALAAM",
  "OFFICIAL DAMAC SALES PARTNER",
  "DUBAI RESIDENCES",
  "+255 789 113 131",
] as const;

export const residences = [
  {
    index: "01",
    name: "Skyline Residences",
    line: "Towers with the city at your feet.",
    assetKey: "tower-hero",
  },
  {
    index: "02",
    name: "Marina After Dark",
    line: "Waterfront calm, metropolitan energy.",
    assetKey: "marina-night",
  },
  {
    index: "03",
    name: "Lagoon Villas",
    line: "Turquoise water at the doorstep.",
    assetKey: "lagoon-aerial",
  },
  {
    index: "04",
    name: "Private Villas",
    line: "Space, privacy and architectural poise.",
    assetKey: "villas-dusk",
  },
  {
    index: "05",
    name: "Penthouse Interiors",
    line: "Evenings above the skyline.",
    assetKey: "interior-night",
  },
] as const;

export const dealStats = [
  { from: 0, to: 4, suffix: "%", label: "DLD waiver" },
  { from: 0, to: 4, suffix: "%", label: "Exclusive event discount" },
  { from: 12, to: 15, suffix: "%", label: "Projected ROI" },
  { from: 0, to: 50, suffix: "%", label: "Appreciation by handover" },
] as const;

export const spotlightSlides = [
  {
    assetKey: "skyline-dubai",
    kicker: "The city, composed",
    caption: "Dubai's night skyline from a quieter point of view.",
  },
  {
    assetKey: "interior-night",
    kicker: "Private elevation",
    caption: "Interiors made for evenings above the lights.",
  },
  {
    assetKey: "lagoon-aerial",
    kicker: "Water at the door",
    caption: "An address shaped around turquoise calm.",
  },
] as const;

export const journeySteps = [
  {
    index: "01",
    title: "Private discovery",
    body: "A one-to-one consultation in Dar es Salaam, on your terms.",
  },
  {
    index: "02",
    title: "Guided virtual viewing",
    body: "Walk your shortlisted residences with our team, room by room.",
  },
  {
    index: "03",
    title: "Secured with DAMAC",
    body: "Reservation and paperwork handled end to end.",
  },
  {
    index: "04",
    title: "Handover & ownership",
    body: "Your keys, your address, your Dubai.",
  },
] as const;

export const founderNote = {
  quote:
    "We started VastuVibe with a simple belief: Tanzanians deserve a trusted, private door to the world's most rewarding property market. We keep it personal — one conversation at a time.",
  attribution: "— Founder, VastuVibe Group",
} as const;
