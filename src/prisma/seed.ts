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

  const studentAccount = await prisma.users.upsert({
    where: { uuid: '76301743-844a-4f11-85b7-a1ffa87784de' },
    update: {},
    create: {
      uuid: '76301743-844a-4f11-85b7-a1ffa87784de',
      email: 'dwidummy72@gmail.com',
      full_name: 'Student Skilins',
      profile_url: null,
      password: '$2a$10$FxnbFvlZkW.iWTO1r9KyQOErKYcpwQhIdv3aLn2Qt99AFwFg7zSpG',
      emailVerified: true,
      roles: { connect: { name: RoleType.Student } },
    },
  });

  const PRLDG = await prisma.majors.upsert({
    where: { uuid: '9bdea8be-e72f-4138-b7d0-f175c0086c63' },
    update: {},
    create: {
      uuid: '9bdea8be-e72f-4138-b7d0-f175c0086c63',
      image_url: null,
      avatar_url: null,
      name: 'PENGEMBANGAN PERANGKAT LUNAK DAN GIM',
      description:
        'Pengembangan Perangkat Lunak dan Gim merupakan salah satu program keahlian yang ada di SMKN 1 Gunungputri . Program Pengembangan Perangkat Lunak dan GIM atau sebelumnya keahlian Rekayasa Perangkat Lunak (RPL) adalah salah satu kompetensi keahlian dalam bidang Teknologi Komputer dan Informatika yang secara khusus mempelajari tentang pemrograman komputer dan game developer.',
    },
  });

  const studentTest = await prisma.students.upsert({
    where: { uuid: 'f9d5d6b8-6998-402b-9355-8040d715bf8e' },
    update: {},
    create: {
      uuid: 'f9d5d6b8-6998-402b-9355-8040d715bf8e',
      nis: '0022413284',
      name: 'Dwi Luthfianto',
      birthdate: '2002-10-27T00:00:00.000Z',
      birthplace: 'Depok',
      sex: 'Male',
      user: { connect: { uuid: '76301743-844a-4f11-85b7-a1ffa87784de' } },
      major: { connect: { name: 'PENGEMBANGAN PERANGKAT LUNAK DAN GIM' } },
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
    studentAccount,
    PRLDG,
    studentTest,
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
