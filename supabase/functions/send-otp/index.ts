// supabase/functions/send-otp/index.ts
// This function ALWAYS generates the OTP — frontend never generates codes
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting
const attempts: Map<string, { count: number; firstAt: number }> = new Map();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS   = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json();
    const phone = body.phone;

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Rate limiting
    const now = Date.now();
    const entry = attempts.get(phone);
    if (entry && now - entry.firstAt < RATE_WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait 10 minutes." }), {
        status: 429, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    attempts.set(phone, {
      count: (!entry || now - entry.firstAt >= RATE_WINDOW_MS) ? 1 : entry.count + 1,
      firstAt: (!entry || now - entry.firstAt >= RATE_WINDOW_MS) ? now : entry.firstAt,
    });

    // Always generate OTP server-side
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code    = String(array[0] % 1000000).padStart(6, "0");
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Use service role to write to DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Invalidate any existing unused OTPs for this phone
