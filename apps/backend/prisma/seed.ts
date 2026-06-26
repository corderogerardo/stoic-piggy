import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/password';

const prisma = new PrismaClient();

// Every seeded account shares this password so the demo is easy to drive.
const DEMO_PASSWORD = 'piggy1234';

type QuestStatusLiteral = 'available' | 'in_progress' | 'completed' | 'claimed';

interface SeedQuest {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  status: QuestStatusLiteral;
  /** Links to an in-app lesson (cards + quiz). Omit for legacy tap-to-claim quests. */
  lessonKey?: string;
}
interface SeedChild {
  id: string;
  displayName: string;
  username: string;
  age: number;
  level: number;
  xp: number;
  allowanceCents: number;
  autopayEnabled: boolean;
  balanceCents: number;
  goal?: { title: string; targetCents: number; savedCents: number };
  quests?: SeedQuest[];
}
interface SeedFamily {
  id: string;
  email: string;
  displayName: string;
  children: SeedChild[];
}

// A handful of simulated families so the system has realistic, multi-user data.
const FAMILIES: SeedFamily[] = [
  {
    id: 'seed-parent',
    email: 'patricia@stoicpiggy.dev',
    displayName: 'Patricia',
    children: [
      {
        id: 'seed-marco',
        displayName: 'Marco',
        username: 'marco',
        age: 12,
        // 1950 XP → level 2, just 50 short of level 3. The first lesson tips him
        // over the boundary, so the demo shows a level-up + the $5 reward.
        level: 2,
        xp: 1950,
        allowanceCents: 5000,
        autopayEnabled: true,
        balanceCents: 34000,
        goal: { title: 'Bici nueva', targetCents: 50000, savedCents: 34000 },
        quests: [
          {
            id: 'seed-q1',
            title: 'Aprende a ahorrar',
            description: 'Descubre por qué guardar un poco cada semana hace crecer tu dinero.',
            rewardXp: 50,
            status: 'available',
            lessonKey: 'save',
          },
          {
            id: 'seed-q2',
            title: 'Pon tu primera meta',
            description: 'Elige algo que quieras y define cuánto necesitas ahorrar.',
            rewardXp: 80,
            status: 'available',
            lessonKey: 'goal',
          },
          {
            id: 'seed-q5',
            title: 'Resiste una tentación',
            description: 'Aprende la pausa estoica y decide con la cabeza fría.',
            rewardXp: 100,
            status: 'available',
            lessonKey: 'resist',
          },
        ],
      },
      {
        id: 'seed-sofia',
        displayName: 'Sofía',
        username: 'sofia',
        age: 9,
        level: 2,
        xp: 1500,
        allowanceCents: 3000,
        autopayEnabled: false,
        balanceCents: 18000,
        goal: { title: 'Nintendo Switch', targetCents: 120000, savedCents: 18000 },
      },
    ],
  },
  {
    id: 'seed-parent-2',
    email: 'diego@stoicpiggy.dev',
    displayName: 'Diego',
    children: [
      {
        id: 'seed-lucas',
        displayName: 'Lucas',
        username: 'lucas',
        age: 14,
        level: 5,
        xp: 4300,
        allowanceCents: 6000,
        autopayEnabled: true,
        balanceCents: 52000,
        goal: { title: 'Tenis nuevos', targetCents: 80000, savedCents: 52000 },
        quests: [
          {
            id: 'seed-q3',
            title: 'Deuda y crédito',
            description: 'Lo que cuesta pedir prestado.',
            rewardXp: 200,
            status: 'available',
          },
        ],
      },
      {
        id: 'seed-emma',
        displayName: 'Emma',
        username: 'emma',
        age: 7,
        level: 1,
        xp: 300,
        allowanceCents: 2500,
        autopayEnabled: false,
        balanceCents: 9000,
        goal: { title: 'Casa de muñecas', targetCents: 40000, savedCents: 9000 },
      },
      {
        id: 'seed-mateo',
        displayName: 'Mateo',
        username: 'mateo',
        age: 10,
        level: 3,
        xp: 2600,
        allowanceCents: 4000,
        autopayEnabled: true,
        balanceCents: 26000,
        goal: { title: 'Set de Lego', targetCents: 60000, savedCents: 26000 },
      },
    ],
  },
  {
    id: 'seed-parent-3',
    email: 'andrea@stoicpiggy.dev',
    displayName: 'Andrea',
    children: [
      {
        id: 'seed-valeria',
        displayName: 'Valeria',
        username: 'valeria',
        age: 11,
        level: 6,
        xp: 5100,
        allowanceCents: 4500,
        autopayEnabled: false,
        balanceCents: 41000,
        goal: { title: 'Bici nueva', targetCents: 70000, savedCents: 41000 },
        quests: [
          {
            id: 'seed-q4',
            title: 'Metas que se cumplen',
            description: 'Divide una meta grande en pasos pequeños.',
            rewardXp: 130,
            status: 'available',
            lessonKey: 'goal',
          },
        ],
      },
    ],
  },
];

async function main(): Promise<void> {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const family of FAMILIES) {
    const parent = await prisma.parent.upsert({
      where: { email: family.email },
      update: { displayName: family.displayName, passwordHash },
      create: {
        id: family.id,
        email: family.email,
        displayName: family.displayName,
        passwordHash,
      },
    });

    for (const kid of family.children) {
      await prisma.child.upsert({
        where: { id: kid.id },
        update: { username: kid.username, passwordHash },
        create: {
          id: kid.id,
          parentId: parent.id,
          displayName: kid.displayName,
          username: kid.username,
          passwordHash,
          age: kid.age,
          level: kid.level,
          xp: kid.xp,
          allowanceCents: kid.allowanceCents,
          autopayEnabled: kid.autopayEnabled,
        },
      });

      await prisma.piggyBank.upsert({
        where: { id: `${kid.id}-bank` },
        update: {},
        create: {
          id: `${kid.id}-bank`,
          childId: kid.id,
          name: 'Ahorros',
          balanceCents: kid.balanceCents,
        },
      });

      if (kid.goal) {
        await prisma.savingsGoal.upsert({
          where: { id: `${kid.id}-goal` },
          update: {},
          create: {
            id: `${kid.id}-goal`,
            childId: kid.id,
            title: kid.goal.title,
            targetCents: kid.goal.targetCents,
            savedCents: kid.goal.savedCents,
          },
        });
      }

      for (const quest of kid.quests ?? []) {
        await prisma.quest.upsert({
          where: { id: quest.id },
          update: {},
          create: {
            id: quest.id,
            childId: kid.id,
            title: quest.title,
            description: quest.description,
            rewardXp: quest.rewardXp,
            status: quest.status,
            lessonKey: quest.lessonKey,
          },
        });
      }
    }
  }

  const [parents, children] = await Promise.all([prisma.parent.count(), prisma.child.count()]);
  console.log(
    `🌱 Seeded ${parents} parents and ${children} children with banks, goals and quests.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
