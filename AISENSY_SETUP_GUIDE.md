# AiSensy WhatsApp Setup Guide

## Step 1 — Sign up at AiSensy (10 minutes)
1. Go to https://www.aisensy.com → **Get Started**
2. Pick **Basic plan ₹999/mo** (or trial first)
3. Provide:
   - Your dedicated WhatsApp Business number: **+91 90594 24167**
   - Business name: **ONCOST**
   - Brand category: E-commerce / Gifting

## Step 2 — Meta Business verification (1-3 days, AiSensy assists)
AiSensy will guide you through Meta Business Manager verification. You'll need:
- GST certificate or business registration proof
- Display name approval (will be "ONCOST")
- Your number cannot be in personal WhatsApp during this — back up your chats then uninstall WhatsApp from that SIM

## Step 3 — Create approved templates in AiSensy Dashboard
Once verified, go to **Templates → Create Campaign Template** and create these 3 templates exactly:

### Template 1: `oncost_order_confirm`
- Category: **Utility**
- Language: English
- Body:
```
Hi {{1}}, your ONCOST order #{{2}} is confirmed! 🎉

💰 Amount paid: ₹{{3}}

We're packing your gifts with care and will share tracking details once shipped.

Track: {{4}}

Need help? Reply to this message anytime.
```
- Variables: 4 (customer_name, order_id, amount, tracking_url)

### Template 2: `oncost_abandoned_cart`
- Category: **Marketing**
- Body:
```
Hi {{1}} 🌸

You left some lovely picks in your ONCOST cart worth ₹{{2}}!

✨ Complete your order before stocks run out: {{3}}

Need help choosing? Just reply.
```
- Variables: 3 (customer_name, cart_value, recovery_url)

### Template 3: `oncost_shipping_update`
- Category: **Utility**
- Body:
```
Hi {{1}},

📦 Your ONCOST order #{{2}} has been {{3}}!

Track here: {{4}}

Thank you for shopping with us 🙏
```
- Variables: 4 (customer_name, order_id, status, tracking_url)

### Template 4: `oncost_chatbot_reply`
- Category: **Utility**
- Body: `{{1}}`
- Variables: 1 (this lets the chatbot send dynamic replies)
- ⚠️ Marketing-style content may not get approved here; keep replies utility/transactional

Templates take **24-48 hours** for Meta approval.

## Step 4 — Get your AiSensy API Key
After approval:
1. AiSensy Dashboard → **Settings → API**
2. Click **"Get API Key"**
3. Copy the long token

## Step 5 — Configure Vercel env vars
In Vercel → Project Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `AISENSY_API_KEY` | The token from Step 4 |
| `INTERNAL_API_KEY` | Generate a random 32-char string (e.g. `openssl rand -hex 16`) |
| `CRON_SECRET` | Another random 32-char string |

(You should already have `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL` from CCAvenue setup.)

Redeploy after adding.

## Step 6 — Configure AiSensy webhook
In AiSensy Dashboard → **Settings → Webhooks**:
- Webhook URL: `https://www.oncost.shop/api/whatsapp/webhook`
- Events: **Incoming Messages** ✓
- Save

## Step 7 — Test
1. **Order confirmation**: Place a test order via your CCAvenue test flow → on payment success, you should get a WhatsApp message on the customer's phone
2. **Welcome chatbot**: Send "hi" to your WhatsApp business number from any phone → you should get the 1-2-3-4 menu within 2 seconds
3. **Abandoned cart**: Add item to cart while logged in, then wait 24 hours (or manually run `https://www.oncost.shop/api/whatsapp/abandoned-cart-cron` with proper auth header)

## Cost monitoring
- **AiSensy**: ₹999/mo flat
- **Meta WhatsApp**: ~₹0.30 per Utility conversation, ~₹0.80 per Marketing conversation
- First **1000 service conversations per month are free** (Meta's free tier)
- Track usage in AiSensy Dashboard → Analytics

## Pause/disable
- To temporarily pause WhatsApp: remove `AISENSY_API_KEY` from Vercel env vars + redeploy → all WhatsApp calls fail silently (orders still complete via CCAvenue, no user-visible impact)
