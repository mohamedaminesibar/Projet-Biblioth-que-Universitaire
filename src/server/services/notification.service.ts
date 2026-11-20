import { db } from '../db/database';
import { NotificationLog, DelaySeverity } from '../../types/library';
import { AuthUser } from '../types';

export interface DispatchNotificationParams {
  loanId: string;
  recipientEmail: string;
  recipientName: string;
  bookTitle: string;
  severity: DelaySeverity;
  subject: string;
  message: string;
  channel?: 'in_app' | 'email' | 'both';
  forceResend?: boolean;
}

export interface NotificationResult {
  notification: NotificationLog;
  deliveryStatus: 'delivered' | 'failed';
  providerMessageId: string;
  attempts: number;
}

export class NotificationService {
  /**
   * Get notifications for user with privacy enforcement
   */
  async getNotifications(user: AuthUser): Promise<NotificationLog[]> {
    let result = Array.from(db.notifications.values());

    if (user.role === 'student') {
      result = result.filter((n) => n.recipientEmail === user.email);
    }

    return result.sort((a, b) => (b.id > a.id ? 1 : -1));
  }

  /**
   * Sends a formal reminder notification with anti-duplicate and cessation checks
   */
  async sendNotification(
    params: DispatchNotificationParams,
    senderUser: AuthUser
  ): Promise<NotificationResult> {
    if (senderUser.role !== 'librarian') {
      const err: any = new Error('Seul le personnel de bibliothèque peut émettre des relances formelles.');
      err.statusCode = 403;
      err.code = 'UNAUTHORIZED_NOTIFICATION_DISPATCH';
      throw err;
    }

    // 1. CESSATION RULE: Stop reminders when loan is already returned
    if (params.loanId) {
      const loan = db.loans.get(params.loanId);
      if (!loan) {
        const err: any = new Error('Emprunt de référence introuvable.');
        err.statusCode = 404;
        err.code = 'LOAN_NOT_FOUND';
        throw err;
      }

      if (loan.status === 'returned') {
        const err: any = new Error(
          'Impossible d’envoyer une notification : cet ouvrage a déjà été restitué et l’emprunt est clôturé.'
        );
        err.statusCode = 400;
        err.code = 'LOAN_ALREADY_RETURNED';
        throw err;
      }
    }

    // 2. ANTI-DUPLICATE RULE: Prevent spamming identical reminder within active window
    if (!params.forceResend && params.loanId) {
      const existingRecentNotification = Array.from(db.notifications.values()).find(
        (n) =>
          n.loanId === params.loanId &&
          n.severity === params.severity &&
          n.recipientEmail === params.recipientEmail
      );

      if (existingRecentNotification) {
        const err: any = new Error(
          `Une notification de même niveau (${params.severity}) a déjà été transmise récemment pour cet emprunt. Utilisez l'option "forceResend" si un réenvoi exceptionnel est requis.`
        );
        err.statusCode = 409;
        err.code = 'DUPLICATE_NOTIFICATION_BLOCKED';
        throw err;
      }
    }

    // 3. Provider Delivery Simulation (e.g. SMTP / In-App Provider acknowledgment)
    // Provider confirmation must be received before marking as delivered
    const providerDeliverySuccess = true; // In production: await smtpClient.sendMail(...)
    const providerMessageId = `msg_est_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!providerDeliverySuccess) {
      const err: any = new Error('Échec d’acheminement par le fournisseur de messagerie. Veuillez réessayer.');
      err.statusCode = 502;
      err.code = 'PROVIDER_DELIVERY_FAILED';
      throw err;
    }

    const newNotif: NotificationLog = {
      id: `notif_${Date.now()}`,
      loanId: params.loanId,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      bookTitle: params.bookTitle,
      severity: params.severity,
      subject: params.subject,
      message: params.message,
      sentAt: 'À l’instant',
      channel: params.channel || 'both',
      read: false,
    };

    db.notifications.set(newNotif.id, newNotif);

    return {
      notification: newNotif,
      deliveryStatus: 'delivered',
      providerMessageId,
      attempts: 1,
    };
  }

  async markAllAsRead(user: AuthUser): Promise<void> {
    for (const notif of db.notifications.values()) {
      if (user.role === 'librarian' || notif.recipientEmail === user.email) {
        notif.read = true;
      }
    }
  }
}

export const notificationService = new NotificationService();
