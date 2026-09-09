import bcrypt from "bcryptjs";
import prisma from "../src/shared/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Seed default Tenant + Branch
  const defaultTenant = await prisma.tenant.upsert({
    where: { slug: "nexacare" },
    update: { name: "NexaCare" },
    create: { name: "NexaCare", slug: "nexacare", isActive: true },
  });

  const defaultBranch = await prisma.branch.upsert({
    where: { slug: "main-branch" },
    update: { name: "Main Branch", tenantId: defaultTenant.id },
    create: {
      name: "Main Branch",
      slug: "main-branch",
      address: "Main",
      tenantId: defaultTenant.id,
    },
  });

  if (!defaultTenant.defaultBranchId) {
    await prisma.tenant.update({
      where: { id: defaultTenant.id },
      data: { defaultBranchId: defaultBranch.id },
    });
  }

  console.log("✅ Tenant seeded:", defaultTenant.slug, "-> branch:", defaultBranch.slug);

  // 1. Seed Users (Admin and Receptionist) — keep global email unique, no branch auto-assign (all branches)
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const receptionistPassword = await bcrypt.hash("Reception@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@hospital.com" },
    update: {
      fullName: "System Administrator",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
      tenantId: defaultTenant.id,
    },
    create: {
      fullName: "System Administrator",
      email: "admin@hospital.com",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
      tenantId: defaultTenant.id,
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: "receptionist@hospital.com" },
    update: {
      fullName: "Clinic Receptionist",
      password: receptionistPassword,
      role: "RECEPTIONIST",
      isActive: true,
      tenantId: defaultTenant.id,
    },
    create: {
      fullName: "Clinic Receptionist",
      email: "receptionist@hospital.com",
      password: receptionistPassword,
      role: "RECEPTIONIST",
      isActive: true,
      tenantId: defaultTenant.id,
    },
  });

  console.log("✅ Users seeded:", { admin: admin.email, receptionist: receptionist.email });

  const superAdminPassword = await bcrypt.hash("Super@12345", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "super@nexacare.com" },
    update: {
      fullName: "Platform Super Admin",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      tenantId: null,
      mustChangePassword: false,
    },
    create: {
      fullName: "Platform Super Admin",
      email: "super@nexacare.com",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      tenantId: null,
      mustChangePassword: false,
    },
  });
  console.log("✅ Super admin seeded:", superAdmin.email);

  // 2. Seed Services
  const servicesData = [
    { name: "General Consultation", price: 25, duration: 30, description: "Routine health consultation", isActive: true, branchId: defaultBranch.id },
    { name: "Follow-up Consultation", price: 15, duration: 15, description: "Follow-up medical review", isActive: true, branchId: defaultBranch.id },
    { name: "Pediatrics Consultation", price: 30, duration: 30, description: "Specialized child health care", isActive: true, branchId: defaultBranch.id },
    { name: "Medical Certificate", price: 10, duration: 15, description: "Doctor assessment for certificate", isActive: true, branchId: defaultBranch.id },
    { name: "Blood Pressure Check", price: 5, duration: 10, description: "Blood pressure and vitals reading", isActive: true, branchId: defaultBranch.id },
  ];

  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: s });
    } else if (!existing.branchId) {
      await prisma.service.update({ where: { id: existing.id }, data: { branchId: defaultBranch.id } });
    }
  }
  console.log("✅ Services seeded");

  // 3. Seed Doctors
  const doctorsData = [
    { fullName: "Dr. Sara Ahmed", specialty: "General Practice", phone: "+252 61 111 1111", isActive: true, branchId: defaultBranch.id },
    { fullName: "Dr. Mohamed Ali", specialty: "Pediatrics", phone: "+252 61 222 2222", isActive: true, branchId: defaultBranch.id },
    { fullName: "Dr. Amina Yusuf", specialty: "Dermatology", phone: "+252 61 333 3333", isActive: false, branchId: defaultBranch.id },
  ];

  for (const d of doctorsData) {
    const existing = await prisma.doctor.findFirst({ where: { fullName: d.fullName } });
    if (!existing) {
      await prisma.doctor.create({ data: d });
    } else if (!existing.branchId) {
      await prisma.doctor.update({ where: { id: existing.id }, data: { branchId: defaultBranch.id } });
    }
  }
  console.log("✅ Doctors seeded");

  // 4. Seed Patients
  const patientsData = [
    { fullName: "Hassan Omar", phone: "+252 61 444 4444", gender: "MALE", birthDate: new Date("1992-04-12"), address: "Hargeisa", notes: "Prefers morning visits", tenantId: defaultTenant.id },
    { fullName: "Fadumo Abdi", phone: "+252 61 555 5555", gender: "FEMALE", birthDate: new Date("1988-11-03"), address: "Berbera", notes: "Regular checkups", tenantId: defaultTenant.id },
    { fullName: "Yusuf Ismail", phone: "+252 61 666 6666", gender: "MALE", birthDate: new Date("2015-07-21"), address: "Mogadishu", notes: "Pediatric patient", tenantId: defaultTenant.id },
  ];

  for (const p of patientsData) {
    const existing = await prisma.patient.findFirst({ where: { phone: p.phone } });
    if (!existing) {
      await prisma.patient.create({ data: p });
    } else if (!existing.tenantId) {
      await prisma.patient.update({ where: { id: existing.id }, data: { tenantId: defaultTenant.id } });
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
