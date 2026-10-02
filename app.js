(()=>{'use strict';
const C=window.MATICA_CONFIG||{},A='';const $=s=>document.querySelector(s);const stage=$('#stage');
const scenes=[
{kind:'video',name:'La sala dei numeri',title:'Chi sono i numeri primi?',desc:'Scopri il mondo dei numeri primi, la loro definizione e il Teorema fondamentale dell’aritmetica.',bg:'atrio-primi.png',preview:'panorama-primi.jpg',video:'video1'},
{kind:'pano',name:'Il regno dei numeri',title:'Esplora i numeri',bg:'panorama-primi.jpg',group:'primes',quiz:'prime'},
{kind:'video',name:'La Grecia di Euclide',title:'I primi sono infiniti?',desc:'Entra nella Grecia antica e ascolta la dimostrazione di Euclide.',bg:'scena-euclide.jpg',preview:'panorama-euclide.jpg',video:'video2'},
{kind:'pano',name:'La biblioteca di Euclide',title:'Sulle tracce di Euclide',bg:'panorama-euclide.jpg',group:'euclid'},
{kind:'video',name:'Il castello di Arsinoe',title:'Come troviamo i numeri primi?',desc:'Dalla corte tolemaica al crivello di Eratostene: scopri un metodo per trovare tutti i primi fino a un numero scelto.',bg:'scena-arsinoe.jpg',preview:'panorama-eratostene.jpg',video:'video3'},
{kind:'pano',name:'La sala di Eratostene',title:'La selezione dei numeri',bg:'panorama-eratostene.jpg',group:'eratosthenes'},
{kind:'embed',name:'Il crivello interattivo'},
{kind:'video',name:'Il mondo delle relazioni',title:'Multipli e divisori',desc:'Ogni numero ha legami con altri numeri. Scopri che cosa significa essere multiplo o divisore.',bg:'scena-divisori.jpg',preview:'panorama-divisori.jpg',video:'video6'},
{kind:'pano',name:'La stanza dei numeri parlanti',title:'Ascolta le relazioni',bg:'panorama-divisori.jpg',group:'divisors',quiz:'divisor'},
{kind:'video',name:'I criteri di divisibilità',title:'Come riconoscere i multipli?',desc:'Scopri come riconoscere i multipli di 2, 3 e 5 osservando le cifre di un numero.',bg:'panorama-criteri.jpg',preview:'panorama-criteri.jpg',video:'video7'},
{kind:'pano',name:'La stanza dei multipli',title:'Scopri i criteri di divisibilità',bg:'panorama-criteri.jpg',group:'criteria',quiz:'criteria'},
{kind:'final',name:'La prova finale'}];
let index=0, watched={},quizPassed={},viewer=null,questionState=null,sound=false,changing=false; const visited=new Set();
const primeList=[2,3,5,7,11,13,17,19,23,29];
const prime=n=>n>1&&Array.from({length:Math.floor(Math.sqrt(n))-1},(_,i)=>i+2).every(d=>n%d!==0);
function factor(n){let a=[];for(let d=2;d<=n;d++)while(n%d===0){a.push(d);n/=d}return a}
function normFactors(s){const v=s.trim().replaceAll('×','x').replaceAll('·','x').replaceAll('*','x').replace(/\s/g,'').split('x').map(Number);return v.length&&v.every(Number.isInteger)?v.sort((a,b)=>a-b):[]}
function shuffle(a){let b=a.slice();for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function btn(label,fn,cls='btn'){const e=document.createElement('button');e.className=cls;e.textContent=label;e.addEventListener('click',fn);return e}
function el(tag,cls,html){const v=document.createElement(tag);if(cls)v.className=cls;if(html!==undefined)v.innerHTML=html;return v}
let videoResizeObserver=null;
function modal(html,{wide=false,close=null}={}){videoResizeObserver?.disconnect();videoResizeObserver=null;const mb=$('.modalbox');mb.classList.toggle('videoMode',wide);$('#modal').classList.toggle('video-modal',wide);$('#modalBody').innerHTML=html;$('#modal').classList.remove('hide');$('#closeModal').onclick=()=>{hideModal();close?.()}};
function hideModal(){videoResizeObserver?.disconnect();videoResizeObserver=null;if(document.fullscreenElement?.id==='videoFrame')document.exitFullscreen?.().catch(()=>{});$('#modal').classList.remove('video-modal');$('#modal').classList.add('hide');$('#modalBody').innerHTML='';}
function escapeH(s){return String(s).replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]))}
function videoId(v){if(!v)return '';if(/^[a-zA-Z0-9_-]{11}$/.test(v))return v;try{const u=new URL(v);if(u.hostname.includes('youtu.be'))return u.pathname.slice(1);if(u.hostname.includes('youtube.com'))return u.searchParams.get('v')||u.pathname.split('/').pop();}catch{}return ''}
function playVideo(key,done){const id=videoId(C[key]);const title={video1:'Definizione e Teorema fondamentale',video2:'I numeri primi sono infiniti',video3:'Come si trovano i numeri primi',video4:'Eratostene: approfondimento',video5:'Secondo filmato di Eratostene',video6:'Multipli e divisori',video7:'Criteri di divisibilità'}[key]||'Video';
const body=id?`<h2 class="video-title">${escapeH(title)}</h2><div id="videoFrame" class="video-frame"><iframe class="video" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&playsinline=1" title="${escapeH(title)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><div class="video-toolbar"><button id="expandVideo" class="mini">⛶ Schermo intero</button><a href="https://www.youtube.com/watch?v=${encodeURIComponent(id)}" target="_blank" rel="noopener noreferrer">Apri su YouTube</a></div>`:`<div class="videoFallback"><h2>${escapeH(title)}</h2><p>Video non ancora disponibile.</p></div>`;
modal(body,{wide:true,close:()=>{if(done){watched[key]=true;render()}}});
if(id){const frame=$('#videoFrame'),iframe=frame.querySelector('iframe');const fit=()=>{const w=frame.clientWidth,h=frame.clientHeight;const width=Math.max(0,Math.min(w,h*16/9));iframe.style.width=width+'px';iframe.style.height=(width*9/16)+'px';};videoResizeObserver=new ResizeObserver(fit);videoResizeObserver.observe(frame);requestAnimationFrame(fit);const expand=$('#expandVideo');if(!frame.requestFullscreen)expand.hidden=true;else expand.onclick=()=>{frame.requestFullscreen().catch(()=>{expand.textContent='Usa ⛶ nel video';});};}
}
function travel(next){if(changing||next<0||next>=scenes.length)return;changing=true;if(viewer){viewer.dispose();viewer=null}const t=$('#transition');const flight=t.querySelector('.flight');const scene=scenes[next];flight.style.backgroundImage=scene.bg?`url('${A+scene.bg}')`: `url('${A}atrio-primi.png')`;t.classList.remove('hide');setTimeout(()=>{index=next;render()},1450);setTimeout(()=>{t.classList.add('hide');changing=false},2600)}
function render(){visited.add(index);let s=scenes[index];$('#stageLabel').textContent=s.name;$('#progress').textContent=`✦ ${visited.size} / ${scenes.length}`;stage.innerHTML='';if(s.kind==='video')renderVideoScene(s);else if(s.kind==='pano')renderPanoScene(s);else if(s.kind==='embed')renderEmbed();else renderFinal();}
const lessonGoals={
video1:{objective:'Riconoscere i numeri primi e composti e comprendere il significato della scomposizione in fattori primi.',knowledge:'Definizione di numero primo e di numero composto; perché 1 non appartiene a nessuna delle due categorie; enunciato del Teorema fondamentale dell’aritmetica.'},
video2:{objective:'Comprendere che i numeri primi sono infiniti.',knowledge:'Comprendere e saper ricostruire i passaggi della dimostrazione per assurdo dell’infinità dei numeri primi: ipotesi di un elenco finito, prodotto dei primi elencati più 1 e contraddizione.'},
video3:{objective:'Comprendere la logica del crivello di Eratostene e utilizzarlo per individuare i numeri primi entro un limite assegnato.',knowledge:'Escludere 1; conservare ogni primo individuato ed eliminare i suoi multipli maggiori del primo stesso, distinguendo i numeri primi dai composti.'},
video7:{objective:'Applicare i criteri di divisibilità per 2, 3 e 5 per riconoscere rapidamente i multipli di questi numeri.',knowledge:'Un numero è divisibile per 2 se termina con 0, 2, 4, 6 o 8; per 3 se la somma delle cifre è multipla di 3; per 5 se termina con 0 o 5. Uno stesso numero può soddisfare più criteri.'},
video6:{objective:'Acquisire i concetti di multiplo e divisore di un numero naturale e comprendere la relazione reciproca tra essi.',knowledge:'Stabilire se un numero naturale è multiplo o divisore di un numero dato, usando una moltiplicazione oppure, quando il divisore è diverso da zero, una divisione con resto zero.'}
};
function addLessonInfo(root,s){
const g=lessonGoals[s.video]||lessonGoals.video3;
const intro=el('div','intro hide');intro.id='lessonInfo';intro.innerHTML=`<button class="intro-close" aria-label="Chiudi obiettivi e da sapere">×</button><h1>${escapeH(s.title)}</h1><p><strong>OBIETTIVI:</strong> ${escapeH(g.objective)}</p><p><strong>DA SAPERE:</strong> ${escapeH(g.knowledge)}</p>`;
const tab=btn('ⓘ Obiettivi / Da sapere',()=>{intro.classList.remove('hide');tab.classList.add('hide');tab.setAttribute('aria-expanded','true');intro.querySelector('button').focus()},'intro-reopen');tab.setAttribute('aria-expanded','false');tab.setAttribute('aria-controls','lessonInfo');
intro.querySelector('button').onclick=()=>{intro.classList.add('hide');tab.classList.remove('hide');tab.setAttribute('aria-expanded','false');tab.focus()};root.append(intro,tab);
}
function renderVideoScene(s){let root=el('section','scene');root.style.backgroundImage=`url("${A+s.bg}")`;addLessonInfo(root,s);
let wrap=el('div','portal-wrap'),isWatched=!!watched[s.video],p=el('button','portal');p.setAttribute('aria-label',isWatched?'Attraversa il portale':'Apri la lezione video');p.innerHTML=`<span class="preview" style="background-image:url('${A+(isWatched?s.preview:s.bg)}')"></span><span class="playmark">${isWatched?'✧':'▶'}</span>`;p.onclick=()=>isWatched?travel(index+1):playVideo(s.video,true);wrap.append(p,el('div','portal-label',isWatched?'✦ Clicca per entrare nella stanza':'▶ Clicca per guardare la lezione'));root.append(wrap);let aside=el('div','side-actions');aside.append(btn('Riapri il video',()=>playVideo(s.video,true),'btn alt'));root.append(aside);stage.append(root)}

const factText=n=>n<2?'Non ho una scomposizione in fattori primi.':`Sono ${factor(n).join(' × ')}.`;
// Hotspots use normalized texture coordinates, shared with the panorama itself.
function region(label,x,y,w,h,text,type='numberhit',action=null){return {label:String(label),u:x,v:y,uw:w,vh:h,text,type,action}}
function makeMarkers(group){
if(group==='primes'){
const boxes=[[1,722,460,55,76],[2,455,443,65,84],[3,514,443,60,79],[5,568,444,50,72],[7,478,374,48,63],[11,530,381,48,50],[13,475,318,40,42],[17,523,325,44,45],[19,564,342,42,44],[23,584,386,50,48],[4,870,384,40,46],[6,912,369,44,54],[8,958,369,44,54],[9,1002,379,43,62],[10,897,420,48,44],[12,951,418,56,48],[15,870,471,47,51],[16,918,470,47,52],[18,970,474,49,60],[20,1027,475,66,60]];
return boxes.map(([n,x,y,w,h])=>region(n,x/1456,y/720,w/1456,h/720,n===1?'Sono 1: non sono né primo né composto. Ho un solo divisore positivo.':prime(n)?`Sono ${n}: sono primo! Ho esattamente due divisori positivi, 1 e ${n}.`:`Sono ${n}: sono composto! ${n} = ${factor(n).join(' × ')}. Ho più di due divisori positivi.`));
}
if(group==='euclid')return [
region('Euclide',.50,.51,.035,.06,'Sono Euclide. Negli Elementi trovi una dimostrazione dell’infinità dei numeri primi. Esplora le scintille: una ti rivelerà come proseguire.','spark'),
region('La dimostrazione',.48,.82,.035,.06,'I numeri primi sono infiniti. Supponiamo di averli elencati tutti e consideriamo il loro prodotto più 1. Questo numero non è divisibile per nessuno dei primi dell’elenco: è primo oppure ha un fattore primo fuori dall’elenco. In entrambi i casi, abbiamo una contraddizione.','spark'),
region('Il passaggio segreto',.648,.67,.035,.06,'Vuoi raggiungere il castello di Arsinoe? Il passaggio è nascosto nel cartello di legno davanti alla finestra. Tocca il cartello per proseguire!','spark'),
region('Un esempio concreto',.22,.30,.035,.06,'Parto da 2, 3 e 5: il loro prodotto più 1 è 31. Dividendo 31 per ciascuno dei tre numeri, il resto è sempre 1. Nessuno di loro è un divisore di 31.','spark'),
region('Attenzione: non sempre primo!',.32,.51,.035,.06,'Il prodotto di alcuni primi più 1 non è sempre primo! Per esempio, 2 × 3 × 5 × 7 × 11 × 13 + 1 = 30031 = 59 × 509. Il punto decisivo è che i suoi fattori primi non erano nell’elenco di partenza.','spark'),
region('Che cosa significa per assurdo?',.085,.47,.035,.06,'In una dimostrazione per assurdo suppongo vero il contrario di ciò che voglio dimostrare. Se ne ricavo una contraddizione, devo abbandonare l’ipotesi iniziale. Qui l’ipotesi è che i numeri primi siano soltanto un numero finito.','spark'),
region('Non esiste il più grande',.925,.45,.035,.06,'Dire che i primi sono infiniti significa anche che non esiste un numero primo più grande di tutti gli altri. Qualunque primo tu scelga, esiste un primo maggiore.','spark'),
region('Cartello: entra nel castello di Arsinoe',.75,.491,.067,.096,'','scenehit',()=>travel(4))];
if(group==='eratosthenes')return [
region('Eratostene',.60,.52,.035,.06,'Sono Eratostene. Il mio crivello permette di trovare i numeri primi eliminando i numeri composti. Vuoi provarlo? Tocca la tavola con i numeri appoggiata sul tavolo: è il passaggio al crivello interattivo!','spark'),
region('Da dove cominciare',.31,.73,.035,.06,'Escludo 1, che non è primo. Parto da 2: lo conservo e cancello tutti i suoi multipli maggiori di 2.','spark'),
region('Come proseguire',.73,.75,.035,.06,'Scelgo il più piccolo numero non ancora cancellato dopo l’ultimo primo trovato. Lo conservo e cancello i suoi multipli maggiori del numero stesso. Ripeto il procedimento.','spark'),
region('Quando fermarsi',.28,.48,.035,.06,'Per trovare i primi fino a N, basta eliminare i multipli dei primi non superiori a √N. Ogni composto non maggiore di N ha almeno un fattore primo non superiore a √N.','spark'),
region('Perché cominciare dal quadrato?',.125,.36,.035,.06,'Quando arrivo al primo p, posso iniziare a cancellare da p × p: i multipli precedenti hanno già un fattore primo più piccolo. Con 5, per esempio, 10, 15 e 20 sono già stati cancellati; il primo nuovo numero da eliminare è 25.','spark'),
region('Un solo primo pari',.425,.31,.035,.06,'Il 2 resta nel crivello, mentre tutti i numeri pari maggiori di 2 vengono eliminati. Ecco perché 2 è l’unico numero primo pari!','spark'),
region('I primi fino a 100',.815,.39,.035,.06,'Per trovare i primi fino a 100 bastano i passaggi con 2, 3, 5 e 7: sono i primi non superiori a √100 = 10. I numeri maggiori di 1 rimasti sono tutti primi.','spark'),
region('Dispari non significa primo',.91,.57,.035,.06,'Essere dispari non basta per essere primo: 9 = 3 × 3, 15 = 3 × 5 e 25 = 5 × 5 sono composti. Il crivello elimina anche questi numeri, nei passaggi con 3 o con 5.','spark'),
region('Tavola: entra nel crivello interattivo',.502,.827,.24,.17,'','scenehit',()=>travel(6))];
if(group==='criteria')return criteriaRegions();
return divisorRegions();
}
function divisorRegions(){
const rows=[
[20,270,530,190,152,'Sono 20: sono multiplo di 2, 4, 5 e 10, e anche di 1 e 20.'],
[6,483,529,115,142,'Sono 6: sono divisore di 12 e multiplo di 2 e 3. Infatti 12 = 6 × 2 e 6 = 2 × 3.'],
[12,684,527,153,141,'Sono 12: sono multiplo di 3 e 4. I miei divisori positivi sono 1, 2, 3, 4, 6 e 12.'],
[15,892,529,151,136,'Sono 15: sono multiplo di 3 e 5. Infatti 15 = 3 × 5.'],
[24,1127,531,185,140,'Sono 24: sono multiplo di 6, 8 e 12. Sono anche divisore di 48.'],
[1,1340,528,94,145,'Sono 1: sono divisore di ogni numero naturale positivo. Non sono né primo né composto.'],
[9,1551,529,117,147,'Sono 9: sono multiplo di 3 e divisore di 18, 27 e 36.']];
return rows.map(([n,x,y,w,h,text])=>region(n,x/1774,y/887,w/1774,h/887,text));}

function criteriaRegions(){
const rows=[
[22,301,348,203,162,'Sono 22: finisco con 2, una cifra pari, quindi sono multiplo di 2.'],
[8,603,346,124,166,'Sono 8: sono pari, quindi sono divisibile per 2.'],
[16,886,347,203,162,'Sono 16: finisco con 6, una cifra pari, quindi sono multiplo di 2.'],
[27,1175,348,203,163,'Sono 27: la somma delle mie cifre è 2 + 7 = 9. Poiché 9 è multiplo di 3, anch’io sono multiplo di 3.'],
[81,1470,344,205,170,'Sono 81: la somma delle mie cifre è 8 + 1 = 9, quindi sono multiplo di 3.'],
[51,282,572,203,166,'Sono 51: la somma delle mie cifre è 5 + 1 = 6, quindi sono multiplo di 3.'],
[21,589,575,208,164,'Sono 21: la somma delle mie cifre è 2 + 1 = 3, quindi sono multiplo di 3.'],
[54,890,576,225,168,'Sono 54: la somma delle mie cifre è 5 + 4 = 9, quindi sono multiplo di 3. Sono anche pari, quindi sono divisibile anche per 2.'],
[20,1190,576,229,169,'Sono 20: finisco con 0, quindi sono pari e sono divisibile sia per 2 sia per 5.'],
[35,1497,575,225,168,'Sono 35: finisco con 5, quindi sono divisibile per 5.']];
return rows.map(([n,x,y,w,h,text])=>region(n,x/1774,y/887,w/1774,h/887,text));}

