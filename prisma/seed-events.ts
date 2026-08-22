import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Najdeme v databázi admina, aby měly akce platného tvůrce
  let admin = await prisma.user.findFirst({ where: { role: "admin" } });

  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    console.error(
      "❌ V databázi chybí jakýkoliv uživatel! Nejdřív se přihlas nebo pusť aplikaci.",
    );
    return;
  }

  console.log("🌱 Vkládám testovací výpravy do databáze...");

  const mockEvents = [
    {
      title: "Podzimní výprava na Vysočinu",
      description:
        "Tradiční víkendová výprava plná her, celotáborové hry a opékání buřtů. Budeme spát na vytápěné skautské základně.",
      location: "Skautská základna Polnička, Vysočina",
      date: new Date("2026-10-16T16:00:00Z"),
      dateEnd: new Date("2026-10-18T14:00:00Z"),
      meetingPoint: "Hlavní nádraží (pod hodinami) v 16:15",
      returnPoint: "Hlavní nádraží v 14:30",
      targetPatrol: "Všichni",
      capacity: 25,
      accommodation: "Vytápěná chata na matracích (vlastní spacák)",
      food: "Společná strava od pátku večera do neděle oběda",
      equipment:
        "Spacák, karimatka, oblečení do lesa i na chatu, pláštěnka, uzlovačka, zápisník, baterka/čelovka, hrnek.",
      priceChildren: 450,
      priceOlder: 500,
      paymentMethod: "HOTOVĚ na srazu / QR kód",
      paymentDeadline: new Date("2026-10-10T23:59:59Z"),
      rsvpDeadline: new Date("2026-10-09T23:59:59Z"),
      leaderInCharge: "Ondra 'Medvěd' Novák",
      leaderContact: "+420 777 123 456",
      createdById: admin.id,
    },
    {
      title: "Jednodenní výlet: Moravský kras a Pustý žleb",
      description:
        "Sobotní pochod přírodou, prozkoumáme volně přístupné jeskyně a vyzkoušíme si orientaci podle mapy a buzoly.",
      location: "Moravský kras (Skalní mlýn)",
      date: new Date("2026-09-19T08:00:00Z"),
      dateEnd: new Date("2026-09-19T17:00:00Z"),
      meetingPoint: "Ústřední autobusové nádraží v 7:45",
      returnPoint: "Stejné místo v 17:15",
      targetPatrol: "Medvědi",
      capacity: 15,
      accommodation: "Bez přespání",
      food: "Vlastní jídlo a pití na celý den (velká svačina + min. 1.5l vody)",
      equipment:
        "Pevná obuv, batoh, pláštěnka, funkční čelovka (do jeskyní!), skautský šátek, kapesné na kofolu.",
      priceChildren: 120,
      priceOlder: 150,
      paymentMethod: "Převodem na účet",
      paymentDeadline: new Date("2026-09-15T23:59:59Z"),
      rsvpDeadline: new Date("2026-09-14T23:59:59Z"),
      leaderInCharge: "Eliška 'Sýkorka' Dvořáková",
      leaderContact: "+420 733 987 654",
      createdById: admin.id,
    },
    {
      title: "Zimní bivakovací výprava",
      description:
        "Náročnější výprava pro starší členy. Vyzkoušíme si stavbu přístřeší z plachty, rozdělávání ohně kresadlem a zimní táboření.",
      location: "Orlické hory",
      date: new Date("2026-11-20T15:00:00Z"),
      dateEnd: new Date("2026-11-22T13:00:00Z"),
      meetingPoint: "Vlakové nádraží v 14:45",
      returnPoint: "Vlakové nádraží v 13:15",
      targetPatrol: "RK Polux",
      capacity: 12,
      accommodation: "Pod celtou / v bivaku",
      food: "Individuální (vaření na dřívkáči nebo vařiči)",
      equipment:
        "Kvalitní zimní spacák (komfort pod 0°C), karimatka, celta, nůž, kresadlo, kotlík, teplé vrstvy oblečení.",
      priceChildren: 300,
      priceOlder: 350,
      paymentMethod: "HOTOVĚ",
      paymentDeadline: new Date("2026-11-15T23:59:59Z"),
      rsvpDeadline: new Date("2026-11-12T23:59:59Z"),
      leaderInCharge: "Michal 'Rys' Svoboda",
      leaderContact: "+420 608 112 233",
      createdById: admin.id,
    },
  ];

  for (const event of mockEvents) {
    await prisma.event.create({ data: event });
  }

  console.log("✅ Hotovo! Všechny výpravy byly úspěšně nahrány.");
}

main()
  .catch((e) => {
    console.error("❌ Chyba:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
