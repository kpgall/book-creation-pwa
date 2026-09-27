const KEY="bookCreationStudio.v01";
const tabs=["Overview","Manuscript","Illustrations","Production","Publishing","Project Log"];
const workflows={
"Children's Picture Book":{
"Manuscript":["Define concept and audience","Develop story outline","Draft manuscript","Review and revise manuscript","Lock manuscript","Break manuscript into pages / spreads"],
"Illustrations":["Approve Character Master","Approve Environment Master","Approve Style Master","Create Illustration Schedule","Generate / source scene images","Review scene sequence","Approve final illustrations"],
"Production":["Confirm trim size, bleed and margins","Set up Affinity document","Place final text and images","Preflight image resolution and layout","Export print-ready interior PDF","Create and check cover"],
"Publishing":["Prepare title, subtitle and description","Prepare keywords and categories","Set pricing and territories","Upload manuscript and cover to KDP","Run KDP preview","Order / review proof","Publish","Prepare A+ Content"]
},
"Illustrated Non-Fiction":{
"Manuscript":["Define concept and reader","Create chapter structure","Research and draft entries","Fact-check sources and claims","Edit and proofread","Lock manuscript"],
"Illustrations":["Define illustration style","Create illustration list","Produce / source artwork","Review and approve artwork"],
"Production":["Confirm trim and interior specification","Build Affinity document","Place text and artwork","Preflight","Export print-ready PDF","Create cover"],
"Publishing":["Prepare KDP metadata","Keywords and categories","Pricing","Upload and preview","Proof","Publish","A+ Content"]
}};
const generic={
"Manuscript":["Define concept and audience","Create structure","Draft content","Review and edit","Proofread","Lock manuscript"],
"Illustrations":["Decide whether artwork is required","Create artwork list","Produce / source artwork","Approve final artwork"],
"Production":["Confirm book specification","Compile interior","Preflight","Export final files","Create cover"],
"Publishing":["Prepare metadata","Keywords and categories","Pricing","Upload and preview","Proof","Publish"]
};
let data=JSON.parse(localStorage.getItem(KEY)||'{"books":[]}'), current=null, active="Overview";
const $=s=>document.querySelector(s);
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function makeWorkflow(type){let src=workflows[type]||generic,o={}; for(const [stage,items] of Object.entries(src))o[stage]=items.map(name=>({name,status:"Not Started"}));return o}
function pct(b){let a=Object.values(b.workflow).flat(),n=a.filter(x=>x.status==="Complete").length;return a.length?Math.round(n/a.length*100):0}
function renderBooks(){let box=$("#books"); if(!data.books.length){box.innerHTML='<div class="panel empty"><h3>No book projects yet</h3><p class="muted">Create your first project to generate its workflow.</p><button class="primary" onclick="openNew()">Create First Book</button></div>';return}box.innerHTML=data.books.map(b=>`<article class="card" onclick="openBook('${b.id}')"><span class="badge">${b.type}</span><h3>${esc(b.title)}</h3><p class="muted">${esc(b.series||"Standalone")} · ${esc(b.formats)}</p><div class="progress"><span style="width:${pct(b)}%"></span></div><strong>${pct(b)}% complete</strong></article>`).join("")}
function openNew(){$("#bookDialog").showModal()}
function openBook(id){current=data.books.find(b=>b.id===id);active="Overview";$("#dashboard").classList.add("hidden");$("#workspace").classList.remove("hidden");renderWorkspace()}
function renderWorkspace(){let b=current;$("#bookHeader").innerHTML=`<h2>${esc(b.title)}</h2><p class="muted">${esc(b.type)} · ${esc(b.author)} · ${esc(b.imprint)}</p>`;$("#tabs").innerHTML=tabs.map(t=>`<button class="${t===active?"active":""}" onclick="showTab('${t}')">${t}</button>`).join("");renderTab()}
function showTab(t){active=t;renderWorkspace()}
function renderTab(){let b=current,c=$("#tabContent");if(active==="Overview"){c.innerHTML=`<div class="grid"><div class="panel"><h3>Project</h3><p><b>Series:</b> ${esc(b.series||"—")}</p><p><b>Trim:</b> ${esc(b.trim||"—")}</p><p><b>Interior:</b> ${esc(b.interior)}</p><p><b>Formats:</b> ${esc(b.formats)}</p></div><div class="panel"><h3>Progress</h3><div class="progress"><span style="width:${pct(b)}%"></span></div><h2>${pct(b)}%</h2><p class="muted">Based on completed workflow tasks.</p></div></div><div class="note"><b>Generation Engine:</b> reserved for the next development phase. It will connect manuscript and illustration generation directly to each book project.</div>`;return}
if(active==="Project Log"){c.innerHTML=`<div class="panel"><h3>Project Log</h3>${b.log.map(x=>`<p><b>${x.date}</b> — ${esc(x.text)}</p>`).join("")||"<p class=muted>No entries yet.</p>"}<form onsubmit="addLog(event)"><input id="logText" placeholder="Add a decision, change or milestone…" required><button class="primary">Add Entry</button></form></div>`;return}
let tasks=b.workflow[active]||[];c.innerHTML=`<div class="panel"><h3>${active}</h3>${tasks.map((x,i)=>`<div class="task"><span>${esc(x.name)}</span><select onchange="setStatus('${active}',${i},this.value)">${["Not Started","In Progress","Review","Complete"].map(s=>`<option ${s===x.status?"selected":""}>${s}</option>`).join("")}</select></div>`).join("")}</div>`}
function setStatus(stage,i,v){current.workflow[stage][i].status=v;save();renderTab()}
function addLog(e){e.preventDefault();let v=$("#logText").value.trim();if(v){current.log.unshift({date:new Date().toLocaleDateString("en-GB"),text:v});save();renderTab()}}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
$("#newBook").onclick=openNew;$("#cancel").onclick=()=>$("#bookDialog").close();$("#back").onclick=()=>{$("#workspace").classList.add("hidden");$("#dashboard").classList.remove("hidden");renderBooks()};
$("#bookForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),b={id:Date.now().toString(36),title:f.get("title"),type:f.get("type"),series:f.get("series"),author:f.get("author"),imprint:f.get("imprint"),trim:f.get("trim"),interior:f.get("interior"),formats:f.get("formats"),workflow:makeWorkflow(f.get("type")),log:[{date:new Date().toLocaleDateString("en-GB"),text:"Project created"}]};data.books.unshift(b);save();$("#bookDialog").close();e.target.reset();renderBooks();openBook(b.id)};
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
renderBooks();