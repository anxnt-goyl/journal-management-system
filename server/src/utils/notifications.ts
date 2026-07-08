import { NotificationModel } from '../models/Notification';

export interface NotificationPayload {
  type: 'paper_submitted' | 'reviewer_assigned' | 'revision_required' | 'paper_accepted' | 'paper_rejected' | 'paper_published';
  recipientId: string;
  paperId?: string;
  paperTitle?: string;
  reviewerName?: string;
  messageOverride?: string;
}

export const buildNotificationPayload = (payload: NotificationPayload) => {
  const baseTitleMap = {
    paper_submitted: 'Paper Submitted',
    reviewer_assigned: 'Reviewer Assigned',
    revision_required: 'Revision Required',
    paper_accepted: 'Paper Accepted',
    paper_rejected: 'Paper Rejected',
    paper_published: 'Paper Published',
  } as const;

  const baseMessageMap = {
    paper_submitted: `Your paper "${payload.paperTitle || 'Untitled Paper'}" has been submitted successfully.`,
    reviewer_assigned: `You have been assigned to review paper "${payload.paperTitle || 'Untitled Paper'}".`,
    revision_required: `Paper "${payload.paperTitle || 'Untitled Paper'}" requires revision before further review.`,
    paper_accepted: `Paper "${payload.paperTitle || 'Untitled Paper'}" has been accepted.`,
    paper_rejected: `Paper "${payload.paperTitle || 'Untitled Paper'}" has been rejected.`,
    paper_published: `Paper "${payload.paperTitle || 'Untitled Paper'}" has been published.`,
  } as const;

  return {
    recipientId: payload.recipientId,
    title: baseTitleMap[payload.type],
    message: payload.messageOverride || baseMessageMap[payload.type],
    type: payload.type,
    paperId: payload.paperId,
    isRead: false,
  };
};

export const createNotification = async (payload: NotificationPayload) => {
  const notificationDoc = buildNotificationPayload(payload);
  return NotificationModel.create(notificationDoc);
};
