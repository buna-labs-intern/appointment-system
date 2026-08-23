import bcrypt from "bcryptjs";
import prisma from "../src/shared/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed Users (Admin and Receptionist)
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const receptionistPassword = await bcrypt.hash("Reception@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hospital.com" },
    update: {
      fullName: "System Administrator",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      fullName: "System Administrator",
      email: "admin@hospital.com",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: "receptionist@hospital.com" },
    update: {
      fullName: "Clinic Receptionist",
      password: receptionistPassword,
      role: "RECEPTIONIST",
      isActive: true,
    },
    create: {
      fullName: "Clinic Receptionist",
      email: "receptionist@hospital.com",
      password: receptionistPassword,
      role: "RECEPTIONIST",
      isActive: true,
    },
  });

  console.log("✅ Users seeded:", { admin: admin.email, receptionist: receptionist.email });

  // 2. Seed Services
  const servicesData = [
    { name: "General Consultation", price: 25, duration: 30, description: "Routine health consultation", isActive: true },
    { name: "Follow-up Consultation", price: 15, duration: 15, description: "Follow-up medical review", isActive: true },
    { name: "Pediatrics Consultation", price: 30, duration: 30, description: "Specialized child health care", isActive: true },
    { name: "Medical Certificate", price: 10, duration: 15, description: "Doctor assessment for certificate", isActive: true },
    { name: "Blood Pressure Check", price: 5, duration: 10, description: "Blood pressure and vitals reading", isActive: true },
  ];

  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }
  console.log("✅ Services seeded");

  // 3. Seed Doctors
  const doctorsData = [
    { fullName: "Dr. Sara Ahmed", specialty: "General Practice", phone: "+252 61 111 1111", isActive: true },
    { fullName: "Dr. Mohamed Ali", specialty: "Pediatrics", phone: "+252 61 222 2222", isActive: true },
    { fullName: "Dr. Amina Yusuf", specialty: "Dermatology", phone: "+252 61 333 3333", isActive: false },
  ];

  for (const d of doctorsData) {
    const existing = await prisma.doctor.findFirst({ where: { fullName: d.fullName } });
    if (!existing) {
      await prisma.doctor.create({ data: d });
    }
  }
  console.log("✅ Doctors seeded");

  // 4. Seed Patients
  const patientsData = [
    { fullName: "Hassan Omar", phone: "+252 61 444 4444", gender: "MALE", birthDate: new Date("1992-04-12"), address: "Hargeisa", notes: "Prefers morning visits" },
    { fullName: "Fadumo Abdi", phone: "+252 61 555 5555", gender: "FEMALE", birthDate: new Date("1988-11-03"), address: "Berbera", notes: "Regular checkups" },
    { fullName: "Yusuf Ismail", phone: "+252 61 666 6666", gender: "MALE", birthDate: new Date("2015-07-21"), address: "Mogadishu", notes: "Pediatric patient" },
  ];

  for (const p of patientsData) {
    const existing = await prisma.patient.findFirst({ where: { phone: p.phone } });
    if (!existing) {
      await prisma.patient.create({ data: p });
    }
  }
  console.log("✅ Patients seeded");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
