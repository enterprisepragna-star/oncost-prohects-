import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const SMTP_HOSTNAME = Deno.env.get("SMTP_HOSTNAME") || "smtp.hostinger.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME");
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");

serve(async (req) => {
  try {
    const payload = await req.json();

    // Only process inserts into the 'orders' table
    if (payload.type === "INSERT" && payload.table === "orders") {
      const order = payload.record;
      
      // Determine the customer's email (if guest, use guest_email, else we would need to fetch their profile email)
      // Since we don't have the profile email directly in the order payload, it's best to always save the email in guest_email even for logged-in users,
      // or we query the auth table here (which requires service role key).
      // For this implementation, we assume the frontend passes guest_email or we just send it to admin.
      const customerEmail = order.guest_email || SMTP_USERNAME; 
      
      if (!customerEmail) {
        return new Response("No email to send to", { status: 200 });
      }

      const client = new SmtpClient();
      await client.connectTLS({
        hostname: SMTP_HOSTNAME,
        port: SMTP_PORT,
        username: SMTP_USERNAME,
        password: SMTP_PASSWORD,
      });

      await client.send({
        from: SMTP_USERNAME,
        to: customerEmail,
        subject: `Order Confirmation - #${order.id.split('-')[0]}`,
        content: `Thank you for your order!\n\nYour order total is Rs. ${order.total_amount}.\nStatus: ${order.status}\n\nWe will contact you shortly with shipping details.`,
      });

      await client.close();
      return new Response("Email sent successfully", { status: 200 });
    }

    return new Response("Ignored", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
