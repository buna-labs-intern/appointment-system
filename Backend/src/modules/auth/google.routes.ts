import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../shared/prisma";
import AppError from "../../utils/AppError";
import catchAsync from "../../utils/catchAsync";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const JWT_SECRET = process.env.JWT_SECRET || "appointment_system_jwt_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

async function verifyGoogleIdToken(idToken: string) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw new AppError(401, "Invalid Google token");
  const payload = (await res.json()) as any;
  if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) throw new AppError(401, "Google token audience mismatch");
  if (payload.email_verified !== "true" && payload.email_verified !== true) throw new AppError(401, "Google email not verified");
  return payload as { email: string; name?: string; sub: string };
}

const router = Router();

router.post(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const { idToken } = req.body;
    if (!idToken) throw new AppError(400, "idToken is required");

    const google = await verifyGoogleIdToken(idToken);
    const email = google.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: { select: { id: true, name: true, slug: true, isActive: true } },
        userBranches: { include: { branch: { select: { id: true, name: true, slug: true, isActive: true } } } },
      },
    });
    if (!user) throw new AppError(404, "No account linked to this Google email. Contact administrator.");
    if (!user.isActive) throw new AppError(403, "Account deactivated");
    if (user.tenant && !user.tenant.isActive) throw new AppError(403, "Clinic is banned. Contact platform administrator.");

    const branchIds = user.userBranches.map((ub) => ub.branchId);
    const branchAll = branchIds.length === 0;
    const branches = user.userBranches
      .map((ub) => ub.branch)
      .filter(Boolean)
      .map((b) => ({ id: b!.id, name: b!.name, slug: b!.slug, isActive: b!.isActive }));
    if (!branchAll && branchIds.length === 1) {
      const b = branches[0];
      if (b && !b.isActive) throw new AppError(403, `Your branch "${b.name}" is archived`);
    }

    const tenant = user.tenant ? { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug } : null;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        branchIds,
        branchAll,
        tenantId: tenant?.id ?? null,
        tenantSlug: tenant?.slug ?? null,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      success: true,
      message: "Google login successful",
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          mustChangePassword: user.mustChangePassword,
          tenantId: tenant?.id ?? null,
          branchIds,
          branchAll,
          branches,
        },
        tenant,
      },
    });
  })
);

export default router;
