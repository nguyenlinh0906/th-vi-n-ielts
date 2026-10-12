<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IELTS Listening – Vol 8 Test 3</title>
<style>
:root{--bg:#f4f6fa;--card:#fff;--ink:#1d2433;--mute:#667085;--line:#d9dfea;--brand:#1f4fd8;--ok:#127a3d;--bad:#c4281c}
*{box-sizing:border-box}
body{margin:0;font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--ink)}
header{position:sticky;top:0;z-index:10;background:#fff;border-bottom:1px solid var(--line);padding:10px 16px}
.bar{max-width:900px;margin:auto;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.bar h1{font-size:17px;margin:0;flex:1 1 220px}
button{font:inherit;border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 12px;cursor:pointer}
button.primary{background:var(--brand);border-color:var(--brand);color:#fff}
button:disabled{opacity:.45;cursor:not-allowed}
.prog{flex:1 1 100%;display:flex;gap:10px;align-items:center;font-size:13px;color:var(--mute)}
.prog input[type=range]{flex:1}
.prog input:disabled{opacity:.5}
main{max-width:900px;margin:18px auto 60px;padding:0 14px}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px 22px;margin-bottom:18px}
section>h2{margin:0 0 4px;font-size:20px;color:var(--brand)}
.instr{color:var(--mute);margin:0 0 12px}
.blk{margin:14px 0}
.blk h3{margin:0 0 6px;font-size:16px}
.notes p{margin:4px 0}
.notes ul{margin:4px 0 8px;padding-left:22px}
.q{margin:12px 0}
.q .t{font-weight:600}
.q label{display:block;padding:3px 0;cursor:pointer}
input.fill{width:130px;border:0;border-bottom:2px solid var(--brand);background:#eef2ff;padding:2px 6px;font:inherit;text-align:center;border-radius:4px 4px 0 0}
select.pick{font:inherit;padding:2px 4px;border:2px solid var(--brand);border-radius:6px;background:#eef2ff}
.num{display:inline-block;min-width:22px;font-weight:700;color:var(--brand)}
.wordlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:4px 12px;background:#f7f8fb;border:1px solid var(--line);border-radius:8px;padding:10px 14px;margin:10px 0}
.flow .step{padding:8px 12px;border:1px solid var(--line);border-radius:8px;background:#fafbff}
.flow .arrow{text-align:center;color:var(--mute);line-height:1.1}
img.map{max-width:100%;border:1px solid var(--line);border-radius:8px}
.maplist{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px 20px;margin-top:10px}
.right{outline:2px solid var(--ok)!important}
.wrong{outline:2px solid var(--bad)!important}
.fb{font-size:13px;margin-left:6px}
.fb.ok{color:var(--ok)}.fb.bad{color:var(--bad)}
#result{display:none;background:#fff;border:2px solid var(--brand);border-radius:12px;padding:16px 22px}
#result h2{margin:0 0 6px}
.hint{font-size:13px;color:var(--mute)}
</style>
</head>
<body>
<header>
 <div class="bar">
  <h1>IELTS Listening – Vol 8 · Test 3</h1>
  <label class="hint"><input type="checkbox" id="exam" checked> Chế độ thi thật (nghe 1 lần, không tua)</label>
  <button class="primary" id="play">▶ Bắt đầu nghe</button>
  <button id="pause" style="display:none">⏸</button>
  <button id="back" style="display:none">⏪ 10s</button>
  <button id="fwd" style="display:none">10s ⏩</button>
  <select id="speed" style="display:none"><option>0.75</option><option selected>1</option><option>1.25</option><option>1.5</option></select>
  <div class="prog"><span id="cur">0:00</span><input type="range" id="seek" min="0" max="100" value="0" step="0.1" disabled><span id="dur">0:00</span></div>
 </div>
</header>
<audio id="aud" preload="auto" src="audio.mp3"></audio>

<main id="app"></main>

<main>
 <button class="primary" id="submit">Nộp bài & chấm điểm</button>
 <button id="reset">Làm lại</button>
 <div id="result" style="margin-top:16px"></div>
</main>

<script>
/* ============================================================
   1) ĐÁP ÁN – điền vào đây (để "" nếu chưa có thì sẽ không chấm câu đó)
   - Nhiều đáp án chấp nhận được: "colour/color"
   - Câu 24–25: điền 2 đáp án, thứ tự nào cũng được
   ============================================================ */
const ANSWERS = {
  1:"",2:"",3:"",4:"",5:"",6:"",7:"",8:"",9:"",10:"",
  11:"",12:"",13:"",14:"",15:"",
  16:"",17:"",18:"",19:"",20:"",
  21:"",22:"",23:"",
  "24-25":["",""],
  26:"",27:"",28:"",29:"",30:"",
  31:"",32:"",33:"",34:"",35:"",36:"",37:"",38:"",39:"",40:""
};

/* ============================================================
   2) NỘI DUNG ĐỀ – dạng dữ liệu
   Trong html: {{n}} = ô điền từ, {{n:sel}} = ô chọn A–I / A–H (theo "letters" của khối)
   ============================================================ */
const MAP_SRC = "map.jpg";
const LIST_11_15 = {A:"button",B:"website",C:"helmet",D:"light",E:"locker",F:"password",G:"rack",H:"screen",I:"sound"};

const TEST = [
 { title:"SECTION 1", instr:"Questions 1–10 · Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
   blocks:[{type:"notes", html:`
    <h3>Beach Heads Travel – Customer Request Sheet</h3>
    <p><b>Example</b></p>
    <p><b>Name:</b> Duncan <b><i>White</i></b><br><b>Group details:</b> three adults and two children</p>
    <p><b>Date of arrival:</b> {{1}} (staying for 2 weeks)</p>
    <p><b>Week One</b></p>
    <p><b>Accommodation:</b></p>
    <ul><li>Book a {{2}} on the beach</li><li>Budget is around {{3}} a night</li></ul>
    <p><b>Activities:</b></p>
    <ul><li>The children want to go {{4}} – arrange for them to have a {{5}}</li>
    <li>Book a time for Susan and Jenny to play {{6}}</li>
    <li>Duncan wants to go {{7}} – send some information</li></ul>
    <p><b>Week Two</b></p>
    <p><b>Accommodation:</b> National Park – book a {{8}} ($100 per night)</p>
    <p><b>Activities:</b></p>
    <ul><li>Arrange a {{9}} for Jenny</li><li>Send Duncan a {{10}} for Marco's</li></ul>`}]},

 { title:"SECTION 2", instr:"Questions 11–15 · Complete the flow-chart. Choose FIVE answers, A–I, from the box.",
   blocks:[
    {type:"flow", steps:[
      "Subscribe to the service online to receive a card",
      "At the station, log on at the computer terminal",
      "Select a bike by using the {{11:sel}}",
      "Release the bike by using the {{12:sel}} – of your chosen bike",
      "Remove the bike from the {{13:sel}} (You have ten seconds.)",
      "Make sure you have a {{14:sel}} before setting off",
      "At the end of your journey, return the bike to a station and secure in place<br>(A {{15:sel}} – will tell you the bike is locked correctly)"],
     letters:"ABCDEFGHI", list:LIST_11_15, title:"How to use City Cycle"},
    {type:"map", instr:"Questions 16–20 · Label the plan below. Choose the correct letter, A–H.", letters:"ABCDEFGH",
     items:[[16,"Coffee cart"],[17,"Workshop"],[18,"Lockers"],[19,"Showers"],[20,"Towel"]]}]},

 { title:"SECTION 3", instr:"Questions 21–30",
   blocks:[
    {type:"notes", html:`<p class="hint">Questions 21–23 · Complete the notes below. Write ONE WORD ONLY for each answer.</p>
     <h3>Products using renewable energy sources</h3>
     <p><b>a) Kites produced by German company</b></p>
     <ul><li>are attached to ships by long cables</li><li>can use wind power in any {{21}}</li><li>could reduce toxic emissions by 50%</li></ul>
     <p><b>b) Sports car produced by US company</b></p>
     <ul><li>uses {{22}} as a power source</li><li>will have zero emissions</li></ul>
     <p><b>c) Ethanol stoves produced in South Africa</b></p>
     <ul><li>are safer than paraffin stoves as less likely to {{23}}</li></ul>`},
    {type:"multi", nums:[24,25], max:2, q:"Questions 24–25 · Choose TWO correct answers. Who will Sylvia and Greg ask to take part in the survey?",
     opts:{A:"companies",B:"lecturers",C:"local residents",D:"schoolchildren",E:"university students"}},
    {type:"mcq", n:26, q:"What does Sylvia say about people's knowledge of renewable energy?", opts:{A:"Many people know little about it.",B:"People understand it because it has been in the news recently",C:"People are eager to find out more about it"}},
    {type:"mcq", n:27, q:"What do Sylvia and Greg decide to ask about traditional energy consumption?", opts:{A:"the best way of preventing pollution",B:"possible future developments",C:"how expensive people find it"}},
    {type:"mcq", n:28, q:"What does Greg say about nuclear power?", opts:{A:"It is not important for their survey",B:"People today have a positive attitude towards it.",C:"Some people think it is unsafe"}},
    {type:"mcq", n:29, q:"What do Sylvia and Greg agree about the cost of renewable energy?", opts:{A:"Prices will drop in the future",B:"People won't pay the high price",C:"The benefits outweigh the high cost"}},
    {type:"mcq", n:30, q:"Sylvia and Greg agree that modern windmills", opts:{A:"are the most efficient way of harnessing energy",B:"should be put in carefully selected locations",C:"make the landscape look unattractive"}}]},

 { title:"SECTION 4", instr:"Questions 31–40 · Complete the notes below. Write ONE WORD ONLY for each answer.",
   blocks:[{type:"notes", html:`
    <h3>Absence from work</h3>
    <p>Absence may be frequent or occasional.</p>
    <p><b>Main factors involved</b></p>
    <ul><li>the {{31}} of employees (e.g. females are likely to have responsibility for children)</li>
    <li>employees' {{32}} (but the evidence is inconclusive)</li>
    <li>the {{33}} of the organization (absenteeism may be acceptable)</li>
    <li>the type of work (higher absence among employees in {{34}})</li>
    <li>the {{35}} of an employee's work group</li></ul>
    <p><b>Public sector versus private sector</b></p>
    <p>Public sector has higher absence levels</p>
    <p>Possible explanation – the public sector is less {{36}}</p>
    <p>Systems may be more bureaucratic because of {{37}} factors (e.g. state controls)</p>
    <p>More recent literature suggests public sector organisations usually</p>
    <ul><li>have a {{38}} workforce</li><li>have more female and more older employees</li>
    <li>provide {{39}} for longer, with fewer restrictions</li>
    <li>are less likely to {{40}} employer</li></ul>`}]}
];

/* ============================================================
   3) RENDER – không cần sửa phần dưới
   ============================================================ */
const $ = s => document.querySelector(s);
const app = $("#app");
function fill(html, letters){
  return html.replace(/\{\{(\d+)(:sel)?\}\}/g,(m,n,sel)=>{
    if(sel){
      const o = [...letters].map(c=>`<option value="${c}">${c}</option>`).join("");
      return `<span class="num">${n}</span><select class="pick" data-q="${n}"><option value="">–</option>${o}</select>`;
    }
    return `<span class="num">${n}</span><input class="fill" data-q="${n}" autocomplete="off" spellcheck="false">`;
  });
}
function render(){
  app.innerHTML = "";
  for(const s of TEST){
    const sec = document.createElement("section");
    let h = `<h2>${s.title}</h2><p class="instr">${s.instr}</p>`;
    for(const b of s.blocks){
      if(b.type==="notes") h += `<div class="blk notes">${fill(b.html)}</div>`;
      else if(b.type==="flow"){
        h += `<div class="blk flow"><h3>${b.title}</h3>`;
        b.steps.forEach((t,i)=>{ h += (i?'<div class="arrow">↓</div>':'') + `<div class="step">${fill(t,b.letters)}</div>`; });
        h += `<div class="wordlist">${Object.entries(b.list).map(([k,v])=>`<div><b>${k}</b> ${v}</div>`).join("")}</div></div>`;
      }
      else if(b.type==="map"){
        h += `<div class="blk"><p class="instr">${b.instr}</p><img class="map" src="${MAP_SRC}" alt="Bicycle Centre Plan"><div class="maplist">`
          + b.items.map(([n,t])=>`<div>${fill(`{{${n}:sel}}`,b.letters)} ${t}</div>`).join("") + `</div></div>`;
      }
      else if(b.type==="mcq"){
        h += `<div class="q"><div class="t"><span class="num">${b.n}</span>${b.q}</div>`
          + Object.entries(b.opts).map(([k,v])=>`<label><input type="radio" name="q${b.n}" value="${k}"> ${k}. ${v}</label>`).join("") + `</div>`;
      }
      else if(b.type==="multi"){
        h += `<div class="q"><div class="t"><span class="num">${b.nums.join("–")}</span>${b.q}</div>`
          + Object.entries(b.opts).map(([k,v])=>`<label><input type="checkbox" class="multi" value="${k}"> ${k}. ${v}</label>`).join("") + `</div>`;
      }
    }
    sec.innerHTML = h; app.appendChild(sec);
  }
  // giới hạn 2 lựa chọn cho câu 24–25
  document.querySelectorAll("input.multi").forEach(c=>c.addEventListener("change",()=>{
    if(document.querySelectorAll("input.multi:checked").length>2) c.checked=false;
  }));
}
render();

/* ---------- AUDIO ---------- */
const aud=$("#aud"), playB=$("#play"), pauseB=$("#pause"), seek=$("#seek"), exam=$("#exam");
const fmt=t=>{t=Math.max(0,t|0);return (t/60|0)+":"+String(t%60).padStart(2,"0")};
function mode(){
  const e=exam.checked;
  pauseB.style.display=$("#back").style.display=$("#fwd").style.display=$("#speed").style.display=e?"none":"";
  seek.disabled=e;
  if(e){aud.playbackRate=1;}
}
exam.onchange=mode; mode();
playB.onclick=()=>{aud.play(); if(exam.checked){playB.disabled=true;playB.textContent="🔊 Đang phát…";exam.disabled=true;} else {playB.textContent="▶ Phát";}};
pauseB.onclick=()=>aud.pause();
$("#back").onclick=()=>aud.currentTime-=10;
$("#fwd").onclick=()=>aud.currentTime+=10;
$("#speed").onchange=e=>aud.playbackRate=+e.target.value;
seek.oninput=()=>aud.currentTime=seek.value/100*aud.duration;
aud.onloadedmetadata=()=>$("#dur").textContent=fmt(aud.duration);
aud.ontimeupdate=()=>{$("#cur").textContent=fmt(aud.currentTime);if(aud.duration)seek.value=aud.currentTime/aud.duration*100;};
aud.onended=()=>{playB.textContent="✔ Hết bài nghe";};

/* ---------- CHẤM ĐIỂM ---------- */
const norm=s=>String(s||"").trim().toLowerCase().replace(/\s+/g," ");
const ok=(user,key)=>key.split("/").map(norm).includes(norm(user));
function mark(el,good,msg){
  el.classList.remove("right","wrong");
  el.nextElementSibling?.classList.contains("fb")&&el.nextElementSibling.remove();
  el.classList.add(good?"right":"wrong");
  if(!good){const s=document.createElement("span");s.className="fb bad";s.textContent="→ "+msg;el.after(s);}
}
$("#submit").onclick=()=>{
  let total=0,right=0,skipped=0,lines=[];
  const check=(n,user,key,el)=>{
    if(!key){skipped++;lines.push(`${n}: ${user||"(trống)"} <i>(chưa có đáp án)</i>`);return;}
    total++; const g=ok(user,key); if(g)right++; if(el)mark(el,g,key.split("/")[0]);
    lines.push(`${n}: ${user||"(trống)"} ${g?"✔":"✘ ("+key+")"}`);
  };
  document.querySelectorAll("[data-q]").forEach(el=>{const n=el.dataset.q;check(n,el.value,ANSWERS[n],el);});
  for(let n=26;n<=30;n++){const c=document.querySelector(`input[name=q${n}]:checked`);check(n,c?c.value:"",ANSWERS[n],c?c.parentElement:null);}
  const picked=[...document.querySelectorAll("input.multi:checked")].map(c=>c.value).sort();
  const key=ANSWERS["24-25"];
  if(key[0]&&key[1]){const ks=key.map(norm).sort().map(x=>x.toUpperCase());
    [0,1].forEach(i=>{total++; if(picked.includes(key[i].toUpperCase()))right++;});
    lines.push(`24–25: ${picked.join(", ")||"(trống)"} (đáp án: ${key.join(", ")})`);
  } else {skipped+=2;lines.push(`24–25: ${picked.join(", ")||"(trống)"} <i>(chưa có đáp án)</i>`);}
  const r=$("#result");r.style.display="block";
  r.innerHTML=`<h2>${total?`Kết quả: ${right}/${total}`:"Đã ghi nhận bài làm"}</h2>`
    +(skipped?`<p class="hint">${skipped} câu chưa được chấm vì chưa điền đáp án vào biến ANSWERS trong code.</p>`:"")
    +`<div style="columns:2;font-size:14px">${lines.map(l=>`<div>${l}</div>`).join("")}</div>`;
  r.scrollIntoView({behavior:"smooth"});
};
$("#reset").onclick=()=>{render();$("#result").style.display="none";aud.pause();aud.currentTime=0;exam.disabled=false;playB.disabled=false;playB.textContent="▶ Bắt đầu nghe";};
</script>
</body>
</html>
