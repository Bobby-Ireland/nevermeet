export type ProfileGender = "woman" | "man";

export type Profile = {
  id: string;
  gender: ProfileGender;
  name: string;
  age: number;
  city: string;
  distance: string;
  bio: string;
  interests: string[];
  image: string;
  position?: string;
  opener: string;
  replyStyle: "dry" | "warm" | "chaotic" | "flirty";
};

// All identities, locations, distances and messages are fictional.
// Add another object here to extend the deck. See ASSETS.md for image credits.
const womenNames = ["Niamh", "Ava", "Zara", "Freya", "Leah", "Amara", "Roisin", "Elena", "Orla", "Hana", "Clara", "Isla", "Maeve", "Tara", "Layla", "Nora", "Keira", "Alana"];
const menNames = ["Finn", "Jamie", "Dara", "Oscar", "Ronan", "Eli", "Cian", "Noah", "Alex", "Sam", "Hugo", "Conor", "Kai", "Ben", "Adam", "Max", "Owen", "Aidan"];
const cities = ["Dublin", "Cork", "Galway", "Limerick", "Kilkenny", "Waterford", "Sligo", "Belfast"];
const womenBios = [
  "Sunday markets, tiny sunglasses and cancelling plans with excellent notice.",
  "Sea swims, red wine and an emotionally significant Notes app.",
  "Museum dates in theory. Staying home in practice.",
  "Runs on iced coffee, good lighting and plausible deniability.",
  "Ceramics, city breaks and never being ready when the taxi arrives.",
  "Live music, long lunches and one more episode.",
];
const menBios = [
  "Makes a great carbonara and an even better excuse not to leave the house.",
  "Running club, record shops and a very serious Sunday roast.",
  "Can recommend a wine. Cannot commit to a time.",
  "Climbs things recreationally. Avoids emotional heights professionally.",
  "Dog person, film nerd and optimistic owner of a gym membership.",
  "Good playlists, questionable dancing and elite-level plan avoidance.",
];
const interests = [
  ["Coffee", "People watching"], ["Sea swims", "Wine"], ["Galleries", "Sunday naps"],
  ["Live music", "City breaks"], ["Books", "Pasta"], ["Hikes", "Cinema"],
];
const styles: Profile["replyStyle"][] = ["dry", "warm", "chaotic", "flirty"];

const generatedWomen: Profile[] = womenNames.map((name, i) => ({
  id: `woman-${String(i + 1).padStart(2, "0")}`,
  gender: "woman",
  name,
  age: 25 + (i % 9),
  city: cities[i % cities.length],
  distance: `${2 + (i * 3) % 17} km away`,
  bio: womenBios[i % womenBios.length],
  interests: interests[i % interests.length],
  image: `/portraits/woman-${String(i + 1).padStart(2, "0")}.webp`,
  position: "50% 34%",
  opener: [
    "You look like someone I'd make elaborate plans with and then lovingly cancel on.",
    "Quick question: are you free never? My schedule just opened up.",
    "This match feels serious. We should avoid meeting before it gets out of hand.",
    "Okay, your profile has excellent fictional chemistry.",
  ][i % 4],
  replyStyle: styles[i % styles.length],
}));

const generatedMen: Profile[] = menNames.map((name, i) => ({
  id: `man-${String(i + 1).padStart(2, "0")}`,
  gender: "man",
  name,
  age: 26 + (i % 9),
  city: cities[(i + 2) % cities.length],
  distance: `${1 + (i * 4) % 18} km away`,
  bio: menBios[i % menBios.length],
  interests: interests[(i + 2) % interests.length],
  image: `/portraits/man-${String(i + 1).padStart(2, "0")}.webp`,
  position: "50% 34%",
  opener: [
    "Strong match. We should celebrate by making absolutely no plans.",
    "I had an opening line, but it required us to eventually meet. So, hi.",
    "You seem great. Shall we keep this perfect by never testing it in person?",
    "Our fictional meet-cute is already better than my real calendar.",
  ][i % 4],
  replyStyle: styles[(i + 1) % styles.length],
}));

export const profiles: Profile[] = [
  {
    id: "maya", gender: "woman", name: "Maya", age: 27, city: "Dublin", distance: "2 km away",
    bio: "Pilates, spicy margaritas and judging your Spotify Wrapped.",
    interests: ["Pilates", "Spicy margaritas"], image: "/portraits/maya.webp", position: "50% 35%",
    opener: "Okay, your profile is dangerously convincing 😌",
    replyStyle: "flirty",
  },
  {
    id: "theo", gender: "man", name: "Theo", age: 29, city: "Cork", distance: "4 km away",
    bio: "Coffee snob. Weekend surfer. Will absolutely steal your chips.",
    interests: ["Surfing", "Coffee"], image: "/portraits/theo.webp", position: "50% 35%",
    opener: "Important question: are we sharing chips, or should I order my own?",
    replyStyle: "dry",
  },
  {
    id: "sofia", gender: "woman", name: "Sofia", age: 26, city: "Galway", distance: "3 km away",
    bio: "Design nerd. Bookshops. Airport pints.",
    interests: ["Design", "Bookshops"], image: "/portraits/sofia.webp", position: "50% 35%",
    opener: "I was going to play it cool, but here we are. Hi ✨",
    replyStyle: "warm",
  },
  {
    id: "luca", gender: "man", name: "Luca", age: 31, city: "Limerick", distance: "5 km away",
    bio: "Good pasta, bad dancing and an unreasonable number of houseplants.",
    interests: ["Pasta", "Plant parent"], image: "/portraits/luca.webp", position: "50% 35%",
    opener: "You, me, a pasta recipe we'll never actually make. Thoughts?",
    replyStyle: "chaotic",
  },
  ...generatedWomen,
  ...generatedMen,
];

export const women = profiles.filter(profile => profile.gender === "woman");
export const men = profiles.filter(profile => profile.gender === "man");
