import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.js";

const password = await bcrypt.hash("password123", 10);

// ─── Helpers ────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice() {
  return pick([30000, 35000, 40000, 45000, 50000, 55000, 60000, 75000, 100000]);
}

function futureDate(daysFromNow, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function pastDate(daysAgo, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const studios = [
  "Studio 1",
  "Studio 2",
  "Studio 3",
  "Studio 4",
  "Studio 5",
  "IMAX 1",
  "IMAX 2",
  "Dolby Atmos",
  "VIP Lounge",
  "Outdoor Screen",
];

const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seatsPerRow = 12;

function generateSeats() {
  const seats = [];
  for (const row of rows) {
    for (let i = 1; i <= seatsPerRow; i++) {
      seats.push(`${row}${i}`);
    }
  }
  return seats;
}

const allSeats = generateSeats();

// ─── Seed Users ─────────────────────────────────────────────────────────────

async function seedUser({ username, email, role }) {
  return prisma.user.upsert({
    where: { email },
    update: { username, role },
    create: { username, email, password, role },
  });
}

async function seedUsers() {
  const users = [];

  // Admin users
  users.push(
    await seedUser({
      username: "admin",
      email: "admin@example.com",
      role: "ADMIN",
    }),
  );
  users.push(
    await seedUser({
      username: "superadmin",
      email: "superadmin@example.com",
      role: "ADMIN",
    }),
  );
  users.push(
    await seedUser({
      username: "manager",
      email: "manager@example.com",
      role: "ADMIN",
    }),
  );

  // Regular users
  const userNames = [
    "alice",
    "bob",
    "charlie",
    "diana",
    "eve",
    "frank",
    "grace",
    "henry",
    "iris",
    "jack",
    "kate",
    "leo",
    "mia",
    "noah",
    "olivia",
    "peter",
    "quinn",
    "ruby",
    "sam",
    "tina",
    "ulysses",
    "violet",
    "will",
    "xena",
    "yusuf",
    "zara",
    "adam",
    "bella",
    "carl",
    "dina",
    "elijah",
    "fiona",
    "george",
    "hannah",
    "ivan",
    "julia",
    "kevin",
    "luna",
    "marcus",
    "nina",
    "oscar",
    "paula",
    "rafael",
    "sophia",
    "tom",
    "uma",
    "victor",
    "wendy",
    "xander",
    "yasmin",
    "zack",
  ];

  for (let i = 0; i < userNames.length; i++) {
    users.push(
      await seedUser({
        username: userNames[i],
        email: `${userNames[i]}@example.com`,
        role: "USER",
      }),
    );
  }

  return users;
}

// ─── Seed Movies ────────────────────────────────────────────────────────────

const moviesData = [
  // Action
  {
    title: "The Dark Knight",
    description:
      "Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy.",
    duration: 152,
    genre: "Action",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nECeA.jpg",
  },
  {
    title: "Inception",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
    duration: 148,
    genre: "Action",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
  },
  {
    title: "Mad Max: Fury Road",
    description:
      "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland.",
    duration: 120,
    genre: "Action",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg",
  },
  {
    title: "John Wick",
    description:
      "An ex-hitman comes out of retirement to track down the gangsters that killed his dog.",
    duration: 101,
    genre: "Action",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
  },
  {
    title: "Die Hard",
    description:
      "An NYPD officer tries to save his wife and several others taken hostage by German terrorists.",
    duration: 132,
    genre: "Action",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/yFihqxQbW3Z2CHYjH1YwNcPi8H5.jpg",
  },
  {
    title: "Mission: Impossible – Fallout",
    description:
      "Ethan Hunt and his IMF team race against time after a mission gone wrong.",
    duration: 147,
    genre: "Action",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg",
  },
  {
    title: "The Matrix",
    description:
      "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
    duration: 136,
    genre: "Action",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  },
  {
    title: "Gladiator",
    description:
      "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.",
    duration: 155,
    genre: "Action",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmJ1U1mTnU1K4XyK.jpg",
  },
  {
    title: "Terminator 2: Judgment Day",
    description:
      "A cyborg, identical to the one who failed to kill Sarah Connor, must now protect her teenage son from a more advanced cyborg.",
    duration: 137,
    genre: "Action",
    posterUrl: "https://image.tmdb.org/t/p/w500/2y4dZyJxVaV3eU5KfXJxmV5zXq.jpg",
  },
  {
    title: "The Bourne Ultimatum",
    description:
      "Jason Bourne dodges a ruthless CIA official and his agents from a new assassination program.",
    duration: 115,
    genre: "Action",
    posterUrl: "https://image.tmdb.org/t/p/w500/l2E054b4i7V3JyXnA4yJwXkKZ.jpg",
  },

  // Sci-Fi
  {
    title: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    duration: 169,
    genre: "Sci-Fi",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  {
    title: "Blade Runner 2049",
    description:
      "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.",
    duration: 164,
    genre: "Sci-Fi",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
  },
  {
    title: "Arrival",
    description:
      "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    duration: 116,
    genre: "Sci-Fi",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
  },
  {
    title: "Dune",
    description:
      "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with protecting the most valuable asset in the galaxy.",
    duration: 155,
    genre: "Sci-Fi",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  },
  {
    title: "The Martian",
    description:
      "An astronaut becomes stranded on Mars and must find a way to survive and signal for rescue.",
    duration: 144,
    genre: "Sci-Fi",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/5BHuvQ6p9kfc091Z8RiFNhCwL4b.jpg",
  },
  {
    title: "Gravity",
    description:
      "Two astronauts work together to survive after an accident leaves them stranded in space.",
    duration: 91,
    genre: "Sci-Fi",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/uPxtxhB2Fy9ihVqtBtNGHmknJqV.jpg",
  },
  {
    title: "Ex Machina",
    description:
      "A young programmer is selected to participate in a groundbreaking experiment in synthetic intelligence.",
    duration: 108,
    genre: "Sci-Fi",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/iJAe7UtboAHPyav8LhUhKp5s6A4.jpg",
  },
  {
    title: "Star Wars: A New Hope",
    description:
      "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee, and two droids to save the galaxy from the Empire.",
    duration: 121,
    genre: "Sci-Fi",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
  },

  // Comedy
  {
    title: "The Grand Budapest Hotel",
    description:
      "A legendary concierge at a famous European hotel between the wars and his friendship with a young employee.",
    duration: 99,
    genre: "Comedy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
  },
  {
    title: "Superbad",
    description:
      "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.",
    duration: 113,
    genre: "Comedy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg",
  },
  {
    title: "The Hangover",
    description:
      "Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night and the bachelor missing.",
    duration: 100,
    genre: "Comedy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/lBUjPfCR6Hdawe6Y0sXYu6cPMoI.jpg",
  },
  {
    title: "Bridesmaids",
    description:
      "Competition between the maid of honor and a bridesmaid over who is the bride's best friend threatens to upend the life of an out-of-work pastry chef.",
    duration: 125,
    genre: "Comedy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gJtA7hYsBMQ7EM3sPBMUdBfU7a0.jpg",
  },
  {
    title: "Groundhog Day",
    description:
      "A weatherman finds himself inexplicably living the same day over and over again.",
    duration: 101,
    genre: "Comedy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gCgt1WARPZaXnqCxXqJk49Kkzou.jpg",
  },
  {
    title: "Shaun of the Dead",
    description:
      "A man decides to turn his moribund life around by winning back his ex-girlfriend, reconciling his relationship with his mother, and dealing with an entire community that has turned into zombies.",
    duration: 99,
    genre: "Comedy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/dgXPhzNJH8HFTBjXPB177yNx6RI.jpg",
  },
  {
    title: "The Big Lebowski",
    description:
      "Jeff 'The Dude' Lebowski, mistaken for a millionaire of the same name, seeks restitution for his ruined rug and enlists his bowling buddies to help get it.",
    duration: 117,
    genre: "Comedy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/5DpmtMBXXNDujq37rRjMEt1Cui5.jpg",
  },
  {
    title: "Ferris Bueller's Day Off",
    description:
      "A high school wise guy is determined to have a day off from school, despite what the Principal thinks of that.",
    duration: 103,
    genre: "Comedy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9LTgW2VAKi5kZqh0vAiy2jXxChD.jpg",
  },

  // Drama
  {
    title: "The Shawshank Redemption",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    duration: 142,
    genre: "Drama",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
  },
  {
    title: "Forrest Gump",
    description:
      "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    duration: 142,
    genre: "Drama",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
  },
  {
    title: "The Godfather",
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.",
    duration: 175,
    genre: "Drama",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
  },
  {
    title: "Schindler's List",
    description:
      "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
    duration: 195,
    genre: "Drama",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
  },
  {
    title: "12 Angry Men",
    description:
      "The jury in a New York City murder trial is frustrated by a single member whose skeptical caution forces them to more carefully consider the evidence before voting.",
    duration: 96,
    genre: "Drama",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
  },
  {
    title: "Parasite",
    description:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    duration: 132,
    genre: "Drama",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  },
  {
    title: "The Green Mile",
    description:
      "The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift.",
    duration: 189,
    genre: "Drama",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg",
  },
  {
    title: "Good Will Hunting",
    description:
      "Will Hunting, a janitor at M.I.T., has a gift for mathematics, but needs help from a psychologist to find direction in his life.",
    duration: 126,
    genre: "Drama",
    posterUrl: "https://image.tmdb.org/t/p/w500/bABCBKYBK7A5G1x0FzoeoNfuj2.jpg",
  },

  // Horror
  {
    title: "Get Out",
    description:
      "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.",
    duration: 104,
    genre: "Horror",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKS0NKeEpsA.jpg",
  },
  {
    title: "A Quiet Place",
    description:
      "A family must live their lives in silence to hide from creatures that hunt by sound.",
    duration: 90,
    genre: "Horror",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/nAU74GmpUk7t5iklEp3bufwDq4n.jpg",
  },
  {
    title: "Hereditary",
    description:
      "A grieving family is haunted by tragic and disturbing occurrences.",
    duration: 127,
    genre: "Horror",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/p9fmuz2Oj3HtEJEqbIwkFGUhVXD.jpg",
  },
  {
    title: "The Shining",
    description:
      "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence.",
    duration: 146,
    genre: "Horror",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg",
  },
  {
    title: "The Exorcist",
    description:
      "When a teenage girl is possessed by a mysterious entity, her mother seeks the help of two priests to save her daughter.",
    duration: 122,
    genre: "Horror",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/4ucLGcXVVSVnsfkGtbLY4XAius8.jpg",
  },
  {
    title: "It Follows",
    description:
      "A young woman is followed by an unknown supernatural force after a sexual encounter.",
    duration: 100,
    genre: "Horror",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  },
  {
    title: "The Conjuring",
    description:
      "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.",
    duration: 112,
    genre: "Horror",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wom.jpg",
  },
  {
    title: "Midsommar",
    description:
      "A couple travels to Sweden to visit a rural hometown's fabled mid-summer festival, but what begins as an idyllic retreat quickly devolves into an increasingly violent and bizarre competition.",
    duration: 148,
    genre: "Horror",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg",
  },

  // Romance
  {
    title: "Titanic",
    description:
      "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    duration: 194,
    genre: "Romance",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
  },
  {
    title: "La La Land",
    description:
      "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    duration: 128,
    genre: "Romance",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
  },
  {
    title: "The Notebook",
    description:
      "A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social differences.",
    duration: 123,
    genre: "Romance",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg",
  },
  {
    title: "Pride and Prejudice",
    description:
      "Sparks fly when spirited Elizabeth Bennet meets single, rich, and proud Mr. Darcy.",
    duration: 129,
    genre: "Romance",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/sGjIvtVvTlWnia2zfJfHz81pZ9Q.jpg",
  },
  {
    title: "Before Sunrise",
    description:
      "A young man and woman meet on a train in Europe, and wind up spending one evening together in Vienna.",
    duration: 101,
    genre: "Romance",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/9NBjDNPHA6SkThIwe0o5XVg3GAY.jpg",
  },
  {
    title: "Eternal Sunshine of the Spotless Mind",
    description:
      "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.",
    duration: 108,
    genre: "Romance",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg",
  },
  {
    title: "Casablanca",
    description:
      "A cynical American expatriate struggles to decide whether or not he should help his former lover and her fugitive husband escape French Morocco.",
    duration: 102,
    genre: "Romance",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/5K7cOHoay2mZusSLezBOY0Qxh8a.jpg",
  },
  {
    title: "Call Me by Your Name",
    description:
      "In 1980s Italy, romance blossoms between a seventeen-year-old student and the older man hired as his father's research assistant.",
    duration: 132,
    genre: "Romance",
    posterUrl: "https://image.tmdb.org/t/p/w500/mZ4gBdfkhP9tvLH1DO4inU1wXz.jpg",
  },

  // Animation
  {
    title: "Spirited Away",
    description:
      "A young girl enters a mysterious world of spirits and must work to free herself and her parents.",
    duration: 125,
    genre: "Animation",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    description:
      "Teen Miles Morales becomes the Spider-Man of his reality and crosses paths with five counterparts from other dimensions.",
    duration: 117,
    genre: "Animation",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
  },
  {
    title: "Toy Story",
    description:
      "A cowboy doll is profoundly threatened and jealous when a new spaceman action figure supplants him as top toy in a boy's bedroom.",
    duration: 81,
    genre: "Animation",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
  },
  {
    title: "Coco",
    description:
      "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather.",
    duration: 105,
    genre: "Animation",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg",
  },
  {
    title: "WALL-E",
    description:
      "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind.",
    duration: 98,
    genre: "Animation",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8Y1wcjQxGM9KK.jpg",
  },
  {
    title: "Finding Nemo",
    description:
      "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home.",
    duration: 100,
    genre: "Animation",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
  },
  {
    title: "Your Name",
    description:
      "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?",
    duration: 106,
    genre: "Animation",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
  },
  {
    title: "Howl's Moving Castle",
    description:
      "When an unconfident young woman is cursed with an old body by a spiteful witch, her only chance of breaking the spell lies with a self-indulgent yet insecure young wizard.",
    duration: 119,
    genre: "Animation",
    posterUrl: "https://image.tmdb.org/t/p/w500/TkTPELv4kC3u1lkloush8skOjE.jpg",
  },

  // Thriller
  {
    title: "Se7en",
    description:
      "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
    duration: 127,
    genre: "Thriller",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg",
  },
  {
    title: "The Silence of the Lambs",
    description:
      "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.",
    duration: 118,
    genre: "Thriller",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/uS9m8OBk1RVFDUGCNU5rSgbD8VZ.jpg",
  },
  {
    title: "Prisoners",
    description:
      "When Keller Dover's daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads.",
    duration: 153,
    genre: "Thriller",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/tuZhZtbzT0x2Jk8RTo6R6mHm7Dj.jpg",
  },
  {
    title: "Gone Girl",
    description:
      "With his wife's disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him.",
    duration: 149,
    genre: "Thriller",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/qymaJhucquUwjpb8oiqynMeXnID.jpg",
  },
  {
    title: "Shutter Island",
    description:
      "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.",
    duration: 138,
    genre: "Thriller",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg",
  },
  {
    title: "Zodiac",
    description:
      "Between 1968 and 1983, a San Francisco cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer.",
    duration: 157,
    genre: "Thriller",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/bgLyOROfFQI3FqYL7jQbiaV8lkN.jpg",
  },

  // Fantasy
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    description:
      "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring.",
    duration: 178,
    genre: "Fantasy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    description:
      "An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.",
    duration: 152,
    genre: "Fantasy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
  },
  {
    title: "Pan's Labyrinth",
    description:
      "In the Falangist Spain of 1944, the stepdaughter of a sadistic army officer escapes into an eerie but captivating fantasy world.",
    duration: 118,
    genre: "Fantasy",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/t0TDsqbCTgSi0AL7k4rYvSPl2Bj.jpg",
  },
  {
    title: "The Princess Bride",
    description:
      "While home sick in bed, a young boy's grandfather reads him the story of a farmboy-turned-pirate who must rescue a princess.",
    duration: 98,
    genre: "Fantasy",
    posterUrl: "https://image.tmdb.org/t/p/w500/kTXxdNv4CqMFSB6LqN3yJdXp6Y.jpg",
  },
  {
    title: "Stardust",
    description:
      "In a countryside town bordering on a magical land, a young man makes a promise to his beloved that he'll retrieve a fallen star.",
    duration: 127,
    genre: "Fantasy",
    posterUrl: "https://image.tmdb.org/t/p/w500/3Jc7TGqJzD0qLqJk49Kkzou.jpg",
  },
  {
    title: "The Chronicles of Narnia",
    description:
      "Four kids travel through a wardrobe to the land of Narnia and learn of their destiny to free it with the guidance of a mystical lion.",
    duration: 143,
    genre: "Fantasy",
    posterUrl: "https://image.tmdb.org/t/p/w500/5ShH0K4kC3u1lkloush8skOjE.jpg",
  },
];

async function seedMovies() {
  const movies = [];
  for (const m of moviesData) {
    const existing = await prisma.movie.findFirst({
      where: { title: m.title },
    });
    if (existing) {
      movies.push(existing);
    } else {
      movies.push(await prisma.movie.create({ data: m }));
    }
  }
  return movies;
}

// ─── Seed Schedules ─────────────────────────────────────────────────────────

async function seedSchedules(movies) {
  const schedules = [];
  let scheduleCount = 0;

  for (const movie of movies) {
    // 2-3 schedules per movie
    const numSchedules = randomInt(2, 3);
    const usedTimes = new Set();

    for (let i = 0; i < numSchedules && scheduleCount < 120; i++) {
      const daysOffset = randomInt(-5, 14); // some past, mostly future
      const hour = pick([10, 12, 14, 16, 18, 19, 20, 21]);
      const minute = pick([0, 15, 30, 45]);
      const timeKey = `${daysOffset}-${hour}-${minute}`;

      if (usedTimes.has(timeKey)) continue;
      usedTimes.add(timeKey);

      const showTime =
        daysOffset >= 0
          ? futureDate(daysOffset, hour, minute)
          : pastDate(Math.abs(daysOffset), hour, minute);

      const studio = pick(studios);
      const price = randomPrice();

      const existing = await prisma.schedule.findFirst({
        where: { movieId: movie.id, showTime: new Date(showTime), studio },
      });

      if (existing) {
        schedules.push(existing);
      } else {
        schedules.push(
          await prisma.schedule.create({
            data: {
              movieId: movie.id,
              showTime: new Date(showTime),
              studio,
              price,
            },
          }),
        );
      }
      scheduleCount++;
    }
  }

  return schedules;
}

// ─── Seed Bookings ──────────────────────────────────────────────────────────

async function seedBookings(users, schedules) {
  const bookings = [];
  const bookedSeats = new Set(); // track "scheduleId:seatNumber"
  let bookingCount = 0;

  // Only create bookings for past and near-future schedules
  const bookableSchedules = schedules.filter((s) => {
    const showTime = new Date(s.showTime);
    const now = new Date();
    const diffHours = (showTime - now) / (1000 * 60 * 60);
    return diffHours > -48; // include schedules from last 2 days
  });

  for (const schedule of bookableSchedules) {
    if (bookingCount >= 250) break;

    // 5-20 bookings per schedule
    const numBookings = randomInt(5, 20);
    const shuffledSeats = [...allSeats].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numBookings && bookingCount < 250; i++) {
      const seat = shuffledSeats[i % shuffledSeats.length];
      const key = `${schedule.id}:${seat}`;

      if (bookedSeats.has(key)) continue;
      bookedSeats.add(key);

      const user = pick(users.filter((u) => u.role === "USER"));
      if (!user) continue;

      const statuses = [
        "CONFIRMED",
        "CONFIRMED",
        "CONFIRMED",
        "CONFIRMED",
        "CANCELLED",
        "PENDING",
      ];
      const status = pick(statuses);

      const existing = await prisma.booking.findFirst({
        where: { scheduleId: schedule.id, seatNumber: seat },
      });

      if (existing) {
        bookings.push(existing);
      } else {
        bookings.push(
          await prisma.booking.create({
            data: {
              userId: user.id,
              scheduleId: schedule.id,
              seatNumber: seat,
              status,
            },
          }),
        );
      }
      bookingCount++;
    }
  }

  return bookings;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // ─── Reset Database ──────────────────────────────────────────────────────

  console.log("Resetting database...");

  console.log("  Deleting bookings...");
  await prisma.booking.deleteMany();

  console.log("  Deleting schedules...");
  await prisma.schedule.deleteMany();

  console.log("  Deleting movies...");
  await prisma.movie.deleteMany();

  console.log("  Deleting users...");
  await prisma.user.deleteMany();

  console.log("  Database reset complete.\n");

  // ─── Seed Data ───────────────────────────────────────────────────────────

  console.log("Seeding users...");
  const users = await seedUsers();
  console.log(`  Created ${users.length} users (3 admins, 53 regular users)`);

  console.log("Seeding movies...");
  const movies = await seedMovies();
  console.log(`  Created ${movies.length} movies`);

  console.log("Seeding schedules...");
  const schedules = await seedSchedules(movies);
  console.log(`  Created ${schedules.length} schedules`);

  console.log("Seeding bookings...");
  const bookings = await seedBookings(users, schedules);
  console.log(`  Created ${bookings.length} bookings`);

  console.log("\n✅ Database reset and seeded successfully!");
  console.log("\n─── Login Credentials ───");
  console.log("Admin:  admin@example.com / password123");
  console.log("Admin:  superadmin@example.com / password123");
  console.log("Admin:  manager@example.com / password123");
  console.log("User:   alice@example.com / password123");
  console.log("User:   bob@example.com / password123");
  console.log("User:   demo@example.com / password123");
  console.log(
    `\nAdmin user IDs: ${users
      .filter((u) => u.role === "ADMIN")
      .map((u) => u.id)
      .join(", ")}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
