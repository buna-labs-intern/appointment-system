// src/app.ts
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import morganMiddleware from "./middleware/morganMiddleware";
import doctorRoutes from "./modules/doctor/doctor.routes";
import patientRoutes from "./modules/patient/patient.route";
import serviceRoutes from "./modules/service/service.routes";

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// ✅ Health Check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Hello from Appointment System API",
  });
});

// ✅ Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/services", serviceRoutes);

// Routes (keep existing)
import appointmentRoutes from "./modules/appointment/appointment.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.route";

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/appointments", appointmentRoutes);

// ✅ Global Error Handler - Always last
app.use(globalErrorHandler);

export default app;