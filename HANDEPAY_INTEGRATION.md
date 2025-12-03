# Handepay Card Machine Integration Guide

This guide explains how to integrate Handepay contactless card machines with the Fumari POS system.

## Overview

Handepay provides card payment terminals that can integrate with POS systems. This integration allows you to:
- Process card payments directly from the POS
- Track payment status in real-time
- Handle payment confirmations via webhooks
- Support multiple payment methods (Handepay card, cash, etc.)

## Integration Methods

### 1. Webhook-Based Integration (Recommended)

Handepay card machines can send payment status updates to your system via webhooks.

**Setup Steps:**

1. **Configure Webhook URL in Handepay Dashboard:**
   - Log in to your Handepay merchant portal
   - Navigate to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/payments/handepay/webhook`
   - Select events: `payment.completed`, `payment.failed`, `payment.refunded`

2. **Environment Variables:**
   Add to your `.env.local` and Vercel environment variables:
   ```env
   HANDEPAY_WEBHOOK_SECRET=your_webhook_secret_from_handepay
   HANDEPAY_MERCHANT_ID=your_merchant_id
   HANDEPAY_TERMINAL_ID=your_terminal_id
   ```

3. **Webhook Verification:**
   The webhook handler automatically verifies incoming requests (implement signature verification in production).

### 2. API Integration (If Available)

If Handepay provides an API, you can initiate payments programmatically.

**Setup Steps:**

1. **Get API Credentials:**
   - Contact Handepay support to request API access
   - Obtain API key, merchant ID, and terminal ID

2. **Configure Environment Variables:**
   ```env
   HANDEPAY_API_KEY=your_api_key
   HANDEPAY_MERCHANT_ID=your_merchant_id
   HANDEPAY_TERMINAL_ID=your_terminal_id
   HANDEPAY_ENVIRONMENT=production  # or 'sandbox' for testing
   ```

3. **Update Integration Code:**
   - Edit `lib/handepay.ts`
   - Implement the `initiateHandepayPayment` function with actual Handepay API calls
   - Refer to Handepay API documentation for exact endpoints and request format

### 3. Manual Entry (Fallback)

If automatic integration isn't available, staff can manually enter transaction IDs from card machine receipts.

**How It Works:**
1. Customer pays on Handepay card machine
2. Staff receives receipt with transaction ID
3. Staff enters transaction ID in payment modal
4. Payment is recorded in system

## Using the Payment System

### Processing a Payment

1. **From Orders Page:**
   - Click "Pay" button on any order card
   - Select payment method (Handepay Card or Cash)
   - Enter payment amount (defaults to remaining balance)
   - For Handepay: Enter transaction ID if available, or leave blank for webhook confirmation
   - Click "Process Payment"

2. **Payment Flow:**
   - **Handepay Card:** Payment is marked as "pending" until webhook confirms completion
   - **Cash:** Payment is immediately marked as "completed"
   - Order status updates to "completed" when fully paid

### Payment Statuses

- **pending:** Payment initiated, waiting for confirmation
- **completed:** Payment successfully processed
- **failed:** Payment failed or was declined
- **refunded:** Payment was refunded

## Database Schema

The Payment model includes:
- `orderId`: Link to order
- `amount`: Payment amount
- `method`: Payment method (`handepay_card`, `cash`, etc.)
- `status`: Payment status
- `transactionId`: Handepay transaction ID
- `handepayData`: JSON string with card details (card type, last 4 digits, auth code, etc.)

## API Endpoints

### Create Payment
```
POST /api/payments
Body: {
  orderId: string,
  amount: number,
  method: string,
  transactionId?: string,
  handepayData?: object
}
```

### Get Payments
```
GET /api/payments?orderId=order_id
```

### Update Payment (Webhook)
```
PATCH /api/payments/[id]
Body: {
  status: string,
  transactionId?: string,
  handepayData?: object
}
```

### Handepay Webhook
```
POST /api/payments/handepay/webhook
Body: {
  transactionId: string,
  orderId: string,
  amount: number,
  status: string,
  cardType?: string,
  last4?: string,
  authCode?: string,
  timestamp: string,
  signature: string
}
```

## Testing

### Test Mode

1. Set `HANDEPAY_ENVIRONMENT=sandbox` in environment variables
2. Use Handepay test card numbers (provided by Handepay)
3. Test webhook locally using tools like ngrok or similar

### Test Card Numbers

Contact Handepay support for test card numbers and scenarios.

## Troubleshooting

### Payment Not Confirming

- Check webhook URL is correctly configured in Handepay dashboard
- Verify webhook endpoint is accessible (not blocked by firewall)
- Check server logs for webhook errors
- Ensure transaction ID matches between card machine and system

### Payment Status Stuck on Pending

- Manually update payment status via API if webhook fails
- Check Handepay dashboard for transaction status
- Contact Handepay support if transaction exists but webhook not received

### Webhook Not Receiving Updates

- Verify webhook URL is publicly accessible
- Check SSL certificate is valid
- Ensure webhook secret matches Handepay configuration
- Review server logs for incoming webhook requests

## Security Considerations

1. **Webhook Verification:**
   - Always verify webhook signatures in production
   - Implement rate limiting on webhook endpoint
   - Use HTTPS for all webhook communications

2. **API Keys:**
   - Store API keys securely in environment variables
   - Never commit API keys to version control
   - Rotate keys regularly

3. **Transaction IDs:**
   - Validate transaction IDs before processing
   - Prevent duplicate payment processing
   - Log all payment attempts for audit trail

## Support

- **Handepay Support:** Contact Handepay for API documentation and integration support
- **Technical Issues:** Check server logs and webhook delivery status
- **Payment Disputes:** Refer to Handepay merchant portal for transaction details

## Next Steps

1. Contact Handepay to set up merchant account and request API access
2. Configure webhook URL in Handepay dashboard
3. Set up environment variables
4. Test integration with test transactions
5. Go live with production credentials

---

**Note:** This integration is designed to work with Handepay's standard card machine setup. Actual implementation may vary based on Handepay's specific API and requirements. Contact Handepay support for detailed integration documentation.

