# Handepay Integration for Local Network Deployment

This guide explains how to integrate Handepay card machines when your POS system runs on a **local network** (not publicly accessible on the internet).

## Understanding the Challenge

**The Problem:**
- Your POS system runs on a local network (e.g., `192.168.1.100:3000`)
- Handepay webhooks need to reach your system from the internet
- Local IP addresses are not accessible from outside your network
- Vercel deployment is only for demonstration purposes

**The Solution:**
We'll use **multiple integration methods** that work best for local network environments.

---

## Integration Methods for Local Network

### Method 1: Manual Transaction Entry (Recommended for Local)

**Best for:** Local network deployments, simple setup, reliable

**How It Works:**
1. Customer pays on Handepay card machine
2. Card machine prints receipt with transaction ID
3. Staff enters transaction ID in POS payment modal
4. Payment is recorded immediately

**Advantages:**
- ✅ Works perfectly on local network
- ✅ No internet/webhook required
- ✅ Simple and reliable
- ✅ No additional setup needed

**Setup:**
- No setup required! The payment modal already supports manual entry
- Staff just needs to enter the transaction ID from the receipt

**Workflow:**
```
1. Customer orders → Order created in POS
2. Staff clicks "Pay" button on order
3. Staff selects "Handepay Card" payment method
4. Customer pays on Handepay card machine
5. Staff receives receipt with transaction ID (e.g., "HP-123456789")
6. Staff enters transaction ID in payment modal
7. Staff enters payment amount
8. Click "Process Payment"
9. Payment recorded ✅
```

---

### Method 2: Direct API Integration (If Available)

**Best for:** Real-time payment initiation, if Handepay provides API

**How It Works:**
1. POS sends payment request directly to Handepay API
2. Handepay processes payment on card machine
3. API returns transaction result immediately
4. Payment status updated in POS

**Advantages:**
- ✅ Real-time payment processing
- ✅ No webhook needed
- ✅ Works on local network

**Requirements:**
- Handepay must provide API access
- API credentials (API key, merchant ID, terminal ID)
- Internet connection (for API calls, but system stays local)

**Setup Steps:**

1. **Contact Handepay:**
   - Request API access for your merchant account
   - Get API documentation
   - Obtain API credentials

2. **Configure Environment Variables:**
   ```env
   HANDEPAY_API_KEY=your_api_key
   HANDEPAY_MERCHANT_ID=your_merchant_id
   HANDEPAY_TERMINAL_ID=your_terminal_id
   HANDEPAY_API_URL=https://api.handepay.co.uk
   ```

3. **Update Integration Code:**
   - Edit `lib/handepay.ts`
   - Implement `initiateHandepayPayment()` with actual Handepay API calls
   - Test with Handepay test environment

4. **Usage:**
   - When staff clicks "Pay" → POS calls Handepay API
   - Card machine prompts customer to pay
   - Payment result returned immediately
   - POS updates payment status

---

### Method 3: Webhook with Tunnel (For Real-Time Updates)

**Best for:** Real-time webhook updates on local network

**How It Works:**
1. Use a tunnel service (ngrok, localtunnel) to expose local server
2. Configure Handepay webhook to send to tunnel URL
3. Tunnel forwards webhooks to your local server
4. Payment status updates automatically

**Advantages:**
- ✅ Real-time automatic updates
- ✅ No manual entry needed
- ✅ Works on local network

**Disadvantages:**
- ⚠️ Requires tunnel service (may have costs/limits)
- ⚠️ Tunnel URL changes if using free tier
- ⚠️ Requires internet connection

**Setup Steps:**

#### Option A: Using ngrok (Recommended)

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your local server:**
   ```bash
   npm run dev:demo
   # Server runs on http://localhost:3000
   ```

3. **Start ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```

4. **Get public URL:**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:3000
   ```

5. **Configure Handepay Webhook:**
   - Log in to Handepay merchant portal
   - Go to Settings → Webhooks
   - Add webhook URL: `https://abc123.ngrok.io/api/payments/handepay/webhook`
   - Save configuration

6. **Keep Tunnel Running:**
   - Keep ngrok running while POS is active
   - For production, consider ngrok paid plan (static domain)

#### Option B: Using localtunnel (Free Alternative)

1. **Install localtunnel:**
   ```bash
   npm install -g localtunnel
   ```

2. **Start tunnel:**
   ```bash
   lt --port 3000 --subdomain fumari-pos
   ```

3. **Use provided URL:**
   ```
   https://fumari-pos.loca.lt
   ```

4. **Configure Handepay webhook** with this URL

**Note:** Free tunnels may have URL changes. For production, consider paid plans.

---

### Method 4: Polling Mechanism (Alternative)

**Best for:** When webhooks aren't reliable, periodic status checks

**How It Works:**
1. POS creates payment with "pending" status
2. POS periodically checks Handepay API for payment status
3. When payment confirmed, update status in POS

**Advantages:**
- ✅ Works on local network
- ✅ No webhook needed
- ✅ Reliable fallback

**Disadvantages:**
- ⚠️ Not real-time (depends on polling interval)
- ⚠️ Requires Handepay API access

**Implementation:**

Create a background job that polls Handepay API:

```typescript
// lib/handepay-polling.ts
export async function pollPaymentStatus(transactionId: string) {
  // Check Handepay API for payment status
  // Update payment in database if status changed
}
```

---

## Recommended Setup for Local Network

### For Production (Local Network):

**Primary Method: Manual Entry**
- Staff enters transaction ID from receipt
- Simple, reliable, no setup needed
- Works perfectly on local network

**Optional Enhancement: Direct API**
- If Handepay provides API, implement direct integration
- Real-time payment initiation
- Still works on local network

