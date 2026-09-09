import bcrypt from "bcryptjs";
import prisma from "../src/shared/prisma";

function dayAt(hour: number, minute: number, dayOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Seeding demo data...");

  const tenant = await prisma.tenant.upsert({
    where: { slug: "nexacare" },
    update: {},
    create: { name: "NexaCare", slug: "nexacare" },
  });

  const mainBranch = await prisma.branch.upsert({
    where: { slug: "main-branch" },
    update: { tenantId: tenant.id },
    create: { name: "Main Branch", slug: "main-branch", address: "Main", tenantId: tenant.id },
  });

  if (!tenant.defaultBranchId) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { defaultBranchId: mainBranch.id },
    });
  }

  const doctors = await prisma.doctor.findMany({
    where: { branchId: mainBranch.id, isActive: true },
  });
  const services = await prisma.service.findMany({
    where: { branchId: mainBranch.id, isActive: true },
  });
  const patients = await prisma.patient.findMany({
    where: { tenantId: tenant.id },
  });

  if (doctors.length === 0 || services.length === 0 || patients.length === 0) {
    console.log("⚠️  Run `npm run prisma:seed` first — demo appointments need seeded doctors, services and patients.");
    return;
  }

  const existingAppointments = await prisma.appointment.count({
    where: { branchId: mainBranch.id },
  });

  if (existingAppointments === 0) {
    const consultation = services.find((s) => s.name.includes("General")) ?? services[0];
    const followUp = services.find((s) => s.name.includes("Follow-up")) ?? services[1] ?? services[0];
    const peds = services.find((s) => s.name.includes("Pediatrics")) ?? services[0];
    const sara = doctors[0];
    const mohamed = doctors[1] ?? doctors[0];

    const plan: {
      doctorId: string;
      serviceId: string;
      patientId: string;
      date: Date;
      startTime: string;
      endTime: string;
      status: string;
      reason: string;
    }[] = [
      { doctorId: sara.id, serviceId: consultation.id, patientId: patients[0].id, date: dayAt(9, 0, 0), startTime: "09:00", endTime: "09:30", status: "SCHEDULED", reason: "Fever and headache" },
      { doctorId: sara.id, serviceId: followUp.id, patientId: patients[1].id, date: dayAt(10, 0, 0), startTime: "10:00", endTime: "10:15", status: "SCHEDULED", reason: "Follow-up review" },
      { doctorId: mohamed.id, serviceId: peds.id, patientId: patients[2].id, date: dayAt(13, 0, 0), startTime: "13:00", endTime: "13:30", status: "SCHEDULED", reason: "Child checkup" },
      { doctorId: mohamed.id, serviceId: peds.id, patientId: patients[2].id, date: dayAt(9, 30, 1), startTime: "09:30", endTime: "10:00", status: "SCHEDULED", reason: "Vaccination review" },
      { doctorId: sara.id, serviceId: consultation.id, patientId: patients[1].id, date: dayAt(11, 0, -1), startTime: "11:00", endTime: "11:30", status: "COMPLETED", reason: "Blood pressure review" },
      { doctorId: sara.id, serviceId: consultation.id, patientId: patients[0].id, date: dayAt(14, 0, -2), startTime: "14:00", endTime: "14:30", status: "COMPLETED", reason: "General consultation" },
      { doctorId: mohamed.id, serviceId: consultation.id, patientId: patients[1].id, date: dayAt(9, 0, -3), startTime: "09:00", endTime: "09:30", status: "COMPLETED", reason: "Routine check" },
      { doctorId: mohamed.id, serviceId: followUp.id, patientId: patients[0].id, date: dayAt(15, 0, -1), startTime: "15:00", endTime: "15:15", status: "CANCELLED", reason: "Patient cancelled" },
    ];

    for (const a of plan) {
      await prisma.appointment.create({
        data: {
          doctorId: a.doctorId,
          patientId: a.patientId,
          serviceId: a.serviceId,
          date: a.date,
          startTime: a.startTime,
          endTime: a.endTime,
          status: a.status,
          reason: a.reason,
          branchId: mainBranch.id,
        },
      });
    }
    console.log(`✅ ${plan.length} demo appointments created (today, upcoming, completed, cancelled)`);
  } else {
    console.log(`ℹ️  Appointments already exist (${existingAppointments}) — skipping appointment demo data`);
  }

  const receptionist = await prisma.user.findUnique({ where: { email: "receptionist@hospital.com" } });
  if (receptionist) {
    const existingShift = await prisma.staffShift.findFirst({
      where: { receptionistId: receptionist.id, branchId: mainBranch.id },
    });
    if (!existingShift) {
      await prisma.staffShift.create({
        data: {
          receptionistId: receptionist.id,
          branchId: mainBranch.id,
          date: dayAt(0, 0, 0),
          session: "MORNING",
          startTime: "09:00",
          endTime: "12:00",
          location: "Front Desk",
          status: "SCHEDULED",
        },
      });
      await prisma.staffShift.create({
        data: {
          receptionistId: receptionist.id,
          branchId: mainBranch.id,
          date: dayAt(0, 0, 1),
          session: "AFTERNOON",
          startTime: "13:00",
          endTime: "17:00",
          location: "Front Desk",
          status: "SCHEDULED",
        },
      });
      console.log("✅ Demo staff shifts created for receptionist (today + tomorrow)");
    }
  }

  const existingNotifications = await prisma.notification.count({
    where: { branchId: mainBranch.id },
  });
  if (existingNotifications === 0) {
    await prisma.notification.createMany({
      data: [
        { title: "Welcome to NexaCare", message: "Demo environment is ready. Explore the dashboard.", type: "system", branchId: mainBranch.id },
        { title: "New Patient Registered", message: `${patients[0].fullName} was registered into the clinic system.`, type: "patient", branchId: mainBranch.id },
        { title: "Upcoming Appointment", message: `Appointment scheduled with ${doctors[0].fullName} today.`, type: "appointment", branchId: mainBranch.id },
      ],
    });
    console.log("✅ Demo notifications created");
  }

  const secondTenant = await prisma.tenant.upsert({
    where: { slug: "hargeisa-medical" },
    update: {},
    create: { name: "Hargeisa Medical Center", slug: "hargeisa-medical", phone: "+252 61 000 0000" },
  });

  const secondBranch = await prisma.branch.upsert({
    where: { slug: "hargeisa-medical-main" },
    update: { tenantId: secondTenant.id },
    create: { name: "Main Branch", slug: "hargeisa-medical-main", tenantId: secondTenant.id },
  });

  if (!secondTenant.defaultBranchId) {
    await prisma.tenant.update({
      where: { id: secondTenant.id },
      data: { defaultBranchId: secondBranch.id },
    });
  }

  const ownerPassword = await bcrypt.hash("Owner@12345", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@hmc.com" },
    update: {
      fullName: "Dr. Khadija Ali",
      password: ownerPassword,
      mustChangePassword: true,
      isActive: true,
      tenantId: secondTenant.id,
    },
    create: {
      fullName: "Dr. Khadija Ali",
      email: "owner@hmc.com",
      phone: "+252 63 111 2222",
      password: ownerPassword,
      role: "ADMIN",
      isActive: true,
      mustChangePassword: true,
      tenantId: secondTenant.id,
    },
  });

  const ownerLink = await prisma.userBranch.findFirst({
    where: { userId: owner.id, branchId: secondBranch.id },
  });
  if (!ownerLink) {
    await prisma.userBranch.create({ data: { userId: owner.id, branchId: secondBranch.id } });
  }

  const secondDoctor = await prisma.doctor.findFirst({
    where: { fullName: "Dr. Khadija Hassan" },
  });
  if (!secondDoctor) {
    await prisma.doctor.create({
      data: { fullName: "Dr. Khadija Hassan", specialty: "Internal Medicine", phone: "+252 63 333 4444", branchId: secondBranch.id },
    });
  }

  const secondService = await prisma.service.findFirst({
    where: { name: "Specialist Consultation", branchId: secondBranch.id },
  });
  if (!secondService) {
    await prisma.service.create({
      data: { name: "Specialist Consultation", price: 40, duration: 30, branchId: secondBranch.id },
    });
  }

  console.log("✅ Second clinic seeded: Hargeisa Medical Center (owner@hmc.com / Owner@12345)");
  console.log("🎉 Demo data complete!");
}

main()
  .catch((e) => {
    console.error("❌ Demo seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
