import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import morganMiddleware from "./middleware/morganMiddleware";
import doctorRoutes from "./modules/doctor/doctor.routes";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);
app.use("/api/doctors", doctorRoutes);

// Health Check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Hello from Appointment System API",
  });
});


// Routes

import appointmentRoutes from "./modules/appointment/appointment.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.route";




app.use("/api/dashboard", dashboardRoutes);
app.use("/api/appointments", appointmentRoutes);


app.use(globalErrorHandler);

export default app;