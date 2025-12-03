import 'dotenv/config';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Explicitly load .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient();

// Prevent accidental seeding in production without explicit flag
if (process.env.NODE_ENV === 'production' && process.env.FORCE_SEED !== 'true') {
  console.error('⚠️  Seeding is disabled in production. Set FORCE_SEED=true to override.');
  process.exit(1);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create Default Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@fumari.com',
      password: hashedPassword,
      role: 'admin',
      active: true,
    },
  });

  console.log('✅ Created default admin user (username: admin, password: admin123)');

  // Create Sections
  const mainHall = await prisma.section.upsert({
    where: { id: 'section-main' },
    update: {},
    create: {
      id: 'section-main',
      name: 'Main Hall',
      description: 'Main dining area',
      capacity: 400,
      active: true,
    },
  });

  const shishaLounge = await prisma.section.upsert({
    where: { id: 'section-shisha' },
    update: {},
    create: {
      id: 'section-shisha',
      name: 'Shisha Lounge',
      description: 'Dedicated shisha area',
      capacity: 300,
      active: true,
    },
  });

  const barArea = await prisma.section.upsert({
    where: { id: 'section-bar' },
    update: {},
    create: {
      id: 'section-bar',
      name: 'Bar Area',
      description: 'Cocktail bar and seating',
      capacity: 200,
      active: true,
    },
  });

  const outdoor = await prisma.section.upsert({
    where: { id: 'section-outdoor' },
    update: {},
    create: {
      id: 'section-outdoor',
      name: 'Outdoor Terrace',
      description: 'Outdoor seating area',
      capacity: 100,
      active: true,
    },
  });

  console.log('✅ Created sections');

  // Create Tables (sample - you can expand this)
  for (let i = 1; i <= 50; i++) {
    const sectionId = i <= 20 ? mainHall.id : i <= 35 ? shishaLounge.id : i <= 45 ? barArea.id : outdoor.id;
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: {
        number: i,
        capacity: i % 4 === 0 ? 8 : i % 3 === 0 ? 6 : 4,
        sectionId,
        status: 'available',
        currentGuests: 0,
      },
    });
  }

  console.log('✅ Created tables');

  // Create Staff
  const manager = await prisma.staff.upsert({
    where: { email: 'manager@fumari.com' },
    update: {},
    create: {
      name: 'Ahmet Yılmaz',
      email: 'manager@fumari.com',
      phone: '+90 555 123 4567',
      role: 'manager',
      pin: '0000',
      active: true,
    },
  });

  for (let i = 1; i <= 10; i++) {
    await prisma.staff.upsert({
      where: { email: `waiter${i}@fumari.com` },
      update: {},
      create: {
        name: `Waiter ${i}`,
        email: `waiter${i}@fumari.com`,
        phone: `+90 555 ${1000 + i}`,
        role: 'waiter',
        pin: `${1000 + i}`,
        active: true,
      },
    });
  }

  for (let i = 1; i <= 5; i++) {
    await prisma.staff.upsert({
      where: { email: `bartender${i}@fumari.com` },
      update: {},
      create: {
        name: `Bartender ${i}`,
        email: `bartender${i}@fumari.com`,
        phone: `+90 555 ${2000 + i}`,
        role: 'bartender',
        pin: `${2000 + i}`,
        active: true,
      },
    });
  }

  console.log('✅ Created staff');

  // Create Menu Categories
  const turkishFood = await prisma.menuCategory.upsert({
    where: { id: 'cat-turkish-food' },
    update: {},
    create: {
      id: 'cat-turkish-food',
      name: 'Turkish Food',
      nameTr: 'Türk Mutfağı',
      description: 'Traditional Turkish cuisine',
      type: 'food',
      displayOrder: 1,
      active: true,
    },
  });

  const kebabs = await prisma.menuCategory.upsert({
    where: { id: 'cat-kebabs' },
    update: {},
    create: {
      id: 'cat-kebabs',
      name: 'Kebabs',
      nameTr: 'Kebaplar',
      description: 'Grilled meats and kebabs',
      type: 'food',
      displayOrder: 2,
      active: true,
    },
  });

  const mezes = await prisma.menuCategory.upsert({
    where: { id: 'cat-mezes' },
    update: {},
    create: {
      id: 'cat-mezes',
      name: 'Mezes & Appetizers',
      nameTr: 'Mezeler',
      description: 'Turkish appetizers',
      type: 'food',
      displayOrder: 3,
      active: true,
    },
  });

  const cocktails = await prisma.menuCategory.upsert({
    where: { id: 'cat-cocktails' },
    update: {},
    create: {
      id: 'cat-cocktails',
      name: 'Cocktails',
      nameTr: 'Kokteyller',
      description: 'Signature cocktails',
      type: 'cocktail',
      displayOrder: 4,
      active: true,
    },
  });

  const turkishDrinks = await prisma.menuCategory.upsert({
    where: { id: 'cat-turkish-drinks' },
    update: {},
    create: {
      id: 'cat-turkish-drinks',
      name: 'Turkish Drinks',
      nameTr: 'Türk İçecekleri',
      description: 'Traditional Turkish beverages',
      type: 'drink',
      displayOrder: 5,
      active: true,
    },
  });

  const shisha = await prisma.menuCategory.upsert({
    where: { id: 'cat-shisha' },
    update: {},
    create: {
      id: 'cat-shisha',
      name: 'Shisha',
      nameTr: 'Nargile',
      description: 'Premium shisha flavors',
      type: 'shisha',
      displayOrder: 6,
      active: true,
    },
  });

  console.log('✅ Created menu categories');

  // Create Menu Items (Prices in British Pounds for Birmingham, UK - Realistic Shisha Bar Prices)
  const menuItems = [
    // Turkish Food
    { name: 'Adana Kebab', nameTr: 'Adana Kebabı', price: 14.50, categoryId: kebabs.id, prepTime: 20 },
    { name: 'Iskender Kebab', nameTr: 'İskender Kebabı', price: 15.50, categoryId: kebabs.id, prepTime: 25 },
    { name: 'Lahmacun', nameTr: 'Lahmacun', price: 7.50, categoryId: turkishFood.id, prepTime: 10 },
    { name: 'Pide', nameTr: 'Pide', price: 9.50, categoryId: turkishFood.id, prepTime: 15 },
    { name: 'Manti', nameTr: 'Mantı', price: 11.50, categoryId: turkishFood.id, prepTime: 20 },
    
    // Mezes
    { name: 'Hummus', nameTr: 'Humus', price: 5.00, categoryId: mezes.id, prepTime: 5 },
    { name: 'Baba Ganoush', nameTr: 'Patlıcan Ezmesi', price: 5.50, categoryId: mezes.id, prepTime: 5 },
    { name: 'Cacik', nameTr: 'Cacık', price: 4.50, categoryId: mezes.id, prepTime: 5 },
    { name: 'Haydari', nameTr: 'Haydari', price: 5.00, categoryId: mezes.id, prepTime: 5 },
    
    // Cocktails
    { name: 'Turkish Delight Martini', nameTr: 'Türk Lokumu Martini', price: 10.50, categoryId: cocktails.id, prepTime: 5 },
    { name: 'Raki Sour', nameTr: 'Rakı Sour', price: 9.50, categoryId: cocktails.id, prepTime: 5 },
    { name: 'Istanbul Mule', nameTr: 'İstanbul Mule', price: 10.00, categoryId: cocktails.id, prepTime: 5 },
    { name: 'Rose & Pistachio', nameTr: 'Gül & Fıstık', price: 11.00, categoryId: cocktails.id, prepTime: 6 },
    
    // Turkish Drinks
    { name: 'Ayran', nameTr: 'Ayran', price: 3.50, categoryId: turkishDrinks.id, prepTime: 2 },
    { name: 'Turkish Tea', nameTr: 'Türk Çayı', price: 2.50, categoryId: turkishDrinks.id, prepTime: 3 },
    { name: 'Turkish Coffee', nameTr: 'Türk Kahvesi', price: 4.50, categoryId: turkishDrinks.id, prepTime: 5 },
    { name: 'Raki', nameTr: 'Rakı', price: 8.50, categoryId: turkishDrinks.id, prepTime: 2 },
    { name: 'Efes Beer', nameTr: 'Efes Bira', price: 5.50, categoryId: turkishDrinks.id, prepTime: 2 },
    { name: 'Turkish Wine', nameTr: 'Türk Şarabı', price: 7.50, categoryId: turkishDrinks.id, prepTime: 2 },
    { name: 'Fresh Pomegranate Juice', nameTr: 'Taze Nar Suyu', price: 4.50, categoryId: turkishDrinks.id, prepTime: 3 },
    { name: 'Fresh Orange Juice', nameTr: 'Taze Portakal Suyu', price: 3.50, categoryId: turkishDrinks.id, prepTime: 3 },
    { name: 'Salgam', nameTr: 'Şalgam', price: 3.50, categoryId: turkishDrinks.id, prepTime: 2 },
    { name: 'Boza', nameTr: 'Boza', price: 4.00, categoryId: turkishDrinks.id, prepTime: 2 },
    
    // Shisha
    { name: 'Double Apple', nameTr: 'Çift Elma', price: 13.00, categoryId: shisha.id, prepTime: 10 },
    { name: 'Grape Mint', nameTr: 'Üzüm Nane', price: 13.00, categoryId: shisha.id, prepTime: 10 },
    { name: 'Rose', nameTr: 'Gül', price: 14.00, categoryId: shisha.id, prepTime: 10 },
    { name: 'Watermelon', nameTr: 'Karpuz', price: 13.00, categoryId: shisha.id, prepTime: 10 },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: `item-${item.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {
        price: item.price, // Update price if item exists
      },
      create: {
        id: `item-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: item.name,
        nameTr: item.nameTr,
        categoryId: item.categoryId,
        price: item.price,
        preparationTime: item.prepTime,
        available: true,
        displayOrder: 0,
      },
    });
  }

  console.log('✅ Created menu items');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


