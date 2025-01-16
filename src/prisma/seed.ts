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

  const majorData = [
    {
      image_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      avatar_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      name: 'PENGEMBANGAN PERANGKAT LUNAK DAN GIM',
      description:
        'Pengembangan Perangkat Lunak dan Gim merupakan salah satu program keahlian yang ada di SMKN 1 Gunungputri . Program Pengembangan Perangkat Lunak dan GIM atau sebelumnya keahlian Rekayasa Perangkat Lunak (RPL) adalah salah satu kompetensi keahlian dalam bidang Teknologi Komputer dan Informatika yang secara khusus mempelajari tentang pemrograman komputer dan game developer.',
    },
    {
      image_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      avatar_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      name: 'KIMIA INDUSTRI',
      description:
        'Kimia Industri adalah Program keahlian yang mempelajari pemprosesan bahan mentah menjadi berupa barang setengah jadi ataupun barang jadi (produk) seperti : minyak bumi dan gas bumi, gas bio, detergen, cairan anti kuman, plastik, kertas, kecantikan, obat-obatan, makanan instan, dll. Lulusan Teknik Kimia Industri berpeluang kerja antara lain : Di Industri Kimia (Sebagai Analisis Laboratorium dan Operator Peralatan Industri Kimia); Industri Pangan (Indofood, Unilever, Makanan Instan dll); Industri Kesehatan dan Kecantikan : (Industri Obat-obatan, detergen, sabun, pasta gigi, dll); Pertambangan : Pertamina, Pabrik Pengolahan Oli, dan Gas; Industri Selter Industri Pupuk dan Peptisida, Dll.',
    },
    {
      image_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      avatar_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      name: 'TEKNIK PENGELASAN',
      description:
        'Jurusan ini mempelajari satu bidang kerja saja yaitu bagaimana cara untuk mengelas yang baik, dan teori tentang apa – apa saja bahan untuk proses pengelasan, jursan las sendiri memiliki peluang kerja yang sangat dibutuhkan oleh beberapa perusahaan, karena tidak sedikit industri yang mensiagakan para pekerja di bidang engginering untuk menjaga kecakapan mesin – mesin yang ada di perusahaan, salah satu yang dibutuhkan adalah teknik las.',
    },
    {
      image_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      avatar_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      name: 'TEKNIK PEMESINAN',
      description:
        'Program Keahlian Teknik Pemesinan membekali peserta didik dengan ketrampilan pemesinan yang meliputi : mengoperasikan mesin-mesin produksi baik mesin Manual maupun mesin CNC (Computer Numerical Control) , mesin Bubut, mesin Frais, mesin Sekrap, mesin Bor, mesin Gerinda Datar, mesin Gerinda Poros, mesin Gerinda Potong, mengasah alat-alat potong, Pengelasan dan Fabrikasi logam dan 3D Printing. Peserta didik juga dibekali dengan pengetahuan membaca dan menggambar dengan teknik manual maupun dengan CAD (Computer Aidet Design). Pengenalan dan pengolahan bahan, mengukur dengan alat ukur mekanik presisi, menggunakan perkakas tangan serta melakukan perhitungan dasar dan lanjut untuk diimplementasikan dalam praktek membuat benda kerja dan perlengkapan praktek oleh Guru Praktek ( Instruktor ) yang rata-rata tamatan S1 dan D4 dan semua sudah bersertifikasi guru, juga ada yang sedang menempuh kuliah S2.',
    },
    {
      image_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      avatar_url:
        'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      name: 'TEKNIK ELEKTRONIKA',
      description:
        'Teknik Elektronika adalah bidang teknik yang mempelajari tentang komponen listrik dan peralatan-peralatan semi konduktor. Teknik Elektronika merupakan bagian dari Teknik Listrik (Teknik Elektro). Materi yang dipelajari meliputi aplikasi sistem elektronika digital, elektronika computer, sistem mikroprosesor dan mikrokontroller, rangkaian elektronika terapan dan elektronika Industri, program sistem pengendali elektronik berbasis mikroprosesor,  mikrokontroller, PLC dan Komputer,  sistem pengendali dan sistem otomasi elektronika.',
    },
  ];

  const createdMajors = await Promise.all(
    majorData.map(async (maj) => {
      const major = await prisma.majors.upsert({
        where: {
          name: maj.name,
        },
        update: {
          description: maj.description,
          image_url: maj.image_url,
          avatar_url: maj.avatar_url,
        },
        create: {
          name: maj.name,
          description: maj.description,
          image_url: maj.image_url,
          avatar_url: maj.avatar_url,
        },
      });

      return major;
    }),
  );

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

  const Categories = ['Fiction', 'Non-fiction'];
  for (const name of Categories) {
    await prisma.categories.upsert({
      where: { name },
      update: {
        avatar_url:
          'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        name,
        description: 'No description avalaible!',
      },
      create: {
        avatar_url:
          'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        name,
        description: 'No description avalaible!',
      },
    });
  }

  const Genres = [
    'Mystery',
    'Science Fiction',
    'Fantasy',
    'Romance',
    'Thriller',
    'Biography',
    'Self-Help',
    'Historical Fiction',
    'Young Adult',
    `Children's Literature`,
    'Graphic Novel',
    'Poetry',
    'Cookbook',
    'Travel',
    'Memoir',
    'Classic',
    'Dystopian',
    'Adventure',
  ];
  for (const name of Genres) {
    await prisma.genres.upsert({
      where: { name },
      update: {
        avatar_url:
          'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        name,
        description: 'No description avalaible!',
      },
      create: {
        avatar_url:
          'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        name,
        description: 'No description avalaible!',
      },
    });
  }

  const Tags = [
    'Best Seller',
    'New Release',
    'Award Winning',
    'Highly Recommended',
    'Popular Choice',
    'Must Read',
    'Critically Acclaimed',
    'Reader Favorite',
    'Book Club Pick',
    'Trending Now',
    'Essential Reading',
    'Top Rated',
    'Diverse Voices',
    'Debut Author',
    'Illustrated Edition',
    'Limited Edition',
    `Collector's Item`,
    'Signed Copy',
    'E-book Exclusive',
    'Audiobook Available',
  ];
  for (const name of Tags) {
    await prisma.tags.upsert({
      where: { name },
      update: {
        avatar_url:
          'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        name,
        description: 'No description avalaible!',
      },
      create: {
        avatar_url:
          'https://images.unsplash.com/photo-1494537176433-7a3c4ef2046f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        name,
        description: 'No description avalaible!',
      },
    });
  }

  console.log({
    admin,
    staff,
    user,
    judge,
    student,
    staffAccount,
    adminAccount,
    studentAccount,
    createdMajors,
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