### For Demonstration (Vercel):

**Webhook Method:**
- Configure webhook URL in Handepay dashboard
- Use Vercel URL: `https://fumari.vercel.app/api/payments/handepay/webhook`
- Automatic payment confirmations

---

## Local Network Deployment Guide

### Step 1: Set Up Local Server

1. **Start server on local network:**
   ```bash
   npm run dev:demo
   ```

2. **Find your local IP:**
   ```bash
   npm run demo:ip
   # Or manually: ipconfig getifaddr en0
   ```

3. **Access from devices on same network:**
   ```
   http://YOUR_LOCAL_IP:3000
   # Example: http://192.168.1.100:3000
   ```

### Step 2: Configure Payment Method

**For Manual Entry (Recommended):**
- No configuration needed
- Payment modal already supports manual transaction ID entry

**For API Integration:**
1. Get Handepay API credentials
2. Add to `.env.local`:
   ```env
   HANDEPAY_API_KEY=your_api_key
   HANDEPAY_MERCHANT_ID=your_merchant_id
   HANDEPAY_TERMINAL_ID=your_terminal_id
   ```
3. Update `lib/handepay.ts` with actual API implementation

**For Webhook Tunnel:**
1. Install ngrok: `brew install ngrok`
2. Start tunnel: `ngrok http 3000`
3. Configure Handepay webhook with ngrok URL
4. Keep tunnel running during operation

### Step 3: Test Payment Flow

1. Create an order in POS
2. Click "Pay" button
3. Select "Handepay Card"
4. **Manual Entry:**
   - Enter transaction ID from receipt
   - Enter amount
   - Click "Process Payment"
5. **API Integration:**
   - Click "Process Payment"
   - Card machine prompts customer
   - Payment confirmed automatically

---

## Payment Flow Comparison

### Manual Entry Flow:
```
POS → Staff enters transaction ID → Payment recorded ✅
(No internet/webhook needed)
```

### API Integration Flow:
```
POS → API call to Handepay → Card machine → Customer pays → 
API response → Payment recorded ✅
(Internet needed for API, but system stays local)
```

### Webhook Flow:
```
POS → Payment initiated → Handepay processes → 
Webhook sent → Tunnel forwards → Local server → Payment recorded ✅
(Internet + tunnel needed)
```

---

## Environment Variables for Local Network

Create `.env.local`:

```env
# Database (Railway or local PostgreSQL)
DATABASE_URL=postgresql://...

# Handepay Configuration (if using API)
HANDEPAY_API_KEY=your_api_key
HANDEPAY_MERCHANT_ID=your_merchant_id
HANDEPAY_TERMINAL_ID=your_terminal_id
HANDEPAY_API_URL=https://api.handepay.co.uk
HANDEPAY_ENVIRONMENT=production

# Webhook Secret (if using webhooks)
HANDEPAY_WEBHOOK_SECRET=your_webhook_secret

# Local Network Configuration
NEXT_PUBLIC_BASE_URL=http://YOUR_LOCAL_IP:3000
```

---

## Troubleshooting Local Network Issues

### Payment Not Recording?

1. **Check transaction ID format:**
   - Verify transaction ID matches receipt
   - Check for typos

2. **Check payment amount:**
   - Ensure amount matches receipt
   - Verify remaining balance calculation

3. **Check server logs:**
   ```bash
   # Check terminal where server is running
   # Look for payment API errors
   ```

### API Integration Not Working?

1. **Check internet connection:**
   - API calls need internet access
   - Verify firewall allows outbound HTTPS

2. **Verify API credentials:**
   - Check `.env.local` has correct values
   - Test API credentials with Handepay support

3. **Check API endpoint:**
   - Verify `HANDEPAY_API_URL` is correct
   - Test API endpoint accessibility

### Webhook Tunnel Issues?

1. **Tunnel not receiving webhooks:**
   - Verify tunnel is running
   - Check tunnel URL matches Handepay config
   - Test tunnel URL: `curl https://your-tunnel-url/api/payments/handepay/webhook`

2. **Tunnel URL changed:**
   - Free ngrok URLs change on restart
   - Update Handepay webhook URL
   - Consider paid ngrok plan for static URL

---

## Best Practices for Local Network

1. **Use Manual Entry as Primary:**
   - Most reliable for local network
   - No additional setup
   - Works offline

2. **Keep Receipts:**
   - Store transaction receipts for records
   - Use for reconciliation
   - Reference for disputes

3. **Regular Reconciliation:**
   - Compare POS payments with Handepay reports
   - Verify all transactions recorded
   - Check for discrepancies

4. **Backup Internet Connection:**
   - If using API/webhook, have backup internet
   - Manual entry works without internet

5. **Monitor Payment Status:**
   - Check pending payments regularly
   - Update status manually if needed
   - Keep audit trail

---

## Summary

**For Local Network Deployment:**

✅ **Recommended:** Manual Transaction Entry
- Simple, reliable, no setup
- Works perfectly on local network
- Staff enters transaction ID from receipt

✅ **Optional:** Direct API Integration
- Real-time payment initiation
- Requires Handepay API access
- Works on local network (needs internet for API calls)

⚠️ **Advanced:** Webhook with Tunnel
- Real-time automatic updates
- Requires tunnel service
- More complex setup

**For Vercel Demo:**

✅ Use webhook method with Vercel URL
- Configure Handepay webhook: `https://fumari.vercel.app/api/payments/handepay/webhook`
- Automatic payment confirmations

---

**Need Help?**
- Contact Handepay support for API access and documentation
- Check server logs for payment errors
- Verify transaction IDs match receipts

