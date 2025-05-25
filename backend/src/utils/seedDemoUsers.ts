// backend/src/utils/seedDemoUsers.ts
import bcrypt from 'bcryptjs';
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Candidate } from "../entity/Candidate";
import { Lecturer } from "../entity/Lecturer";
import { Admin } from "../entity/Admin";

// Demo users data
const demoUsers = [
  {
    name: 'Demo Lecturer',
    email: 'lecturer@example.com',
    password: 'Password123',
    role: 'lecturer' as const
  },
  {
    name: 'Demo Candidate',
    email: 'candidate@example.com',
    password: 'Password123',
    role: 'candidate' as const
  },
  {
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'Password123',
    role: 'admin' as const
  },
  // Additional test users
  {
    name: 'Jane Smith',
    email: 'jane.smith@student.rmit.edu.au',
    password: 'Password123',
    role: 'candidate' as const
  },
  {
    name: 'Dr. John Wilson',
    email: 'john.wilson@rmit.edu.au',
    password: 'Password123',
    role: 'lecturer' as const
  }
];

export async function seedDemoUsers() {
  try {
    console.log("🔑 Seeding demo users...");
    
    const userRepo = AppDataSource.getRepository(User);
    const candidateRepo = AppDataSource.getRepository(Candidate);
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const adminRepo = AppDataSource.getRepository(Admin);
    
    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await userRepo.findOne({ 
        where: { email: userData.email } 
      });
      
      if (existingUser) {
        console.log(`- User already exists: ${userData.email}`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = userRepo.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      
      const savedUser = await userRepo.save(user);
      console.log(`✓ Created user: ${userData.name} (${userData.email})`);
      
      // Create role-specific record
      if (userData.role === 'candidate') {
        const candidate = candidateRepo.create({
          user_id: savedUser.id,
          availability: 'parttime',
          skills: ['Programming', 'Teaching']
        });
        await candidateRepo.save(candidate);
        console.log(`  └─ Created candidate profile`);
      }
      else if (userData.role === 'lecturer') {
        const lecturer = lecturerRepo.create({
          user_id: savedUser.id,
          department: 'School of Computer Science'
        });
        await lecturerRepo.save(lecturer);
        console.log(`  └─ Created lecturer profile`);
      }
      else if (userData.role === 'admin') {
        const admin = adminRepo.create({
          user_id: savedUser.id,
          department: 'IT Administration'
        });
        await adminRepo.save(admin);
        console.log(`  └─ Created admin profile`);
      }
    }
    
    console.log("✅ Demo users seeding completed!");
    console.log("\n📋 Available login credentials:");
    console.log("   Lecturer: lecturer@example.com / Password123");
    console.log("   Candidate: candidate@example.com / Password123");
    console.log("   Admin: admin@example.com / Password123");
    
  } catch (error) {
    console.error("❌ Error seeding demo users:", error);
    throw error;
  }
}