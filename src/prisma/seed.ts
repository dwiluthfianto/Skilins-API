import { PrismaClient, RoleType } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Roles Seeder
  const admin = await prisma.roles.upsert({
    where: { name: RoleType.Admin },
    update: {},
    create: {
      name: RoleType.Admin,
    },
  });
  const staff = await prisma.roles.upsert({
    where: { name: RoleType.Staff },
    update: {},
    create: {
      name: RoleType.Staff,
    },
  });
  const user = await prisma.roles.upsert({
    where: { name: RoleType.User },
    update: {},
    create: {
      name: RoleType.User,
    },
  });
  const judge = await prisma.roles.upsert({
    where: { name: RoleType.Judge },
    update: {},
    create: {
      name: RoleType.Judge,
    },
  });
  const student = await prisma.roles.upsert({
    where: { name: RoleType.Student },
    update: {},
    create: {
      name: RoleType.Student,
    },
  });

  const adminAccount = await prisma.users.upsert({
    where: { uuid: '33af070e-9cde-4024-8e90-fbfef6b39640' },
    update: {},
    create: {
      uuid: '33af070e-9cde-4024-8e90-fbfef6b39640',
      email: 'admin@skilins.com',
      full_name: 'Admin Skilins',
      profile_url: null,
      password: '$2a$10$Xeo3UC8q3NRliHF4xN1H/.CGgV5ZMFe8KiIpyJdBn0SwnV1o3pg2a',
      emailVerified: true,
      roles: { connect: { name: RoleType.Admin } },
    },
  });
  const staffAccount = await prisma.users.upsert({
    where: { uuid: '38ebdc87-dca6-441b-9acf-08dda606eef4' },
    update: {},
    create: {
      uuid: '38ebdc87-dca6-441b-9acf-08dda606eef4',
      email: 'staff@skilins.com',
      full_name: 'Staff Skilins',
      profile_url: null,
      password: '$2a$10$jHwi4rWw6gGGRNiuGA0CT.ooBUicRQFT5m9KNLr51FYuXVkgiN.Ba',
      emailVerified: true,
      roles: { connect: { name: RoleType.Staff } },
    },
  });

  console.log({
    admin,
    staff,
    user,
    judge,
    student,
    staffAccount,
    adminAccount,
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
