import { useState } from "react";

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

// ── 4 PLANS ─────────────────────────────────────────────────────
const PLANS = [
  {
    id:"beginner", name:"Beginner", mo:1000, yr:10000,
    icon:"🔑", color:T.sky, light:T.skyL, badge:null,
    tagline:"First-time landlord? Start here.",
    units:"1 property · up to 2 units",
    support:"Email support · 72hr response",
    features:["Up to 2 flats / rooms","Rent tracking & UPI collection","WhatsApp payment reminders","Tenant portal — pay & view bills","Auto payment receipts","Basic maintenance requests","15-day free trial"],
    not:["P&L dashboard","Bulk reminders","Agreement generator","Photo vault"],
  },
  {
    id:"starter", name:"Starter", mo:2500, yr:25000,
    icon:"🌱", color:T.teal, light:T.tealL, badge:null,
    tagline:"Growing your portfolio.",
    units:"1 property · up to 5 units",
    support:"Email support · 48hr response",
    features:["Up to 5 flats / PG rooms","Everything in Beginner","Utility billing (electricity, water)","Maintenance tracker with history","Move-in / out photo vault","Agreement & document storage"],
    not:["P&L dashboard","Bulk WhatsApp","Agreement generator"],
  },
  {
    id:"growth", name:"Growth", mo:5000, yr:50000,
    icon:"📈", color:T.saffron, light:T.saffronL, badge:"MOST POPULAR",
    tagline:"For serious landlords & PG owners.",
    units:"1 property · up to 25 units",
    support:"Email support · 24hr response",
    features:["Up to 25 flats / PG rooms","Everything in Starter","Full P&L dashboard","Bulk WhatsApp reminders","Rental agreement generator (₹99/doc)","Advance deposit tracking","Food & laundry add-on charges","Tenant turnover tracking","Maintenance with photo proof"],
    not:["Phone support","GST invoicing"],
  },
  {
    id:"pro", name:"Pro", mo:10000, yr:100000,
    icon:"🏆", color:T.plum, light:T.plumL, badge:"BEST VALUE",
    tagline:"Large buildings & PG chains.",
    units:"Up to 3 properties · 50 units",
    support:"Phone + Email · 4hr SLA",
    features:["Up to 50 flats / PG rooms","Up to 3 properties","Everything in Growth","Phone & email support (4hr SLA)","GST invoice generation","Advanced reports & exports","Multi-user staff access","Dedicated onboarding call","Unlimited agreement generator","Priority WhatsApp support"],
    not:[],
  },
];

// ── VALUE PROPS ──────────────────────────────────────────────────
const OWNER_VALUES = [
  { icon:"💬", title:"Never chase rent again", desc:"Auto WhatsApp reminders fire on the 1st and 5th every month. Tenants pay before you pick up the phone.", color:T.teal, light:T.tealL },
  { icon:"📊", title:"Full P&L in one dashboard", desc:"Collected vs expected, maintenance costs, vacancy losses — month by month, in plain numbers you can share with your CA.", color:T.saffron, light:T.saffronL },
  { icon:"💳", title:"UPI collection, zero cash", desc:"Tenants pay via GPay, PhonePe, Paytm. No cash counting, no bank visits, no more 'sent it yesterday'.", color:T.sky, light:T.skyL },
  { icon:"📄", title:"Agreements in 2 minutes", desc:"Karnataka-format rental agreement, pre-filled from your tenant data. Download, print, sign. No stamp vendor visit.", color:T.amber, light:T.amberL },
  { icon:"🔧", title:"Maintenance with photo proof", desc:"Tenants raise requests with photos. You assign, track and close. Every repair documented — no disputes at vacating.", color:T.plum, light:T.plumL },
];

const TENANT_VALUES = [
  { icon:"💳", title:"Pay rent from your phone", desc:"Pay via UPI in 10 seconds from any app — GPay, PhonePe, Paytm, BHIM. No cash, no queues.", color:T.teal, light:T.tealL },
  { icon:"🧾", title:"Receipts automatically", desc:"Every payment generates a receipt instantly. No more texting your landlord to 'please send the receipt'.", color:T.saffron, light:T.saffronL },
  { icon:"🔧", title:"Raise requests instantly", desc:"Leaking tap? Fan not working? Raise a maintenance request from your phone and track it in real time.", color:T.sky, light:T.skyL },
  { icon:"📋", title:"All dues in one place", desc:"Rent, electricity, water, maintenance — see everything you owe and everything paid, in one clean screen.", color:T.amber, light:T.amberL },
  { icon:"📞", title:"No more calling your landlord", desc:"Chat, share photos, raise complaints — all inside Rentok. Your landlord responds in the app.", color:T.plum, light:T.plumL },
];

const PG_PAINS = [
  { icon:"📅", pain:"20+ tenants paying on different dates", fix:"Rentok tracks each bed's due date separately and fires individual reminders — automatically, every month." },
  { icon:"💰", pain:"Advance & rent tracked separately", fix:"Each occupant has their own advance ledger. See what's held, adjusted, and refundable at a glance." },
  { icon:"🍱", pain:"Food, laundry & add-on charges", fix:"Add custom recurring charges per tenant — mess, laundry, AC, parking. All billed and tracked monthly." },
  { icon:"🔄", pain:"New agreements every month", fix:"Generate a fresh agreement in 2 minutes. Digital, pre-filled, ready to sign — no stamp vendor." },
  { icon:"💬", pain:"WhatsApp chaos with 20+ follow-ups", fix:"One bulk send reaches all pending tenants with personalised messages. Your personal WhatsApp stays clean." },
];

const COMPARE = [
  ["Feature",          "Beginner","Starter","Growth",  "Pro"],
  ["Units",            "2",      "5",      "25",      "50"],
  ["Properties",       "1",      "1",      "1",       "3"],
  ["UPI Payments",     "✓",      "✓",      "✓",       "✓"],
  ["WhatsApp Remind",  "✓",      "✓",      "✓",       "✓"],
  ["Tenant Portal",    "✓",      "✓",      "✓",       "✓"],
  ["Auto Receipts",    "✓",      "✓",      "✓",       "✓"],
  ["P&L Dashboard",    "—",      "—",      "✓",       "✓"],
  ["Bulk WhatsApp",    "—",      "—",      "✓",       "✓"],
  ["Agreement Gen.",   "—",      "—",      "₹99/doc", "Unlimited"],
  ["PG Add-on Charges","—",      "—",      "✓",       "✓"],
  ["Photo Vault",      "—",      "✓",      "✓",       "✓"],
  ["GST Invoicing",    "—",      "—",      "—",       "✓"],
  ["Phone Support",    "—",      "—",      "—",       "✓"],
  ["Multi-user",       "—",      "—",      "—",       "✓"],
  ["Onboarding Call",  "—",      "—",      "—",       "✓"],
];

const FAQS = [
  { q:"Do I need a credit card to start?", a:"No. Start your 15-day free trial with just your phone number. No card, no commitment." },
  { q:"Can I switch plans later?", a:"Yes — upgrade or downgrade any time. Upgrades apply immediately; downgrades at next billing cycle." },
  { q:"Does it work for PG accommodations?", a:"Yes. Growth and Pro plans support PG features — per-bed billing, food/laundry charges, advance tracking, high-turnover agreements." },
  { q:"How does UPI rent collection work?", a:"Tenants pay via GPay, PhonePe, Paytm or BHIM. Payment goes to your account. Rentok records the transaction and generates a receipt automatically." },
  { q:"What is the agreement generator?", a:"Generates a formatted 11-month Leave & Licence agreement in Karnataka government format, pre-filled from your data. Download and print in 2 minutes." },
  { q:"Is my data safe?", a:"Data is stored on Supabase with row-level security — only you and your tenants can access your property data. We never sell your data." },
];

// ── DEMO DATA ────────────────────────────────────────────────────
const DFLATS = Array.from({length:10},(_,i)=>{
  const id=i+1, occ=[1,2,3,4,5,6,7,8].includes(id);
  const names=["Ramesh Kumar","Priya Sharma","Anil Verma","Sunita Rao","Vijay Nair","Deepa Menon","Suresh Patel","Anita Joshi"];
  const rents=[8000,9500,10000,11000,12000,8500,9000,10500];
  return {
    id, floor:Math.ceil(id/3), occupied:occ,
    tenant:occ?names[i%8]:null, phone:occ?`+91 9${800000000+id*111111}`:null,
    rent:rents[i%8], rentPaid:occ&&[1,2,4,5,7].includes(id),
    electricity:occ?[800,950,1100,700,1200,850,920,1050][i%8]:0,
    electricityPaid:occ&&[1,2,4,7].includes(id),
    maintenance:500, maintenancePaid:occ&&[1,2,5].includes(id),
    advance:occ?rents[i%8]*3:0, moveIn:occ?`202${2+i%3}-0${1+i%8}-10`:null,
    maintenanceReqs:occ&&i%3===0?[{id:`M${id}`,title:["Leaking tap","Fan issue","Door latch"][i%3],status:i%2===0?"open":"resolved",date:"2025-03-01",priority:["high","medium","low"][i%3]}]:[],
  };
});
const PL_DEMO=["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m,i)=>({
  month:m,
  collected:[85000,92000,78000,88000,95000,82000,98000,85000,102000,78000,88000,105000][i],
  expected:100000,
  maintenance:[8000,5000,12000,3000,7000,9000,4000,6000,11000,5000,8000,3000][i],
}));
const fd=(n)=>"₹"+Number(n).toLocaleString("en-IN");
const pc=(a,b)=>b>0?Math.round(a/b*100):0;

// ── SHARED UI ────────────────────────────────────────────────────
const Chip=({label,color=T.teal,bg})=><span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:20,background:bg||color+"18",color,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;

const Btn=({children,onClick,variant="primary",size="md",full,style:s={}})=>{
  const v={primary:{background:T.saffron,color:"#fff",border:"none"},secondary:{background:T.surface,color:T.ink2,border:`1.5px solid ${T.border2}`},ghost:{background:"transparent",color:T.muted,border:`1.5px solid ${T.border}`},teal:{background:T.teal,color:"#fff",border:"none"},plum:{background:T.plum,color:"#fff",border:"none"},sky:{background:T.sky,color:"#fff",border:"none"},wa:{background:"#25D366",color:"#fff",border:"none"}};
  const sz={sm:"6px 13px",md:"10px 22px",lg:"13px 28px"};
  return <button onClick={onClick} style={{cursor:"pointer",borderRadius:10,fontFamily:"inherit",fontWeight:800,fontSize:size==="sm"?12:size==="lg"?15:14,padding:sz[size],width:full?"100%":undefined,transition:"opacity .15s",...v[variant],...s}} onMouseOver={e=>e.currentTarget.style.opacity=".85"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
};

// ── URL PARAM HELPERS ────────────────────────────────────────────
const getParams = () => {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      name:  p.get("name")  || "",
      city:  p.get("city")  || "",
      flats: parseInt(p.get("flats")||"0",10)||0,
      plan:  p.get("plan")  || "",
      beta:  p.get("beta")  === "1",
      role:  p.get("role")  || "owner",
    };
  } catch(e){ return {}; }
};

// ── MAIN ────────────────────────────────────────────────────────
export default function App(){
  const params = getParams();
  const isBetaUser = params.beta || !!params.name;

  // If arrived via personalised beta link → go straight to demo
  const [screen,setScreen]=useState(isBetaUser ? "demo-owner" : "landing");
  const [billing,setBilling]=useState("monthly");
  const [audience,setAudience]=useState("owner");
  const [openFaq,setOpenFaq]=useState(null);
  const [demoTab,setDemoTab]=useState("dashboard");
  const [tenantTab,setTenantTab]=useState("home");
  const [flats,setFlats]=useState(DFLATS);
  const [selFlat,setSelFlat]=useState(null);
  const [mFilter,setMFilter]=useState("all");
  const [toast,setToast]=useState(null);
  const [betaBannerDismissed,setBetaBannerDismissed]=useState(false);

  const FORM_URL="https://docs.google.com/forms/d/e/1FAIpQLScd2tgV61wlCkJMfnQSOMa0ExM-c0ZpJVU1xOd6XD63Fs6pQA/viewform";

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),3500);};
  const markPaid=(fid,type)=>{setFlats(p=>p.map(f=>f.id===fid?{...f,[`${type}Paid`]:true}:f));showToast(`${type} marked as paid ✓`);};
  const goDemo=()=>{setDemoTab("dashboard");setSelFlat(null);setScreen("demo-owner");};
  const openReg=(plan=null)=>{ window.open(FORM_URL, "_blank"); };

  const occupied=flats.filter(f=>f.occupied).length;
  const totalExp=flats.filter(f=>f.occupied).reduce((s,f)=>s+f.rent,0);
  const totalColl=flats.filter(f=>f.occupied&&f.rentPaid).reduce((s,f)=>s+f.rent,0);
  const totalMaint=22000;
  const netProfit=totalColl-totalMaint;
  const pendingRent=flats.filter(f=>f.occupied&&!f.rentPaid);
  const openReqs=flats.flatMap(f=>f.maintenanceReqs.filter(r=>r.status==="open")).length;

  const price=(p)=>billing==="monthly"?p.mo:Math.round(p.yr/12);
  const save=(p)=>p.mo*12-p.yr;

  const CSS=`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}button{cursor:pointer;font-family:inherit;}input,select,textarea{outline:none;font-family:inherit;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${T.border2};border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}.fu{animation:fadeUp .45s ease both}.plan-card{transition:transform .2s,box-shadow .2s}.plan-card:hover{transform:translateY(-6px)}.val-card{transition:all .2s}.val-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.07)}`;

  const Toast=()=>toast?<div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",padding:"11px 24px",borderRadius:13,background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,color:"#fff",fontWeight:800,fontSize:13,zIndex:9999,whiteSpace:"nowrap",animation:"toastIn .25s ease",boxShadow:`0 8px 28px ${T.saffron}35`}}>{toast}</div>:null;

  // ── DEMO OWNER ───────────────────────────────────────────────
  const firstName = params.name ? params.name.split(" ")[0] : "";
  const displayName = firstName || "Owner";
  const planLabel = params.plan ? PLANS.find(p=>p.id===params.plan)?.name || params.plan : "";

  if(screen==="demo-owner") return(
    <div style={{fontFamily:"'Nunito','Segoe UI',sans-serif",background:T.bg,color:T.ink,minHeight:"100vh",display:"flex",flexDirection:"column",maxWidth:520,margin:"0 auto"}}>
      <style>{CSS}</style>

      {/* Beta user personalised welcome banner */}
      {isBetaUser && !betaBannerDismissed && (
        <div style={{background:`linear-gradient(135deg,${T.plum},#9333ea)`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{fontSize:12,color:"#fff",fontWeight:700,lineHeight:1.4}}>
            👋 Welcome to your Rentok Beta, <strong>{displayName}</strong>!
            {planLabel && <span style={{opacity:.85}}> · {planLabel} plan</span>}
            <span style={{display:"block",fontSize:10,opacity:.8,fontWeight:500,marginTop:1}}>This is a preview of your dashboard. Real data syncs once your account is activated.</span>
          </div>
          <button onClick={()=>setBetaBannerDismissed(true)} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:6,padding:"4px 9px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",flexShrink:0}}>✕</button>
        </div>
      )}

      <div style={{background:T.surface,borderBottom:`1.5px solid ${T.border}`,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:9,background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🔑</div>
          <div>
            <div style={{fontWeight:900,fontSize:14,color:T.ink,letterSpacing:-.3}}>Rentok</div>
            <div style={{fontSize:9,color:T.muted}}>{isBetaUser ? `${displayName}'s Portal · Beta` : "Owner Portal · Demo"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <div style={{padding:"3px 9px",borderRadius:20,background:isBetaUser?T.plumL:T.amberL,border:`1px solid ${isBetaUser?T.plum:T.amber}35`,fontSize:9,fontWeight:800,color:isBetaUser?T.plum:T.amber}}>{isBetaUser?"🚀 Beta":"🎁 Demo"}</div>
          <button onClick={()=>{setTenantTab("home");setScreen("demo-tenant");}} style={{background:T.tealL,border:`1px solid ${T.teal}30`,borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,color:T.teal,cursor:"pointer"}}>🏠 Tenant View</button>
          {!isBetaUser && <button onClick={()=>setScreen("landing")} style={{background:T.panel,border:`1.5px solid ${T.border}`,borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,color:T.muted,cursor:"pointer"}}>← Back</button>}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",paddingBottom:68}}>
        {demoTab==="dashboard"&&(
          <div style={{padding:"18px 16px",animation:"fadeUp .3s ease"}}>
            {firstName && (
              <div style={{fontSize:15,fontWeight:800,color:T.ink,marginBottom:14}}>
                Good morning, {firstName}! 👋
              </div>
            )}
            <div style={{background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,borderRadius:18,padding:"20px",marginBottom:18,color:"#fff",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,.1)",pointerEvents:"none"}}/>
              <div style={{fontSize:10,fontWeight:700,opacity:.8,letterSpacing:.5,marginBottom:3}}>THIS MONTH · NET INCOME</div>
              <div style={{fontSize:30,fontWeight:900,letterSpacing:-1.5}}>{fd(netProfit)}</div>
              <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap"}}>
                {[["Collected",fd(totalColl)],["Expected",fd(totalExp)],["Maintenance","-"+fd(totalMaint)]].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:9,opacity:.75}}>{l}</div><div style={{fontSize:14,fontWeight:800}}>{v}</div></div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:18}}>
              {[{icon:"🏡",label:"Occupied",value:`${occupied}/10`,sub:`${10-occupied} vacant`,color:T.teal,light:T.tealL},{icon:"⚠️",label:"Rent Pending",value:pendingRent.length,sub:fd(pendingRent.reduce((s,f)=>s+f.rent,0))+" due",color:T.rose,light:T.roseL},{icon:"📊",label:"Collection",value:`${pc(totalColl,totalExp)}%`,sub:"this month",color:T.amber,light:T.amberL},{icon:"🔧",label:"Open Requests",value:openReqs,sub:"maintenance",color:T.sky,light:T.skyL}].map(s=>(
                <div key={s.label} style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,padding:"14px 14px"}}>
                  <div style={{width:32,height:32,borderRadius:9,background:s.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,marginBottom:7}}>{s.icon}</div>
                  <div style={{fontSize:20,fontWeight:900,color:T.ink,letterSpacing:-.8}}>{s.value}</div>
                  <div style={{fontSize:11,fontWeight:700,color:T.ink2,marginTop:1}}>{s.label}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:1}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,padding:"16px",marginBottom:18}}>
              <div style={{fontWeight:800,fontSize:13,color:T.ink,marginBottom:12}}>Rent Collected vs Expected (12 months)</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:3,height:80}}>
                {PL_DEMO.map((d,i)=>{
                  const max=105000;
                  return(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,height:"100%",justifyContent:"flex-end"}}>
                      <div style={{width:"100%",height:`${pc(d.collected,max)}%`,minHeight:2,background:T.saffron,borderRadius:"2px 2px 0 0"}}/>
                      <div style={{fontSize:7,color:T.muted}}>{d.month}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:14}}>
                {[{label:"FY 2024–25",val:"₹11.4L",delta:"+12%",up:true},{label:"Vacancy Loss",val:"₹1.8L",delta:"-5%",up:false},{label:"Avg/Flat",val:"₹9,800",delta:"+8%",up:true}].map(r=>(
                  <div key={r.label} style={{background:T.panel,borderRadius:11,padding:"10px 10px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:T.muted,fontWeight:600,marginBottom:3}}>{r.label}</div>
                    <div style={{fontSize:14,fontWeight:900,color:T.ink,letterSpacing:-.5}}>{r.val}</div>
                    <div style={{fontSize:10,fontWeight:700,color:r.up?T.teal:T.rose,marginTop:2}}>{r.delta}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{fontWeight:800,fontSize:13,color:T.ink,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              Pending Rent ({pendingRent.length})
              <button onClick={()=>showToast(`WhatsApp sent to ${pendingRent.length} tenants ✓`)} style={{background:"#25D366",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>Bulk Remind</button>
            </div>
            {pendingRent.slice(0,4).map(f=>(
              <div key={f.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,padding:"10px 13px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:13}}>
                <div style={{width:34,height:34,borderRadius:10,background:T.roseL,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:T.rose,flexShrink:0}}>{(f.tenant||"?").split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T.ink}}>{f.tenant}</div><div style={{fontSize:10,color:T.muted}}>Flat {f.id} · {fd(f.rent)}</div></div>
                <button onClick={()=>showToast(`WhatsApp sent to ${f.tenant} ✓`)} style={{background:"#25D366",border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>📱</button>
              </div>
            ))}

            {/* Beta user feedback nudge */}
            {isBetaUser && (
              <div style={{marginTop:8,background:T.plumL,border:`1.5px solid ${T.plum}25`,borderRadius:16,padding:"16px"}}>
                <div style={{fontSize:13,fontWeight:900,color:T.plum,marginBottom:6}}>🙏 You're shaping Rentok</div>
                <div style={{fontSize:12,color:T.ink2,lineHeight:1.6,marginBottom:12}}>
                  Explore the dashboard, reminders, and agreements tabs. What would make this 10× more useful for you?
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <a href={`https://wa.me/919876500000?text=Rentok feedback from ${params.name||"beta user"}: `} target="_blank" rel="noreferrer"
                    style={{flex:1,minWidth:120,background:"#25D366",border:"none",borderRadius:10,padding:"9px 12px",fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",textAlign:"center",textDecoration:"none",display:"block"}}>
                    💬 WhatsApp Feedback
                  </a>
                  <a href="mailto:rentoksupport@gmail.com"
                    style={{flex:1,minWidth:120,background:T.plum,border:"none",borderRadius:10,padding:"9px 12px",fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",textAlign:"center",textDecoration:"none",display:"block"}}>
                    📧 Email Us
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {demoTab==="rentals"&&!selFlat&&(
          <div style={{padding:"18px 16px",animation:"fadeUp .3s ease"}}>
            <div style={{fontWeight:800,fontSize:15,color:T.ink,marginBottom:14}}>All Flats</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
              {flats.map(f=>(
                <div key={f.id} onClick={()=>setSelFlat(f)} style={{background:T.card,border:`1.5px solid ${f.occupied?(f.rentPaid?T.teal+"35":T.amber+"35"):T.border}`,borderRadius:14,padding:"13px",cursor:"pointer",transition:"all .18s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:6}}>
                    <div style={{fontSize:15,fontWeight:900,color:T.ink}}>#{f.id}</div>
                    <Chip label={f.occupied?"Occupied":"Vacant"} color={f.occupied?T.teal:T.rose}/>
                  </div>
                  {f.occupied&&<><div style={{fontSize:11,fontWeight:700,color:T.ink2,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.tenant}</div><div style={{fontSize:13,fontWeight:900,color:T.saffron}}>{fd(f.rent)}/mo</div><div style={{marginTop:7,display:"flex",gap:4,flexWrap:"wrap"}}><Chip label={f.rentPaid?"R ✓":"R ⚠"} color={f.rentPaid?T.teal:T.amber}/><Chip label={f.electricityPaid?"E ✓":"E ⚠"} color={f.electricityPaid?T.teal:T.rose}/></div></>}
                </div>
              ))}
            </div>
          </div>
        )}

        {demoTab==="rentals"&&selFlat&&(()=>{
          const f=flats.find(x=>x.id===selFlat.id);
          const due=(!f.rentPaid?f.rent:0)+(!f.electricityPaid?f.electricity:0)+(!f.maintenancePaid?f.maintenance:0);
          return(
            <div style={{padding:"18px 16px",animation:"fadeUp .3s ease"}}>
              <button onClick={()=>setSelFlat(null)} style={{background:"none",border:"none",color:T.muted,fontSize:12,fontWeight:700,marginBottom:14,cursor:"pointer"}}>← All Flats</button>
              <div style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,padding:18,marginBottom:13}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:12}}>
                  <div><div style={{fontSize:20,fontWeight:900,color:T.ink}}>Flat {f.id}</div><div style={{fontSize:11,color:T.muted}}>Floor {f.floor}</div></div>
                  <Chip label={f.occupied?"Occupied":"Vacant"} color={f.occupied?T.teal:T.rose}/>
                </div>
                {f.occupied&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,paddingTop:12,borderTop:`1px solid ${T.border}`}}>{[["Tenant",f.tenant],["Phone",f.phone],["Move-in",f.moveIn],["Advance",fd(f.advance)]].map(([l,v])=><div key={l}><div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:.4,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:11,fontWeight:700,color:T.ink,marginTop:1}}>{v}</div></div>)}</div>}
              </div>
              {f.occupied&&<div style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,padding:18}}>
                <div style={{fontWeight:800,fontSize:13,color:T.ink,marginBottom:12}}>💳 Current Billing</div>
                {[{type:"rent",label:"Rent",icon:"🏠",amt:f.rent,paid:f.rentPaid},{type:"electricity",label:"Electricity",icon:"⚡",amt:f.electricity,paid:f.electricityPaid},{type:"maintenance",label:"Maintenance",icon:"🔧",amt:f.maintenance,paid:f.maintenancePaid}].map(b=>(
                  <div key={b.type} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,padding:"9px 12px",background:T.panel,borderRadius:10}}>
                    <span style={{fontSize:16}}>{b.icon}</span>
                    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:T.ink}}>{b.label}</div><div style={{fontSize:14,fontWeight:900,color:T.saffron}}>{fd(b.amt)}</div></div>
                    {b.paid?<Chip label="✓ Paid" color={T.teal}/>:<button onClick={()=>markPaid(f.id,b.type)} style={{background:T.saffron,border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,color:"#fff",cursor:"pointer"}}>Mark Paid</button>}
                  </div>
                ))}
                {due>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"9px 12px",background:T.roseL,borderRadius:10,marginTop:4}}><span style={{fontSize:12,fontWeight:700,color:T.rose}}>Total Due</span><span style={{fontSize:15,fontWeight:900,color:T.rose}}>{fd(due)}</span></div>}
              </div>}
            </div>
          );
        })()}

        {demoTab==="whatsapp"&&(
          <div style={{padding:"18px 16px",animation:"fadeUp .3s ease"}}>
            <div style={{fontWeight:800,fontSize:15,color:T.ink,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>WhatsApp Reminders<button onClick={()=>showToast(`Bulk sent to ${pendingRent.length} tenants ✓`)} style={{background:"#25D366",border:"none",borderRadius:8,padding:"6px 13px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>Bulk ({pendingRent.length})</button></div>
            <div style={{background:"#25D36610",border:"1px solid #25D36628",borderRadius:12,padding:"11px 14px",marginBottom:16}}><div style={{fontSize:11,fontWeight:700,color:"#1A7A45",marginBottom:2}}>💬 WhatsApp Business Connected · Rentok</div><div style={{fontSize:10,color:T.muted}}>Auto-reminders fire on 1st & 5th each month</div></div>
            {flats.filter(f=>f.occupied).map(f=>{const dues=[];if(!f.rentPaid)dues.push("Rent");if(!f.electricityPaid)dues.push("Electricity");return(<div key={f.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,padding:"10px 13px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:13}}><div style={{width:32,height:32,borderRadius:9,background:dues.length?T.amberL:T.tealL,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:dues.length?T.amber:T.teal,flexShrink:0}}>{(f.tenant||"?").split(" ").map(w=>w[0]).join("").slice(0,2)}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T.ink}}>{f.tenant}</div><div style={{fontSize:10,color:T.muted}}>Flat {f.id}{dues.length?` · Due: ${dues.join(", ")}`:""}</div></div><button onClick={()=>showToast(`WhatsApp sent to ${f.tenant} ✓`)} style={{background:"#25D366",border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>📱 Send</button></div>);
            })}
          </div>
        )}

        {demoTab==="maintenance"&&(
          <div style={{padding:"18px 16px",animation:"fadeUp .3s ease"}}>
            <div style={{fontWeight:800,fontSize:15,color:T.ink,marginBottom:14}}>Maintenance Requests</div>
            <div style={{display:"flex",gap:6,marginBottom:14}}>{[["all","All"],["open","Open"],["resolved","Resolved"]].map(([v,l])=><button key={v} onClick={()=>setMFilter(v)} style={{padding:"5px 13px",borderRadius:20,border:`1.5px solid ${mFilter===v?T.saffron:T.border2}`,background:mFilter===v?T.saffronL:"transparent",color:mFilter===v?T.saffron:T.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}</div>
            {flats.flatMap(f=>f.maintenanceReqs.map(r=>({...r,tenant:f.tenant,flatId:f.id}))).filter(r=>mFilter==="all"||r.status===mFilter).map(req=>(
              <div key={req.id} style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:13,padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:5}}><div style={{fontWeight:700,fontSize:13,color:T.ink,flex:1,marginRight:8}}>{req.title}</div><Chip label={req.status==="resolved"?"✓ Resolved":"Open"} color={req.status==="resolved"?T.teal:T.rose}/></div>
                <div style={{fontSize:11,color:T.muted,marginBottom:8}}>Flat {req.flatId} · {req.tenant} · {req.date}</div>
                <Chip label={req.priority==="high"?"🔴 High":req.priority==="medium"?"🟡 Medium":"🟢 Low"} color={req.priority==="high"?T.rose:req.priority==="medium"?T.amber:T.teal}/>
                {req.status==="open"&&<button onClick={()=>{setFlats(p=>p.map(f=>f.id===req.flatId?{...f,maintenanceReqs:f.maintenanceReqs.map(r=>r.id===req.id?{...r,status:"resolved"}:r)}:f));showToast("Marked resolved ✓");}} style={{marginLeft:8,background:T.tealL,border:`1px solid ${T.teal}30`,borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,color:T.teal,cursor:"pointer"}}>✓ Resolve</button>}
              </div>
            ))}
            {flats.flatMap(f=>f.maintenanceReqs).filter(r=>mFilter==="all"||r.status===mFilter).length===0&&<div style={{textAlign:"center",padding:"32px 0",color:T.muted,fontSize:13}}>No {mFilter==="all"?"":mFilter} requests 🎉</div>}
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:520,margin:"0 auto",background:T.surface,borderTop:`1.5px solid ${T.border}`,display:"flex",zIndex:50}}>
        {[{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"rentals",icon:"🏠",label:"Rentals"},{id:"whatsapp",icon:"💬",label:"Reminders"},{id:"maintenance",icon:"🔧",label:"Maintenance"}].map(t=>(
          <button key={t.id} onClick={()=>{setDemoTab(t.id);setSelFlat(null);}} style={{flex:1,padding:"9px 4px 10px",background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",color:demoTab===t.id?T.saffron:T.muted,fontFamily:"inherit",borderTop:`2.5px solid ${demoTab===t.id?T.saffron:"transparent"}`,transition:"all .15s"}}>
            <span style={{fontSize:15}}>{t.icon}</span><span style={{fontSize:8,fontWeight:800}}>{t.label}</span>
          </button>
        ))}
      </div>
      <Toast/>
    </div>
  );

  // ── DEMO TENANT ──────────────────────────────────────────────
  if(screen==="demo-tenant") return(
    <div style={{fontFamily:"'Nunito','Segoe UI',sans-serif",background:T.bg,color:T.ink,minHeight:"100vh",display:"flex",flexDirection:"column",maxWidth:520,margin:"0 auto"}}>
      <style>{CSS}</style>
      <div style={{background:`linear-gradient(135deg,${T.teal},${T.tealB})`,padding:"16px 16px 24px",color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.08)",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,opacity:.85}}>Rentok · Tenant Portal</div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>{setDemoTab("dashboard");setScreen("demo-owner");}} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>🏢 Owner View</button>
            <button onClick={()=>setScreen("landing")} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.8)",cursor:"pointer"}}>← Back</button>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800}}>RK</div>
          <div><div style={{fontSize:17,fontWeight:900,letterSpacing:-.4}}>Ramesh Kumar</div><div style={{fontSize:10,opacity:.8}}>Flat 1 · Floor 1 · Sunrise Apartments</div></div>
        </div>
        <div style={{padding:"11px 14px",background:"rgba(255,255,255,.15)",borderRadius:12,backdropFilter:"blur(8px)"}}>
          <div style={{fontSize:9,fontWeight:700,opacity:.8,marginBottom:2}}>TOTAL DUE THIS MONTH</div>
          <div style={{fontSize:26,fontWeight:900,letterSpacing:-1}}>{fd(10000+1200+350+500)}</div>
          <button onClick={()=>showToast("Opening UPI payment…")} style={{marginTop:8,background:"#fff",color:T.teal,border:"none",borderRadius:8,padding:"6px 16px",fontSize:12,fontWeight:800,cursor:"pointer"}}>Pay All via UPI →</button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",paddingBottom:68}}>
        {tenantTab==="home"&&(
          <div style={{padding:"16px"}}>
            <div style={{fontWeight:800,fontSize:13,color:T.ink,marginBottom:11}}>This Month's Bills</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[{label:"Rent",amt:10000,paid:false,icon:"🏠"},{label:"Electricity",amt:1200,paid:false,icon:"⚡"},{label:"Water",amt:350,paid:true,icon:"💧"},{label:"Maintenance",amt:500,paid:false,icon:"🔧"}].map(b=>(
                <div key={b.label} style={{background:T.card,border:`1.5px solid ${b.paid?T.teal+"55":T.border}`,borderRadius:13,padding:"13px"}}>
                  <div style={{fontSize:18,marginBottom:3}}>{b.icon}</div>
                  <div style={{fontSize:10,color:T.muted,fontWeight:600}}>{b.label}</div>
                  <div style={{fontSize:17,fontWeight:900,color:T.saffron,margin:"3px 0"}}>{fd(b.amt)}</div>
                  {b.paid?<Chip label="✓ Paid" color={T.teal}/>:<button onClick={()=>showToast(`Opening UPI for ${b.label}…`)} style={{background:T.saffron,border:"none",borderRadius:7,padding:"4px 11px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>Pay</button>}
                </div>
              ))}
            </div>
            <div style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:13,padding:14}}>
              <div style={{fontWeight:800,fontSize:12,color:T.ink,marginBottom:10}}>🏠 Tenancy Details</div>
              {[["Monthly Rent",fd(10000)],["Security Deposit",fd(30000)],["Move-in","01 Jun 2023"],["Agreement Expiry","31 Apr 2026"]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}><span style={{color:T.muted,fontWeight:600}}>{l}</span><span style={{fontWeight:700,color:T.ink}}>{v}</span></div>
              ))}
            </div>
          </div>
        )}
        {tenantTab==="payments"&&(
          <div style={{padding:"16px"}}>
            <div style={{fontWeight:800,fontSize:14,color:T.ink,marginBottom:13}}>Payment History</div>
            {[{type:"Rent",amt:10000,date:"2025-02-01",status:"paid",txn:"TXN8821"},{type:"Electricity",amt:1100,date:"2025-02-01",status:"paid",txn:"TXN8822"},{type:"Rent",amt:10000,date:"2025-03-01",status:"pending",txn:""},{type:"Electricity",amt:1200,date:"2025-03-01",status:"pending",txn:""}].map((p,i)=>(
              <div key={i} style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:13,padding:"13px 15px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
                  <div><div style={{fontWeight:700,fontSize:13,color:T.ink}}>{p.type}</div><div style={{fontSize:10,color:T.muted,marginTop:2}}>{p.date}{p.txn?` · ${p.txn}`:""}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:900,color:T.saffron}}>{fd(p.amt)}</div><Chip label={p.status==="paid"?"✓ Paid":"Pending"} color={p.status==="paid"?T.teal:T.amber}/></div>
                </div>
                {p.status==="pending"&&<button onClick={()=>showToast(`Opening UPI for ${p.type}…`)} style={{width:"100%",marginTop:9,background:T.saffron,border:"none",borderRadius:8,padding:"7px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>Pay {fd(p.amt)} via UPI</button>}
              </div>
            ))}
          </div>
        )}
        {tenantTab==="requests"&&(
          <div style={{padding:"16px"}}>
            <div style={{fontWeight:800,fontSize:14,color:T.ink,marginBottom:13}}>Maintenance Requests</div>
            <div style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:13,padding:16,marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:13,color:T.ink,marginBottom:11}}>+ New Request</div>
              <input placeholder="Describe the issue (e.g. leaking tap)…" style={{width:"100%",background:T.panel,border:`1.5px solid ${T.border}`,color:T.ink,borderRadius:9,padding:"9px 12px",fontSize:12,marginBottom:10}}/>
              <div style={{display:"flex",gap:7,marginBottom:11}}>{["Low","Medium","High"].map(p=><button key={p} style={{flex:1,padding:"6px",borderRadius:8,border:`1.5px solid ${T.border2}`,background:T.panel,color:T.ink2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{p}</button>)}</div>
              <button onClick={()=>showToast("Request submitted ✓")} style={{width:"100%",background:T.saffron,border:"none",borderRadius:9,padding:"9px",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>Submit Request</button>
            </div>
            {[{title:"Leaking tap in bathroom",status:"resolved",date:"2025-02-10",note:"Fixed on 12 Feb"},{title:"Broken window latch",status:"open",date:"2025-03-01",note:""}].map((r,i)=>(
              <div key={i} style={{background:T.card,border:`1.5px solid ${T.border}`,borderRadius:13,padding:"13px 15px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:4}}><div style={{fontWeight:700,fontSize:12,color:T.ink,flex:1,marginRight:8}}>{r.title}</div><Chip label={r.status==="resolved"?"✓ Resolved":"Open"} color={r.status==="resolved"?T.teal:T.rose}/></div>
                <div style={{fontSize:10,color:T.muted,marginBottom:r.note?5:0}}>{r.date}</div>
                {r.note&&<div style={{fontSize:10,color:T.teal,padding:"5px 9px",background:T.tealL,borderRadius:7}}>{r.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,maxWidth:520,margin:"0 auto",background:T.surface,borderTop:`1.5px solid ${T.border}`,display:"flex",zIndex:50}}>
        {[{id:"home",icon:"🏠",label:"Home"},{id:"payments",icon:"💳",label:"Payments"},{id:"requests",icon:"🔧",label:"Requests"}].map(t=>(
          <button key={t.id} onClick={()=>setTenantTab(t.id)} style={{flex:1,padding:"9px 4px 10px",background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",color:tenantTab===t.id?T.teal:T.muted,fontFamily:"inherit",borderTop:`2.5px solid ${tenantTab===t.id?T.teal:"transparent"}`,transition:"all .15s"}}>
            <span style={{fontSize:15}}>{t.icon}</span><span style={{fontSize:8,fontWeight:800}}>{t.label}</span>
          </button>
        ))}
      </div>
      <Toast/>
    </div>
  );

  // ── LANDING ──────────────────────────────────────────────────
  return(
    <div style={{fontFamily:"'Nunito','Segoe UI',sans-serif",background:T.bg,color:T.ink,minHeight:"100vh",overflowX:"hidden"}}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{background:T.surface,borderBottom:`1.5px solid ${T.border}`,padding:"13px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:`0 4px 12px ${T.saffron}30`}}>🔑</div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{fontWeight:900,fontSize:18,color:T.ink,letterSpacing:-.5,lineHeight:1}}>Rentok</div>
              <span style={{fontSize:9,fontWeight:800,background:T.amberL,color:T.amber,padding:"2px 7px",borderRadius:20,border:`1px solid ${T.amber}30`,letterSpacing:.5}}>BETA</span>
            </div>
            <div style={{fontSize:9,color:T.muted,fontWeight:600}}>Rent smarter. Manage better.</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <a href="mailto:rentoksupport@gmail.com" style={{background:"none",border:"none",fontSize:12,fontWeight:600,color:T.muted,textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>📧 Support</a>
          <Btn variant="primary" onClick={()=>openReg()}>Join Beta →</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section style={{textAlign:"center",padding:"64px 24px 48px",maxWidth:700,margin:"0 auto",position:"relative"}}>
        <div style={{position:"absolute",top:0,left:"5%",width:420,height:360,borderRadius:"50%",background:`radial-gradient(circle,${T.saffron}09,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:40,right:"0%",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${T.teal}09,transparent 70%)`,pointerEvents:"none"}}/>
        <div className="fu" style={{animationDelay:"0s",display:"inline-flex",alignItems:"center",gap:7,padding:"5px 15px",borderRadius:20,background:T.saffronL,border:`1px solid ${T.saffron}30`,fontSize:11,fontWeight:700,color:T.saffron,letterSpacing:.5,marginBottom:20}}>
          ✦ 15-DAY FREE TRIAL · NO CARD NEEDED · MADE IN INDIA 🇮🇳
        </div>
        <h1 className="fu" style={{fontSize:"clamp(28px,5.5vw,50px)",fontWeight:900,letterSpacing:-2,lineHeight:1.08,marginBottom:18,animationDelay:".08s"}}>
          Collect rent on time,<br/>
          <span style={{background:`linear-gradient(90deg,${T.saffron},${T.saffronB},${T.teal},${T.saffron})`,backgroundSize:"300% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 5s linear infinite"}}>every single month.</span>
        </h1>
        <p className="fu" style={{fontSize:16,color:T.muted,lineHeight:1.75,maxWidth:480,margin:"0 auto 32px",animationDelay:".16s"}}>
          WhatsApp reminders, UPI payments, P&L dashboard, rental agreements & maintenance tracking — built for Indian landlords and PG owners.
        </p>
        <div className="fu" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:12,animationDelay:".22s"}}>
          <Btn variant="primary" size="lg" onClick={()=>openReg()}>Join Beta — Free →</Btn>
          <Btn variant="secondary" size="lg" onClick={goDemo}>👀 See Demo</Btn>
        </div>
        <div className="fu" style={{fontSize:12,color:T.muted,animationDelay:".26s"}}>No credit card · Free beta access · Be the first to try Rentok</div>
      </section>

      {/* WHO IS THIS FOR */}
      <section style={{padding:"0 24px 64px",maxWidth:920,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:10,fontWeight:800,color:T.muted,letterSpacing:.9,textTransform:"uppercase",marginBottom:12}}>Who is Rentok for?</div>
          <div style={{display:"inline-flex",background:T.panel,borderRadius:14,padding:4,border:`1.5px solid ${T.border}`,gap:3}}>
            {[["owner","🏢","Property Owners"],["tenant","🏠","Tenants"],["pg","🛏️","PG Owners"]].map(([id,icon,label])=>(
              <button key={id} onClick={()=>setAudience(id)} style={{padding:"10px 18px",borderRadius:11,border:"none",background:audience===id?T.surface:"transparent",color:audience===id?T.saffron:T.muted,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:audience===id?`0 2px 8px ${T.border}`:"none",transition:"all .18s"}}>{icon} {label}</button>
            ))}
          </div>
        </div>

        {audience==="owner"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:28}}>
              <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:900,letterSpacing:-1.2,color:T.ink,marginBottom:8}}>Stop chasing rent.<br/>Start running a business.</h2>
              <p style={{fontSize:14,color:T.muted,maxWidth:440,margin:"0 auto",lineHeight:1.7}}>Rentok turns the chaos of managing multiple tenants into a clean automated system that runs itself.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14,marginBottom:24}}>
              {OWNER_VALUES.map((v,i)=>(
                <div key={i} className="val-card" style={{background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:18,padding:"20px 18px"}}>
                  <div style={{width:46,height:46,borderRadius:13,background:v.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12,animation:`float ${2.4+i*.3}s ease infinite`}}>{v.icon}</div>
                  <div style={{fontSize:14,fontWeight:800,color:T.ink,marginBottom:7,letterSpacing:-.2}}>{v.title}</div>
                  <div style={{fontSize:12,color:T.muted,lineHeight:1.7}}>{v.desc}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"16px 22px",background:`linear-gradient(135deg,${T.saffronL},#fff9f2)`,border:`1.5px solid ${T.saffron}20`,borderRadius:14,display:"flex",flexWrap:"wrap",gap:22,justifyContent:"center",alignItems:"center"}}>
              {[["₹12L+","Rent collected monthly"],["4.8★","Owner rating"],["2 min","To generate agreement"],["98%","On-time payment rate"]].map(([n,l])=>(
                <div key={l} style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:T.saffron,letterSpacing:-1}}>{n}</div><div style={{fontSize:10,color:T.muted,fontWeight:600,marginTop:2}}>{l}</div></div>
              ))}
            </div>
          </div>
        )}

        {audience==="tenant"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:28}}>
              <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:900,letterSpacing:-1.2,color:T.ink,marginBottom:8}}>Your rental life,<br/>finally organised.</h2>
              <p style={{fontSize:14,color:T.muted,maxWidth:440,margin:"0 auto",lineHeight:1.7}}>Pay rent from your phone, track every bill, raise maintenance requests and stop worrying about missed payments.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14,marginBottom:24}}>
              {TENANT_VALUES.map((v,i)=>(
                <div key={i} className="val-card" style={{background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:18,padding:"20px 18px"}}>
                  <div style={{width:46,height:46,borderRadius:13,background:v.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12,animation:`float ${2.4+i*.3}s ease infinite`}}>{v.icon}</div>
                  <div style={{fontSize:14,fontWeight:800,color:T.ink,marginBottom:7,letterSpacing:-.2}}>{v.title}</div>
                  <div style={{fontSize:12,color:T.muted,lineHeight:1.7}}>{v.desc}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"16px 22px",background:`linear-gradient(135deg,${T.tealL},#f0fbf8)`,border:`1.5px solid ${T.teal}20`,borderRadius:14,display:"flex",flexWrap:"wrap",gap:22,justifyContent:"center",alignItems:"center"}}>
              {[["10 sec","To pay rent via UPI"],["Instant","Receipts, every time"],["0 calls","To landlord for bills"],["4.9★","Tenant rating"]].map(([n,l])=>(
                <div key={l} style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:900,color:T.teal,letterSpacing:-1}}>{n}</div><div style={{fontSize:10,color:T.muted,fontWeight:600,marginTop:2}}>{l}</div></div>
              ))}
            </div>
          </div>
        )}

        {audience==="pg"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:28}}>
              <h2 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:900,letterSpacing:-1.2,color:T.ink,marginBottom:8}}>Running a PG is hard.<br/><span style={{color:T.saffron}}>Collecting rent shouldn't be.</span></h2>
              <p style={{fontSize:14,color:T.muted,maxWidth:500,margin:"0 auto",lineHeight:1.7}}>20+ occupants, different due dates, food charges, advance adjustments and a WhatsApp full of "bhai aaj nahi hoga" — Rentok handles all of it.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
              <div style={{background:T.roseL,border:`1.5px solid ${T.rose}22`,borderRadius:16,padding:"18px 16px"}}>
                <div style={{fontSize:12,fontWeight:800,color:T.rose,marginBottom:12}}>😫 Without Rentok</div>
                {["Tracking 20+ payments in Excel","Chasing each tenant on personal WhatsApp","Forgetting who paid advance","Agreements expiring unnoticed","Separate notes for food, laundry, AC"].map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:7,marginBottom:7,fontSize:11,color:T.rose,alignItems:"flex-start"}}><span style={{flexShrink:0}}>✕</span><span>{p}</span></div>
                ))}
              </div>
              <div style={{background:T.tealL,border:`1.5px solid ${T.teal}22`,borderRadius:16,padding:"18px 16px"}}>
                <div style={{fontSize:12,fontWeight:800,color:T.teal,marginBottom:12}}>✨ With Rentok</div>
                {["Auto-reminders fire before due date","Bulk WhatsApp reaches all in one tap","Each occupant's advance tracked separately","Agreements prompt renewal automatically","Food, laundry, AC billed per tenant"].map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:7,marginBottom:7,fontSize:11,color:T.teal,alignItems:"flex-start"}}><span style={{flexShrink:0}}>✓</span><span>{p}</span></div>
                ))}
              </div>
            </div>
            {PG_PAINS.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"14px 16px",background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:13,marginBottom:9}}>
                <div style={{width:40,height:40,borderRadius:11,background:T.saffronL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{p.icon}</div>
                <div><div style={{fontSize:12,fontWeight:800,color:T.rose,marginBottom:3}}>Problem: {p.pain}</div><div style={{fontSize:12,color:T.muted,lineHeight:1.6}}>✓ <span style={{color:T.teal,fontWeight:700}}>Rentok: </span>{p.fix}</div></div>
              </div>
            ))}
            <div style={{marginTop:14,padding:"14px 18px",background:`linear-gradient(135deg,${T.saffronL},#fff9f2)`,border:`1.5px solid ${T.saffron}22`,borderRadius:13,textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:800,color:T.ink,marginBottom:4}}>PG owners save 6+ hours/month on rent follow-ups</div>
              <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Growth plan · ₹5,000/mo · Up to 25 beds · or start on Beginner at ₹1,000/mo</div>
              <Btn variant="primary" size="sm" onClick={()=>openReg()}>Join Beta for PGs →</Btn>
            </div>
          </div>
        )}
      </section>

      {/* PRICING */}
      <section style={{padding:"0 24px 72px",maxWidth:1060,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:10,fontWeight:800,color:T.muted,letterSpacing:.9,textTransform:"uppercase",marginBottom:10}}>Pricing</div>
          <h2 style={{fontSize:"clamp(22px,4vw,36px)",fontWeight:900,letterSpacing:-1.5,marginBottom:8}}>Simple, honest pricing</h2>
          <p style={{fontSize:14,color:T.muted,marginBottom:22}}>One property per plan · 15-day free trial on every plan</p>
          <div style={{display:"inline-flex",background:T.panel,border:`1.5px solid ${T.border}`,borderRadius:13,padding:3,gap:0}}>
            {[["monthly","Monthly"],["annual","Annual"]].map(([v,l])=>(
              <button key={v} onClick={()=>setBilling(v)} style={{padding:"8px 22px",borderRadius:11,border:"none",background:billing===v?T.surface:"transparent",color:billing===v?T.saffron:T.muted,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7,boxShadow:billing===v?`0 2px 8px ${T.border}`:"none",transition:"all .2s"}}>
                {l}{v==="annual"&&<span style={{fontSize:10,background:billing==="annual"?T.saffronL:"transparent",color:T.saffron,padding:"2px 7px",borderRadius:6,fontWeight:900}}>SAVE 2 MONTHS</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:18}}>
          {PLANS.map((plan,i)=>(
            <div key={plan.id} className="plan-card" style={{background:plan.id==="pro"?"linear-gradient(160deg,#1a0d2e,#120818)":T.surface,border:`2px solid ${plan.badge?plan.color+"55":T.border}`,borderRadius:22,padding:"26px 22px",position:"relative",overflow:"hidden",boxShadow:plan.badge?`0 8px 28px ${plan.color}18`:"none"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${plan.color},transparent)`,opacity:plan.badge?1:.25,pointerEvents:"none"}}/>
              {plan.badge&&<div style={{position:"absolute",top:-1,right:18,background:plan.color,color:"#fff",fontSize:9,fontWeight:900,padding:"4px 11px",borderRadius:"0 0 9px 9px",letterSpacing:.5}}>{plan.badge}</div>}
              <div style={{width:48,height:48,borderRadius:14,background:plan.id==="pro"?`${plan.color}25`:plan.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:12,animation:`float ${2.2+i*.4}s ease infinite`}}>{plan.icon}</div>
              <div style={{fontSize:19,fontWeight:900,color:plan.id==="pro"?"#fff":T.ink,letterSpacing:-.4,marginBottom:3}}>{plan.name}</div>
              <div style={{fontSize:11,color:plan.id==="pro"?"rgba(255,255,255,.5)":T.muted,marginBottom:18,lineHeight:1.4}}>{plan.tagline}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:3}}>
                <span style={{fontSize:15,color:plan.id==="pro"?"rgba(255,255,255,.4)":T.muted,fontWeight:700}}>₹</span>
                <span style={{fontSize:44,fontWeight:900,letterSpacing:-2.5,color:plan.color,lineHeight:1}}>{price(plan).toLocaleString("en-IN")}</span>
                <span style={{fontSize:13,color:plan.id==="pro"?"rgba(255,255,255,.4)":T.muted,fontWeight:600}}>/mo</span>
              </div>
              {billing==="annual"&&<div style={{fontSize:10,color:plan.id==="pro"?"rgba(255,255,255,.4)":T.muted,marginBottom:3}}>₹{plan.yr.toLocaleString("en-IN")}/yr · save ₹{save(plan).toLocaleString("en-IN")}</div>}
              {billing==="monthly"&&<div style={{fontSize:10,color:plan.color,fontWeight:700,marginBottom:3}}>₹{plan.yr.toLocaleString("en-IN")}/yr (save 2 months)</div>}
              <div style={{display:"inline-flex",alignItems:"center",padding:"5px 11px",borderRadius:8,background:plan.id==="pro"?`${plan.color}20`:plan.light,border:`1px solid ${plan.color}28`,margin:"12px 0 18px"}}>
                <span style={{fontSize:11,fontWeight:800,color:plan.color}}>{plan.units}</span>
              </div>
              <button onClick={()=>openReg(plan)} style={{width:"100%",padding:"11px",background:`linear-gradient(135deg,${plan.color},${plan.color}cc)`,border:"none",borderRadius:11,fontSize:13,fontWeight:800,color:"#fff",marginBottom:16,cursor:"pointer",fontFamily:"inherit",transition:"opacity .15s"}} onMouseOver={e=>e.currentTarget.style.opacity=".85"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                Join Beta →
              </button>
              <div style={{padding:"10px 12px",borderRadius:11,background:plan.id==="pro"?"rgba(255,255,255,.07)":T.panel,border:`1px solid ${plan.id==="pro"?"rgba(255,255,255,.1)":T.border}`,marginBottom:18}}>
                <div style={{fontSize:9,fontWeight:800,color:plan.color,letterSpacing:.7,marginBottom:5}}>📞 SUPPORT</div>
                <div style={{fontSize:11,color:plan.id==="pro"?"rgba(255,255,255,.55)":T.muted}}>{plan.support}</div>
              </div>
              <div style={{fontSize:9,fontWeight:800,color:plan.id==="pro"?"rgba(255,255,255,.25)":T.subtle,letterSpacing:.6,marginBottom:9,textTransform:"uppercase"}}>What's included</div>
              {plan.features.map((f,fi)=>(
                <div key={fi} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}>
                  <div style={{width:15,height:15,borderRadius:4,background:plan.id==="pro"?`${plan.color}28`:plan.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:plan.color,fontWeight:900,flexShrink:0,marginTop:1}}>✓</div>
                  <span style={{fontSize:11,color:plan.id==="pro"?"rgba(255,255,255,.65)":T.ink2,lineHeight:1.4}}>{f}</span>
                </div>
              ))}
              {plan.not.map((f,fi)=>(
                <div key={fi} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start",opacity:.3}}>
                  <div style={{width:15,height:15,borderRadius:4,background:T.panel,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:T.subtle,flexShrink:0,marginTop:1}}>✕</div>
                  <span style={{fontSize:11,color:T.subtle,lineHeight:1.4}}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {billing==="monthly"&&(
          <div style={{marginTop:18,padding:"14px 20px",background:T.amberL,border:`1.5px solid ${T.amber}28`,borderRadius:13,textAlign:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:T.amber}}>💡 Switch to annual and save up to ₹20,000/year on Pro — </span>
            <button onClick={()=>setBilling("annual")} style={{background:T.amber,border:"none",borderRadius:7,padding:"4px 12px",fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",marginLeft:6}}>Switch to Annual</button>
          </div>
        )}
      </section>

      {/* COMPARE TABLE */}
      <section style={{padding:"0 24px 72px",maxWidth:820,margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(20px,3.5vw,30px)",fontWeight:900,letterSpacing:-1.2,textAlign:"center",marginBottom:6}}>Compare all plans</h2>
        <p style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:28}}>All plans include UPI payments, WhatsApp reminders & a 15-day free trial</p>
        <div style={{background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:18,overflow:"hidden"}}>
          {COMPARE.map(([feature,...vals],i)=>(
            <div key={feature} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",background:i===0?T.panel:i%2===0?"transparent":T.bg,borderBottom:i<COMPARE.length-1?`1px solid ${T.border}`:"none"}}>
              <div style={{padding:"11px 18px",fontSize:i===0?10:12,fontWeight:i===0?800:500,color:i===0?T.muted:T.ink2,letterSpacing:i===0?.6:0,textTransform:i===0?"uppercase":"none"}}>{feature}</div>
              {vals.map((v,j)=>{
                const plan=PLANS[j];
                const isCheck=v==="✓", isDash=v==="—";
                return(
                  <div key={j} style={{padding:"11px 6px",textAlign:"center",borderLeft:`1px solid ${T.border}`}}>
                    {i===0?<span style={{fontSize:10,fontWeight:900,color:plan.color}}>{v}</span>:<span style={{fontSize:isCheck?15:11,fontWeight:isCheck?900:600,color:isCheck?plan.color:isDash?T.subtle:T.ink2}}>{v}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* BETA BANNER */}
      <section style={{padding:"0 24px 72px",maxWidth:860,margin:"0 auto"}}>
        <div style={{borderRadius:24,padding:"48px 36px",background:`linear-gradient(135deg,${T.saffronL},#fff9f2)`,border:`2px solid ${T.saffron}22`,textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-50,right:-50,width:180,height:180,borderRadius:"50%",background:`radial-gradient(circle,${T.saffron}10,transparent 70%)`,pointerEvents:"none"}}/>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:20,background:T.amberL,border:`1px solid ${T.amber}30`,fontSize:11,fontWeight:800,color:T.amber,marginBottom:14,letterSpacing:.5}}>🧪 BETA — FREE ACCESS FOR EARLY USERS</div>
          <h3 style={{fontSize:"clamp(20px,4vw,32px)",fontWeight:900,letterSpacing:-1.2,marginBottom:10}}>Be among the first landlords on Rentok</h3>
          <p style={{color:T.muted,fontSize:14,marginBottom:28,maxWidth:440,margin:"0 auto 28px",lineHeight:1.7}}>Join the beta for free. Help us shape the product. Get lifetime early-bird pricing when we launch.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:14}}>
            {PLANS.map(p=>(
              <button key={p.id} onClick={()=>openReg(p)} style={{padding:"10px 20px",borderRadius:12,border:`2px solid ${p.color}40`,background:`${p.color}10`,color:p.color,fontSize:13,fontWeight:800,cursor:"pointer",transition:"all .18s"}} onMouseOver={e=>{e.currentTarget.style.background=p.color;e.currentTarget.style.color="#fff";}} onMouseOut={e=>{e.currentTarget.style.background=`${p.color}10`;e.currentTarget.style.color=p.color;}}>
                {p.icon} {p.name}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:T.muted}}>No credit card · Cancel any time · Full beta access free</div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:"0 24px 72px",maxWidth:640,margin:"0 auto"}}>
        <h2 style={{fontSize:"clamp(20px,3.5vw,28px)",fontWeight:900,letterSpacing:-1,textAlign:"center",marginBottom:6}}>Frequently asked</h2>
        <p style={{textAlign:"center",color:T.muted,fontSize:13,marginBottom:32}}>Email us at <a href="mailto:rentoksupport@gmail.com" style={{color:T.saffron,fontWeight:700,textDecoration:"none"}}>rentoksupport@gmail.com</a></p>
        {FAQS.map((faq,i)=>(
          <div key={i} style={{borderBottom:`1.5px solid ${T.border}`,borderRadius:openFaq===i?10:0,overflow:"hidden",transition:"background .2s",background:openFaq===i?T.surface:"transparent"}}>
            <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:"100%",background:"none",border:"none",padding:"16px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,color:openFaq===i?T.ink:T.ink2,textAlign:"left",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:14}}>
              <span style={{lineHeight:1.4}}>{faq.q}</span>
              <span style={{fontSize:20,color:T.muted,transition:"transform .25s",transform:openFaq===i?"rotate(45deg)":"none",flexShrink:0,lineHeight:1,fontWeight:300}}>+</span>
            </button>
            <div style={{maxHeight:openFaq===i?180:0,overflow:"hidden",transition:"max-height .3s ease"}}>
              <p style={{fontSize:13,color:T.muted,lineHeight:1.75,padding:"0 14px 16px"}}>{faq.a}</p>
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:`1.5px solid ${T.border}`,padding:"22px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${T.saffron},${T.saffronB})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🔑</div>
          <span style={{fontWeight:900,fontSize:14,color:T.ink}}>Rentok</span>
          <span style={{fontSize:9,fontWeight:800,background:T.amberL,color:T.amber,padding:"2px 7px",borderRadius:20,letterSpacing:.5}}>BETA</span>
        </div>
        <div style={{fontSize:11,color:T.muted,textAlign:"center"}}>© 2025 Rentok · Made in India 🇮🇳<br/><a href="mailto:rentoksupport@gmail.com" style={{color:T.saffron,fontWeight:700,textDecoration:"none",fontSize:11}}>rentoksupport@gmail.com</a></div>
        <div style={{display:"flex",gap:16}}>
          {["Privacy","Terms"].map(l=><button key={l} style={{background:"none",border:"none",color:T.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{l}</button>)}
          <a href="mailto:rentoksupport@gmail.com" style={{color:T.muted,fontSize:11,fontWeight:700,textDecoration:"none"}}>Contact</a>
        </div>
      </footer>

      <Toast/>
    </div>
  );
}
