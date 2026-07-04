/* Populates the database with a demo admin, owners, tenants, and listings.
   Run with: npm run seed  (make sure MONGO_URI is set in .env) */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');

const run = async () => {
  await connectDB();

  console.log('[seed] Clearing existing demo collections...');
  await Promise.all([User.deleteMany({}), Listing.deleteMany({})]);

  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@flatmatch.app',
    password: 'Admin@123',
    role: 'admin',
    phone: '9999900000',
    isVerified: true,
  });

  const owner1 = await User.create({
    name: 'Rohit Verma',
    email: 'owner1@flatmatch.app',
    password: 'Owner@123',
    role: 'owner',
    phone: '9876543210',
    gender: 'male',
    isVerified: true,
  });

  const owner2 = await User.create({
    name: 'Priya Nair',
    email: 'owner2@flatmatch.app',
    password: 'Owner@123',
    role: 'owner',
    phone: '9876500000',
    gender: 'female',
    isVerified: true,
  });

  const tenant1 = await User.create({
    name: 'Ankit Sharma',
    email: 'tenant1@flatmatch.app',
    password: 'Tenant@123',
    role: 'tenant',
    phone: '9123456780',
    gender: 'male',
    preferences: {
      preferredLocation: 'Rohini, Delhi',
      budgetMin: 6000,
      budgetMax: 12000,
      moveInDate: new Date('2026-08-01'),
      lifestyleTags: ['Night Owl', 'Non Smoker', 'Pet Lover'],
      about: 'Software engineer, quiet and tidy, WFH most days.',
    },
    isVerified: true,
  });

  const tenant2 = await User.create({
    name: 'Sneha Kapoor',
    email: 'tenant2@flatmatch.app',
    password: 'Tenant@123',
    role: 'tenant',
    phone: '9123456781',
    gender: 'female',
    preferences: {
      preferredLocation: 'Noida',
      budgetMin: 8000,
      budgetMax: 15000,
      moveInDate: new Date('2026-07-15'),
      lifestyleTags: ['Early Bird', 'Vegan', 'Fitness Freak'],
      about: 'Marketing professional, gym enthusiast, early sleeper.',
    },
    isVerified: true,
  });

  await Listing.insertMany([
    {
      owner: owner1._id,
      title: 'Spacious 1BHK near Rohini Sector 7',
      description: 'Well-lit 1BHK, close to metro, ideal for a working professional. Fully furnished with modern amenities.',
      location: { address: 'Sector 7, Rohini', city: 'Delhi', lat: 28.7041, lng: 77.1025 },
      rent: 9500,
      securityDeposit: 19000,
      availableFrom: new Date('2026-08-01'),
      roomType: 'single',
      furnishing: 'fully-furnished',
      genderPreference: 'any',
      amenities: ['Wifi', 'AC', 'Fridge', 'PowerBackup', 'CCTV'],
      photos: [],
      status: 'active',
    },
    {
      owner: owner1._id,
      title: 'Shared Double Room in Pitampura',
      description: 'Great for students and young professionals. Walking distance to markets and metro station.',
      location: { address: 'Pitampura', city: 'Delhi', lat: 28.6942, lng: 77.1310 },
      rent: 6500,
      securityDeposit: 13000,
      availableFrom: new Date('2026-07-20'),
      roomType: 'shared-double',
      furnishing: 'semi-furnished',
      genderPreference: 'male',
      amenities: ['Wifi', 'Fridge', 'Machine'],
      photos: [],
      status: 'active',
    },
    {
      owner: owner2._id,
      title: 'Premium 2BHK in Sector 62, Noida',
      description: 'Newly renovated 2BHK with balcony view, near IT parks. Perfect for professionals wanting comfort.',
      location: { address: 'Sector 62', city: 'Noida', lat: 28.6280, lng: 77.3649 },
      rent: 14000,
      securityDeposit: 28000,
      availableFrom: new Date('2026-07-15'),
      roomType: '2bhk',
      furnishing: 'fully-furnished',
      genderPreference: 'any',
      amenities: ['Wifi', 'AC', 'Parking', 'CCTV', 'TV', 'PowerBackup'],
      photos: [],
      status: 'active',
    },
    {
      owner: owner2._id,
      title: "Girls' PG in Sector 18, Noida",
      description: 'Safe and secure PG for working women, home-cooked meals included, 24x7 security.',
      location: { address: 'Sector 18', city: 'Noida', lat: 28.5697, lng: 77.3260 },
      rent: 10000,
      securityDeposit: 10000,
      availableFrom: new Date('2026-07-10'),
      roomType: 'pg',
      furnishing: 'fully-furnished',
      genderPreference: 'female',
      amenities: ['Wifi', 'AC', 'CCTV', 'Fridge'],
      photos: [],
      status: 'active',
    },
  ]);

  console.log('[seed] Done. Demo accounts:');
  console.log(`  Admin  -> admin@flatmatch.app / Admin@123`);
  console.log(`  Owner  -> owner1@flatmatch.app / Owner@123`);
  console.log(`  Owner  -> owner2@flatmatch.app / Owner@123`);
  console.log(`  Tenant -> tenant1@flatmatch.app / Tenant@123`);
  console.log(`  Tenant -> tenant2@flatmatch.app / Tenant@123`);
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});