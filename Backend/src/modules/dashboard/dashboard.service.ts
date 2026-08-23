import { DashboardRepository } from "./dashboard.repository";

export class DashboardService {
  private repository = new DashboardRepository();

  async getDashboardData() {
    return this.repository.getStatistics();
  }
}