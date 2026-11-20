import { db } from '../db/database';
import { DashboardMetrics } from '../types';
import { loanService } from './loan.service';

export class DashboardService {
  async getMetrics(): Promise<DashboardMetrics> {
    const allLoans = Array.from(db.loans.values()).filter((l) => l.status === 'active');

    let onTimeCount = 0;
    let yellowCount = 0;
    let orangeCount = 0;
    let redCount = 0;

    for (const loan of allLoans) {
      const { severity } = loanService.calculateDelay(loan.dueDate);
      if (severity === 'none') onTimeCount++;
      else if (severity === 'yellow') yellowCount++;
      else if (severity === 'orange') orangeCount++;
      else if (severity === 'red') redCount++;
    }

    const pendingReservationsCount = Array.from(db.reservations.values()).filter(
      (r) => r.status === 'waiting'
    ).length;

    return {
      totalActiveLoans: allLoans.length,
      onTimeLoansCount: onTimeCount,
      yellowDelayCount: yellowCount,
      orangeDelayCount: orangeCount,
      redDelayCount: redCount,
      pendingReservationsCount,
      expectedReturnsTodayCount: 1, // simulated expected returns
    };
  }
}

export const dashboardService = new DashboardService();
