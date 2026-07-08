import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNotificationPayload } from '../utils/notifications';

test('buildNotificationPayload creates event-specific notification content', () => {
  const notification = buildNotificationPayload({
    type: 'reviewer_assigned',
    paperId: 'paper-123',
    paperTitle: 'Towards Smarter Peer Review',
    recipientId: 'user-42',
  });

  assert.equal(notification.type, 'reviewer_assigned');
  assert.equal(notification.recipientId, 'user-42');
  assert.equal(notification.paperId, 'paper-123');
  assert.equal(notification.isRead, false);
  assert.match(notification.message, /assigned/i);
  assert.match(notification.title, /review/i);
});
