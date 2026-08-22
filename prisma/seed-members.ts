import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const BOY_NAMES = [
  "Jan",
  "Tomáš",
  "Jakub",
  "Adam",
  "Filip",
  "Matěj",
  "Lukáš",
  "Vojtěch",
  "David",
  "Ondřej",
  "Daniel",
  "Martin",
  "Marek",
  "Petr",
  "Michal",
  "Josef",
  "Pavel",
  "Jiří",
  "Štěpán",
  "Dominik",
  "Samuel",
  "Mikuláš",
  "Jáchym",
  "Šimon",
  "Kryštof",
  "Oliver",
  "Matyáš",
];

const GIRL_NAMES = [
  "Eliška",
  "Anna",
  "Adéla",
  "Tereza",
  "Sofie",
  "Viktorie",
  "Ema",
  "Karolína",
  "Natálie",
  "Amálie",
  "Julie",
  "Kristýna",
  "Klára",
  "Nela",
  "Laura",
  "Barbora",
  "Lucie",
  "Veronika",
  "Markéta",
  "Anežka",
  "Nikol",
  "Sára",
  "Magdaléna",
];

const LAST_NAMES = [
  { male: "Novák", female: "Nováková" },
  { male: "Svoboda", female: "Svobodová" },
  { male: "Novotný", female: "Novotná" },
  { male: "Dvořák", female: "Dvořáková" },
  { male: "Černý", female: "Černá" },
  { male: "Procházka", female: "Procházková" },
  { male: "Kučera", female: "Kučerová" },
  { male: "Veselý", female: "Veselá" },
  { male: "Horák", female: "Horáková" },
  { male: "Němec", female: "Němcová" },
  { male: "Pokorný", female: "Pokorná" },
  { male: "Pospíšil", female: "Pospíšilová" },
  { male: "Hájek", female: "Hájková" },
  { male: "Král", female: "Králová" },
  { male: "Jelínek", female: "Jelínková" },
  { male: "Růžička", female: "Růžičková" },
  { male: "Beneš", female: "Benešová" },
  { male: "Fiala", female: "Fialová" },
  { male: "Sedláček", female: "Sedláčková" },
  { male: "Sadílek", female: "Sadílková" },
];

const STREETS = [
  "Kounicova",
  "Masarykova",
  "Veveří",
  "Údolní",
  "Palackého třída",
  "Lidická",
  "Zezulova",
  "Botanická",
  "Štefánikova",
  "Hrnčířská",
  "Purkyňova",
  "Bayerova",
  "Pekářská",
  "Kotlářská",
  "Úvoz",
  "Joštova",
];

const HEALTH_ISSUES = [
  "Bez zdravotních komplikací",
  "Bez zdravotních komplikací",
  "Bez zdravotních komplikací",
  "Alergie na pyl a prach",
  "Alergie na včelí/vosí bodnutí (Epipen s sebou)",
  "Mírné astma (inhalátor v batohu)",
  "Alergie na ořechy",
  "Nosit brýle na čtení i ven",
  "Alergie na roztoče",
  "pyridoxin 1x denně večer",
  "Občasné migrény při zátěži",
];

const DIETS = [
  "Bez omezení",
  "Bez omezení",
  "Bez omezení",
  "Bezlepková",
  "Vegetariánská",
  "Bezlaktózová",
  "Alergie na ořechy",
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPhone(): string {
  const prefixes = [
    "602",
    "603",
    "604",
    "605",
    "720",
    "721",
    "731",
    "732",
    "773",
    "775",
    "777",
  ];
  return `+420 ${getRandom(prefixes)} ${getRandomInt(100, 999)} ${getRandomInt(100, 999)}`;
}

async function main() {
  console.log("🌱 Generuji 90 dětí do kolonky Členové...");

  // Načtení nebo vytvoření družin
  let patrols = await prisma.patrol.findMany();
  if (patrols.length === 0) {
    await prisma.patrol.createMany({
      data: [
        { name: "Medvědi" },
        { name: "Tygřice" },
        { name: "Veverky" },
        { name: "Rysi" },
        { name: "RK Polux" },
        { name: "Sedmikrásky" },
        { name: "Sokoli" },
        { name: "Sýkorky" },
        { name: "Gepardi" },
        { name: "Netopýři" },
      ],
    });
    patrols = await prisma.patrol.findMany();
  }

  const defaultPassword = hashPassword("heslo123");

  for (let i = 1; i <= 90; i++) {
    const isBoy = Math.random() > 0.5;
    const firstName = isBoy ? getRandom(BOY_NAMES) : getRandom(GIRL_NAMES);
    const family = getRandom(LAST_NAMES);
    const lastName = isBoy ? family.male : family.female;

    const motherName = `${getRandom(GIRL_NAMES)} ${family.female}`;
    const motherPhone = getRandomPhone();
    const fatherName = `${getRandom(BOY_NAMES)} ${family.male}`;
    const fatherPhone = getRandomPhone();

    const street = getRandom(STREETS);
    const houseNum = `${getRandomInt(1, 150)}/${getRandomInt(1, 40)}`;
    const address = `${street} ${houseNum}`;

    const birthYear = getRandomInt(2010, 2019);
    const birthMonth = getRandomInt(1, 12);
    const birthDay = getRandomInt(1, 28);
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay);

    const patrol = getRandom(patrols);

    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: `dite${i}_${Date.now()}@skaut-katalog.cz`,
        password: defaultPassword,
        role: "MEMBER",
        patrolId: patrol.id,
        mustChangePassword: false,
        birthDate: birthDate,
        healthNote: getRandom(HEALTH_ISSUES),
        dietaryRestrictions: getRandom(DIETS),
        motherName: motherName,
        motherPhone: motherPhone,
        fatherName: fatherName,
        fatherPhone: fatherPhone,
        parentPhone: motherPhone,
        address: address,
        city: "Brno",
        postalCode: "602 00",
      },
    });
  }

  console.log("✅ Hotovo! 90 dětí bylo úspěšně vloženo.");
}

main()
  .catch((e) => {
    console.error("❌ Chyba:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
