//import prisma from utils folder
const prisma = require('../utils/database');

async function main() {
  // Create users
  const author = await prisma.user.create({
    data: {
      firstName: 'Suman',
      lastName: 'Sharma',
      dob: new Date('1992-03-15'),
      email: 'suman.sharma@example.com',
      phoneNo: '9800000001',
      password: 'hashedpassword1', // Use a hashed password in production!
      userType: 'author',
      createdAt: new Date(),
      createdCategories: {
        create: [
          {
            name: 'Prabidhi',
            status: 'ACTIVE',
            createdAt: new Date(),
          },
          {
            name: 'JeevanShailee',
            status: 'ACTIVE',
            createdAt: new Date(),
          },
        ],
      },
    },
    include: { createdCategories: true },
  });

  const reader = await prisma.user.create({
    data: {
      firstName: 'Maya',
      lastName: 'Kandel',
      dob: new Date('1996-07-21'),
      email: 'maya.kandel@example.com',
      phoneNo: '9800000002',
      password: 'hashedpassword2',
      userType: 'reader',
      createdAt: new Date(),
    },
  });

  // Create blogs
  const blog1 = await prisma.blog.create({
    data: {
      title: 'Nepalma Prabidhiko Bikas',
      body: 'Nepalma pachhilo samaya prabidhiko kshetrama ullekhaniya pragati bhayeko cha.',
      status: 'ACTIVE',
      categoryId: author.createdCategories[0].id,
      createdBy: author.id,
      createdAt: new Date(),
    },
  });

  const blog2 = await prisma.blog.create({
    data: {
      title: 'Swastha JeevanShailee Ka Upayaharu',
      body: 'Swastha jeevan shailee apnauna ka lagi niyamit vyaayam ra santulit aahar aawashyak cha.',
      status: 'ACTIVE',
      categoryId: author.createdCategories[1].id,
      createdBy: author.id,
      createdAt: new Date(),
    },
  });

  // Likes and comments by reader
  await prisma.like.create({
    data: {
      userId: reader.id,
      blogId: blog1.id,
      createdAt: new Date(),
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Dherai ramro lekh!',
      userId: reader.id,
      blogId: blog1.id,
      createdAt: new Date(),
    },
  });

  console.log('Nepali seed data (Romanized) created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });