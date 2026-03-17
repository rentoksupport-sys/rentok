import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE CONFIG ──────────────────────────────────────────
// Replace with your actual values from Supabase → Settings → API
const SUPABASE_URL  = "https://xcjakihewzegzyumnyuw.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjamFraWhld3plZ3p5dW1ueXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODcyNDIsImV4cCI6MjA4OTI2MzI0Mn0.HLwaK6PDdMap8SQ5ODz5XNSCKbCNnHkilO3HeuSVdyc";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── TWILIO CONFIG (via Supabase Edge Function) ───────────────
// We'll call a Supabase Edge Function to send WhatsApp OTP
// No Twilio keys exposed in frontend
const SEND_OTP_FN = `${SUPABASE_URL}/functions/v1/send-otp`;

const T = {
  bg:"#FAFAF7", surface:"#FFFFFF", panel:"#F5F3EE", card:"#FFFFFF",
  border:"#E8E4DC", border2:"#D4CFC4",
  ink:"#2C2416", ink2:"#5C5240", muted:"#9C8E7A", subtle:"#C4BAA8",
  saffron:"#E8821A", saffronL:"#FDF0E0", saffronB:"#F5A650",
  teal:"#1A8A72", tealL:"#E0F5F0", tealB:"#2AB394",
  amber:"#D4A017", amberL:"#FDF8E0",
  rose:"#C44B4B", roseL:"#FDEAEA",
  sky:"#2D7DD2", skyL:"#E8F2FC",
  plum:"#7C3AED", plumL:"#EDE9FE",
  green:"#2E7D32", greenL:"#E8F5E9",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; }
  button { cursor: pointer; font-family: inherit; }
  input, select, textarea { outline: none; font-family: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(10px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
  @keyframes spin { to { transform: rotate(360deg) } }
  .fu { animation: fadeUp .35s ease both; }
  .spin { animation: spin 1s linear infinite; }
`;

const fd = (n) => "₹" + Number(n||0).toLocaleString("en-IN");
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";

// ── REUSABLE COMPONENTS ──────────────────────────────────────
const Chip = ({ label, color }) => (
  <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20,
    background:`${color}18`, color, border:`1px solid ${color}30` }}>{label}</span>
);

const Spinner = () => (
  <div className="spin" style={{ width:20, height:20, border:`3px solid ${T.border2}`,
    borderTopColor:T.saffron, borderRadius:"50%", display:"inline-block" }}/>
);

const Toast = ({ msg }) => msg ? (
  <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
    padding:"11px 24px", borderRadius:13, background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,
    color:"#fff", fontWeight:800, fontSize:13, zIndex:9999, whiteSpace:"nowrap",
    animation:"toastIn .25s ease", boxShadow:`0 8px 28px ${T.saffron}35` }}>{msg}</div>
) : null;

// ── PHONE INPUT COMPONENT ────────────────────────────────────
const PhoneInput = ({ value, onChange, disabled }) => (
  <div style={{ display:"flex", border:`1.5px solid ${T.border2}`, borderRadius:12,
    overflow:"hidden", background:T.panel }}>
    <div style={{ padding:"12px 14px", background:T.surface, borderRight:`1px solid ${T.border2}`,
      fontSize:14, fontWeight:700, color:T.ink2, whiteSpace:"nowrap" }}>🇮🇳 +91</div>
    <input
      type="tel" value={value} onChange={e => onChange(e.target.value.replace(/\D/g,"").slice(0,10))}
      placeholder="WhatsApp number" disabled={disabled}
      style={{ flex:1, padding:"12px 14px", background:"transparent", border:"none",
        fontSize:15, fontWeight:700, color:T.ink, letterSpacing:.5 }}
    />
  </div>
);

// ── OTP INPUT COMPONENT ──────────────────────────────────────
const OtpInput = ({ value, onChange }) => (
  <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
    {[0,1,2,3,4,5].map(i => (
      <input key={i} id={`otp-${i}`} type="tel" maxLength={1}
        value={value[i]||""} onChange={e => {
          const v = e.target.value.replace(/\D/,"");
          const arr = value.split("");
          arr[i] = v;
          onChange(arr.join(""));
          if(v && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
        }}
        onKeyDown={e => { if(e.key==="Backspace" && !value[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus(); }}
        style={{ width:44, height:52, textAlign:"center", fontSize:22, fontWeight:900,
          border:`2px solid ${value[i]?T.saffron:T.border2}`, borderRadius:12,
          background:value[i]?T.saffronL:T.surface, color:T.ink, fontFamily:"inherit",
          transition:"all .15s" }}
      />
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ══════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [step, setStep] = useState("phone"); // phone | otp | profile
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if(resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r-1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const sendOtp = async () => {
    if(phone.length !== 10) { setError("Enter a valid 10-digit WhatsApp number"); return; }
    setLoading(true); setError("");
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Save OTP session to Supabase
      const { data, error: dbErr } = await supabase
        .from("otp_sessions")
        .insert({ phone:`+91${phone}`, otp_code:code, expires_at:expires })
        .select("id").single();

      if(dbErr) throw dbErr;
      setSessionId(data.id);

      // Send WhatsApp OTP via Edge Function
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ phone:`+91${phone}`, code }),
      });

      if(!res.ok) {
        // Fallback to dev bypass if edge function not deployed yet
        console.warn("Edge function not available, using dev bypass");
        setStep("otp");
        setResendTimer(30);
        setLoading(false);
        return;
      }

      setStep("otp");
      setResendTimer(30);
    } catch(e) {
      // Graceful fallback for dev/testing
      console.warn("OTP send failed, using dev bypass:", e);
      setStep("otp");
      setResendTimer(30);
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if(otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      // Check OTP — allow 123456 as dev bypass
      const isDev = otp === "123456";
      if(!isDev) {
        if(!sessionId) { setError("Session expired. Please request a new OTP."); setLoading(false); return; }
        const { data: session } = await supabase
          .from("otp_sessions")
          .select("*")
          .eq("id", sessionId)
          .eq("phone", `+91${phone}`)
          .eq("used", false)
          .maybeSingle();

        if(!session) { setError("Invalid or expired OTP. Please try again."); setLoading(false); return; }
        if(new Date(session.expires_at) < new Date()) { setError("OTP expired. Please request a new one."); setLoading(false); return; }
        if(session.otp_code !== otp) { setError("Incorrect OTP. Please try again."); setLoading(false); return; }
        await supabase.from("otp_sessions").update({ used:true }).eq("id", sessionId);
      }

      // Check if owner exists
      const { data: existing } = await supabase
        .from("owners").select("*").eq("phone", `+91${phone}`).maybeSingle();

      if(existing) { onLogin(existing); }
      else { setStep("profile"); }
    } catch(e) {
      setStep("profile"); // Fallback for dev
    }
    setLoading(false);
  };


  const createProfile = async () => {
    if(!name.trim()) { setError("Please enter your name"); return; }
    setLoading(true); setError("");
    try {
      const { data: owner, error: insertErr } = await supabase
        .from("owners")
        .insert({ phone:`+91${phone}`, name:name.trim(), city, beta_user:true })
        .select("*").single();

      if(insertErr) throw insertErr;
      onLogin(owner);
    } catch(e) {
      setError("Could not create profile. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily:"'Nunito','Segoe UI',sans-serif", background:T.bg,
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      padding:20 }}>
      <style>{CSS}</style>
      <div className="fu" style={{ width:"100%", maxWidth:400 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:20,
            background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, margin:"0 auto 12px", boxShadow:`0 8px 24px ${T.saffron}35` }}>🔑</div>
          <div style={{ fontSize:26, fontWeight:900, color:T.ink, letterSpacing:-.8 }}>Rentok</div>
          <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>Rent smarter. Manage better.</div>
        </div>

        <div style={{ background:T.surface, borderRadius:20, padding:28,
          border:`1.5px solid ${T.border}`, boxShadow:"0 4px 24px rgba(0,0,0,.06)" }}>

          {/* STEP: PHONE */}
          {step === "phone" && (
            <>
              <div style={{ fontSize:18, fontWeight:900, color:T.ink, marginBottom:6 }}>Owner Login</div>
              <div style={{ fontSize:13, color:T.muted, marginBottom:24 }}>
                We'll send a 6-digit OTP to your WhatsApp
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:.5,
                textTransform:"uppercase", marginBottom:8 }}>WhatsApp Number</div>
              <PhoneInput value={phone} onChange={setPhone} disabled={loading}/>
              {error && <div style={{ color:T.rose, fontSize:12, marginTop:8, fontWeight:600 }}>{error}</div>}
              <button onClick={sendOtp} disabled={loading}
                style={{ width:"100%", marginTop:20, padding:14,
                  background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,
                  border:"none", borderRadius:12, fontSize:15, fontWeight:800,
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading ? <Spinner/> : "Send OTP on WhatsApp →"}
              </button>
              <div style={{ textAlign:"center", marginTop:16, fontSize:12, color:T.muted }}>
                New to Rentok?{" "}
                <a href="https://docs.google.com/forms/d/e/1FAIpQLScd2tgV61wlCkJMfnQSOMa0ExM-c0ZpJVU1xOd6XD63Fs6pQA/viewform"
                  target="_blank" rel="noreferrer"
                  style={{ color:T.saffron, fontWeight:700, textDecoration:"none" }}>
                  Request beta access →
                </a>
              </div>
            </>
          )}

          {/* STEP: OTP */}
          {step === "otp" && (
            <>
              <div style={{ fontSize:18, fontWeight:900, color:T.ink, marginBottom:6 }}>Enter OTP</div>
              <div style={{ fontSize:13, color:T.muted, marginBottom:24 }}>
                Sent to WhatsApp <strong style={{ color:T.ink }}>+91 {phone}</strong>
                <button onClick={()=>{setStep("phone");setOtp("");setError("");}}
                  style={{ background:"none", border:"none", color:T.saffron,
                    fontWeight:700, fontSize:12, marginLeft:8, cursor:"pointer" }}>Change</button>
              </div>
              <OtpInput value={otp} onChange={setOtp}/>
              <div style={{ textAlign:"center", marginTop:10, padding:"7px 14px",
                background:T.tealL, borderRadius:8, fontSize:11, fontWeight:600, color:T.teal }}>
                📱 OTP sent to WhatsApp · Use <strong>123456</strong> if Twilio not set up yet
              </div>
              {error && <div style={{ color:T.rose, fontSize:12, marginTop:12,
                textAlign:"center", fontWeight:600 }}>{error}</div>}
              <button onClick={verifyOtp} disabled={loading || otp.length < 6}
                style={{ width:"100%", marginTop:20, padding:14,
                  background:otp.length===6?`linear-gradient(135deg,${T.saffron},${T.saffronB})`:T.panel,
                  border:"none", borderRadius:12, fontSize:15, fontWeight:800,
                  color:otp.length===6?"#fff":T.muted,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  transition:"all .2s" }}>
                {loading ? <Spinner/> : "Verify & Login →"}
              </button>
              <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:T.muted }}>
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : <button onClick={()=>{setOtp("");sendOtp();}}
                      style={{ background:"none", border:"none", color:T.saffron,
                        fontWeight:700, fontSize:12, cursor:"pointer" }}>
                      Resend OTP
                    </button>
                }
              </div>
            </>
          )}

          {/* STEP: PROFILE (first time) */}
          {step === "profile" && (
            <>
              <div style={{ fontSize:18, fontWeight:900, color:T.ink, marginBottom:6 }}>
                Welcome to Rentok! 🎉
              </div>
              <div style={{ fontSize:13, color:T.muted, marginBottom:24 }}>
                Quick setup — takes 30 seconds
              </div>
              {[
                { label:"Your Name", key:"name", value:name, set:setName, placeholder:"e.g. Suresh Rao" },
                { label:"City", key:"city", value:city, set:setCity, placeholder:"e.g. Bengaluru" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:.5,
                    textTransform:"uppercase", marginBottom:6 }}>{f.label}</div>
                  <input value={f.value} onChange={e=>f.set(e.target.value)}
                    placeholder={f.placeholder}
                    style={{ width:"100%", background:T.panel, border:`1.5px solid ${T.border2}`,
                      color:T.ink, borderRadius:10, padding:"11px 14px", fontSize:14,
                      fontWeight:600 }}/>
                </div>
              ))}
              {error && <div style={{ color:T.rose, fontSize:12, marginBottom:8, fontWeight:600 }}>{error}</div>}
              <button onClick={createProfile} disabled={loading}
                style={{ width:"100%", marginTop:8, padding:14,
                  background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,
                  border:"none", borderRadius:12, fontSize:15, fontWeight:800,
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {loading ? <Spinner/> : "Enter Rentok →"}
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:T.muted }}>
          By logging in you agree to our{" "}
          <span style={{ color:T.saffron, fontWeight:700, cursor:"pointer" }}>Terms</span>
          {" "}and{" "}
          <span style={{ color:T.saffron, fontWeight:700, cursor:"pointer" }}>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADD TENANT FORM
// ══════════════════════════════════════════════════════════════
function AddTenantForm({ unitId, ownerId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name:"", phone:"", email:"", move_in_date:"", lease_end:"", notes:""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if(!form.name.trim()) { setError("Tenant name is required"); return; }
    setSaving(true); setError("");
    try {
      // Insert tenant
      const { data: tenant, error: tErr } = await supabase
        .from("tenants")
        .insert({
          owner_id: ownerId,
          unit_id: unitId,
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          move_in_date: form.move_in_date || null,
          lease_end: form.lease_end || null,
          notes: form.notes.trim() || null,
          is_active: true,
        })
        .select("*").single();

      if(tErr) throw tErr;

      // Mark unit as occupied
      await supabase.from("units").update({ is_occupied:true }).eq("id", unitId);

      // Auto-create first month rent payment
      const today = new Date();
      const dueDate = form.move_in_date || today.toISOString().split("T")[0];
      const { data: unitData } = await supabase
        .from("units").select("rent_amount").eq("id", unitId).single();

      if(unitData) {
        await supabase.from("payments").insert({
          owner_id: ownerId,
          unit_id: unitId,
          tenant_id: tenant.id,
          type: "rent",
          amount: unitData.rent_amount,
          due_date: dueDate,
          status: "pending",
        });
      }

      onSaved();
    } catch(e) {
      setError("Failed to add tenant. Please try again.");
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ fontSize:13, fontWeight:800, color:T.ink, marginBottom:14 }}>
        + Add Tenant
      </div>
      {[
        { label:"Full Name *", key:"name", placeholder:"e.g. Ramesh Kumar", type:"text" },
        { label:"WhatsApp Number", key:"phone", placeholder:"e.g. 9876543210", type:"tel" },
        { label:"Email", key:"email", placeholder:"e.g. ramesh@gmail.com", type:"email" },
        { label:"Move-in Date", key:"move_in_date", placeholder:"", type:"date" },
        { label:"Lease End Date", key:"lease_end", placeholder:"", type:"date" },
      ].map(f => (
        <div key={f.key} style={{ marginBottom:11 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:.5,
            textTransform:"uppercase", marginBottom:5 }}>{f.label}</div>
          <input type={f.type} value={form[f.key]}
            onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
            placeholder={f.placeholder}
            style={{ width:"100%", background:T.surface, border:`1.5px solid ${T.border2}`,
              color:T.ink, borderRadius:10, padding:"9px 12px", fontSize:13,
              fontWeight:600, boxSizing:"border-box" }}/>
        </div>
      ))}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:.5,
          textTransform:"uppercase", marginBottom:5 }}>Notes (optional)</div>
        <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
          placeholder="Any notes about this tenant..."
          rows={2}
          style={{ width:"100%", background:T.surface, border:`1.5px solid ${T.border2}`,
            color:T.ink, borderRadius:10, padding:"9px 12px", fontSize:13,
            fontWeight:600, boxSizing:"border-box", resize:"none", fontFamily:"inherit" }}/>
      </div>
      {error && <div style={{ color:T.rose, fontSize:12, marginBottom:10, fontWeight:600 }}>{error}</div>}
      <div style={{ background:T.tealL, border:`1px solid ${T.teal}25`, borderRadius:10,
        padding:"9px 12px", fontSize:12, color:T.teal, marginBottom:14, fontWeight:600 }}>
        ✓ Unit will be marked occupied · First rent payment created automatically
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={onCancel}
          style={{ flex:1, padding:"9px", background:T.panel, border:`1.5px solid ${T.border2}`,
            borderRadius:10, fontSize:13, fontWeight:700, color:T.muted, cursor:"pointer" }}>
          Cancel
        </button>
        <button onClick={save} disabled={saving}
          style={{ flex:2, padding:"9px", background:T.saffron, border:"none",
            borderRadius:10, fontSize:13, fontWeight:800, color:"#fff", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          {saving ? <Spinner/> : "Save Tenant →"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// OWNER DASHBOARD
// ══════════════════════════════════════════════════════════════
function OwnerDashboard({ owner, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [units, setUnits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ unit_number:"", rent_amount:"", deposit:"", type:"flat" });
  const [saving, setSaving] = useState(false);
  const [selUnit, setSelUnit] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3000); };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: u }, { data: p }, { data: r }] = await Promise.all([
        supabase.from("units").select("*, tenants(*)").eq("owner_id", owner.id).order("unit_number"),
        supabase.from("payments").select("*, units(unit_number), tenants(name)").eq("owner_id", owner.id).order("created_at", { ascending:false }).limit(50),
        supabase.from("maintenance_requests").select("*, units(unit_number)").eq("owner_id", owner.id).order("created_at", { ascending:false }),
      ]);
      setUnits(u || []);
      setPayments(p || []);
      setRequests(r || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, [owner.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-generate monthly rent payments for all occupied units
  const autoGeneratePayments = useCallback(async () => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const monthLabel = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

      // Get all occupied units with active tenants
      const { data: occupiedUnits } = await supabase
        .from("units")
        .select("*, tenants(*)")
        .eq("owner_id", owner.id)
        .eq("is_occupied", true);

      if(!occupiedUnits || occupiedUnits.length === 0) return;

      for(const unit of occupiedUnits) {
        const tenant = unit.tenants?.find(t => t.is_active);
        if(!tenant) continue;

        // Check if rent payment already exists for this month
        const { data: existing } = await supabase
          .from("payments")
          .select("id")
          .eq("unit_id", unit.id)
          .eq("type", "rent")
          .gte("due_date", monthStart.toISOString().split("T")[0])
          .lte("due_date", monthEnd.toISOString().split("T")[0])
          .limit(1);

        if(existing && existing.length > 0) continue; // Already exists

        // Create this month's rent payment
        const dueDate = new Date(now.getFullYear(), now.getMonth(),
          Math.min(1, monthEnd.getDate())).toISOString().split("T")[0];

        await supabase.from("payments").insert({
          owner_id: owner.id,
          unit_id: unit.id,
          tenant_id: tenant.id,
          type: "rent",
          amount: unit.rent_amount,
          due_date: dueDate,
          status: "pending",
          notes: `Auto-generated · ${monthLabel}`,
        });
      }

      // Reload payments after generation
      const { data: p } = await supabase
        .from("payments")
        .select("*, units(unit_number), tenants(name)")
        .eq("owner_id", owner.id)
        .order("created_at", { ascending:false })
        .limit(50);
      if(p) setPayments(p);

    } catch(e) { console.error("Auto-generate payments error:", e); }
  }, [owner.id]);

  useEffect(() => {
    if(units.length > 0) autoGeneratePayments();
  }, [units, autoGeneratePayments]);

  const addUnit = async () => {
    if(!newUnit.unit_number || !newUnit.rent_amount) { showToast("Unit number and rent are required"); return; }
    setSaving(true);
    try {
      // Get or create default property
      let { data: props } = await supabase.from("properties").select("id").eq("owner_id", owner.id).limit(1);
      let propId;
      if(!props || props.length === 0) {
        const { data: newProp } = await supabase.from("properties")
          .insert({ owner_id:owner.id, name:`${owner.name||"My"}'s Property`, city:owner.city||"Bengaluru" })
          .select("id").single();
        propId = newProp.id;
      } else { propId = props[0].id; }

      await supabase.from("units").insert({
        owner_id: owner.id, property_id: propId,
        unit_number: newUnit.unit_number,
        rent_amount: parseFloat(newUnit.rent_amount),
        deposit: newUnit.deposit ? parseFloat(newUnit.deposit) : null,
        type: newUnit.type,
      });
      setNewUnit({ unit_number:"", rent_amount:"", deposit:"", type:"flat" });
      setShowAddUnit(false);
      showToast("Unit added ✓");
      loadData();
    } catch(e) { showToast("Error adding unit"); }
    setSaving(false);
  };

  const markPaid = async (paymentId) => {
    await supabase.from("payments").update({ status:"paid", paid_date:new Date().toISOString().split("T")[0] }).eq("id", paymentId);
    showToast("Marked as paid ✓");
    loadData();
  };

  const vacateTenant = async (unitId, tenantId) => {
    await Promise.all([
      supabase.from("units").update({ is_occupied:false }).eq("id", unitId),
      supabase.from("tenants").update({ is_active:false, unit_id:null }).eq("id", tenantId),
    ]);
    setSelUnit(null);
    showToast("Unit marked as vacant ✓");
    loadData();
  };

  const resolveRequest = async (id) => {
    await supabase.from("maintenance_requests").update({ status:"resolved", resolved_at:new Date().toISOString() }).eq("id", id);
    showToast("Marked as resolved ✓");
    loadData();
  };

  const occupied = units.filter(u => u.is_occupied);
  const totalExpected = occupied.reduce((s,u) => s + Number(u.rent_amount), 0);
  const pendingPayments = payments.filter(p => p.status === "pending");
  const totalPending = pendingPayments.reduce((s,p) => s + Number(p.amount), 0);
  const openReqs = requests.filter(r => r.status === "open").length;
  const firstName = (owner.name||"").split(" ")[0] || "there";

  const tabs = [
    { id:"dashboard", icon:"📊", label:"Dashboard" },
    { id:"units", icon:"🏡", label:"Units" },
    { id:"payments", icon:"💰", label:"Payments" },
    { id:"requests", icon:"🔧", label:"Requests" },
  ];

  if(loading) return (
    <div style={{ fontFamily:"'Nunito','Segoe UI',sans-serif", background:T.bg,
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14 }}>
      <style>{CSS}</style>
      <Spinner/>
      <div style={{ fontSize:13, color:T.muted, fontWeight:600 }}>Loading your dashboard…</div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Nunito','Segoe UI',sans-serif", background:T.bg,
      color:T.ink, minHeight:"100vh", display:"flex", flexDirection:"column",
      maxWidth:520, margin:"0 auto" }}>
      <style>{CSS}</style>

      {/* Top bar */}
      <div style={{ background:T.surface, borderBottom:`1.5px solid ${T.border}`,
        padding:"11px 16px", display:"flex", alignItems:"center",
        justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:9,
            background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🔑</div>
          <div>
            <div style={{ fontWeight:900, fontSize:14, color:T.ink, letterSpacing:-.3 }}>Rentok</div>
            <div style={{ fontSize:9, color:T.muted }}>{owner.name || owner.phone} · Owner</div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{ background:T.panel, border:`1.5px solid ${T.border}`,
            borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700,
            color:T.muted, cursor:"pointer" }}>Logout</button>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:72 }}>

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div style={{ padding:"18px 16px" }} className="fu">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:15, fontWeight:800, color:T.ink }}>
                Good morning, {firstName}! 👋
              </div>
              <button onClick={async()=>{ await autoGeneratePayments(); showToast("Payments refreshed ✓"); }}
                style={{ background:T.tealL, border:`1px solid ${T.teal}30`, borderRadius:9,
                  padding:"6px 12px", fontSize:11, fontWeight:700, color:T.teal, cursor:"pointer" }}>
                🔄 Refresh
              </button>
            </div>

            {/* P&L Banner */}
            <div style={{ background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,
              borderRadius:18, padding:20, marginBottom:18, color:"#fff",
              position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-20, right:-20, width:90, height:90,
                borderRadius:"50%", background:"rgba(255,255,255,.1)", pointerEvents:"none" }}/>
              <div style={{ fontSize:10, fontWeight:700, opacity:.8, letterSpacing:.5, marginBottom:3 }}>
                RENT PENDING THIS MONTH
              </div>
              <div style={{ fontSize:32, fontWeight:900, letterSpacing:-1.5 }}>{fd(totalPending)}</div>
              <div style={{ display:"flex", gap:16, marginTop:10, flexWrap:"wrap" }}>
                {[["Expected", fd(totalExpected)], ["Units", `${occupied.length}/${units.length}`], ["Pending", pendingPayments.length+" bills"]].map(([l,v])=>(
                  <div key={l}><div style={{ fontSize:9, opacity:.75 }}>{l}</div><div style={{ fontSize:14, fontWeight:800 }}>{v}</div></div>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:18 }}>
              {[
                { icon:"🏡", label:"Occupied", value:`${occupied.length}/${units.length}`, sub:`${units.length-occupied.length} vacant`, color:T.teal, light:T.tealL },
                { icon:"⚠️", label:"Rent Pending", value:pendingPayments.length, sub:fd(totalPending)+" due", color:T.rose, light:T.roseL },
                { icon:"🔧", label:"Open Requests", value:openReqs, sub:"maintenance", color:T.sky, light:T.skyL },
                { icon:"📋", label:"Total Units", value:units.length, sub:"in portfolio", color:T.amber, light:T.amberL },
              ].map(s => (
                <div key={s.label} style={{ background:T.card, border:`1.5px solid ${T.border}`,
                  borderRadius:14, padding:14 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:s.light,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:15, marginBottom:7 }}>{s.icon}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:T.ink, letterSpacing:-.8 }}>{s.value}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:T.ink2, marginTop:1 }}>{s.label}</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Pending payments list */}
            {pendingPayments.length > 0 && (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:T.ink }}>
                    Pending Payments ({pendingPayments.length})
                  </div>
                  <button onClick={()=>{
                    const msgs = pendingPayments.slice(0,5).map(p => {
                      const phone = p.tenants?.phone?.replace(/\D/g,"");
                      if(!phone) return null;
                      return `https://wa.me/${phone.startsWith("91")?phone:"91"+phone}?text=Hi ${(p.tenants?.name||"").split(" ")[0]}, your ${p.type} of ${fd(p.amount)} is due. Please pay at your earliest. - ${owner.name||"Your Landlord"} via Rentok`;
                    }).filter(Boolean);
                    if(msgs.length === 0) { showToast("No phone numbers saved for pending tenants"); return; }
                    msgs.forEach((url, i) => setTimeout(()=>window.open(url,"_blank"), i*500));
                    showToast(`Opening WhatsApp for ${msgs.length} tenants…`);
                  }}
                    style={{ background:"#25D366", border:"none", borderRadius:8,
                      padding:"6px 12px", fontSize:11, fontWeight:700,
                      color:"#fff", cursor:"pointer" }}>
                    📱 Remind All
                  </button>
                </div>
                {pendingPayments.slice(0,5).map(p => (
                  <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10,
                    marginBottom:9, padding:"10px 13px", background:T.card,
                    border:`1.5px solid ${T.border}`, borderRadius:13 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:T.roseL,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontWeight:800, fontSize:11, color:T.rose, flexShrink:0 }}>
                      {(p.tenants?.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:T.ink }}>{p.tenants?.name || "Tenant"}</div>
                      <div style={{ fontSize:10, color:T.muted }}>
                        {p.units?.unit_number} · {p.type} · {fd(p.amount)}
                      </div>
                    </div>
                    <button onClick={()=>markPaid(p.id)}
                      style={{ background:T.tealL, border:`1px solid ${T.teal}30`,
                        borderRadius:8, padding:"5px 10px", fontSize:11,
                        fontWeight:700, color:T.teal, cursor:"pointer" }}>✓ Paid</button>
                  </div>
                ))}
              </>
            )}

            {units.length === 0 && (
              <div style={{ textAlign:"center", padding:"32px 20px", background:T.card,
                border:`1.5px solid ${T.border}`, borderRadius:16, marginTop:8 }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🏠</div>
                <div style={{ fontSize:15, fontWeight:800, color:T.ink, marginBottom:6 }}>Add your first unit</div>
                <div style={{ fontSize:13, color:T.muted, marginBottom:16 }}>
                  Start by adding a flat or room to track rent
                </div>
                <button onClick={()=>{setTab("units");setShowAddUnit(true);}}
                  style={{ background:T.saffron, border:"none", borderRadius:10,
                    padding:"10px 24px", fontSize:13, fontWeight:800, color:"#fff", cursor:"pointer" }}>
                  + Add Unit
                </button>
              </div>
            )}
          </div>
        )}

        {/* UNITS TAB */}
        {tab === "units" && (
          <div style={{ padding:"18px 16px" }} className="fu">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:15, color:T.ink }}>Your Units</div>
              <button onClick={()=>setShowAddUnit(true)}
                style={{ background:T.saffron, border:"none", borderRadius:10,
                  padding:"7px 14px", fontSize:12, fontWeight:800, color:"#fff", cursor:"pointer" }}>
                + Add Unit
              </button>
            </div>

            {/* Add unit form */}
            {showAddUnit && (
              <div style={{ background:T.surface, border:`1.5px solid ${T.saffron}40`,
                borderRadius:16, padding:18, marginBottom:18 }}>
                <div style={{ fontWeight:800, fontSize:14, color:T.ink, marginBottom:14 }}>
                  New Unit
                </div>
                {[
                  { label:"Unit Number *", key:"unit_number", placeholder:"e.g. Flat 1A, Room 3" },
                  { label:"Monthly Rent (₹) *", key:"rent_amount", placeholder:"e.g. 10000", type:"number" },
                  { label:"Security Deposit (₹)", key:"deposit", placeholder:"e.g. 30000", type:"number" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:.5,
                      textTransform:"uppercase", marginBottom:5 }}>{f.label}</div>
                    <input type={f.type||"text"} value={newUnit[f.key]}
                      onChange={e=>setNewUnit(p=>({...p,[f.key]:e.target.value}))}
                      placeholder={f.placeholder}
                      style={{ width:"100%", background:T.panel, border:`1.5px solid ${T.border2}`,
                        color:T.ink, borderRadius:10, padding:"10px 13px", fontSize:14, fontWeight:600 }}/>
                  </div>
                ))}
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:.5,
                    textTransform:"uppercase", marginBottom:6 }}>Type</div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[["flat","🏠 Flat"],["room","🛏 Room"],["studio","🏙 Studio"],["shop","🏪 Shop"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setNewUnit(p=>({...p,type:v}))}
                        style={{ flex:1, padding:"7px 4px", borderRadius:9,
                          border:`1.5px solid ${newUnit.type===v?T.saffron:T.border2}`,
                          background:newUnit.type===v?T.saffronL:T.panel,
                          color:newUnit.type===v?T.saffron:T.muted,
                          fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>setShowAddUnit(false)}
                    style={{ flex:1, padding:10, background:T.panel, border:`1.5px solid ${T.border2}`,
                      borderRadius:10, fontSize:13, fontWeight:700, color:T.muted, cursor:"pointer" }}>
                    Cancel
                  </button>
                  <button onClick={addUnit} disabled={saving}
                    style={{ flex:2, padding:10, background:T.saffron, border:"none",
                      borderRadius:10, fontSize:13, fontWeight:800, color:"#fff", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    {saving ? <Spinner/> : "Save Unit"}
                  </button>
                </div>
              </div>
            )}

            {/* Units list */}
            {units.length === 0 && !showAddUnit && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:T.muted }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🏠</div>
                <div style={{ fontSize:14, fontWeight:700 }}>No units yet</div>
                <div style={{ fontSize:12, marginTop:4 }}>Add your first flat or room above</div>
              </div>
            )}
            {units.map(u => {
              const tenant = u.tenants?.[0];
              const isOpen = selUnit?.id === u.id;
              return (
                <div key={u.id} style={{ background:T.card,
                  border:`1.5px solid ${isOpen?T.saffron:u.is_occupied?T.teal+"35":T.border}`,
                  borderRadius:14, marginBottom:11, overflow:"hidden" }}>

                  {/* Unit header — always visible */}
                  <div onClick={()=>setSelUnit(isOpen?null:u)}
                    style={{ padding:13, cursor:"pointer", display:"flex",
                      justifyContent:"space-between", alignItems:"start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <div style={{ fontSize:15, fontWeight:900, color:T.ink }}>{u.unit_number}</div>
                        <Chip label={u.is_occupied?"Occupied":"Vacant"} color={u.is_occupied?T.teal:T.rose}/>
                      </div>
                      {tenant && (
                        <div style={{ fontSize:12, fontWeight:700, color:T.ink2, marginBottom:2 }}>
                          👤 {tenant.name}
                        </div>
                      )}
                      <div style={{ fontSize:13, fontWeight:900, color:T.saffron }}>{fd(u.rent_amount)}/mo
                        {u.deposit && <span style={{ fontSize:10, color:T.muted, fontWeight:600 }}> · Deposit {fd(u.deposit)}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize:16, color:T.muted, marginLeft:8 }}>{isOpen?"▲":"▼"}</div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ borderTop:`1px solid ${T.border}`, padding:14, background:T.panel }}>
                      {tenant ? (
                        <>
                          {/* Tenant info card */}
                          <div style={{ background:T.surface, borderRadius:12, padding:14, marginBottom:12,
                            border:`1px solid ${T.border}` }}>
                            <div style={{ fontSize:12, fontWeight:800, color:T.teal, marginBottom:10 }}>
                              👤 Tenant Details
                            </div>
                            {[
                              ["Name", tenant.name],
                              ["Phone", tenant.phone || "—"],
                              ["Email", tenant.email || "—"],
                              ["Move-in", fmt(tenant.move_in_date)],
                              ["Lease ends", fmt(tenant.lease_end)],
                            ].map(([l,v]) => (
                              <div key={l} style={{ display:"flex", justifyContent:"space-between",
                                marginBottom:7, fontSize:12 }}>
                                <span style={{ color:T.muted, fontWeight:600 }}>{l}</span>
                                <span style={{ color:T.ink, fontWeight:700 }}>{v}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ display:"flex", gap:8 }}>
                            <button onClick={()=>vacateTenant(u.id, tenant.id)}
                              style={{ flex:1, padding:"8px", background:T.roseL,
                                border:`1px solid ${T.rose}30`, borderRadius:9,
                                fontSize:12, fontWeight:700, color:T.rose, cursor:"pointer" }}>
                              🚪 Mark Vacated
                            </button>
                            <button onClick={()=>{
                              const wa = tenant.phone?.replace(/\D/g,"");
                              if(wa) window.open(`https://wa.me/${wa}?text=Hi ${tenant.name.split(" ")[0]}, this is a reminder for your rent payment. Please pay at your earliest convenience. - Rentok`, "_blank");
                              else showToast("No phone number saved for this tenant");
                            }} style={{ flex:1, padding:"8px", background:"#25D366",
                              border:"none", borderRadius:9, fontSize:12,
                              fontWeight:700, color:"#fff", cursor:"pointer" }}>
                              📱 WhatsApp
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Add tenant form */
                        <AddTenantForm unitId={u.id} ownerId={owner.id}
                          onSaved={()=>{ setSelUnit(null); loadData(); showToast("Tenant added ✓"); }}
                          onCancel={()=>setSelUnit(null)}/>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab === "payments" && (
          <div style={{ padding:"18px 16px" }} className="fu">
            <div style={{ fontWeight:800, fontSize:15, color:T.ink, marginBottom:14 }}>Payments</div>
            {payments.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:T.muted }}>
                <div style={{ fontSize:32, marginBottom:10 }}>💰</div>
                <div style={{ fontSize:14, fontWeight:700 }}>No payments yet</div>
                <div style={{ fontSize:12, marginTop:4 }}>Payments will appear here once tenants are added</div>
              </div>
            )}
            {payments.map(p => (
              <div key={p.id} style={{ background:T.card, border:`1.5px solid ${T.border}`,
                borderRadius:13, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:4 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.ink }}>
                      {p.tenants?.name || "Tenant"} · {p.units?.unit_number}
                    </div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>
                      {p.type} · Due: {fmt(p.due_date)}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:14, fontWeight:900, color:T.ink }}>{fd(p.amount)}</div>
                    <Chip label={p.status} color={p.status==="paid"?T.teal:p.status==="overdue"?T.rose:T.amber}/>
                  </div>
                </div>
                {p.status === "pending" && (
                  <button onClick={()=>markPaid(p.id)}
                    style={{ width:"100%", marginTop:8, padding:"7px", background:T.tealL,
                      border:`1px solid ${T.teal}30`, borderRadius:8, fontSize:12,
                      fontWeight:700, color:T.teal, cursor:"pointer" }}>
                    ✓ Mark as Paid
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REQUESTS TAB */}
        {tab === "requests" && (
          <div style={{ padding:"18px 16px" }} className="fu">
            <div style={{ fontWeight:800, fontSize:15, color:T.ink, marginBottom:14 }}>
              Maintenance Requests
            </div>
            {requests.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 20px", color:T.muted }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🔧</div>
                <div style={{ fontSize:14, fontWeight:700 }}>No requests yet</div>
                <div style={{ fontSize:12, marginTop:4 }}>Tenant requests will appear here</div>
              </div>
            )}
            {requests.map(r => (
              <div key={r.id} style={{ background:T.card, border:`1.5px solid ${T.border}`,
                borderRadius:13, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:4 }}>
                  <div style={{ flex:1, marginRight:8 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:T.ink }}>{r.title}</div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>
                      {r.units?.unit_number} · {fmt(r.created_at)}
                    </div>
                  </div>
                  <Chip label={r.status} color={r.status==="resolved"?T.teal:r.status==="in_progress"?T.amber:T.rose}/>
                </div>
                {r.description && (
                  <div style={{ fontSize:12, color:T.ink2, marginTop:6, lineHeight:1.5 }}>{r.description}</div>
                )}
                {r.status === "open" && (
                  <button onClick={()=>resolveRequest(r.id)}
                    style={{ marginTop:8, background:T.tealL, border:`1px solid ${T.teal}30`,
                      borderRadius:8, padding:"5px 12px", fontSize:12,
                      fontWeight:700, color:T.teal, cursor:"pointer" }}>
                    ✓ Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, maxWidth:520,
        margin:"0 auto", background:T.surface, borderTop:`1.5px solid ${T.border}`,
        display:"flex", zIndex:50 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ flex:1, padding:"9px 4px 10px", background:"none", border:"none",
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              cursor:"pointer", color:tab===t.id?T.saffron:T.muted,
              fontFamily:"inherit",
              borderTop:`2.5px solid ${tab===t.id?T.saffron:"transparent"}`,
              transition:"all .15s" }}>
            <span style={{ fontSize:15 }}>{t.icon}</span>
            <span style={{ fontSize:8, fontWeight:800 }}>{t.label}</span>
          </button>
        ))}
      </div>

      <Toast msg={toast}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [owner, setOwner] = useState(null);
  const [checking, setChecking] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const saved = localStorage.getItem("rentok_owner");
    if(saved) {
      try {
        const parsed = JSON.parse(saved);
        // Re-verify the owner still exists in DB
        supabase.from("owners").select("*").eq("id", parsed.id).single()
          .then(({ data }) => {
            if(data) setOwner(data);
            setChecking(false);
          });
      } catch { setChecking(false); }
    } else { setChecking(false); }
  }, []);

  const handleLogin = (ownerData) => {
    localStorage.setItem("rentok_owner", JSON.stringify(ownerData));
    setOwner(ownerData);
  };

  const handleLogout = () => {
    localStorage.removeItem("rentok_owner");
    setOwner(null);
  };

  if(checking) return (
    <div style={{ fontFamily:"'Nunito','Segoe UI',sans-serif", background:"#FAFAF7",
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{CSS}</style>
      <Spinner/>
    </div>
  );

  if(owner) return <OwnerDashboard owner={owner} onLogout={handleLogout}/>;
  return <LoginScreen onLogin={handleLogin}/>;
}
