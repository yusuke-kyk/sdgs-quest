(function(){
'use strict';
const E=window.SDGSEngine;
const KEY='sdgs-quest-prototype-v01-save'; // Keep v0.1 save key for seamless migration
const app=document.querySelector('#app'),modalRoot=document.querySelector('#modal-root');
const NAMES={energy:'エネルギー生産',env:'環境保全',science:'科学技術研究',manage:'施設管理'};
const TONES={energy:'#f0bf7b',env:'#7cd6a3',science:'#91bffa',manage:'#bba9f0'};
const EMOJI={E01:'🏭',E02:'☀️',E03:'🌬️',E04:'💧',E05:'⚙️',E06:'🌋',E07:'⚛️',N01:'♻️',N02:'🌊',N03:'🌲',N04:'🏢',N05:'🌿',N06:'🌳',N07:'🦆',N08:'🛡️',S01:'📚',S02:'🔬',S03:'🔋',S04:'📊',S05:'☀️',S06:'🛰️',S07:'🧪',S08:'🧬',M01:'🛠️'};
const DESCRIPTION={
 E01:'低コストで資源を生産する一方、環境負荷の大きい火力発電。',E02:'環境負荷を抑えながら安定的な資源供給を目指す。',E03:'技術投資の成果を生かした高出力の再生可能エネルギー。',E04:'地域の水資源を活用する小規模な発電計画。',E05:'化石燃料を使用しながら、火力の環境負荷を抑える。',E06:'地中の熱を利用する、技術水準が必要な発電施設。',E07:'高い出力と厳格な管理が必要な先端エネルギー施設。',
 N01:'費用ゼロで取り組める小規模なごみ削減対策。',N02:'河川の汚染を取り除き、環境負荷を即時に改善する。',N03:'森林を再生し、維持管理を通して数年かけて環境を改善する。',N04:'設備効率を高め、資源節約と環境改善を両立する。',N05:'工場設備を改善し、継続的に排出負荷を抑制する。',N06:'都市の緑を増やし、段階的な環境改善を目指す。',N07:'湿地とその生態系を守る長期的な環境保全政策。',N08:'気象災害の被害を軽減する高度な防災システム。',
 S01:'研究情報を公開・共有し、小さくても着実に技術を進める。',S02:'基礎研究に資金を投じ、今すぐ技術水準を高める。',S03:'完成まで時間を要する、次世代の電力貯蔵研究。',S04:'資源の効率的な利用法を研究して知識と資源を獲得。',S05:'再生可能エネルギーの生産効率を高める研究。',S06:'災害予測を高度化し、将来の被害を軽減する。',S07:'産業の脱炭素化に向けた高度研究を推進する。',S08:'二酸化炭素を回収・貯留する技術を実証する。',M01:'稼働中の発電施設を廃止・強化・延長する。'
};
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const signed=(v)=>v>0?`+${v}`:`${v}`;
const ROUTE_NAMES={energy:'産業',env:'環境',science:'研究',manage:'施設管理'};
const ROUTE_ICON={energy:'⚡',env:'🌱',science:'🔬',manage:'🛠️'};
const ROUTE_COLORS={energy:'#edba72',env:'#82d6a2',science:'#96baf5',manage:'#c9adef'};

function roadmapArea(){
 if(state.stage!=='policy')return '';
 const now=state.shown.map(id=>E.CARD[id]).filter(Boolean);
 const picked=now.find(c=>c.id===routePreviewId)||null;
 const n=state.year;
 const categories=['energy','env','science'];
 const future=n<20, beyond=n<19;
 const ys=[85,191,297];
 const pos={prev:{x:16,w:185},now:{x:254,w:215},next:{x:550,w:195},later:{x:827,w:195}};
 const lastHistory=state.routeHistory?.filter(x=>x.year===n-1).at(-1);
 const lastId=state.previousYearChosenId||lastHistory?.cardId||null;
 const previousIds=Array.isArray(state.previousYearOptions)&&state.previousYearOptions.length
   ?state.previousYearOptions.slice(0,3):lastId?[lastId,null,null]:[];
 const pastPresent=n>1&&!!lastId;
 const currentRoute=picked?E.routeOptions(picked.category):[];
 const drawNode=(x,y,w,cat,top,label,sub,classes='',action='')=>{
  const color=ROUTE_COLORS[cat]||'#d6c087';
  const accent=classes.includes('road-lit')?'#e8fff5':color;
  return `<g class="road-node ${classes}" ${action} ${action?'role="button" tabindex="0"':'aria-hidden="true"'}>
    <rect class="road-shape" x="${x}" y="${y-41}" width="${w}" height="82" rx="13" fill="#132e37" stroke="${color}" stroke-width="1.6" />
    <text x="${x+12}" y="${y-17}" fill="${accent}" font-size="12" font-weight="750">${safe(top)}</text>
    <text x="${x+12}" y="${y+5}" fill="#f1f6f1" font-size="13" font-weight="700">${safe(label.length>13?label.slice(0,12)+'…':label)}</text>
    <text x="${x+12}" y="${y+25}" fill="#a2bfba" font-size="10.5">${safe(sub)}</text>
   </g>`;
 };
 const paths=[];
 const nodes=[];
 if(pastPresent){
  previousIds.forEach((id,i)=>{
    const c=E.CARD[id];
    if(!c){nodes.push(drawNode(pos.prev.x,ys[i],pos.prev.w,'manage','前回の候補','記録なし','旧セーブから復元','road-muted road-unknown'));return;}
    const selected=id===lastId;
    nodes.push(drawNode(pos.prev.x,ys[i],pos.prev.w,c.category,
       selected?'✓ 採用した政策':'採用しなかった政策',selected?c.name:'未採用の政策',selected?`${c.id} / 選択済み`:'選択されなかったカード',
       selected?'road-last-chosen':'road-muted'));
  });
  const chosenIdx=Math.max(0,previousIds.indexOf(lastId));
  now.forEach((c,i)=>{
   const adjacent=E.routeOptions(E.CARD[lastId]?.category).includes(c.category);
   const lit=!!picked&&picked.id===c.id;
   paths.push(`<path class="road-link road-past ${lit?'road-path-focus':''}" d="M ${pos.prev.x+pos.prev.w} ${ys[chosenIdx]} C 220 ${ys[chosenIdx]},231 ${ys[i]},${pos.now.x} ${ys[i]}" fill="none" stroke="${ROUTE_COLORS[E.CARD[lastId]?.category]||'#c1cfc9'}" stroke-width="${lit?3:1.6}" stroke-dasharray="${adjacent?'0':'4 6'}" opacity="${lit?.9:.33}"/>`);
  });
 }else{
  nodes.push(drawNode(pos.prev.x,ys[1],pos.prev.w,'manage','START','ここから始まる','これまでの選択なし','road-start'));
  now.forEach((c,i)=>paths.push(`<path class="road-link road-past" d="M ${pos.prev.x+pos.prev.w} ${ys[1]} C 224 ${ys[1]},233 ${ys[i]},${pos.now.x} ${ys[i]}" fill="none" stroke="#5b827f" opacity=".28" stroke-width="1.4"/>`));
 }
 now.forEach((c,i)=>{
  nodes.push(drawNode(pos.now.x,ys[i],pos.now.w,c.category,`${ROUTE_ICON[c.category]} ${ROUTE_NAMES[c.category]} · ${c.id}`,
    c.name,`資源 ${c.cost} ／ タップで進路確認`,picked?.id===c.id?'road-lit road-current road-current-active':'road-current',
    `data-action="preview-route" data-id="${c.id}" aria-label="${safe(c.name)}からの来年の進路を確認"`));
  if(future){
   E.routeOptions(c.category).filter(k=>categories.includes(k)).forEach(k=>{
    const j=categories.indexOf(k);
    const lit=picked?.id===c.id;
    paths.push(`<path class="road-link ${lit?'road-path-lit':'road-path-idle'}" d="M ${pos.now.x+pos.now.w} ${ys[i]} C 509 ${ys[i]},510 ${ys[j]},${pos.next.x} ${ys[j]}" fill="none" stroke="${ROUTE_COLORS[c.category]}" stroke-width="${lit?3.8:1.3}" opacity="${lit?1:.13}"/>`);
   });
  }
 });
 if(future){
  categories.forEach((cat,i)=>nodes.push(drawNode(pos.next.x,ys[i],pos.next.w,cat,
    `${ROUTE_ICON[cat]} ${ROUTE_NAMES[cat]}`,cat==='energy'?'エネルギー系':cat==='env'?'環境保全系':'研究・技術系',
    picked?(currentRoute.includes(cat)?'接続あり・優先候補':'今回は接続なし'):'今年の政策で変化',
    currentRoute.includes(cat)?'road-lit road-future':'road-future road-dimmed')));
 }else nodes.push(drawNode(pos.next.x,ys[1],pos.next.w,'manage','🏁 未来への継承','20年目の終了後','エンディングへ','road-finish'));
 if(beyond){
  categories.forEach((cat,i)=>{
   E.routeOptions(cat).filter(k=>categories.includes(k)).forEach(k=>{
    const j=categories.indexOf(k);
    const lit=!!picked&&currentRoute.includes(cat);
    paths.push(`<path class="road-link road-possible ${lit?'road-path-potential':''}" d="M ${pos.next.x+pos.next.w} ${ys[i]} C 782 ${ys[i]},796 ${ys[j]},${pos.later.x} ${ys[j]}" fill="none" stroke="${ROUTE_COLORS[cat]}" stroke-dasharray="4 7" stroke-width="${lit?1.9:1.15}" opacity="${lit?.4:.12}"/>`);
   });
  });
  categories.forEach((cat,i)=>nodes.push(drawNode(pos.later.x,ys[i],pos.later.w,cat,
   `${ROUTE_ICON[cat]} ${ROUTE_NAMES[cat]}`,cat==='energy'?'産業の可能性':cat==='env'?'環境の可能性':'研究の可能性','さらに先の方向',
   picked&&currentRoute.some(k=>E.routeOptions(k).includes(cat))?'road-possible-lit':'road-possible-node')));
 }else if(future){
  nodes.push(drawNode(pos.later.x,ys[1],pos.later.w,'manage','🏁 20年目','未来への継承','エンディングへ','road-finish'));
 }else{
  nodes.push(drawNode(pos.later.x,ys[1],pos.later.w,'manage','🌏 100年後','4つの未来','政策の継承','road-finish'));
 }
  // Mobile-only condensed roadmap; desktop keeps the original complete map.
  // The previous year keeps the accepted card bright and the other two muted.
  const miniYear=(year,caption)=>`<div class="mini-year"><b>${year}</b><small>${caption}</small></div>`;
  const prevMini= pastPresent?previousIds.map(id=>{
     const isSelected=id===lastId;
     return `<span class="mini-node mini-past ${isSelected?'mini-picked':'mini-rejected'}">${isSelected?'✓ '+safe(id):'· · ·'}</span>`;
   }).join(''):`<span class="mini-node mini-start">START</span>`;
  const nowMini=now.map(c=>`<button type="button" data-action="preview-route" data-id="${c.id}" class="mini-node mini-option ${picked?.id===c.id?'mini-picked mini-option-active':''}" aria-label="${safe(c.name)}の進路を確認" title="${safe(c.name)}">${ROUTE_ICON[c.category]} ${c.id}</button>`).join('');
  const nextMini=categories.map(cat=>`<span class="mini-node mini-next ${picked?(currentRoute.includes(cat)?'mini-illuminated':'mini-faded'):''}">${ROUTE_ICON[cat]} ${safe(ROUTE_NAMES[cat])}</span>`).join('');
  const laterMini=categories.map(cat=>`<span class="mini-node mini-later ${picked&&currentRoute.some(k=>E.routeOptions(k).includes(cat))?'mini-illuminated':'mini-faded'}">${ROUTE_ICON[cat]} ${safe(ROUTE_NAMES[cat])}</span>`).join('');
  const compactMap=`<div class="roadmap-mini" aria-label="政策ロードマップ簡易表示。今の候補をタップすると未来が光ります">
     <div class="mini-column">${miniYear(n>1?n-1+'年':'開始','前回')}<div class="mini-stack">${prevMini}</div></div>
     <div class="mini-column mini-current">${miniYear(n+'年','現在')}<div class="mini-stack">${nowMini}</div></div>
     <div class="mini-column">${miniYear(n<20?n+1+'年':'終点','翌年')}<div class="mini-stack">${nextMini}</div></div>
     <div class="mini-column">${miniYear(n<19?n+2+'年':'100年後','その先')}<div class="mini-stack">${laterMini}</div></div>
  </div>`;
 const chosenText=picked?`<strong>${safe(picked.name)}</strong> を選ぶと、来年の <strong>${currentRoute.map(k=>safe(ROUTE_NAMES[k])).join('・')}</strong> 分野が優先される。`:'今年の3枚から1枚をタップすると、次の年につながる道が光る。';
 const detail=picked?`<button class="btn small primary" data-action="detail" data-id="${picked.id}">「${safe(picked.name)}」の詳細・実行へ →</button>`:'';
 return `<section class="roadmap-panel"><div class="exp-head"><div><div class="eyebrow">BRANCHING ROADMAP · INTERACTIVE</div><h3>過去から未来へ、政策の軌跡</h3></div><span class="pill neutral">${n} / 20年目</span></div>
 <p class="map-note">${pastPresent?`左側に昨年の選択「${safe(E.CARD[lastId]?.name||'政策')}」、中央に今年の3候補。`:'今年から道が始まる。'} 今年のカードを選ぶと、来年につながる分野と道が光る！</p>
 ${compactMap}
  <details class="roadmap-full"><summary>詳細な分岐マップを表示（左右にスクロール）</summary>
  <div class="roadmap-years" aria-label="年次の並び"><span>${n>1?n-1+'年目':'START'}<small>前回</small></span><span class="roadmap-year-now">${n}年目<small>いまここ</small></span><span>${n<20?n+1+'年目':'END'}<small>次の年</small></span><span>${n<19?n+2+'年目':'100年後'}<small>その先</small></span></div>
 <div class="route-scroll" aria-label="政策の分岐マップ。前年・今年・翌年・翌々年の順"><svg viewBox="0 0 1040 362" role="group" aria-label="前年の採用・未採用カードと、今年から来年への政策分岐" xmlns="http://www.w3.org/2000/svg">
 <defs><filter id="roadmapGlow" x="-55%" y="-55%" width="210%" height="210%"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
 <rect x="${pos.now.x-12}" y="8" width="${pos.now.w+24}" height="346" rx="17" fill="#2f6661" opacity=".17"/>
 <text x="${pos.prev.x+3}" y="23" fill="#91b0ae" font-size="14" font-weight="700">${n>1?n-1+'年目':'出発点'}｜過去</text>
 <text x="${pos.now.x+7}" y="23" fill="#f2dfa3" font-size="15" font-weight="800">▶ ${n}年目｜いまここ</text>
 <text x="${pos.next.x+7}" y="23" fill="#d5e5de" font-size="14" font-weight="700">${n<20?n+1+'年目｜未来':'20年後｜終点'}</text>
 <text x="${pos.later.x+7}" y="23" fill="#b5d0cb" font-size="14" font-weight="700">${n<19?n+2+'年目｜その先':'100年後へ'}</text>
 <path d="M 228 34 V 349 M 515 34 V 349 M 792 34 V 349" fill="none" stroke="#52717a" stroke-dasharray="4 8" opacity=".42"/>
 ${paths.join('')}${nodes.join('')}
 </svg></div>
 <div class="map-choice"><span class="map-choice-copy">${chosenText} <span class="subtle">翌年の具体的なカードはまだ未確定。</span></span>${detail}</div>
 <p class="map-foot">✓＝前年に採用した政策。黒くなった2枚＝選ばなかった政策。発光＝今年選択中のカードから<strong>優先的につながる分野</strong>。接続先から実行可能なカードを最低1枚優先するが、ほかの分野も抽選される。</p></section>`;
}
function countryArea(){
 const facilities=state.facilities.filter(f=>f.end>=state.year);
 const active=facilities.filter(f=>f.start<=state.year);
 const building=facilities.filter(f=>f.start>state.year);
 const environmentActions=state.played.filter(p=>p.category==='env').length;
 const tech=state.technology, burden=state.environment;
 const lush=burden<=39, damaged=burden>=70, desolate=burden>=85;
 const scenery=desolate?'荒廃':damaged?'環境悪化':lush?'緑豊か':'発展途上';
 const greens= Math.min(6, Math.max(0, environmentActions+(lush?2:0)-(damaged?1:0)));
 const trees=2+greens;
 const skyTop=desolate?'#5d554f':damaged?'#97806b':lush?'#418db2':'#668d9e';
 const skyBottom=desolate?'#bda38b':damaged?'#d9b38b':lush?'#b6e2ca':'#b4c9bd';
 const backHill=desolate?'#746e59':damaged?'#877b60':lush?'#4f9c77':'#688e80';
 const frontHill=desolate?'#7d6b50':damaged?'#8d8b64':lush?'#408d67':'#577c6d';
 const soil=desolate?'#927a57':damaged?'#b2a16c':lush?'#70ac74':'#789d7c';
 const treeColor=desolate?'#8d7853':damaged?'#a28a59':lush?'#328a4d':'#4f9165';
 const smokeAlpha=Math.min(.65,Math.max(0,(burden-48)/80));
 const last=state.played.at(-1);
 const lastCategory=last?.category;
 const lastTitle=last?E.CARD[last.cardId]?.name:'';
 const cityTech=Math.max(0,Math.min(4,Math.floor((tech-20)/17)));
 const towerCount=3+cityTech;
 const skyline=Array.from({length:towerCount},(_,i)=>{
  const x=340+i*45, h=96+(i%3)*24+cityTech*9, y=327-h;
  const fill=damaged?'#807c70':cityTech>=2?'#4c9cb2':'#658c91';
  return `<g><rect x="${x}" y="${y}" width="40" height="${h}" rx="3" fill="${fill}" stroke="#d2e1d2" stroke-width="2"/><rect x="${x+7}" y="${y+13}" width="24" height="${h-20}" fill="#ceeae1" opacity=".60"/><path d="M ${x+15} ${y+14} V ${y+h-8} M ${x+24} ${y+14} V ${y+h-8}" stroke="#326e80" stroke-width="4" stroke-dasharray="10 12"/></g>`;
 }).join('');
 const treeSvg=Array.from({length:trees},(_,i)=>{
  const col=i%4,row=Math.floor(i/4);const x=48+col*68+row*20, y=326-(row%2)*24;
  const scale=i%2===0?1.05:1.24;
  const leafy=!(desolate&&i%2===1);
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M 0 10 V -63" stroke="#775840" stroke-width="9" stroke-linecap="round"/>${leafy?`<circle cx="-16" cy="-62" r="28" fill="${treeColor}"/><circle cx="17" cy="-70" r="30" fill="${lush?'#4cbb69':treeColor}"/><circle cx="-4" cy="-89" r="28" fill="${treeColor}"/><circle cx="-18" cy="-78" r="15" fill="${lush?'#78d48d':'#92ab73'}" opacity=".9"/>`:`<path d="M 0 -43 l-19 -23 m19 14 l19 -23" stroke="#806b55" stroke-width="7" fill="none" stroke-linecap="round"/>`}</g>`;
 }).join('');
 const facilitySvg=facilities.slice(-4).map((f,i)=>{
  const slots=[[664,322],[803,322],[710,206],[856,206]];
  const [x,y]=slots[i],type=f.cardId;
  const constructing=f.start>state.year;
  let graphic;
  if(type==='E02')graphic='<path d="M -49 -12 L 52 -12 L 65 17 L -59 17 Z" fill="#286da6" stroke="#c7e6fa" stroke-width="4"/><path d="M -28 -12 L -20 15 M 0 -12 L 7 15 M 29 -12 L 37 15 M -52 2 H 60" stroke="#abd4ec" stroke-width="3"/><path d="M -33 17 V 42 M 36 17 V42" stroke="#8f9b9b" stroke-width="6"/>';
  else if(type==='E03')graphic='<path d="M 0 31 V-95" stroke="#f1eee5" stroke-width="9"/><circle cy="-95" r="8" fill="#fff"/><path d="M 0 -95 L -45 -127 M 0 -95 L 54 -100 M 0 -95 L -10 -44" stroke="#f9f6eb" stroke-width="12" stroke-linecap="round"/>';
  else if(type==='E07')graphic='<path d="M-58 16 Q-56 -78 -1 -78 Q 54 -78 58 16 Z" fill="#9eb5b8" stroke="#e2f0ec" stroke-width="4"/><rect x="-70" y="16" width="142" height="23" rx="3" fill="#5e8190"/>';
  else if(type==='E04')graphic='<rect x="-51" y="-64" width="103" height="105" rx="4" fill="#789da4"/><path d="M-51 -6 Q -10 -40 52 -6" stroke="#a2daed" stroke-width="14" fill="none"/><path d="M-50 16 H50" stroke="#d5e8df" stroke-width="6"/>';
  else if(type==='E06')graphic='<path d="M-65 35 V -34 L 0 -78 L 63 -34 V35 Z" fill="#77939b" stroke="#cee6e1" stroke-width="3"/><path d="M 0 -78 V-99 M25 -90 Q 55 -125 70 -90" stroke="#f3f2e7" stroke-width="9" fill="none"/>';
  else graphic='<rect x="-58" y="-40" width="116" height="77" fill="#6d8892" stroke="#dae1d7" stroke-width="4"/><path d="M -32 -40 V-105 H -8 V -40 M 19 -40 V -84 H 42 V -40" fill="#90a4a9" stroke="#e3e4df" stroke-width="4"/><path d="M -20 -109 q -16 -23 8 -39 M 29 -87 q-16 -25 14 -35" stroke="#b8b0a1" stroke-width="8" fill="none" opacity=".75"/>';
  return `<g transform="translate(${x} ${y})" opacity="${constructing?.60:1}" class="nation-facility"><ellipse cx="0" cy="44" rx="81" ry="12" fill="#254c51" opacity=".35"/>${graphic}${constructing?'<rect x="-68" y="-143" width="130" height="174" fill="none" stroke="#f8dca1" stroke-width="4" stroke-dasharray="9 9"/><text x="-57" y="-126" font-size="18" fill="#ffeac5" font-weight="bold">建設中</text>':''}</g>`;
 }).join('');
 const techArt=tech>=30?`<g transform="translate(548 0)" class="nation-tech"><rect x="0" y="${tech>=60?107:162}" width="88" height="${tech>=60?220:165}" rx="5" fill="${damaged?'#8a9190':'#4fadb6'}" stroke="#dbf5ee" stroke-width="4"/><path d="M 17 186 V306 M 44 160 V306 M 70 186 V306" stroke="#ceebed" stroke-width="8" stroke-dasharray="10 20"/><circle cx="44" cy="${tech>=60?94:153}" r="${tech>=60?22:13}" fill="#a8f3ee" opacity=".90"/>${tech>=60?'<path d="M44 68 V25 M44 25 L17 56 M44 25 L69 57" stroke="#c4f5f8" stroke-width="7" fill="none"/>':''}</g>`:'';
 const cracks=damaged?Array.from({length:desolate?10:4},(_,i)=>{
  const x=30+i*103,y=371+(i%2)*20;
  return `<path d="M${x} ${y} l20 -8 l17 6 l20 -13 m-40 9 l-6 14" stroke="#5b5144" stroke-width="3" fill="none" opacity="${desolate?.75:.5}"/>`;
 }).join(''):'';
 const ruins=desolate?'<g opacity=".85"><rect x="368" y="269" width="76" height="55" fill="#716e65"/><path d="M350 269 L385 247 L400 262 L432 251 L444 269" fill="#605f5e"/><path d="M376 275 L415 303 L400 324" stroke="#4b4c49" stroke-width="7" fill="none"/></g>':'';
 const flowers=lush?Array.from({length:23},(_,i)=>`<circle cx="${(i*79+25)%950}" cy="${349+(i*17)%61}" r="${i%2?4:3}" fill="${i%3?'#f9d78d':'#f0bed4'}" opacity=".9"/>`).join(''):'';
 const condition=desolate?'⚠️ 環境負荷85以上：大地が荒廃し、都市にも傷跡が現れている。':damaged?'⚠️ 環境負荷70以上：緑が失われ、空が煙っている。':lush?'🌿 環境負荷39以下：自然が回復し、国全体に緑が広がっている。':environmentActions?'🌱 保全政策によって緑地が増え始めている。':'🏙️ 政策によって施設や緑地、研究都市の景色が変わっていく。';
 const recent=lastTitle?`直近の政策：${safe(lastTitle)}`:'最初の政策で国の風景を変えよう';
 return `<section class="nation-panel"><div class="exp-head"><div><div class="eyebrow">YOUR COUNTRY · EVOLVING WORLD</div><h3>あなたの政策で変わる、日本の姿</h3></div><span class="pill ${damaged?'warn':'neutral'}">${scenery}・環境${burden}</span></div>
 <div class="nation-picture"><svg viewBox="0 0 960 430" preserveAspectRatio="xMidYMid slice" role="img" aria-label="国の景色：${scenery}、稼働施設${active.length}基、建設中${building.length}基、環境政策${environmentActions}回、科学技術${tech}" xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="nationSky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBottom}"/></linearGradient><linearGradient id="nationGround" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${soil}"/><stop offset="1" stop-color="${damaged?'#867652':'#3d8568'}"/></linearGradient></defs>
 <rect width="960" height="430" fill="url(#nationSky)"/><circle cx="798" cy="70" r="39" fill="${damaged?'#d5ad7e':'#fff2c4'}" opacity=".84"/>
 <path d="M0 215 Q100 105 227 186 Q350 118 460 190 Q650 105 800 173 Q885 126 960 166 V430 H0Z" fill="${backHill}"/>
 <path d="M0 267 Q155 185 310 245 Q465 177 665 264 Q830 183 960 254 V430 H0Z" fill="${frontHill}"/>
 <rect x="0" y="324" width="960" height="106" fill="url(#nationGround)"/>
 ${lush?'<path d="M0 385 Q180 346 380 393 Q610 343 960 380" stroke="#7ad49c" stroke-width="24" fill="none" opacity=".46"/>':''}
 ${skyline}${techArt}${treeSvg}${facilitySvg}${ruins}
 <path d="M0 421 Q211 365 418 412 Q698 353 960 394 V430 H0Z" fill="${damaged?'#8a9689':'#70b6d6'}" opacity=".85"/>
 ${cracks}${flowers}
 <rect width="960" height="430" fill="#7f6358" opacity="${smokeAlpha.toFixed(2)}"/>
 ${damaged?`<g opacity=".62"><ellipse cx="256" cy="90" rx="200" ry="39" fill="#817467"/><ellipse cx="708" cy="145" rx="230" ry="48" fill="#8a8178"/></g>`:''}
 <rect x="16" y="17" width="227" height="45" rx="23" fill="#0b2830" opacity=".89"/><text x="34" y="46" fill="#eaf3df" font-size="19" font-weight="700">YEAR ${String(state.year).padStart(2,'0')} • JAPAN</text>
 <rect x="16" y="377" width="${Math.min(850,Math.max(170,recent.length*18))}" height="39" rx="10" fill="#0b2830" opacity=".88"/><text x="31" y="403" fill="#f7e2a9" font-size="17" font-weight="700">${safe(recent.slice(0,42))}</text>
 </svg></div>
 <div class="nation-facts"><span>🏭 稼働 <b>${active.length}基</b> ／ 建設中 <b>${building.length}基</b></span><span>🌳 保全政策 <b>${environmentActions}回</b></span><span>🔬 科学技術 <b>${tech}</b></span><span>${lush?'🌿':damaged?'🌫️':'🌤️'} 環境 <b>${burden}</b></span></div>
 <p class="nation-state-note">${condition} <span class="subtle">（ゲーム上のイメージ表現。現実の自然環境を厳密に示すものではない）</span></p><details class="nation-mobile-detail"><summary>国の変化を詳しく見る</summary><div class="nation-facts"><span>🏭 稼働 <b>${active.length}基</b> ／ 建設中 <b>${building.length}基</b></span><span>🌳 保全政策 <b>${environmentActions}回</b></span><span>🔬 科学技術 <b>${tech}</b></span></div><p class="nation-state-note">${condition}</p></details></section>`;
}
function milestoneArea(){
 const m=state.milestone;
 if(!m)return '<section class="stage-pane"><h2>中間報告を準備しています</h2></section>';
 const n=(v)=>v>0?`+${v}`:`${v}`;
 const dominant=Object.entries(m.counts).filter(([k])=>k!=='manage').sort((a,b)=>b[1]-a[1])[0][0];
 const summaries={energy:'発電所や産業基盤への投資を優先してきた5年間。得た資源を次に何へ使うかが重要になる。',env:'環境保全を大切に進めた5年間。研究や資源生産との両立を次の課題にしよう。',science:'研究への投資を積み重ねた5年間。新たに解放された政策を確認しよう。'};
 return `<section class="stage-pane milestone-pane main-only"><div class="eyebrow">CHAPTER CLEAR · ${m.from}–${m.to} YEARS</div><h2>📜 第${m.year/5}章 成果報告</h2><p>5年間の取り組みが、国の姿を変えた。ここで成果を確認して、次の5年間の方針を考えよう。</p>
 <div class="milestone-badge">${m.year}年目終了 / 20年</div>
 <div class="result-grid"><div class="result-tile"><small>リソースの変化</small><strong>${n(m.changes.resources)}</strong></div><div class="result-tile"><small>環境負荷の変化</small><strong class="${m.changes.environment<=0?'good':'bad-txt'}">${n(m.changes.environment)}</strong></div><div class="result-tile"><small>科学技術の変化</small><strong class="good">${n(m.changes.technology)}</strong></div></div>
 <div class="panel"><h3>この5年間の政策</h3><div class="milestone-distribution"><span>⚡ 産業 ${m.counts.energy}回</span><span>🌿 環境 ${m.counts.env}回</span><span>🔬 研究 ${m.counts.science}回</span><span>🛠️ 施設管理 ${m.counts.manage}回</span></div><p class="muted">${summaries[dominant]}</p><p class="muted">現在稼働している発電施設：${m.activeFacilities}基</p></div>
 <div class="panel" style="margin-top:12px"><h3>この5年間に起きた出来事</h3>${m.events.length?m.events.slice(0,5).map(ev=>`<div class="item">${ev.year}年目：${safe(ev.name)}</div>`).join(''):'<p class="muted">大きなイベントは発生しなかった。</p>'}</div>
 <p class="milestone-quote">「次の5年は、何を優先する？」</p><button class="btn primary block" data-action="continue-milestone">第${m.year/5+1}章へ進む →</button></section>`;
}

function read(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&(x.version===1||x.version===2)&&Number.isInteger(x.year)&&x.year>=1&&x.year<=20&&Array.isArray(x.facilities)&&Array.isArray(x.shown)&&x.stage){
 if(x.version===1){ x.version=2; x.routeHistory=(x.played||[]).map(p=>({year:p.year,cardId:p.cardId,category:p.category})); x.routeBias=x.routeHistory.at(-1)?.category||null; x.milestone=null; }
 if(!Array.isArray(x.routeHistory))x.routeHistory=[];
 if(!Array.isArray(x.previousYearOptions))x.previousYearOptions=[];
 if(!x.previousYearChosenId)x.previousYearChosenId=x.routeHistory.filter(r=>r.year===x.year-1).at(-1)?.cardId||null;
 return x;
 }}catch(_e){}return null}
