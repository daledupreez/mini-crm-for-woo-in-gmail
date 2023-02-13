/**
 * Standard WooCommerce order status values.
 */
const ORDER_STATUS = {
	CANCELLED: 'cancelled',
	COMPLETED: 'completed',
	FAILED: 'failed',
	ONHOLD: 'on-hold',
	PENDING: 'pending',
	PROCESSING: 'processing',
	REFUNDED: 'refunded',
	TRASH: 'trash'
};

/**
 * Status values that should be considered completed, and no further actions are needed.
 */
const COMPLETED_STATUSES = [
	ORDER_STATUS.CANCELLED,
	ORDER_STATUS.COMPLETED,
	ORDER_STATUS.FAILED,
	ORDER_STATUS.REFUNDED,
	ORDER_STATUS.TRASH
];
