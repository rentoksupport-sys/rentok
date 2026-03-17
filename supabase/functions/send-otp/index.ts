import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if(req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { phone, code } = await req.json();
    if(!phone || !code) return new Response(JSON.stringify({ error:"Missing phone or code" }), { status:400, headers:CORS });

    const TWILIO_SID   = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_FROM  = Deno.env.get("TWILIO_WHATSAPP_FROM") || "whatsapp:+14155238886";

    if(!TWILIO_SID || !TWILIO_TOKEN) {
      return new Response(JSON.stringify({ error:"Twilio credentials not configured" }), { status:500, headers:CORS });
    }

    const message = `Your Rentok OTP is *${code}*\n\nValid for 10 minutes. Do not share this with anyone.\n\n_Rentok — Rent smarter. Manage better._`;

    const body = new URLSearchPar