let state=read()||E.newGame();
let riskExpanded=false,detailId=null,upkeepChosen=new Set(),notice='',routePreviewId=null;
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(_e){}};
const actionable=id=>{const c=E.CARD[id];return E.eligible(state,c)&&E.canAfford(state,c)};
function phaseName(){return ({upkeep:'維持費の配分',policy:'政策を選択',manage:'施設管理',event:'イベント発生',result:'年間の結果',milestone:'5年間の成果報告',ending:'100年後の未来'})[state.stage]}
function stamp(){return `<div class="stages">${[['upkeep','維持費'],['policy','政策選択'],['event','イベント'],['result','年間結果']].map(([id,n])=>`<span class="step ${state.stage===id || (state.stage==='manage'&&id==='policy')?'active':''}">${n}</span>`).join('')}</div>`}
function stat(label,value,color,hint,pct){return `<div class="stat" style="--tone:${color};--pct:${pct}%"><div class="label"><span>${label}</span><span>${hint}</span></div><strong>${value}</strong><div class="meter"><div></div></div></div>`}
function art(c,small=false){const accent=TONES[c.category];return `<div class="art" style="--accent:${accent}"><span class="art-icon" aria-hidden="true">${EMOJI[c.id]||'🌍'}</span><span class="art-label">POLICY // ${c.id}</span><img src="assets/cards/${c.imageId}.png" alt="${safe(c.name)}のイラスト" loading="lazy" onerror="this.remove()"></div>`}
function costLabel(c){return c.id==='M01'?'管理内容による':`資源 ${c.cost}`}
function cardHtml(c){const ok=actionable(c.id);const needs=E.isLegacyOnly(state,c);const effects=E.effectLabel(c);
  const tags=[];if(c.requiredTechnology)tags.push(`技術${c.requiredTechnology}以上`);
  if(c.ongoingEffect) tags.push(`継続${c.ongoingEffect.durationYears}年`);
  if(c.delayedResearch)tags.push(`研究${c.delayedResearch.yearsUntilCompletion}年`);
  if(c.ongoingEffect?.maintenanceCostPerYear)tags.push(`維持費-${c.ongoingEffect.maintenanceCostPerYear}/年`);
  if(needs)tags.push('未来への継承');
  return `<article class="policy ${ok?'':'unaffordable'} ${routePreviewId===c.id?'policy-preview-selected':''}" style="--accent:${TONES[c.category]}"><div class="card-top"><div class="type">${safe(NAMES[c.category])} / ${c.id}</div><h3>${safe(c.name)}</h3></div>${art(c)}<div class="card-content"><div class="cost-row"><span>初期費用</span><b>${costLabel(c)}</b></div><div class="effect-lines">${effects.slice(0,3).map(t=>`<div class="effect">${safe(t)}</div>`).join('')}</div><div class="meta-tags">${tags.map(t=>`<span class="tag ${t.includes('維持費')?'danger':''}">${safe(t)}</span>`).join('')}${!ok?'<span class="tag danger">資源不足</span>':''}</div><div class="card-actions"><button class="btn ghost" data-action="detail" data-id="${c.id}">詳細</button><button class="btn primary" data-action="select" data-id="${c.id}" ${ok?'':'disabled'}>${ok?'この政策を実行':'実行不可'}</button></div></div></article>`;
}
function policyArea(){const choices=state.shown.map(id=>E.CARD[id]).filter(Boolean);
return `<section class="policy-stage-view"><div class="section-head"><div><h2>今年の政策を選ぶ</h2><p>3枚から1枚を選び、20年後の結果へとつなげよう。</p></div><span class="pill neutral">残り${21-state.year}回</span></div>${stamp()}<div class="card-grid">${choices.map(cardHtml).join('')}</div>${roadmapArea()}${countryArea()}<details class="mobile-status"><summary>🛠️ 稼働施設・研究・環境リスクを詳しく見る</summary>${activeSidebar()}</details><div class="footnote">※ 画像は未設定でも遊べます。<span class="code">assets/cards/E01.png</span> のように追加すれば自動で差し替わります。数値はバランス調整中の仮設定です。</div></section>`}
function upkeeps(){return state.currentUpkeep.map(id=>state.ongoing.find(p=>p.id===id)).filter(Boolean)}
function upkeepArea(){const list=upkeeps();const total=list.reduce((n,p)=>n+p.upkeep,0);const paid=list.filter(p=>upkeepChosen.has(p.id)).reduce((n,p)=>n+p.upkeep,0);
return `<section class="stage-pane main-only">${stamp()}<div class="eyebrow">ANNUAL BUDGET</div><h2>維持費を配分しよう</h2><p>今年の収入を反映したあと、継続政策の維持費が不足した。どの政策の効果を維持する？ 支払わなかった政策は今年だけ効果停止。継続期間は消費する。</p><div class="result-grid"><div class="result-tile"><small>利用可能資源</small><strong>${state.resources}</strong></div><div class="result-tile"><small>必要な総維持費</small><strong>${total}</strong></div><div class="result-tile"><small>選んだ維持費</small><strong>${paid}</strong></div></div><div class="actions-list">${list.map(p=>`<label class="option"><input type="checkbox" data-action="upkeep-check" data-id="${p.id}" ${upkeepChosen.has(p.id)?'checked':''}><span><span class="option-text">${safe(E.CARD[p.cardId].name)}｜資源 -${p.upkeep}</span><small>今年維持すれば効果が発生。未払いの場合は今年の効果なし。</small></span></label>`).join('')}</div>${paid>state.resources?'<p class="notice bad">予算を超えています。選択を減らしてください。</p>':''}<div class="divider"></div><button class="btn primary block" data-action="finish-upkeep" ${paid>state.resources?'disabled':''}>維持する政策を確定する</button></section>`}
function manageArea(){const opts=E.managementChoices(state),by=opts.reduce((a,x)=>{(a[x.facilityId]??=[]).push(x);return a;},{});
return `<section class="stage-pane main-only">${stamp()}<div class="eyebrow">FACILITY MANAGEMENT</div><h2>施設を管理する</h2><p>今年の政策枠を使用して、稼働施設を1つ選び、廃止・強化・整備延長のいずれかを実行する。選ぶ前に費用と効果を確認しよう。</p>${Object.entries(by).map(([fid,list])=>`<div class="panel" style="margin-bottom:12px"><h3>🏗️ ${safe(E.CARD[list[0].cardId].name)}</h3><small>残り稼働期間 ${Math.max(0,state.facilities.find(f=>String(f.id)===fid)?.end-state.year+1||0)}年</small><div class="actions-list" style="margin-top:11px">${list.map(o=>`<button class="btn" data-action="manage" data-fid="${o.facilityId}" data-kind="${o.action}" ${o.cost>state.resources?'disabled':''} style="text-align:left"><strong>${safe(o.label)}</strong> ｜費用 ${o.cost}<span style="display:block;font-size:11px;color:#b7cdd0;margin-top:5px">${safe(o.description)}</span></button>`).join('')}</div></div>`).join('')}<button class="btn ghost" data-action="back-manage">政策選択に戻る</button></section>`}
function eventArea(){const ev=state.currentEvent;const can=!!ev.response && state.resources>=ev.response.cost;
const mood=ev.id==='quiet'?'🌤️':ev.harmful?'⛈️':'🌱';
return `<section class="stage-pane main-only">${stamp()}<span class="event-mark">${mood}</span><div class="eyebrow">YEAR ${String(state.year).padStart(2,'0')} / EVENT</div><h2>${safe(ev.title)}</h2><p>${safe(ev.description)}</p>${ev.details.length?`<div class="panel">${ev.details.map(t=>`<div class="item">${safe(t)}</div>`).join('')}</div>`:''}${ev.response?`<div class="notice" style="margin-top:12px">${safe(ev.response.targetName)}：緊急対応によって被害の一部を回避できる。対応は政策枠を追加消費しない。</div><div class="actions-list" style="margin-top:15px"><button class="btn primary" data-action="event-response" data-kind="repair" ${can?'':'disabled'}>${safe(ev.response.label)}${can?'':'（資源不足）'}</button><button class="btn" data-action="event-response" data-kind="accept">${safe(ev.response.decline)}</button></div>`:`<button class="btn primary block" style="margin-top:18px" data-action="event-response" data-kind="accept">今年の結果を見る</button>`}</section>`}
function resultArea(){const y=state.yearReport;const b=y.before;const tiles=[['リソース',state.resources,signed(state.resources-b.resources),'#e3c78c'],['環境負荷',state.environment,signed(state.environment-b.environment),'#e3a39b'],['科学技術',state.technology,signed(state.technology-b.technology),'#8fbcf3']];
return `<section class="stage-pane main-only">${stamp()}<div class="eyebrow">ANNUAL REPORT</div><h2>${state.year}年目の結果</h2><p>1年間の政策・継続効果・ランダムイベントを振り返ろう。</p><div class="result-grid">${tiles.map(([n,v,d,col])=>`<div class="result-tile"><small>${n}</small><strong style="color:${col}">${v}</strong><small>前年比 ${d}</small></div>`).join('')}</div><div class="panel"><div class="item"><strong>選んだ政策</strong><span class="sub">${safe(y.policy||'なし')}</span></div><div class="item"><strong>イベント</strong><span class="sub">${safe(y.event||'なし')}</span></div><div class="item"><strong>今年の収入</strong><span class="sub">資源 +${y.income} ／ 維持費 -${y.upkeep}</span></div>${y.notes.map(n=>`<div class="item"><span class="sub">${safe(n)}</span></div>`).join('')}</div><button class="btn primary block" style="margin-top:16px" data-action="next-year">${state.year===20?'100年後の未来を見る':'次の年へ進む →'}</button></section>`}
function endingArea(){const out=E.ending(state);const icons={green_advanced:'🌿',nature:'🌳',gray_advanced:'🏙️',decline:'🌫️'};
return `<section class="main-only"><div class="ending-hero ending-theme-${out.id}">
  <div class="ending-art">
    <div class="ending-art-fallback" aria-hidden="true">${icons[out.id]}</div>
    <img class="ending-art-image" src="assets/endings/${out.id}.png" alt="${safe(out.name)}の100年後の風景" loading="eager" onerror="this.remove()">
    <div class="ending-art-overlay">
      <div class="ending-title">100 YEARS AFTER · FUTURE REPORT</div>
      <h2>${safe(out.name)}</h2>
      <span class="pill gold">${safe(out.tag)}</span>
    </div>
  </div>
  <p class="ending-description">${safe(out.description)}</p>
</div><div class="result-grid"><div class="result-tile"><small>資源</small><strong>${state.resources}</strong></div><div class="result-tile"><small>環境負荷</small><strong>${state.environment}</strong></div><div class="result-tile"><small>科学技術</small><strong>${state.technology}</strong></div></div><div class="panel"><h3>📜 20年間に築いたもの</h3><p class="muted">${safe(out.flavor)}</p><div class="item">エネルギー政策：${out.counts.energy}回　環境保全：${out.counts.env}回　科学技術研究：${out.counts.science}回</div></div><div class="panel" style="margin-top:12px"><h3>⏳ 次世代へ引き継いだ取り組み</h3>${out.legacy.length?`<ul class="legacy-list">${out.legacy.map(x=>`<li>${safe(x)}</li>`).join('')}</ul>`:'<p class="muted">未完了の取り組みはありません。あなたが進めた政策は歴史として残っています。</p>'}<p class="muted">80年間は自動計算せず、政策履歴から物語として表現しています。未完了の研究は必ず成功したとは限りません。</p></div><div class="panel" style="margin-top:12px"><h3>📖 100年への継承</h3><div class="item"><strong>20年目</strong><span class="sub">あなたの政策運営はここで終わった。技術・環境への選択が次の世代に引き継がれる。</span></div><div class="item"><strong>50年目</strong><span class="sub">政策と投資の成果をどう受け継ぐか、次世代の人々の判断が続いていく。</span></div><div class="item"><strong>100年目</strong><span class="sub">${safe(out.description)} その背景には、あなたが積み重ねた20年間の選択がある。</span></div></div><button class="btn primary block" style="margin-top:16px" data-action="reset">もう一度20年間を始める</button><p class="footnote">ゲーム内数値は教育用の抽象モデルです。現実の災害予測・科学技術水準を示すものではありません。</p></section>`}
function activeSidebar(){const r=E.risk(state),eq=[['環境連動イベント',r.climate,'#db9276'],['独立イベント',r.independent,'#dbba75'],['何もなし',r.none,'#436f69']];const facilities=state.facilities.filter(f=>f.end>=state.year),eff=state.ongoing.filter(p=>p.end>=state.year),studies=state.researches;let riskLevel=state.environment>=85?'危機':state.environment>=65?'警戒':state.environment>=40?'注意':'低リスク';
return `<aside class="sidebar"><div class="panel"><h3>🌎 環境リスク <span class="pill neutral">${riskLevel}</span></h3><small>ゲーム内の仮の確率（今年の現在値）</small><div class="risk-meter">${eq.map(([n,v,c])=>`<span style="width:${v}%;background:${c}"></span>`).join('')}</div><div class="risk-legend">${riskExpanded?eq.map(([n,v,c])=>`<div><span><b style="color:${c}">●</b> ${n}</span><strong>${v}%</strong></div>`).join(''):`<div><span>現在の環境負荷</span><strong>${state.environment} / 100</strong></div>`}</div><button class="btn small ghost block" data-action="toggle-risk" style="margin-top:12px">${riskExpanded?'確率の詳細を閉じる':'正確な発生確率を見る'}</button><div class="risk-note">発生判定は政策実行後に行います。政策により環境負荷が変わると、今年の環境リスクも変化します。</div></div><div class="panel"><h3>🏭 稼働施設 <span class="pill neutral">${facilities.length}</span></h3>${facilities.length?facilities.map(f=>`<div class="item"><strong>${safe(E.CARD[f.cardId].name)}</strong><span class="sub">稼働 ${f.start}〜${f.end}年目 ／ 資源+${f.resourcePerYear}/年・環境${signed(f.environmentPerYear)}/年${f.upgraded?' ／ 強化済':''}${f.extended?' ／ 延長済':''}</span></div>`).join(''):'<p class="muted">まだ施設がありません。エネルギー政策で建設できます。</p>'}</div><div class="panel"><h3>🌱 継続中の政策 <span class="pill neutral">${eff.length}</span></h3>${eff.length?eff.map(p=>`<div class="item"><strong>${safe(E.CARD[p.cardId].name)}</strong><span class="sub">効果期間 ${p.start}〜${p.end}年目${p.upkeep?` ／ 維持費 ${p.upkeep}/年`:''}</span></div>`).join(''):'<p class="muted">現在、継続中の保全・研究効果はありません。</p>'}</div><div class="panel"><h3>🔬 進行中の研究 <span class="pill neutral">${studies.length}</span></h3>${studies.length?studies.map(j=>`<div class="item"><strong>${safe(E.CARD[j.cardId].name)}</strong><span class="sub">${j.completeYear}年目完成予定 ／ 技術+${j.technology}</span></div>`).join(''):'<p class="muted">進行中の研究はありません。</p>'}</div><div class="panel"><h3>📅 政策の履歴</h3>${state.timeline.length?`<div class="timeline">${state.timeline.slice(-5).reverse().map(t=>`<div class="t-item"><strong>${t.year}年目：${safe(t.policy||'政策なし')}</strong><span>${safe(t.event)} ／ 環境 ${t.environment}・技術 ${t.technology}</span></div>`).join('')}</div>`:'<p class="muted">今年の政策から歴史が始まります。</p>'}</div></aside>`;
}
function render(){const ending=state.stage==='ending';const page= ending?endingArea():state.stage==='milestone'?milestoneArea():state.stage==='upkeep'?upkeepArea():state.stage==='manage'?manageArea():state.stage==='event'?eventArea():state.stage==='result'?resultArea():policyArea();
app.innerHTML=`<div class="shell ${state.stage==='policy'?'stage-policy':''}"><header class="topbar"><div class="brand"><div class="logo">🌍</div><div><strong>SDGs QUEST</strong><small>CHOOSE THE FUTURE / PROTOTYPE 0.3</small></div></div><div class="top-actions"><span class="pill neutral mobile-year-indicator">${state.year} / 20年</span><span class="pill neutral">カード24種類・数値v0.2</span><button class="btn small ghost" data-action="reset">↺ 最初から</button></div></header><section class="hero"><div><div class="eyebrow">20 YEARS OF DECISIONS</div><h1>${ending?'100年後の':'その選択が、'}<span>${ending?'未来':'未来を変える。'}</span></h1><p>あなたは政策を決める立場。資源・環境・科学技術のバランスを考えながら、20年間の歴史をつくろう。${ending?'':' 毎年1枚の政策を選択し、最後に100年後を迎える。'}</p></div><div class="year-dial"><small>${ending?'COMPLETE':'POLICY YEAR'}</small><strong>${state.year}<span style="font-size:15px;letter-spacing:0"> / 20</span></strong><div class="track"><div style="width:${state.year/20*100}%"></div></div></div></section><section class="stats">${stat('リソース',state.resources,'#e8c37f','上限なし',Math.min(100,state.resources/140*100))}${stat('環境負荷',state.environment,'#e8a399','低いほど良い',state.environment)}${stat('科学技術',state.technology,'#8fbcf3','高いほど発展',state.technology)}</section><div class="layout"><main>${!ending&&state.stage!=='milestone'&&state.stage!=='policy'?countryArea():''}${page}</main>${activeSidebar()}</div><footer class="footnote">SDGs QUEST（仮）｜ローカル保存対応。試作v0.3・政策数値v0.2。現実の科学的因果関係を単純化した教育用モデルです。<br>数値・抽選確率・イベント効果は調整用の仮設定であり、最終仕様ではありません。</footer></div>`;
persist();
 const roadmapFull=app.querySelector('.roadmap-full');
  if(roadmapFull && window.matchMedia('(min-width: 701px)').matches)roadmapFull.open=true;
  const scroller=app.querySelector('.route-scroll');
 if(scroller){
   const svg=scroller.querySelector('svg');
   if(svg && !routePreviewId && !scroller.dataset.initialized){
     const w=svg.getBoundingClientRect().width;
     scroller.scrollLeft=Math.max(0,((scroller.clientWidth>=650?95:160)/1040)*w);
     scroller.dataset.initialized='1';
   }
 }
}
function modal(c){const effects=E.effectLabel(c);const riskNow=E.risk(state).climate;const nextEnv=E.clamp(state.environment+(c.instantEffect.environment||0));const preview=E.climateChance(nextEnv);
modalRoot.innerHTML=`<div class="overlay" data-action="close-overlay"><div class="modal" role="dialog" aria-modal="true" aria-label="政策詳細"><div class="modal-head"><div><span class="pill neutral">${safe(NAMES[c.category])} / ${c.id}</span><h2 style="margin-top:12px">${safe(c.name)}</h2></div><button class="close" data-action="close-modal" aria-label="閉じる">✕</button></div><p>${safe(DESCRIPTION[c.id]||'')}</p>${art(c)}<div class="detail-row"><span>初期費用</span><strong>${costLabel(c)}</strong></div><div class="detail-row"><span>必要科学技術</span><strong>${c.requiredTechnology||'なし'}</strong></div>${effects.map(e=>`<div class="detail-row"><span>政策効果</span><strong>${safe(e)}</strong></div>`).join('')}<p class="muted">同じ政策が継続中・研究中の場合は再実行できません。時間を要する効果は原則翌年以降に発生します。</p>${nextEnv!==state.environment?`<div class="notice">環境連動イベントの今年の発生確率（仮）：${riskNow}% → ${preview}%</div>`:''}<button class="btn primary block" style="margin-top:16px" data-action="select" data-id="${c.id}" ${actionable(c.id)?'':'disabled'}>${actionable(c.id)?'この政策を実行する':'現在実行できません'}</button></div></div>`;
}
function error(e){notice=e?.message||'処理に失敗しました';const old=document.querySelector('.toast');if(old)old.remove();const el=document.createElement('div');el.className='toast';el.textContent=notice;document.body.appendChild(el);setTimeout(()=>el.remove(),3500)}
function handler(el,ev){const act=el.dataset.action;
try{
 if(act==='preview-route'){
   routePreviewId=el.dataset.id;
   const oldScroll=document.querySelector('.route-scroll')?.scrollLeft||0;
   render();
   const newScroll=document.querySelector('.route-scroll');if(newScroll)newScroll.scrollLeft=oldScroll;
   return;
 }
 if(act==='detail'){detailId=el.dataset.id;if(state.stage==='policy'){routePreviewId=detailId;render()}modal(E.CARD[detailId]);return}
 if(act==='close-modal'||act==='close-overlay'){if(act==='close-overlay'&&ev.target!==el)return;modalRoot.innerHTML='';detailId=null;return}
 if(act==='toggle-risk'){riskExpanded=!riskExpanded;render();return}
 if(act==='reset'){if(!confirm('20年間の進行状況を削除して最初から始めますか？'))return;state=E.newGame();routePreviewId=null;upkeepChosen=new Set();modalRoot.innerHTML='';render();return}
 if(act==='upkeep-check'){const id=Number(el.dataset.id);if(el.checked)upkeepChosen.add(id);else upkeepChosen.delete(id);render();return}
 if(act==='finish-upkeep'){E.resolveUpkeep(state,Array.from(upkeepChosen));upkeepChosen=new Set();render();return}
 if(act==='back-manage'){state.stage='policy';render();return}
 if(act==='select'){const id=el.dataset.id;modalRoot.innerHTML='';E.playCard(state,id);routePreviewId=null;render();return}
 if(act==='manage'){E.manage(state,Number(el.dataset.fid),el.dataset.kind);render();return}
 if(act==='event-response'){E.resolveEvent(state,el.dataset.kind);render();return}
 if(act==='next-year'){E.finishYear(state);routePreviewId=null;upkeepChosen=new Set();render();return}
 if(act==='continue-milestone'){E.continueMilestone(state);routePreviewId=null;render();return}
}catch(e){error(e)}
}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-action]');if(el && el.tagName!=='INPUT')handler(el,ev)});
document.addEventListener('change',ev=>{const el=ev.target.closest('input[data-action]');if(el)handler(el,ev)});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')modalRoot.innerHTML='';
 if((ev.key==='Enter'||ev.key===' ')&&ev.target.closest('.road-node[data-action]')){ev.preventDefault();handler(ev.target.closest('[data-action]'),ev)}});
render();
})();
