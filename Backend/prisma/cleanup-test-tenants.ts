import prisma from "../src/shared/prisma";

async function main() {
  const slugs = ["berbera-clinic"];
  const tenants = await prisma.tenant.findMany({ where: { slug: { in: slugs } } });
  const ids = tenants.map((t) => t.id);

  if (ids.length === 0) {
    console.log("No leftover test tenants found");
    return;
  }

  const tenantDoctors = await prisma.doctor.findMany({
    where: { branch: { tenantId: { in: ids } } },
    select: { id: true },
  });
  const doctorIds = tenantDoctors.map((d) => d.id);

  await prisma.appointment.deleteMany({
    where: { OR: [{ doctorId: { in: doctorIds } }, { branch: { tenantId: { in: ids } } }] },
  });
  await prisma.doctor.deleteMany({ where: { id: { in: doctorIds } } });
  await prisma.service.deleteMany({ where: { branch: { tenantId: { in: ids } } } });
  await prisma.staffShift.deleteMany({ where: { branch: { tenantId: { in: ids } } } });
  await prisma.notification.deleteMany({ where: { branch: { tenantId: { in: ids } } } });
  await prisma.patient.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.userBranch.deleteMany({ where: { branch: { tenantId: { in: ids } } } });
  await prisma.user.deleteMany({ where: { tenantId: { in: ids } } });
  await prisma.branch.deleteMany({ where: { tenantId: { in: ids } } });
  const deleted = await prisma.tenant.deleteMany({ where: { id: { in: ids } } });

  console.log(`Removed ${deleted.count} leftover test tenant(s):`, slugs.join(", "));
}

main()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
