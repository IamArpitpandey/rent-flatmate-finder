/* SAFE, NON-DESTRUCTIVE seeder — adds demo owners (only if missing) and
   demo listings with photos. Never deletes any existing data, and is safe
   to re-run: it upserts listings by (title + city) so re-running won't
   create duplicates.
   Run with: npm run seed */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');

const photosFor = (seed, count = 3) =>
  Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/900/650`);

async function getOrCreateOwner(data) {
  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = await User.create(data);
    console.log(`[seed] Created owner: ${data.email}`);
  } else {
    console.log(`[seed] Owner already exists, reusing: ${data.email}`);
  }
  return user;
}

const run = async () => {
  await connectDB();

  const ownerData = [
    { name: 'Rohit Verma', email: 'owner1@flatmatch.app', password: 'Owner@123', role: 'owner', phone: '9876543210', gender: 'male' },
    { name: 'Priya Nair', email: 'owner2@flatmatch.app', password: 'Owner@123', role: 'owner', phone: '9876500000', gender: 'female' },
    { name: 'Karan Mehta', email: 'owner3@flatmatch.app', password: 'Owner@123', role: 'owner', phone: '9876511111', gender: 'male' },
    { name: 'Ayesha Khan', email: 'owner4@flatmatch.app', password: 'Owner@123', role: 'owner', phone: '9876522222', gender: 'female' },
  ];

  const owners = [];
  for (const data of ownerData) {
    owners.push(await getOrCreateOwner(data));
  }
  const [o1, o2, o3, o4] = owners;

  const listings = [
    { owner: o1, title: 'Spacious 1BHK near Rohini Sector 7', address: 'Sector 7, Rohini', city: 'Delhi', rent: 9500, deposit: 19000, from: '2026-08-01', type: 'single', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'Fridge', 'PowerBackup', 'CCTV'] },
    { owner: o1, title: 'Shared Double Room in Pitampura', address: 'Pitampura', city: 'Delhi', rent: 6500, deposit: 13000, from: '2026-07-20', type: 'shared-double', furnishing: 'semi-furnished', pref: 'male', amenities: ['Wifi', 'Fridge', 'Machine'] },
    { owner: o1, title: 'Cozy Studio near Karol Bagh Metro', address: 'Karol Bagh', city: 'Delhi', rent: 8000, deposit: 16000, from: '2026-07-25', type: 'single', furnishing: 'semi-furnished', pref: 'any', amenities: ['Wifi', 'Fridge', 'CCTV'] },
    { owner: o1, title: 'Budget PG for Working Women, Lajpat Nagar', address: 'Lajpat Nagar', city: 'Delhi', rent: 7000, deposit: 7000, from: '2026-07-10', type: 'pg', furnishing: 'fully-furnished', pref: 'female', amenities: ['Wifi', 'AC', 'CCTV', 'Fridge'] },
    { owner: o1, title: 'Triple Sharing Room in Dwarka', address: 'Sector 12, Dwarka', city: 'Delhi', rent: 5500, deposit: 11000, from: '2026-08-05', type: 'shared-triple', furnishing: 'unfurnished', pref: 'any', amenities: ['Wifi', 'Parking'] },

    { owner: o2, title: 'Premium 2BHK in Sector 62, Noida', address: 'Sector 62', city: 'Noida', rent: 14000, deposit: 28000, from: '2026-07-15', type: '2bhk', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'Parking', 'CCTV', 'TV', 'PowerBackup'] },
    { owner: o2, title: "Girls' PG in Sector 18, Noida", address: 'Sector 18', city: 'Noida', rent: 10000, deposit: 10000, from: '2026-07-10', type: 'pg', furnishing: 'fully-furnished', pref: 'female', amenities: ['Wifi', 'AC', 'CCTV', 'Fridge'] },
    { owner: o2, title: '1BHK Near Sector 137 IT Hub', address: 'Sector 137', city: 'Noida', rent: 11500, deposit: 23000, from: '2026-08-10', type: '1bhk', furnishing: 'semi-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'Fridge', 'Parking'] },
    { owner: o2, title: 'Shared Double Room, Sector 50', address: 'Sector 50', city: 'Noida', rent: 7500, deposit: 15000, from: '2026-07-18', type: 'shared-double', furnishing: 'semi-furnished', pref: 'male', amenities: ['Wifi', 'Machine', 'TV'] },
    { owner: o2, title: 'Boys PG near Sector 15 Market', address: 'Sector 15', city: 'Noida', rent: 6000, deposit: 6000, from: '2026-07-22', type: 'pg', furnishing: 'fully-furnished', pref: 'male', amenities: ['Wifi', 'Fridge', 'CCTV'] },

    { owner: o3, title: 'Modern 2BHK in Sector 29, Gurgaon', address: 'Sector 29', city: 'Gurgaon', rent: 18000, deposit: 36000, from: '2026-08-01', type: '2bhk', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'Parking', 'CCTV', 'TV'] },
    { owner: o3, title: 'Single Room near Cyber Hub', address: 'DLF Cyber City', city: 'Gurgaon', rent: 13000, deposit: 26000, from: '2026-07-28', type: 'single', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'PowerBackup'] },
    { owner: o3, title: 'Co-living Triple Sharing, Sohna Road', address: 'Sohna Road', city: 'Gurgaon', rent: 8500, deposit: 8500, from: '2026-07-14', type: 'shared-triple', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'Machine', 'CCTV'] },
    { owner: o3, title: '3BHK Independent Floor, Sector 45', address: 'Sector 45', city: 'Gurgaon', rent: 25000, deposit: 50000, from: '2026-08-15', type: '3bhk', furnishing: 'semi-furnished', pref: 'any', amenities: ['Wifi', 'Parking', 'PowerBackup'] },

    { owner: o4, title: 'Sunny 1BHK in Koramangala', address: 'Koramangala', city: 'Bangalore', rent: 16000, deposit: 32000, from: '2026-07-20', type: '1bhk', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'Fridge', 'CCTV'] },
    { owner: o4, title: 'Shared Double Room, Indiranagar', address: 'Indiranagar', city: 'Bangalore', rent: 12000, deposit: 24000, from: '2026-08-05', type: 'shared-double', furnishing: 'fully-furnished', pref: 'female', amenities: ['Wifi', 'AC', 'Machine'] },
    { owner: o4, title: 'PG for Techies, HSR Layout', address: 'HSR Layout', city: 'Bangalore', rent: 11000, deposit: 11000, from: '2026-07-18', type: 'pg', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'CCTV', 'PowerBackup'] },
    { owner: o4, title: 'Studio Apartment, Whitefield', address: 'Whitefield', city: 'Bangalore', rent: 14500, deposit: 29000, from: '2026-08-01', type: 'single', furnishing: 'semi-furnished', pref: 'any', amenities: ['Wifi', 'Fridge', 'Parking'] },

    { owner: o2, title: '2BHK near Hinjewadi IT Park', address: 'Hinjewadi Phase 2', city: 'Pune', rent: 15500, deposit: 31000, from: '2026-07-25', type: '2bhk', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'Parking', 'TV'] },
    { owner: o3, title: 'Shared Room for Girls, Baner', address: 'Baner', city: 'Pune', rent: 9000, deposit: 18000, from: '2026-08-08', type: 'shared-double', furnishing: 'semi-furnished', pref: 'female', amenities: ['Wifi', 'Fridge', 'CCTV'] },
    { owner: o1, title: 'Budget PG near Kondhwa', address: 'Kondhwa', city: 'Pune', rent: 6500, deposit: 6500, from: '2026-07-12', type: 'pg', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'Machine'] },

    { owner: o4, title: '1BHK near HITEC City', address: 'HITEC City', city: 'Hyderabad', rent: 13500, deposit: 27000, from: '2026-08-03', type: '1bhk', furnishing: 'fully-furnished', pref: 'any', amenities: ['Wifi', 'AC', 'Fridge', 'PowerBackup'] },
    { owner: o2, title: 'Triple Sharing near Gachibowli', address: 'Gachibowli', city: 'Hyderabad', rent: 7000, deposit: 7000, from: '2026-07-16', type: 'shared-triple', furnishing: 'semi-furnished', pref: 'male', amenities: ['Wifi', 'CCTV'] },
  ];

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i];

    const existing = await Listing.findOne({ title: l.title, 'location.city': l.city });
    if (existing) {
      skipped++;
      continue;
    }

    await Listing.create({
      owner: l.owner._id,
      title: l.title,
      description: `${l.title} — a well-maintained ${l.type.replace('-', ' ')} in ${l.city}, close to markets, transit and everyday essentials. Ideal for working professionals and students looking for a comfortable, hassle-free stay.`,
      location: { address: l.address, city: l.city },
      rent: l.rent,
      securityDeposit: l.deposit,
      availableFrom: new Date(l.from),
      roomType: l.type,
      furnishing: l.furnishing,
      genderPreference: l.pref,
      amenities: l.amenities,
      photos: photosFor(`listing-${i + 1}`, 3),
      status: 'active',
    });
    created++;
  }

  console.log(`[seed] Done. ${created} new listings created, ${skipped} already existed and were skipped.`);
  console.log('[seed] Owner logins (only if newly created above):');
  ownerData.forEach((o) => console.log(`  ${o.email} / ${o.password}`));
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});