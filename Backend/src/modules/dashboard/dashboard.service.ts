import { DashboardRepository } from "./dashboard.repository";

export class DashboardService {
  private repository = new DashboardRepository();

  async getDashboardData(branchId?: string, ctx?: any) {
    return this.repository.getStatistics(branchId, ctx);
  }
}