class Pano{
constructor(node,file){
this.node=node;this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(72,node.clientWidth/node.clientHeight,1,1100);
this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.outputEncoding=THREE.sRGBEncoding;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));this.renderer.setSize(node.clientWidth,node.clientHeight);node.append(this.renderer.domElement);
this.lon=180;this.lat=0;this.fov=72;this.markerObjects=[];this.listeners=[];
const geo=new THREE.SphereGeometry(500,96,64);geo.scale(-1,1,1);this.mat=new THREE.MeshBasicMaterial({color:0xffffff});this.sphere=new THREE.Mesh(geo,this.mat);this.scene.add(this.sphere);
new THREE.TextureLoader().load(A+file,tex=>{if(this.dead){tex.dispose();return}tex.encoding=THREE.sRGBEncoding;this.mat.map=tex;this.mat.needsUpdate=true},undefined,()=>{if(!this.dead)this.node.insertAdjacentHTML('beforeend','<p class="pano-hint">Immagine panoramica non caricata.</p>')});
this.bubble=el('div','pano-bubble hide');this.bubble.setAttribute('role','status');this.bubble.append(btn('×',()=>this.closeBubble(),'bubble-close'),this.bubbleText=el('p'));node.append(this.bubble);this.install();this.tick();
}
listen(n,e,f,o){n.addEventListener(e,f,o);this.listeners.push([n,e,f,o])}
closeBubble(){this.active=null;this.bubble.classList.add('hide')}
install(){const c=this.node;let start=null,old=null,pointerId=null;this.moved=false;
// Reset the gesture BEFORE excluding controls: dragging must never disable later clicks.
this.listen(c,'pointerdown',e=>{this.moved=false;this.drag=false;start=old=null;pointerId=null;if(e.isPrimary===false||e.button>0||e.target.closest('.pano-controls,.pano-bubble'))return;start=old=[e.clientX,e.clientY];pointerId=e.pointerId;this.drag=true;},true);
this.listen(c,'pointermove',e=>{if(!this.drag||!old||e.pointerId!==pointerId)return;const dx=e.clientX-old[0],dy=e.clientY-old[1];if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>7)this.moved=true;if(this.moved){this.lon-=dx*.13;this.lat=Math.max(-60,Math.min(60,this.lat+dy*.13));c.classList.add('dragging')}old=[e.clientX,e.clientY]});
const stop=e=>{if(e.pointerId!==pointerId)return;this.drag=false;old=null;pointerId=null;c.classList.remove('dragging');if(e.type==='pointercancel')this.moved=false};this.listen(window,'pointerup',stop);this.listen(window,'pointercancel',stop);
this.listen(c,'click',e=>{const dragged=this.moved;this.moved=false;if(dragged&&e.detail!==0&&!e.target.closest('.pano-controls,.pano-bubble')){e.stopPropagation();e.preventDefault();return}if(!e.target.closest('button,.pano-bubble'))this.closeBubble()},true);
this.listen(c,'wheel',e=>{if(e.target.closest('.pano-bubble,.pano-controls'))return;e.preventDefault();this.zoom(e.deltaY*.05)},{passive:false});
this.ro=new ResizeObserver(()=>{if(this.dead)return;const w=c.clientWidth,h=c.clientHeight;if(w&&h){this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h)}});this.ro.observe(c);
}
markers(items){this.markerObjects=items.map(item=>{const b=btn(item.type==='spark'?'✦':item.type==='signquiz'?'Affronta i quesiti':'',()=>{if(item.action){this.closeBubble();item.action();return}this.active=item;this.bubbleText.textContent=item.text;this.bubble.classList.remove('hide')},'pano-marker '+item.type);b.setAttribute('aria-label',item.type==='signquiz'?'Affronta i quesiti':item.action?item.label:'Esplora: '+item.label);this.node.append(b);return {item,b}})}
project(u,v){const t=u*Math.PI*2,p=v*Math.PI;const vec=new THREE.Vector3(490*Math.sin(p)*Math.cos(t),490*Math.cos(p),490*Math.sin(p)*Math.sin(t));if(vec.clone().applyMatrix4(this.camera.matrixWorldInverse).z>=-1)return null;vec.project(this.camera);return {x:(vec.x+1)*this.node.clientWidth/2,y:(1-vec.y)*this.node.clientHeight/2}}
tick(){if(this.dead)return;const phi=THREE.MathUtils.degToRad(90-this.lat),theta=THREE.MathUtils.degToRad(this.lon);this.camera.lookAt(new THREE.Vector3(500*Math.sin(phi)*Math.cos(theta),500*Math.cos(phi),500*Math.sin(phi)*Math.sin(theta)));this.camera.updateMatrixWorld();const w=this.node.clientWidth,h=this.node.clientHeight;
for(const {item,b} of this.markerObjects){const q=this.project(item.u,item.v);const corners=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([x,y])=>this.project(item.u+x*item.uw/2,item.v+y*item.vh/2));if(!q||corners.some(c=>!c)||q.x< -100||q.x>w+100||q.y< -100||q.y>h+100){b.style.display='none';continue}const xs=corners.map(c=>c.x),ys=corners.map(c=>c.y);const bw=item.type==='spark'?46:Math.max(44,Math.max(...xs)-Math.min(...xs)),bh=item.type==='spark'?46:Math.max(44,Math.max(...ys)-Math.min(...ys));b.style.cssText=`display:block;left:${q.x}px;top:${q.y}px;width:${bw}px;height:${bh}px`;
}
if(this.active){const q=this.project(this.active.u,this.active.v-this.active.vh/2);if(!q||q.x<0||q.x>w||q.y<0||q.y>h)this.bubble.style.visibility='hidden';else{this.bubble.style.visibility='visible';const bw=this.bubble.offsetWidth,bh=this.bubble.offsetHeight;this.bubble.style.left=Math.max(8,Math.min(w-bw-8,q.x-bw/2))+'px';this.bubble.style.top=Math.max(w<=750?150:72,Math.min(h-bh-105,q.y-bh-12))+'px';}}
this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(()=>this.tick());
}
zoom(d){this.fov=Math.max(32,Math.min(98,this.fov+d));this.camera.fov=this.fov;this.camera.updateProjectionMatrix()}
dispose(){this.dead=true;cancelAnimationFrame(this.raf);this.ro?.disconnect();this.listeners.forEach(([n,e,f,o])=>n.removeEventListener(e,f,o));this.mat.map?.dispose();this.mat.dispose();this.sphere.geometry.dispose();this.renderer.dispose();this.renderer.domElement.remove()}
}
function openSceneQuiz(s){viewer?.closeBubble();if(quizPassed[index]){travel(index+1);return}startQuiz(s.quiz,5,3,()=>{quizPassed[index]=true;travel(index+1)})}
function renderPanoScene(s){const node=el('div','pano');stage.append(node);if(!window.THREE){node.innerHTML=`<div class="scene" style="background-image:url('${A+s.bg}')"><div class="intro"><h2>Impossibile caricare il visore 360°</h2><p>Serve la libreria Three.js e una connessione a Internet.</p></div></div>`;return}viewer=new Pano(node,s.bg);
const hints={primes:'Tocca i numeri per conoscerli. Il cartello di legno apre i quesiti.',euclid:'Tocca le scintille e scopri il passaggio segreto.',eratosthenes:'Tocca le scintille: Eratostene ti rivelerà come entrare nel crivello.',divisors:'Tocca i numeri, poi affronta i quesiti con il pulsante in alto.',criteria:'Tocca i numeri e scopri i criteri per 2, 3 e 5. Poi affronta i quesiti in alto.'};
const hint=el('div','pano-hint',hints[s.group]);node.append(hint);setTimeout(()=>hint.remove(),7000);
const markers=makeMarkers(s.group);
if(s.group==='primes')markers.push(region('Affronta i quesiti',.766,.509,.057,.075,'','signquiz',()=>openSceneQuiz(s)));
viewer.markers(markers);
const controls=el('div','pano-controls');node.append(controls);const zi=btn('＋',()=>viewer.zoom(-10),'mini'),zo=btn('−',()=>viewer.zoom(10),'mini');zi.setAttribute('aria-label','Aumenta zoom');zo.setAttribute('aria-label','Riduci zoom');controls.append(zi,zo);
if(s.group==='primes')viewer.lon=120;
if(s.group==='euclid'){viewer.lon=220;viewer.lat=-12;}
if(s.group==='eratosthenes'){viewer.lon=205;viewer.lat=-22;controls.append(btn('▶ Video Eratostene',()=>playVideo('video4'),'mini'));if(C.video5)controls.append(btn('▶ Secondo video',()=>playVideo('video5'),'mini'));}
if(s.group==='criteria'){viewer.lon=180;viewer.lat=-6;}
if(s.group==='divisors'||s.group==='criteria')controls.append(btn(quizPassed[index]?'✓ Prosegui':'✦ Affronta i quesiti',()=>openSceneQuiz(s),'btn'));
}
function renderEmbed(){let root=el('div','scene');root.innerHTML=`<iframe id="crivello" class="embed embedScene" title="Crivello Matica" loading="eager" src="${escapeH(C.crivello)}"></iframe>`;let bar=el('div','embedToolbar');bar.append(btn('Apri in un’altra scheda',()=>window.open(C.crivello,'_blank','noopener'),'btn alt'));bar.append(btn('✧ Ho esplorato · prosegui',()=>travel(index+1)));root.append(bar);stage.append(root)}
function createPrimeQuiz(){const nums=shuffle(Array.from({length:30},(_,i)=>i+1));let selected=nums.slice(0,5);if(!selected.includes(1)&&Math.random()<.5)selected[0]=1;return selected.map((n,i)=>{if(n===1||prime(n)||i%2===0)return {type:'choice',text:`Il numero ${n} è…`,choices:['Primo','Composto','Né primo né composto'],correct:n===1?2:prime(n)?0:1,explanation:n===1?'1 ha un solo divisore positivo.':prime(n)?`${n} ha esattamente due divisori positivi.`:`${n} = ${factor(n).join(' × ')}.`};return {type:'factors',text:`Scomponi ${n} in fattori primi. Scrivi per esempio 2×3×3.`,n,explanation:`${n} = ${factor(n).join(' × ')}. L’ordine dei fattori non conta.`}})}
function createDivQuiz(){const pool=[];for(let a=2;a<=12;a++)for(let b=2;b<=12;b++){pool.push({type:'choice',text:`${a} è divisore di ${a*b}?`,choices:['Sì','No'],correct:0,explanation:`${a*b} = ${a} × ${b}.`});pool.push({type:'choice',text:`${a*b} è multiplo di ${a}?`,choices:['Sì','No'],correct:0,explanation:`${a*b} = ${a} × ${b}.`});let n=a*b+1;pool.push({type:'choice',text:`${a} è divisore di ${n}?`,choices:['Sì','No'],correct:1,explanation:`${n} diviso ${a} non dà un quoziente intero.`})}return shuffle(pool).slice(0,5)}
// Bank of 50+ independently constructed, editable questions; options randomized at runtime.
function finalBank(){let q=[
['Quale definizione descrive un numero primo?',['Un naturale maggiore di 1 con esattamente due divisori positivi','Un numero divisibile per 1 e per 2','Un naturale con un solo divisore'],0,'La definizione richiede esattamente due divisori: 1 e se stesso.'],
['Il numero 1 è…',['Primo','Composto','Né primo né composto'],2,'1 possiede un unico divisore positivo.'],
['Qual è l’unico numero primo pari?',['2','4','6'],0,'Ogni numero pari maggiore di 2 è divisibile anche per 2.'],
['Quale enunciato esprime il Teorema fondamentale dell’aritmetica?',['Ogni naturale maggiore di 1 è primo oppure si scrive come prodotto di primi, in modo unico a meno dell’ordine','Ogni naturale è somma di due primi','Ogni numero primo è pari'],0,'La scomposizione in primi esiste ed è unica, salvo l’ordine dei fattori.'],
['Quanti numeri primi esistono?',['Infiniti','Esattamente cento','Un numero finito ancora sconosciuto'],0,'Euclide dimostrò che non può esistere un elenco completo e finito di tutti i primi.'],
['Nel crivello di Eratostene, dopo aver considerato il 2…',['Elimino i suoi multipli maggiori di 2','Elimino il 2','Elimino tutti i dispari'],0,'Il 2 deve restare: è un numero primo.'],
['Se a è divisore di b, allora…',['b è multiplo di a','a è necessariamente maggiore di b','b è sempre primo'],0,'La relazione tra divisore e multiplo è reciproca.'],
['Quale affermazione è corretta?',['Ogni naturale positivo è multiplo di 1','1 è primo','Ogni dispari è primo'],0,'Qualunque n è 1 × n.'],
['Un numero composto maggiore di 1 è…',['Un numero con più di due divisori positivi','Un numero dispari','Un numero che termina in 0'],0,'I composti possiedono altri divisori oltre a 1 e a se stessi.']
].map(([text,choices,correct,explanation])=>({type:'choice',text,choices,correct,explanation}));
for(let n of [4,6,8,9,10,12,14,15,16,18,20,21,24,25,27,28,30,32,36,40,42,45,48,49,50,54,60,63,70,72,75,81,84,90,96,100])q.push({type:'factors',text:`Scomponi ${n} in fattori primi.`,n,explanation:`${n} = ${factor(n).join(' × ')}.`});
for(let n of [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,51,57,61,67,71,77,79,83,89,91,97])q.push({type:'choice',text:`Il numero ${n} è primo o composto?`,choices:['Primo','Composto'],correct:prime(n)?0:1,explanation:prime(n)?`${n} è primo.`:`${n} = ${factor(n).join(' × ')}.`});
for(let [a,b] of [[2,18],[3,21],[4,28],[5,45],[6,42],[7,49],[8,72],[9,81],[10,100],[11,99],[12,108],[4,30],[5,32],[7,48],[9,50],[8,54]])q.push({type:'choice',text:`${a} è divisore di ${b}?`,choices:['Sì','No'],correct:b%a===0?0:1,explanation:b%a===0?`${b} = ${a} × ${b/a}.`:`La divisione di ${b} per ${a} non è esatta.`});
for(let [a,b] of [[18,3],[25,5],[40,10],[48,6],[64,8],[72,9],[81,3],[84,7],[91,13],[50,6],[33,5],[42,8]])q.push({type:'choice',text:`${a} è multiplo di ${b}?`,choices:['Sì','No'],correct:a%b===0?0:1,explanation:a%b===0?`${a} = ${b} × ${a/b}.`:`${a} diviso ${b} non è un intero.`});return q;}
function criteriaBank(){const out=[];for(const n of [8,16,22,27,81,51,21,54,20,35,14,18,23,25,30,42,45,50,63,70,75,82,90,91,102,105,111,124,135,152,201,225,310,402,507,810]){
const digit=n%10,sum=String(n).split('').reduce((a,c)=>a+Number(c),0);
for(const d of [2,3,5]){const yes=n%d===0;let reason=d===2?`La cifra delle unità è ${digit}: ${yes?'è pari':'è dispari'}.`:d===3?`La somma delle cifre è ${sum}, che ${yes?'è':'non è'} multipla di 3.`:`Il numero termina con ${digit}: ${yes?'termina con 0 o 5':'non termina con 0 o 5'}.`;out.push({type:'choice',topic:'criteria',criterion:d,key:`${n}-${d}`,text:`Usando i criteri di divisibilità, ${n} è divisibile per ${d}?`,choices:['Sì','No'],correct:yes?0:1,explanation:reason});}
const both=n%10===0;out.push({type:'choice',topic:'criteria',criterion:10,key:`${n}-both`,text:`${n} è divisibile sia per 2 sia per 5?`,choices:['Sì','No'],correct:both?0:1,explanation:both?`${n} termina con 0: è pari ed è anche divisibile per 5.`:`${n} non termina con 0, quindi non è divisibile contemporaneamente per 2 e per 5.`});}return out;}
function createCriteriaQuiz(total=5){const bank=shuffle(criteriaBank()),out=[2,3,5,10].map(d=>bank.find(q=>q.criterion===d));const used=new Set(out.map(q=>q.key));return shuffle(out.concat(bank.filter(q=>!used.has(q.key)).slice(0,Math.max(0,total-4))));}
function finalQuestions(){const bank=shuffle(finalBank());const out=[...bank.filter(q=>q.type==='factors').slice(0,5),...bank.filter(q=>q.type==='choice').slice(0,6),...createCriteriaQuiz(4)];return shuffle(out).map(q=>q.type!=='choice'?q:(()=>{let c=shuffle(q.choices.map((v,i)=>({v,good:i===q.correct})));return {...q,choices:c.map(x=>x.v),correct:c.findIndex(x=>x.good)}})())}
function startQuiz(type,total,threshold,success){const qs=type==='prime'?createPrimeQuiz():type==='divisor'?createDivQuiz():type==='criteria'?createCriteriaQuiz():finalQuestions();questionState={qs:qs.slice(0,total),i:0,score:0,answered:false,threshold,success,type};renderQ()}
function checkAnswer(q,value){if(q.type==='factors'){const ar=normFactors(value);return ar.length===factor(q.n).length&&ar.every((x,i)=>x===factor(q.n)[i])}return Number(value)===q.correct}
function renderQ(){let S=questionState;if(!S)return;if(S.i>=S.qs.length)return endQuiz();const q=S.qs[S.i];let html=`<div class="qcard"><div class="qcount">Domanda ${S.i+1}/${S.qs.length} · Risposte corrette: ${S.score}</div><h2>${escapeH(q.text)}</h2><div id="qAnswers" class="answers">${q.type==='factors'?'<input id="factorAnswer" type="text" aria-label="Scomposizione in fattori primi" placeholder="es. 2 × 2 × 3" autocomplete="off">':q.choices.map((c,i)=>`<button class="answer" data-choice="${i}">${escapeH(c)}</button>`).join('')}</div><p id="feedback" class="feedback" aria-live="polite">Ragiona con calma. Ogni domanda vale un punto.</p><button id="check" class="btn" disabled>Conferma risposta</button><button id="nextQ" class="btn alt hide">${S.i+1===S.qs.length?'Vedi risultato':'Domanda successiva →'}</button></div>`;modal(html);let choice=null;$('#qAnswers').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{choice=Number(b.dataset.choice);$('#qAnswers').querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b));$('#check').disabled=false});if(q.type==='factors'){const input=$('#factorAnswer');input.addEventListener('input',()=>$('#check').disabled=!input.value.trim());input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('#check').disabled)$('#check').click()})}
$('#check').onclick=()=>{let val=q.type==='factors'?$('#factorAnswer').value:choice;let correct=checkAnswer(q,val);if(correct)S.score++;$('#feedback').textContent=(correct?'✓ Risposta corretta. ':'✕ Non esatta. ')+q.explanation;$('#qAnswers').querySelectorAll('button,input').forEach(b=>b.disabled=true);$('#check').classList.add('hide');$('#nextQ').classList.remove('hide');$('#closeModal').disabled=true;};$('#nextQ').onclick=()=>{S.i++;hideModal();$('#closeModal').disabled=false;renderQ()}}
function endQuiz(){const s=questionState;$('#closeModal').disabled=false;let passed=s.score>=s.threshold;modal(`<div class="qcard"><h2>${passed?'✦ Portale sbloccato!':'✧ Puoi riprovare'}</h2><p>Hai ottenuto <strong>${s.score}/${s.qs.length}</strong>. Soglia richiesta: <strong>${s.threshold}/${s.qs.length}</strong>.</p><p>${passed?'Il tuo viaggio può continuare.':'Torna a esplorare, poi ritenta: saranno estratte nuove domande.'}</p><button id="quizDone" class="btn">${passed?'Prosegui →':'Torna alla stanza'}</button></div>`);$('#quizDone').onclick=()=>{hideModal();questionState=null;if(passed)s.success()};}
function renderFinal(){let root=el('div','scene final-scene');root.style.backgroundImage=`url('${A}atrio-primi.png')`;root.innerHTML='<div class="intro"><h1>Il portale della conoscenza</h1><p>Hai esplorato il mondo dei numeri primi, incontrato Euclide, sperimentato il crivello, le relazioni tra multipli e divisori e i criteri di divisibilità per 2, 3 e 5.</p><p><b>Prova conclusiva:</b> 15 quesiti casuali, uno alla volta. Con almeno 9 punti ricevi l’attestato.</p></div>';const wrap=el('div','portal-wrap');wrap.append(btn('✦ Inizia la prova finale (15 domande)',()=>startQuiz('final',15,9,()=>{hideModal();showCert(questionState?.score??lastFinalScore)})));root.append(wrap,bonusLinks());stage.append(root);}
let lastFinalScore=0; // Used to preserve the result once the quiz modal closes.
// Patch: keep final score before invoking certificate callback, with an explicit score argument.
const originalEnd=endQuiz;
endQuiz=function(){let s=questionState;if(s?.type==='final')lastFinalScore=s.score;originalEnd()};
function showCert(score){score=Number.isInteger(score)?score:lastFinalScore;if(score<9){render();return}let level=score===15?'ECCELLENTE':score>=13?'OTTIMO':score>=11?'BUONO':'BASE';stage.innerHTML=`<div id="finish"><div class="certwrap"><div class="certificate"><div style="font-size:28px">✦ MATICA ✦</div><h1>Attestato del viaggio<br>dei numeri primi</h1><p>Si conferisce a</p><input id="studentName" maxlength="65" placeholder="Inserisci il tuo nome" aria-label="Nome dello studente"><h2>${level}</h2><p>per aver completato il percorso interattivo e superato la prova finale con</p><div style="font-size:42px;font-weight:bold">${score} / 15</div><p>Con Mate e Carl • Il viaggio nella matematica</p><small>© Claudia Bartoli — attestato di completamento del percorso didattico</small></div><div class="certButtons"><button id="downloadCert" class="btn">Scarica attestato PDF</button><button id="retryFinal" class="btn alt">Riprova il test</button></div></div></div>`;$('#finish .certwrap').append(bonusLinks());$('#downloadCert').onclick=()=>downloadCertificate(score,level);$('#retryFinal').onclick=()=>{index=scenes.findIndex(s=>s.kind==='final');render()}}
function bonusLinks(){const block=el('aside','bonus-links');block.innerHTML='<span>Bonus di approfondimento</span><a href="https://youtu.be/UwHqrfTZjMs?si=L9j_bi-IY81W3Wvg" target="_blank" rel="noopener noreferrer">▶ Conosci Euclide</a><a href="https://youtu.be/huQlt7OHAg4?si=6x-UBFbwEMaiw6HQ" target="_blank" rel="noopener noreferrer">▶ Conosci Eratostene</a><a href="https://www.youtube.com/watch?v=_exUBLV61ho&amp;t=4s" target="_blank" rel="noopener noreferrer">▶ Numeri primi in tasca</a><a href="https://youtu.be/tS86M_fq8WI" target="_blank" rel="noopener noreferrer">▶ Esiste una Formula?</a>';return block;}
function certificateCanvas(name,score,level){
const canvas=document.createElement('canvas');canvas.width=1684;canvas.height=1190;const ctx=canvas.getContext('2d');
if(!ctx)throw new Error('Impossibile creare l’attestato.');
const bg=ctx.createLinearGradient(0,0,0,1190);bg.addColorStop(0,'#fff9e9');bg.addColorStop(1,'#f3dfac');ctx.fillStyle=bg;ctx.fillRect(0,0,1684,1190);
ctx.strokeStyle='#aa7a30';ctx.lineWidth=5;ctx.strokeRect(45,45,1594,1100);ctx.lineWidth=2;ctx.strokeRect(60,60,1564,1070);
ctx.textAlign='center';ctx.fillStyle='#493019';
const line=(text,y,size,bold=false,family='Georgia')=>{ctx.font=`${bold?'bold ':''}${size}px ${family}`;ctx.fillText(text,842,y);};
line('MATICA',153,42,true);line('IL VIAGGIO DEI NUMERI PRIMI',204,24,false,'Arial');
line('Attestato di completamento',325,64,true);line('Si conferisce a',418,30);
let size=56;ctx.font=`bold ${size}px Arial`;while(ctx.measureText(name).width>1380&&size>18){size--;ctx.font=`bold ${size}px Arial`;}ctx.fillText(name,842,513);
ctx.strokeStyle='#c3a064';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(250,545);ctx.lineTo(1434,545);ctx.stroke();
line('per aver completato il percorso interattivo',618,30);line('e superato la prova finale con',665,30);
line(`${score} / 15`,777,80,true);line(`Livello ${level}`,849,36,true,'Arial');
line('Con Mate e Carl • Il viaggio nella matematica',963,26);
line('© Claudia Bartoli',1040,24,true);line('Attestato di completamento del percorso didattico',1080,21);
return canvas;
}
// A self-contained, single-page PDF: canvas preserves accents and names without external fonts/libraries.
function certificatePdf(jpeg,width,height){
const enc=new TextEncoder(),chunks=[],offsets=[0];let length=0;
const push=data=>{const bytes=typeof data==='string'?enc.encode(data):data;chunks.push(bytes);length+=bytes.length;};
const object=(n,body)=>{offsets[n]=length;push(`${n} 0 obj\n${body}\nendobj\n`);};
push('%PDF-1.4\n');object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
offsets[4]=length;push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);push(jpeg);push('\nendstream\nendobj\n');
const content='q\n841.89 0 0 595.28 0 0 cm\n/Im0 Do\nQ\n';object(5,`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream`);
const xref=length;push('xref\n0 6\n0000000000 65535 f \n');for(let n=1;n<=5;n++)push(`${String(offsets[n]).padStart(10,'0')} 00000 n \n`);push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
return new Blob(chunks,{type:'application/pdf'});
}
function downloadCertificate(score,level){
const input=$('#studentName'),name=input.value.trim();if(!name){alert('Inserisci prima il tuo nome.');input.focus();return;}
try{const canvas=certificateCanvas(name,score,level),encoded=canvas.toDataURL('image/jpeg',.95).split(',')[1],jpeg=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const blob=certificatePdf(jpeg,canvas.width,canvas.height),url=URL.createObjectURL(blob),a=document.createElement('a');
a.href=url;a.download='Attestato_Matica_'+(name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').slice(0,65)||'studente')+'.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}catch(error){alert('Non è stato possibile creare il PDF. Riprova senza chiudere l’attestato.');}}
$('#privacyBtn').onclick=()=>modal(`<h2>Privacy</h2><p>Questo progetto didattico non richiede registrazione, non dispone di un backend proprietario e non invia al gestore i risultati dei quiz o il nome inserito nell’attestato.</p><p>I video incorporati da YouTube (modalità youtube-nocookie), l’eventuale libreria Three.js caricata da CDN e la risorsa esterna del crivello possono effettuare connessioni ai rispettivi servizi, soggetti alle loro informative. Prima di incorporare il crivello verificare anche la relativa informativa.</p><p>Per informazioni: <a href="mailto:${escapeH(C.email)}">${escapeH(C.email)}</a>.</p><p>© Claudia Bartoli. Riproduzione e distribuzione dei materiali protetti non autorizzate, salvo eccezioni previste dalla legge e diritti di terzi.</p>`);
$('#helpBtn').onclick=()=>modal('<h2>Come si gioca</h2><p>1. In ciascun atrio premi il cerchio per aprire la videolezione. Quando chiudi il video, il cerchio diventa un portale verso la scena successiva.</p><p>2. Nei panorami trascina per guardarti attorno e clicca sui numeri o sui simboli luminosi. Su smartphone trascina con un dito.</p><p>3. Supera i tre mini quiz con almeno 3 risposte esatte su 5. Nel crivello esplora la risorsa e premi Prosegui.</p><p>4. Rispondi a 15 quesiti finali: per ottenere l’attestato servono almeno 9 punti.</p><p>Le scomposizioni si scrivono ad esempio 2×2×3; l’ordine dei fattori non conta.</p>');
$('#restartBtn').onclick=()=>{if(confirm('Vuoi ricominciare il viaggio dall’inizio?')){if(viewer){viewer.dispose();viewer=null}index=0;watched={};quizPassed={};visited.clear();hideModal();render()}};
$('#audioBtn').onclick=()=>modal('<p>La colonna sonora non è inclusa in questa versione. Le videolezioni conservano i propri controlli audio.</p>');
render();
})();
