/* backend/seeders/seed.js */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Role from '../models/Role.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { DEFAULT_ROLES } from '../constants/index.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    console.log('Seeding roles...');
    for (const roleData of DEFAULT_ROLES) {
      await Role.findOneAndUpdate(
        { name: roleData.name, businessId: null },
        { ...roleData, isDefault: true, businessId: null },
        { upsert: true, new: true }
      );
    }

    console.log('Seeding Super Admin and Business...');
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@erpbill.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      // Create first business
      const business = await Business.create({
        name: 'Primary Business',
        ownerId: new mongoose.Types.ObjectId() // Placeholder
      });

      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'Super Admin',
        businessId: business._id
      });

      business.ownerId = admin._id;
      await business.save();

      console.log('Super Admin created:', adminEmail);
    } else {
      console.log('Super Admin already exists');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
