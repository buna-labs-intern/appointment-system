import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import { AuthRequest } from "../../middleware/authMiddleware";

export class AuthController {
  static async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result,
    });
  }

  static async getMe(req: AuthRequest, res: Response) {
    const user = await AuthService.getMe(req.user!.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User profile fetched successfully",
      data: user,
    });
  }
}
