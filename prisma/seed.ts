const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Vytvoříme vedoucího
  const admin = await prisma.user.create({
    data: {
      email: 'vedouci@skaut.cz',
      password: 'tajneheslo', // v reálu budeme hesla šifrovat!
      name: 'Honza Vedoucí',
      role: 'LEADER',
    },
  });

  // Vytvoříme družinu
  const patrol = await prisma.patrol.create({
    data: { name: 'Lišáci' },
  });

  // Vytvoříme první akci
  await prisma.event.create({
    data: {
      title: 'První víkendovka',
      description: 'Jedeme na chatu, nezapomeňte spacáky!',
      date: new Date(),
      location: 'Chata u lesa',
      createdById: admin.id,
      allowedPatrols: { connect: { id: patrol.id } },
    },
  });

  console.log('Seedování hotovo! Data jsou v databázi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });