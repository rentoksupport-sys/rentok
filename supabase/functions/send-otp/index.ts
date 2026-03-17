import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { phone, code } = await req.json();

    const TWILIO_SID   = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const TWILIO_FROM  = Deno.env.get("TWILIO_WHATSAPP_FROM")!;

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_FROM,
          To:   `whatsapp:${phone}`,
          Body: `Your Rentok OTP is *${code}*. Valid for 10 minutes. Do not share this with anyone.`,
        }),
      }
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
