const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let T={type:'reading',title:'Reading Test – 3 Passages',parts:[''],qs:[],key:{},mins:60,name:'Thí sinh',raw:''},A={},F=new Set(),cur=1,left=0,tick=null,hid=false,notes={},curR=null,audioURL='',nid=null;

/* ---------- Parse ---------- */
function parseQs(t){const out=[];let c=null,head=[],tf=null,gp=null,gs=null,gi=null;
 t.split('\n').forEach(l=>{l=l.trim();if(!l)return;
  if(/^@img\s/i.test(l)){gi=l.slice(5).trim();return}
  if(/^@opts\s/i.test(l)){gp=l.slice(5).trim().split(/\s*\|\s*/).map(s=>{const z=s.match(/^([A-Z])[.)]\s*(.*)$/);return{k:z?z[1]:s,l:z?z[2]:s}});return}
  if(c&&/^(TRUE|FALSE|NOT GIVEN|YES|NO)$/i.test(l))return;
  let m=l.match(/^(\d{1,2})[.)]\s*(.*)$/);
  if(m){const h=head.join('\n');if(gp){gs=gp;gp=null}else if(h)gs=null;if(h)tf=/not given/i.test(h)?(/\byes\b/i.test(h)?['YES','NO','NOT GIVEN']:['TRUE','FALSE','NOT GIVEN']):null;
   c={n:+m[1],text:m[2],head:h,img:gi,opts:gs?gs.map(o=>({...o})):tf?tf.map(x=>({k:x,l:x})):[],tf:!gs&&!!tf,sel:!!gs};head=[];gi=null;out.push(c);return}
  m=l.match(/^\(?([A-H])[.)]\s+(.*)$/);
  if(m&&c){if(c.tf){c.opts=[];c.tf=false}c.opts.push({k:m[1],l:m[2]});return}
  head.push(l)});
 return out}
function parseRaw(raw){let p='',q='',a='',ex='',ps=[],qt=[];
 const parts=raw.split(/^\s*\[(PASSAGE|QUESTIONS|ANSWERS|EXPLANATIONS)\]\s*$/im);
 if(parts.length>1){for(let i=1;i<parts.length;i+=2){const k=parts[i].toUpperCase(),v=parts[i+1];if(k=='PASSAGE'){ps.push(v.trim());qt.push('')}else{if(!ps.length){ps.push('');qt.push('')}if(k=='QUESTIONS')qt[ps.length-1]+=v+'\n';else if(k=='ANSWERS')a+=v+'\n';else ex+=v+'\n'}}}
 else{const ls=raw.split('\n');let i=ls.findIndex(l=>/^\s*(questions?\s*\d+|\d{1,2}[.)]\s)/i.test(l));if(i<0)i=ls.length;p=ls.slice(0,i).join('\n');q=ls.slice(i).join('\n');ps=[p.trim()];qt=[q]}
 const key={},expl={};a.split('\n').forEach(l=>{const m=l.trim().match(/^(\d{1,2})[.):\s]+(.+)$/);if(m){const pr=m[2].split(/\s+\|\s+/);key[+m[1]]=pr[0].trim();if(pr[1])expl[+m[1]]=pr.slice(1).join(' | ').trim()}});ex.split('\n').forEach(l=>{const m=l.trim().match(/^(\d{1,2})[.):\s]+(.+)$/);if(m)expl[+m[1]]=m[2].trim()});
 const qs=[];qt.forEach((t,i)=>parseQs(t).forEach(x=>{x.part=i;qs.push(x)}));return{ps,qs,key,expl}}

/* ---------- Render ---------- */
function build(){
 $('#who').textContent='Xin chào, '+(T.name||'Thí sinh');$('#badge').textContent=T.type=='reading'?'Reading':'Listening';
 const au=T.type=='listening'?`<div class="p-4" style="border-bottom:1px solid var(--line);background:var(--bgs)"><audio id="au" preload="auto"></audio><div class="flex items-center gap-3"><button class="btn pri" id="pp" style="width:3rem">▶</button><input id="seek" type="range" min="0" max="100" step="0.1" value="0" class="flex-1"><span id="tm" class="text-sm tabular-nums" style="min-width:6rem">0:00 / 0:00</span></div><div class="flex items-center gap-2 mt-2 text-sm" style="color:var(--mute)">Âm lượng <input id="vol" type="range" min="0" max="1" step="0.05" value="1" style="width:9rem">${audioURL?'':'<span style="color:var(--acc)">Chưa có audio — chọn file:</span> <input type="file" id="afile" accept="audio/*" class="text-xs">'}</div></div>`:'';
 const body=T.parts.map((P,i)=>`<div class="pp" data-i="${i}">${P?P.split(/\n\s*\n/).filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join(''):'<p style="color:var(--mute)">Nghe audio và trả lời các câu hỏi ở bên phải. Bạn có thể bôi đen văn bản để ghi chú.</p>'}</div>`).join(''),tabs=T.parts.length>1?`<div class="flex gap-2 px-6 pt-4">${T.parts.map((_,i)=>`<button class="btn" data-pt="${i}">${T.type=='listening'?'Section':'Passage'} ${i+1}</button>`).join('')}</div>`:'';
 $('#left').innerHTML=au+tabs+`<div id="doc" class="doc"><h2>${esc(T.title)}</h2>${body}</div>`;
 if(au)wireAudio();part=-1;showPart(0);
 $('#qs').innerHTML=T.qs.map(q=>`${q.head?`<div class="hd">${esc(q.head)}</div>`:''}${q.img?`<img class="qimg" src="${esc(q.img)}" alt="">`:''}<section class="q" id="q${q.n}" data-n="${q.n}"><div class="flex gap-3"><span class="num">${q.n}</span><div class="flex-1"><p class="mb-2">${esc(q.text)}</p>${q.sel?`<select class="ti" data-n="${q.n}"><option value="">Chọn đáp án</option>${q.opts.map(o=>`<option value="${esc(o.k)}">${esc(o.k)}. ${esc(o.l)}</option>`).join('')}</select>`:q.opts.length?q.opts.map(o=>`<label class="op"><input type="radio" name="r${q.n}" value="${esc(o.k)}" data-n="${q.n}"><span>${o.k.length==1?'<b>'+o.k+'</b> ':''}${esc(o.l)}</span></label>`).join(''):`<input class="ti" data-n="${q.n}" autocomplete="off" placeholder="Nhập đáp án">`}</div><button class="fb" data-flag="${q.n}" title="Đánh dấu xem lại (Alt+F)">⚑</button></div></section>`).join('');
 nav()}
function nav(){
 const done=T.qs.filter(q=>(A[q.n]||'').trim()).length;
 $('#prog').textContent=`${done}/${T.qs.length} đã trả lời · ${F.size} đánh dấu`;
 $('#nav').innerHTML=T.qs.map(q=>`<button class="nb ${(A[q.n]||'').trim()?'ok':''} ${F.has(q.n)?'fl':''} ${q.n==cur?'cu':''}" data-go="${q.n}">${q.n}</button>`).join('');
 document.querySelectorAll('.q').forEach(e=>e.classList.toggle('cur',e.dataset.n==cur));
 document.querySelectorAll('.fb').forEach(e=>e.classList.toggle('on',F.has(+e.dataset.flag)))}
function go(n){cur=n;const pq=T.qs.find(x=>x.n==n);if(pq)showPart(pq.part);const e=$('#q'+n);if(e){e.scrollIntoView({behavior:'smooth',block:'center'});const i=e.querySelector('input,select');if(i)i.focus({preventScroll:true})}nav()}
let part=-1;
function showPart(i){if(i===part)return;part=i;document.querySelectorAll('.pp').forEach(e=>e.style.display=e.dataset.i==i?'block':'none');document.querySelectorAll('[data-pt]').forEach(b=>b.classList.toggle('pri',b.dataset.pt==i));$('#left').scrollTop=0}
$('#left').addEventListener('click',e=>{const b=e.target.closest('[data-pt]');if(b){const q=T.qs.find(x=>x.part==+b.dataset.pt);if(q)go(q.n)}});
function step(d){const i=T.qs.findIndex(q=>q.n==cur),j=Math.max(0,Math.min(T.qs.length-1,i+d));go(T.qs[j].n)}
function flag(n){F.has(n)?F.delete(n):F.add(n);nav()}
$('#nav').onclick=e=>{const b=e.target.closest('[data-go]');if(b)go(+b.dataset.go)};
$('#qs').addEventListener('input',e=>{const n=e.target.dataset.n;if(n){A[n]=e.target.value;cur=+n;nav()}});
$('#qs').addEventListener('focusin',e=>{const n=e.target.dataset.n;if(n&&cur!=n){cur=+n;const pq=T.qs.find(x=>x.n==cur);if(pq)showPart(pq.part);nav()}});
$('#qs').addEventListener('click',e=>{const b=e.target.closest('[data-flag]');if(b)flag(+b.dataset.flag)});
$('#prev').onclick=()=>step(-1);$('#next').onclick=()=>step(1);
addEventListener('keydown',e=>{if(!e.altKey||!T.qs.length)return;
 if(e.key=='ArrowRight'){e.preventDefault();step(1)}else if(e.key=='ArrowLeft'){e.preventDefault();step(-1)}else if(e.key.toLowerCase()=='f'){e.preventDefault();flag(cur)}});

/* ---------- Audio ---------- */
function wireAudio(){const a=$('#au');a.src=audioURL;const af=$('#afile');if(af)af.onchange=e=>{const f=e.target.files[0];if(f){audioURL=URL.createObjectURL(f);a.src=audioURL}};
 const f=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
 $('#pp').onclick=()=>a.paused?a.play():a.pause();
 a.onplay=()=>$('#pp').textContent='❚❚';a.onpause=()=>$('#pp').textContent='▶';
 a.ontimeupdate=a.onloadedmetadata=()=>{$('#seek').value=a.duration?a.currentTime/a.duration*100:0;$('#tm').textContent=f(a.currentTime)+' / '+f(a.duration)};
 $('#seek').oninput=e=>{if(a.duration)a.currentTime=e.target.value/100*a.duration};
 $('#vol').oninput=e=>a.volume=e.target.value}

/* ---------- Highlight & Notes ---------- */
function wrapRange(r,cls,id){const w=document.createTreeWalker($('#doc'),NodeFilter.SHOW_TEXT),ns=[];
 while(w.nextNode()){const n=w.currentNode;if(r.intersectsNode(n)&&n.nodeValue.trim())ns.push(n)}
 ns.forEach(n=>{let s=0,e=n.length;if(n===r.startContainer)s=r.startOffset;if(n===r.endContainer)e=r.endOffset;if(s>=e)return;
  const t=n.splitText(s);t.splitText(e-s);const m=document.createElement('mark');m.className=cls;if(id)m.dataset.id=id;t.parentNode.insertBefore(m,t);m.appendChild(t)})}
function clearR(r){[...$('#doc').querySelectorAll('mark')].filter(m=>r.intersectsNode(m)).forEach(m=>{delete notes[m.dataset.id];m.replaceWith(...m.childNodes)})}
const tb=$('#tb');
function showTb(x,y){tb.style.left=Math.max(8,Math.min(x,innerWidth-330))+'px';tb.style.top=Math.max(8,y)+'px';tb.style.display='flex'}
function hideTb(){tb.style.display='none'}
document.addEventListener('mousedown',e=>{if(!e.target.closest('#tb'))hideTb();if(!e.target.closest('#np')&&!e.target.closest('mark.nt'))$('#np').style.display='none'});
$('#left').addEventListener('mouseup',e=>setTimeout(()=>{const s=getSelection();
 if(s.rangeCount&&!s.isCollapsed&&$('#doc')&&$('#doc').contains(s.anchorNode)){curR=s.getRangeAt(0).cloneRange();const r=curR.getBoundingClientRect();showTb(r.left+r.width/2-150,r.top-46)}},0));
$('#left').addEventListener('contextmenu',e=>{const s=getSelection();if(s.rangeCount&&!s.isCollapsed&&$('#doc').contains(s.anchorNode)){e.preventDefault();curR=s.getRangeAt(0).cloneRange();showTb(e.clientX,e.clientY)}});
tb.addEventListener('mousedown',e=>e.preventDefault());
tb.addEventListener('click',e=>{const a=e.target.closest('button')?.dataset.a;if(!a||!curR)return;
 if(a=='c')clearR(curR);
 else if(a=='n'){const id='n'+Date.now(),rc=curR.getBoundingClientRect();wrapRange(curR,'nt',id);notes[id]='';openNote(id,rc)}
 else wrapRange(curR,a);
 getSelection().removeAllRanges();hideTb()});
function openNote(id,rc){nid=id;const np=$('#np');np.style.display='block';np.style.left=Math.max(8,Math.min(rc.left,innerWidth-290))+'px';np.style.top=Math.min(rc.bottom+8,innerHeight-190)+'px';$('#nt').value=notes[id]||'';$('#nt').focus()}
$('#nt').oninput=e=>notes[nid]=e.target.value;
$('#nclose').onclick=()=>$('#np').style.display='none';
$('#ndel').onclick=()=>{document.querySelectorAll(`mark[data-id="${nid}"]`).forEach(m=>m.replaceWith(...m.childNodes));delete notes[nid];$('#np').style.display='none'};
$('#left').addEventListener('click',e=>{const m=e.target.closest('mark.nt');if(m)openNote(m.dataset.id,m.getBoundingClientRect())});

/* ---------- Timer ---------- */
function paint(){$('#clock').textContent=hid?'••:••':String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');$('#clock').style.color=left<300&&left>0?'var(--acc)':'inherit'}
function startTimer(){clearInterval(tick);left=T.mins*60;paint();tick=setInterval(()=>{left--;paint();if(left<=0){submit(true)}},1000)}
$('#tg').onclick=()=>{hid=!hid;$('#tg').textContent=hid?'Hiện giờ':'Ẩn giờ';paint()};
$('#theme').onclick=()=>{const r=document.documentElement,d=r.dataset.theme?r.dataset.theme=='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=d?'light':'dark';try{localStorage.setItem('ielts_theme',r.dataset.theme)}catch(e){}};
try{const t=localStorage.getItem('ielts_theme');if(t)document.documentElement.dataset.theme=t}catch(e){}

/* ---------- Dialogs ---------- */
function dlg(h){$('#dlg').innerHTML=`<div class="box">${h}</div>`;$('#dlg').style.display='flex'}
function closeDlg(){$('#dlg').style.display='none'}
function openSettings(first){
 dlg(`<h2 class="text-xl font-semibold mb-4">Cài đặt đề thi</h2>
 <div class="grid grid-cols-4 gap-3 mb-3"><label class="f col-span-2">Tên thí sinh<input id="sn"></label><label class="f">Phần thi<select id="st"><option value="reading">Reading</option><option value="listening">Listening</option></select></label><label class="f">Thời gian (phút)<input id="sm" type="number" min="1"></label></div>
 <label class="f mb-3">Tiêu đề đề thi<input id="sti"></label>
 <div class="grid grid-cols-2 gap-3 mb-3"><label class="f">File audio (cho Listening)<input id="saf" type="file" accept="audio/*"></label><label class="f">hoặc URL audio<input id="sau" placeholder="https://.../audio.mp3"></label></div>
 <label class="f">Dán đề thi — dùng các dòng [PASSAGE], [QUESTIONS], [ANSWERS], [EXPLANATIONS] (tùy chọn). Giải thích có thể viết ngay sau đáp án, ví dụ "1. TRUE | lý do...", hoặc đặt trong [EXPLANATIONS]. Nếu không có nhãn, văn bản trước câu hỏi đầu tiên sẽ là passage. Mỗi câu bắt đầu bằng "1." và đáp án trắc nghiệm bằng "A.", "B."...<textarea id="sr" rows="11"></textarea></label>
 <p id="se" class="text-sm mt-2" style="color:var(--acc)"></p>
 <div class="flex gap-2 mt-3"><button class="btn" id="sgen">Tạo mã để thêm vào thư viện</button><span class="flex-1"></span>${first?'':'<button class="btn" id="sc">Đóng</button>'}<button class="btn pri" id="go">Bắt đầu thi</button></div>`);
 const fill=()=>{$('#sn').value=T.name;$('#st').value=T.type;$('#sm').value=T.mins;$('#sti').value=T.title;$('#sr').value=T.raw};fill();
 if(!first)$('#sc').onclick=openLib;
 $('#sgen').onclick=()=>{const raw=$('#sr').value,r=parseRaw(raw);
  if(!r.qs.length){$('#se').textContent='Chưa nhận diện được câu hỏi nào.';return}
  const title=$('#sti').value||'IELTS Practice Test',type=$('#st').value,mins=+$('#sm').value||60;
  T.raw=raw;T.title=title;T.type=type;T.mins=mins;
  const id=(title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'test')+'-'+Date.now().toString(36);
  const e2=s=>s.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${');
  const code="  {id:"+JSON.stringify(id)+",title:"+JSON.stringify(title)+",type:"+JSON.stringify(type)+",mins:"+mins+",raw:`"+e2(raw)+"`},";
  dlg(`<h2 class="text-xl font-semibold mb-2">Mã đề để thêm vào thư viện</h2><p class="mb-3" style="color:var(--mute)">Bấm Copy, mở file tests.js, dán vào ngay trước dấu ] ở cuối file, lưu lại rồi tải lại lên Netlify. Nếu là đề Listening có audio, thêm audio:'ten-file.mp3' vào trong dấu {}.</p><textarea id="gc" rows="12" class="ti" readonly></textarea><div class="flex gap-2 mt-3"><button class="btn" id="gb">Quay lại</button><span class="flex-1"></span><button class="btn pri" id="gcopy">Copy</button></div>`);
  $('#gc').value=code;
  $('#gcopy').onclick=()=>{$('#gc').select();try{navigator.clipboard.writeText(code)}catch(e){document.execCommand('copy')}$('#gcopy').textContent='Đã copy'};
  $('#gb').onclick=()=>openSettings(false)};
 $('#go').onclick=()=>{const raw=$('#sr').value,r=parseRaw(raw);
  if(!r.qs.length){$('#se').textContent='Không tìm thấy câu hỏi. Mỗi câu hỏi cần bắt đầu bằng số và dấu chấm, ví dụ "1. ...".';return}
  const f=$('#saf').files[0];if(f)audioURL=URL.createObjectURL(f);else if($('#sau').value.trim())audioURL=$('#sau').value.trim();
  T={type:$('#st').value,title:$('#sti').value||'IELTS Practice Test',parts:r.ps,qs:r.qs,key:r.key,expl:r.expl,mins:+$('#sm').value||60,name:$('#sn').value||'Thí sinh',raw};
  A={};F=new Set();notes={};cur=r.qs[0].n;sent=false;$('#sub').textContent='Nộp bài';
  try{localStorage.setItem('ielts_raw2',JSON.stringify({raw,type:T.type,title:T.title,mins:T.mins,name:T.name}))}catch(e){}
  build();closeDlg();startTimer()}}
$('#set').onclick=()=>openLib();$('#homeBtn').onclick=()=>openLib();

/* ---------- Submit ---------- */
$('#sub').onclick=()=>{if(sent){showResult();return}const un=T.qs.filter(q=>!(A[q.n]||'').trim()).length;
 dlg(`<h2 class="text-xl font-semibold mb-2">Nộp bài?</h2><p class="mb-4">Bạn còn <b>${un}</b> câu chưa trả lời và <b>${F.size}</b> câu đang đánh dấu xem lại. Sau khi nộp, bạn không thể sửa đáp án.</p><div class="flex justify-end gap-2"><button class="btn" id="no">Tiếp tục làm bài</button><button class="btn pri" id="yes">Nộp bài</button></div>`);
 $('#no').onclick=closeDlg;$('#yes').onclick=()=>submit(false)};
let sent=false,sentAuto=false;
function submit(auto){clearInterval(tick);sent=true;sentAuto=auto;$('#sub').textContent='Xem kết quả';document.querySelectorAll('#qs input,#qs select').forEach(i=>i.disabled=true);try{const sp=Math.min(T.mins,Math.max(1,Math.round((T.mins*60-left)/60))),tm=JSON.parse(localStorage.getItem('ielts_times')||'[]');tm.push({id:T.id,title:T.title,mins:sp,d:new Date().toLocaleDateString('vi-VN')});localStorage.setItem('ielts_times',JSON.stringify(tm))}catch(e){}annotate();showResult()}
function annotate(){
 const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim(),E=T.expl||{},hasKey=Object.keys(T.key).length>0,qs=$('#qs');
 qs.classList.remove('hide-rans','show-rex');
 T.qs.forEach(q=>{const c=$('#q'+q.n),u=A[q.n]||'',k=T.key[q.n],ex=E[q.n],ok=k&&k.split('/').some(x=>norm(x)==norm(u));
  if(hasKey)c.classList.add(ok?'rok':'rbad');
  c.insertAdjacentHTML('beforeend',`<div class="rv">${hasKey?`<b style="color:${ok?'var(--ok)':'var(--acc)'}">${ok?'Đúng':'Sai'}</b><span class="rans"> · Đáp án đúng: <b>${esc(k||'')}</b></span>`:''}${ex?`<button class="btn" data-rex="${q.n}" style="padding:.1rem .6rem;margin-left:.5rem">${XL()}</button><div class="rex" id="rex${q.n}">${esc(ex)}</div>`:''}</div>`)});
 qs.insertAdjacentHTML('afterbegin',`<div class="flex gap-2 mb-3">${hasKey?'<button class="btn" id="qa">Ẩn đáp án</button>':''}${Object.keys(E).length?'<button class="btn" id="qe">Hiện tất cả '+XL().toLowerCase()+'</button>':''}</div>`)}
$('#qs').addEventListener('click',e=>{const t=e.target,b=t.closest('[data-rex]');if(b)$('#rex'+b.dataset.rex).classList.toggle('open');
 if(t.id=='qa'){const h=$('#qs').classList.toggle('hide-rans');t.textContent=h?'Hiện đáp án':'Ẩn đáp án'}
 if(t.id=='qe'){const s=$('#qs').classList.toggle('show-rex');t.textContent=s?'Ẩn tất cả '+XL().toLowerCase()+'':'Hiện tất cả '+XL().toLowerCase()+''}});
function showResult(){const auto=sentAuto;
 const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim(),hasKey=Object.keys(T.key).length>0;let sc=0;
 const rows=T.qs.map(q=>{const u=A[q.n]||'',k=T.key[q.n],ok=k&&k.split('/').some(x=>norm(x)==norm(u));if(ok)sc++;
  return `<tr><td>${q.n}</td><td>${esc(u)||'<i style="color:var(--mute)">(trống)</i>'}</td>${hasKey?`<td class="ca">${esc(k||'')}</td><td style="color:${ok?'var(--ok)':'var(--acc)'}">${ok?'Đúng':'Sai'}</td>`:''}<td>${(T.expl||{})[q.n]?`<button class="btn" data-ex="${q.n}">${XL()}</button>`:''}</td></tr>${(T.expl||{})[q.n]?`<tr class="ex" id="ex${q.n}"><td></td><td colspan="4" style="background:var(--bgs)">${esc(T.expl[q.n])}</td></tr>`:''}`}).join('');
 const st=T.qs.map(q=>{const u=(A[q.n]||'').trim(),k=T.key[q.n];return{part:q.part||0,blank:!u,ok:!!(u&&k&&k.split('/').some(x=>norm(x)==norm(u)))}}),wr=st.filter(s=>!s.blank&&!s.ok).length,bl=st.filter(s=>s.blank).length,PN=T.parts.length,pp=Array.from({length:PN},(_,i)=>{const s=st.filter(x=>x.part==i);return (T.type=='listening'?'Part ':'Passage ')+(i+1)+': '+s.filter(x=>x.ok).length+' đúng · '+s.filter(x=>!x.ok&&!x.blank).length+' sai · '+s.filter(x=>x.blank).length+' trống'}).join('<br>');
 if(T.id&&hasKey){try{const h=JSON.parse(localStorage.getItem('ielts_hist')||'{}');h[T.id]={sc,wr,bl,n:T.qs.length,d:new Date().toLocaleDateString('vi-VN')};localStorage.setItem('ielts_hist',JSON.stringify(h))}catch(e){}}
 dlg(`<div class="flex items-center gap-3 mb-1">${ICON(hasKey&&sc/T.qs.length<.5?'daisy':'sunflower',56)}<h2 class="text-xl font-semibold">${auto?'Hết giờ — bài đã được nộp':'Đã nộp bài'}</h2></div><p class="mb-4" style="color:var(--mute)">${esc(T.name)} · ${esc(T.title)}</p>${hasKey?`<p class="text-3xl font-semibold mb-2">${sc} / ${T.qs.length} câu đúng</p><div class="flex gap-2 mb-3" style="flex-wrap:wrap"><span class="chip" style="background:#d6f5e6;color:#1f5239">✓ Đúng: ${sc}</span><span class="chip" style="background:#ffd9e2;color:#7a2e45">✗ Sai: ${wr}</span><span class="chip" style="background:#ececf3;color:#4a4560">○ Bỏ trống: ${bl}</span></div>${PN>1?`<div class="mb-4 text-sm" style="color:var(--mute);line-height:1.7">${pp}</div>`:'<div class="mb-2"></div>'}`:'<p class="mb-4">Đề chưa có phần [ANSWERS] nên không chấm điểm tự động.</p>'}<div class="flex gap-2 mb-3">${hasKey?'<button class="btn" id="tans">Ẩn đáp án</button>':''}${Object.keys(T.expl||{}).length?'<button class="btn" id="tex">Hiện tất cả '+XL().toLowerCase()+'</button>':''}</div><table><tr><th>Câu</th><th>Bạn trả lời</th>${hasKey?'<th class="ca">Đáp án</th><th>Kết quả</th>':''}<th></th></tr>${rows}</table><div class="flex gap-2 mt-4"><button class="btn" id="review">Xem lại đề</button><span class="flex-1"></span><button class="btn pri" id="again">Làm đề khác</button></div>`);
 const bx=$('#dlg .box');bx.onclick=e=>{const b=e.target.closest('[data-ex]');if(b)$('#ex'+b.dataset.ex).classList.toggle('open')};
 if($('#tans'))$('#tans').onclick=()=>{bx.classList.toggle('hide-ans');$('#tans').textContent=bx.classList.contains('hide-ans')?'Hiện đáp án':'Ẩn đáp án'};
 if($('#tex'))$('#tex').onclick=()=>{bx.classList.toggle('showex');$('#tex').textContent=bx.classList.contains('showex')?'Ẩn tất cả '+XL().toLowerCase()+'':'Hiện tất cả '+XL().toLowerCase()+''};
 $('#review').onclick=closeDlg;$('#again').onclick=()=>openLib()}

/* ---------- Library ---------- */
let LIB=Array.isArray(window.TESTS)?window.TESTS:[];
function hist(){try{return JSON.parse(localStorage.getItem('ielts_hist')||'{}')}catch(e){return{}}}
function begin(x,nm){const r=parseRaw(x.raw);audioURL=x.audio||'';T={id:x.id,type:x.type,title:x.title,parts:r.ps,qs:r.qs,key:r.key,expl:r.expl,mins:x.mins,name:nm,raw:x.raw};A={};F=new Set();notes={};cur=r.qs[0].n;sent=false;$('#sub').textContent='Nộp bài';build();closeDlg();startTimer()}
const XL=()=>T.type=='listening'?'Transcript':'Giải thích';
const ICON=(k,sz)=>{
 const pet=(n,rx,ry,off,fill)=>Array.from({length:n},(_,i)=>`<ellipse cx="32" cy="${32-off}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${i*360/n} 32 32)"/>`).join('');
 const S='stroke="#6b4a5a" stroke-opacity=".22" stroke-width="1"';
 const D={
 sakura:`<g ${S}>${pet(5,9,12,12,'#ffb7cd')}</g><circle cx="32" cy="32" r="6" fill="#ffe27a"/><g fill="#e8836f"><circle cx="32" cy="27" r="1.2"/><circle cx="36" cy="31" r="1.2"/><circle cx="34" cy="36" r="1.2"/><circle cx="29" cy="36" r="1.2"/><circle cx="28" cy="31" r="1.2"/></g>`,
 daisy:`<g ${S}>${pet(8,5,11,13,'#ffffff')}</g><circle cx="32" cy="32" r="8" fill="#ffd54a"/><circle cx="32" cy="32" r="4" fill="#ffb300" opacity=".5"/>`,
 sunflower:`<g ${S}>${pet(12,4.5,10,14,'#ffd23f')}</g><circle cx="32" cy="32" r="9.5" fill="#8a5a3c"/><circle cx="32" cy="32" r="5" fill="#6b4328"/>`,
 tulip:`<path d="M32 60V36" stroke="#6bbf8a" stroke-width="3" stroke-linecap="round"/><path d="M32 54c-8-2-12-8-13-14 7 1 12 6 13 14z" fill="#8fd3a8"/><path d="M32 50c7-2 11-7 12-12-6 1-11 5-12 12z" fill="#8fd3a8"/><g ${S}><path d="M18 14c0 14 6 24 14 24s14-10 14-24l-7 6-7-9-7 9z" fill="#ff8fb0"/><path d="M25 20l7-9 7 9c-1 10-4 17-7 17s-6-7-7-17z" fill="#ffb7cd"/></g>`,
 rainbow:`<g fill="none" stroke-width="4.5" stroke-linecap="round"><path d="M8 44a24 24 0 0 1 48 0" stroke="#ff9fb8"/><path d="M14 44a18 18 0 0 1 36 0" stroke="#ffd98a"/><path d="M20 44a12 12 0 0 1 24 0" stroke="#a6e3c3"/></g><g fill="#fff" ${S}><circle cx="12" cy="46" r="6"/><circle cx="19" cy="48" r="5"/><circle cx="52" cy="46" r="6"/><circle cx="45" cy="48" r="5"/></g>`,
 butterfly:`<g ${S}><ellipse cx="21" cy="25" rx="13" ry="11" fill="#ffb7cd" transform="rotate(-20 21 25)"/><ellipse cx="43" cy="25" rx="13" ry="11" fill="#ffb7cd" transform="rotate(20 43 25)"/><ellipse cx="23" cy="42" rx="9" ry="8" fill="#cfe3ff" transform="rotate(20 23 42)"/><ellipse cx="41" cy="42" rx="9" ry="8" fill="#cfe3ff" transform="rotate(-20 41 42)"/></g><rect x="30" y="18" width="4" height="30" rx="2" fill="#6b4a5a"/><path d="M31 18q-4-8-8-9M33 18q4-8 8-9" stroke="#6b4a5a" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="22" cy="24" r="3" fill="#fff" opacity=".7"/><circle cx="42" cy="24" r="3" fill="#fff" opacity=".7"/>`
 };
 return `<svg viewBox="0 0 64 64" width="${sz}" height="${sz}" aria-hidden="true">${D[k]||D.sakura}</svg>`};
function openLib(){const H=hist();let nm='';try{nm=localStorage.getItem('ielts_name')||''}catch(e){}
 const PAL=[['#ffd6e0','#6e2a40'],['#d6ecff','#234a68'],['#d9f5e6','#1f5239'],['#fff1c9','#614b12'],['#e6dcff','#41316f'],['#ffe0cc','#6f3d20']],KINDS=['sakura','daisy','tulip','sunflower','rainbow','butterfly'];
 const sec=(type,label)=>{const it=LIB.map((x,i)=>({x,i})).filter(o=>o.x.type==type);
  return `<section class="lsec" data-t="${type}"><h3>${label}<span>${it.length} đề</span></h3><div class="lgrid">${it.length?it.map(o=>{const p=PAL[o.i%PAL.length],h=H[o.x.id],n=parseRaw(o.x.raw).qs.length;
   return `<button class="tile" data-lib="${o.i}" style="background:${p[0]};color:${p[1]}">${ICON(KINDS[o.i%KINDS.length],46)}<b>${esc(o.x.title)}</b><span><small>${n} câu · ${o.x.mins} phút</small>${h?`<em>Gần nhất: ${h.sc}/${h.n} đúng · ${h.wr!==undefined?h.wr:h.n-h.sc} sai</em>`:''}</span></button>`}).join(''):'<p class="lempty">Chưa có đề nào 🌸</p>'}</div></section>`};
 dlg(`<div class="flex items-center gap-4 mb-3"><div class="mascot flex items-end">${ICON('tulip',52)}${ICON('sakura',78)}${ICON('daisy',52)}</div><div><h2 class="text-2xl font-semibold mb-1">Thư viện đề thi IELTS</h2><p style="color:var(--mute)">Chọn một ô để làm bài nhé! ✨ Kết quả chỉ được lưu trên trình duyệt của bạn.</p></div></div><div class="card2 mb-4" style="display:grid;grid-template-columns:1fr auto;gap:.8rem;align-items:end"><label class="f">👤 Tên người dùng<input id="ln" value="${esc(nm)}" placeholder="Nhập tên của bạn..."></label><button class="btn pri" id="saveNameBtn">Lưu tên</button></div><div class="card2 mb-4"><h3 class="font-semibold mb-2">📊 Thống kê học tập của bạn</h3><div class="flex gap-6 text-sm mb-2"><div>Số lần làm đề: <b id="statTotalTests">0</b></div><div>Tổng thời gian: <b id="statTotalMins">0</b> phút</div></div><div style="height:140px;position:relative"><canvas id="statsChart"></canvas></div><p id="statEmpty" class="text-sm" style="color:var(--mute);display:none">Chưa có dữ liệu. Làm một đề rồi nộp bài để thấy biểu đồ nhé!</p></div>${sec('reading','📖 Reading')}${sec('listening','🎧 Listening')}<div class="flex justify-between mt-2"><span class="flex gap-2"><button class="btn" id="lcustom">Dán đề của riêng bạn</button></span>${sent||T.qs.length?'<button class="btn" id="lclose">Đóng</button>':''}</div>`);
 try{const tm=JSON.parse(localStorage.getItem('ielts_times')||'[]');$('#statTotalTests').textContent=tm.length;$('#statTotalMins').textContent=tm.reduce((s,t)=>s+t.mins,0);
 if(!tm.length){$('#statsChart').style.display='none';$('#statEmpty').style.display='block'}
 else if(window.Chart){const last=tm.slice(-15);new Chart($('#statsChart').getContext('2d'),{type:'bar',data:{labels:last.map(t=>t.d),datasets:[{label:'Thời gian làm bài (phút)',data:last.map(t=>t.mins),backgroundColor:'#ec7fa3',borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{title:i=>last[i[0].dataIndex].title}}},scales:{y:{beginAtZero:true}}}})}
 else{$('#statsChart').style.display='none';$('#statEmpty').style.display='block';$('#statEmpty').textContent='Không tải được thư viện biểu đồ (cần kết nối mạng).'}}catch(e){}
 $('#saveNameBtn').onclick=()=>{const v=($('#ln').value||'').trim()||'Thí sinh';try{localStorage.setItem('ielts_name',v)}catch(e){}$('#who').textContent='Xin chào, '+v;$('#saveNameBtn').textContent='Đã lưu ✓'};
 $('#dlg .box').style.maxWidth='60rem';
 $('#dlg .box').onclick=e=>{const b=e.target.closest('[data-lib]');if(!b)return;const x=LIB[+b.dataset.lib],nm=($('#ln').value||'').trim()||'Thí sinh';try{localStorage.setItem('ielts_name',nm)}catch(e){}begin(x,nm)};
 $('#lcustom').onclick=()=>openSettings(false);if($('#lclose'))$('#lclose').onclick=closeDlg}

/* ---------- Init ---------- */
try{const s=JSON.parse(localStorage.getItem('ielts_raw2')||'null');if(s)Object.assign(T,s)}catch(e){}
build();openLib();
