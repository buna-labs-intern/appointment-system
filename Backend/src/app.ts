import express, { Application, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import morganMiddleware from "./middleware/morganMiddleware";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import doctorRoutes from "./modules/doctor/doctor.routes";
import patientRoutes from "./modules/patient/patient.route";
import serviceRoutes from "./modules/service/service.routes";
import appointmentRoutes from "./modules/appointment/appointment.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.route";
import notificationRoutes from "./modules/notification/notification.routes";
import scheduleRoutes from "./modules/schedule/schedule.routes";
import { authenticate } from "./middleware/authMiddleware";

const app: Application = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Hello from Clinic Appointment Management System API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/doctors", authenticate, doctorRoutes);
app.use("/api/patients", authenticate, patientRoutes);
app.use("/api/services", authenticate, serviceRoutes);
app.use("/api/appointments", authenticate, appointmentRoutes);
app.use("/api/dashboard", authenticate, dashboardRoutes);
app.use("/api/notifications", authenticate, notificationRoutes);
app.use("/api/schedule", authenticate, scheduleRoutes);

app.use(globalErrorHandler);

export default app;
