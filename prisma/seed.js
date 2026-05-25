import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleItems = [
  {
    slug: 'aurora-mr',
    name: 'Aurora MR',
    description: 'Starter multi-crew ship',
    category: 'ships',
  },
  {
    slug: 'mustang-alpha',
    name: 'Mustang Alpha',
    description: 'Light courier starter',
    category: 'ships',
  },
  {
    slug: 'pyro-station',
    name: 'Pyro Station',
    description: 'Location placeholder for future tracking',
    category: 'locations',
  },
];

async function main() {
  for (const item of sampleItems) {
    await prisma.item.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
  console.log(`Seeded ${sampleItems.length} catalog items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
