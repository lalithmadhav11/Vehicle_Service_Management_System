import Notification from '../models/Notification.js';
import User from '../models/User.js';
import sendEmail from './sendEmail.js';

/**
 * Creates an in-app notification and sends a formatted email.
 * @param {string} userId - ID of the user receiving the notification
 * @param {string} title - Title of the notification/subject of the email
 * @param {string} message - Plain text message for the in-app notification
 * @param {string} type - Notification type (e.g., General, ServiceReminder, StatusUpdate)
 * @param {string} emailHtmlContent - Optional HTML content for the email body. If not provided, message is used.
 */
export const sendDualNotification = async (userId, title, message, type = 'General', emailHtmlContent = null) => {
  try {
    // 1. Create In-App Notification
    await Notification.create({
      userId,
      title,
      message,
      type,
    });

    // 2. Fetch User Email
    const user = await User.findById(userId);
    if (!user || !user.email) return;

    // 3. Send Email
    const htmlContent = emailHtmlContent || `<p>${message}</p>`;
    await sendEmail({
      email: user.email,
      subject: title,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Error sending dual notification to user ${userId}:`, error.message);
  }
};
