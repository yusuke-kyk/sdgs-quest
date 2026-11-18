/* SDGs Quest Prototype v0.3: deterministic rules except explicit RNG draws.
 * Browser: window.SDGSEngine; Node tests: require('./engine.js').
 * Balance figures from policy_cards.json v0.2 are provisional.
 */
(function (root) {
  'use strict';
  const CFG = root.SDGS_DATA || (typeof require === 'function' ? require('../policy_cards.json') : null);
  if (!CFG) throw new Error('SDGS_DATA is missing');
  const CARDS = CFG.cards;
  const CARD = Object.fromEntries(CARDS.map(c => [c.id, c]));
  const RENEWABLE = new Set(['E02', 'E03', 'E04', 'E06']);
  const ENERGY_UPGRADE = {
    E01: { cost: 8, resource: 2, environment: 1 },
    E02: { cost: 8, resource: 2, environment: 0 },
    E03: { cost: 9, resource: 2, environment: 0 },
    E04: { cost: 6, resource: 1, environment: 0 },
    E05: { cost: 8, resource: 2, environment: 1 },
    E06: { cost: 9, resource: 2, environment: 0 },
    E07: { cost: 12, resource: 3, environment: 1 }
  };
  const ENERGY_EXTEND = { E01: 6, E02: 6, E03: 7, E04: 5, E05: 6, E06: 8, E07: 10 };
  const clamp = x => Math.max(0, Math.min(100, x));
  const randInt = (n, rng) => Math.floor(rng() * n);
  const deep = x => JSON.parse(JSON.stringify(x));

  function newGame(rng = Math.random) {
    const s = {
      version: 2, year: 1, resources: CFG.startState.resources,
      environment: CFG.startState.environment, technology: CFG.startState.technology,
      stage: 'policy', facilities: [], ongoing: [], researches: [],
      played: [], timeline: [], shown: [], categoryMisses: { energy: 0, env: 0, science: 0 },
      paidIds: [], currentEvent: null, yearReport: null, lastYearReport: null,
      nextId: 1, reducedBaseIncomeYear: null, currentUpkeep: [],
      routeBias: null, routeHistory: [], milestone: null,
      previousYearOptions: [], previousYearChosenId: null,
      lastAction: null, eventResolveNotes: []
    };
    startYear(s, rng);
    return s;
  }
  const idFor = s => s.nextId++;
  const change = (s, delta) => {
    s.resources = Math.max(0, s.resources + (delta.resources || 0));
    s.environment = clamp(s.environment + (delta.environment || 0));
    s.technology = clamp(s.technology + (delta.technology || 0));
  };
  const runningFacility = (f, y) => f.start <= y && f.end >= y;
  const runningPolicy = (p, y) => p.start <= y && p.end >= y;
  function isActive(s, cardId) {
    return s.facilities.some(f => f.cardId === cardId && f.end >= s.year)
      || s.ongoing.some(p => p.cardId === cardId && p.end >= s.year)
      || s.researches.some(p => p.cardId === cardId);
  }
  function eligible(s, card) {
    if (s.technology < card.requiredTechnology) return false;
    if (isActive(s, card.id)) return false;
    if (card.id === 'M01' && !s.facilities.some(f => runningFacility(f, s.year))) return false;
    if (card.id === 'S05' && !s.facilities.some(f => RENEWABLE.has(f.cardId) && runningFacility(f, s.year))) return false;
    return true;
  }
  function managementChoices(s) {
    const result = [];
    for (const f of s.facilities.filter(f => runningFacility(f, s.year))) {
      result.push({ facilityId: f.id, cardId: f.cardId, action: 'decommission', cost: 0,
        label: '廃止', description: '施設を廃止し、以降の収入と環境負荷を停止する。' });
      if (!f.upgraded) {
        const x = ENERGY_UPGRADE[f.cardId];
        result.push({ facilityId: f.id, cardId: f.cardId, action: 'upgrade', cost: x.cost,
          label: '強化', description: `翌年から資源生産+${x.resource}/年、環境負荷+${x.environment}/年` });
      }
      if (!f.extended) {
        result.push({ facilityId: f.id, cardId: f.cardId, action: 'extend', cost: ENERGY_EXTEND[f.cardId],
          label: '整備・延長', description: '稼働期間を2年間延長する。' });
      }
    }
    return result;
  }
  function canAfford(s, c) {
    return c.id === 'M01' ? managementChoices(s).some(x => x.cost <= s.resources) : c.cost <= s.resources;
  }
  function isLegacyOnly(s, c) {
    if (s.year < 18) return false;
    const effect = c.instantEffect || {};
    const instant = Object.values(effect).some(x => x !== 0);
    if (instant) return false;
    if (c.delayedResearch) return s.year + c.delayedResearch.yearsUntilCompletion > 20;
    if (c.ongoingEffect) return s.year + 1 > 20;
    return false;
  }
  // The route is never a second yearly action: the selected policy determines
  // which subjects are more likely to be available on the FOLLOWING year.
  const ROUTES = {
    energy: ['energy','science'], env: ['env','science'],
    science: ['science','energy'], manage: ['energy','env']
  };
  function routeOptions(category) { return ROUTES[category] || []; }
  function weightedSample(candidates, n, s, rng) {
    const pool = candidates.slice(), answer = [];
    while (pool.length && answer.length < n) {
      const weights = pool.map(c => {
        const miss = s.categoryMisses[c.category] || 0;
        let w = 1 + Math.min(2.2, miss * 0.36);
        if (c.category === 'energy' && s.resources <= 17 && c.cost <= s.resources) w *= 1.4;
        if (s.resources < 8 && c.cost === 0) w *= 1.6;
        if (c.id === 'M01') w *= 0.55;
        if (routeOptions(s.routeBias).includes(c.category)) w *= 1.65;
        return w;
      });
      let target = rng() * weights.reduce((a, b) => a + b, 0);
      let at = weights.length - 1;
      for (let i = 0; i < weights.length; i++) {
        target -= weights[i];
        if (target < 0) { at = i; break; }
      }
      answer.push(pool.splice(at, 1)[0]);
    }
    return answer;
  }
  function draw(s, rng = Math.random) {
    let valid = CARDS.filter(c => eligible(s, c));
    // Preserve a meaningful road-map promise: if at least one affordable and
    // eligible policy belongs to an adjacent route, guarantee one in the draw.
    const adjacent = routeOptions(s.routeBias);
    const routeCandidates = valid.filter(c => adjacent.includes(c.category) && canAfford(s, c));
    const routePick = routeCandidates.length ? weightedSample(routeCandidates, 1, s, rng)[0] : null;
    let picks = routePick ? [routePick, ...weightedSample(valid.filter(c => c.id !== routePick.id), 2, s, rng)]
                          : weightedSample(valid, 3, s, rng);
    // During final years, retain at least two cards with impact within the 20-year evaluation window.
    if (picks.filter(c => isLegacyOnly(s, c)).length > 1) {
      const already = new Set(picks.map(c => c.id));
      const replacements = valid.filter(c => !already.has(c.id) && !isLegacyOnly(s, c));
      for (let i = 2; i >= 0 && picks.filter(c => isLegacyOnly(s, c)).length > 1; i--) {
        if (routePick && picks[i].id === routePick.id) continue;
        if (!isLegacyOnly(s, picks[i]) || !replacements.length) continue;
        picks[i] = replacements.shift();
      }
    }
    if (picks.length && !picks.some(c => canAfford(s, c))) {
      const selected = new Set(picks.map(c => c.id));
      const fallback = valid.filter(c => !selected.has(c.id) && canAfford(s, c));
      if (fallback.length) picks[picks.length - 1] = weightedSample(fallback, 1, s, rng)[0];
    }
    if (s.year === 20 && picks.every(c => isLegacyOnly(s, c))) {
      const fall = valid.filter(c => !isLegacyOnly(s, c) && !picks.includes(c));
      if (fall.length) picks[picks.length - 1] = fall[0];
    }
    const cats = new Set(picks.map(c => c.category));
    ['energy','env','science'].forEach(k => { s.categoryMisses[k] = cats.has(k) ? 0 : s.categoryMisses[k] + 1; });
    s.shown = picks.map(c => c.id);
  }
  function startYear(s, rng = Math.random) {
    const y = s.year;
    s.facilities = s.facilities.filter(f => f.end >= y);
    s.ongoing = s.ongoing.filter(p => p.end >= y);
    s.currentUpkeep = s.ongoing.filter(p => runningPolicy(p, y) && p.upkeep > 0).map(p => p.id);
    s.currentEvent = null;
    s.stage = 'policy';
    s.eventResolveNotes = [];
    s.lastAction = null;
    s.yearReport = { year: y, before: { resources: s.resources, environment: s.environment, technology: s.technology },
      notes: [], income: 0, upkeep: 0, policy: null, event: 'なし' };
    for (const job of s.researches.filter(x => x.completeYear === y)) {
      change(s, { technology: job.technology, environment: job.environment });
      s.yearReport.notes.push(`${CARD[job.cardId].name}が完成：技術+${job.technology}${job.environment ? `、環境${job.environment}` : ''}`);
    }
    s.researches = s.researches.filter(x => x.completeYear > y);
    let base = CFG.baseResourceIncomePerYear;
    if (s.reducedBaseIncomeYear === y) { base = Math.max(0, base - 2); s.reducedBaseIncomeYear = null; }
    const renewing = s.ongoing.some(p => p.cardId === 'S05' && runningPolicy(p, y));
    let facilityIncome = 0;
    for (const f of s.facilities) {
      if (!runningFacility(f, y)) continue;
      if (f.pausedYear === y) { s.yearReport.notes.push(`${CARD[f.cardId].name}は災害の影響で今年の生産を休止`); continue; }
      facilityIncome += f.resourcePerYear + (renewing && RENEWABLE.has(f.cardId) ? 1 : 0);
    }
    s.resources += base + facilityIncome;
    s.yearReport.income = base + facilityIncome;
    const upkeepTotal = s.ongoing.filter(p => s.currentUpkeep.includes(p.id)).reduce((z, p) => z + p.upkeep, 0);
    if (upkeepTotal > s.resources) {
      s.stage = 'upkeep';
      s.paidIds = [];
      return;
    }
    resolveUpkeep(s, s.currentUpkeep, rng);
  }
  function resolveUpkeep(s, selected, rng = Math.random) {
    if (s.stage !== 'upkeep' && s.stage !== 'policy') throw new Error('Not in upkeep phase');
    const validIds = new Set(s.currentUpkeep);
    const ids = [...new Set(selected)].filter(id => validIds.has(id));
    const cost = s.ongoing.filter(p => ids.includes(p.id)).reduce((z,p) => z+p.upkeep, 0);
    if (cost > s.resources) throw new Error('維持費が予算を超えています');
    s.resources -= cost;
    s.paidIds = ids;
    s.yearReport.upkeep = cost;
    const policyActive = p => runningPolicy(p,s.year) && (p.upkeep === 0 || ids.includes(p.id));
    let yearlyResource = 0, yearlyEnv = CFG.baseEnvironmentBurdenPerYear;
    for (const f of s.facilities) {
      if (runningFacility(f,s.year) && f.pausedYear !== s.year) yearlyEnv += f.environmentPerYear;
    }
    for (const p of s.ongoing) {
      if (policyActive(p)) { yearlyResource += p.resources; yearlyEnv += p.environment; }
      else if (runningPolicy(p,s.year) && p.upkeep) s.yearReport.notes.push(`${CARD[p.cardId].name}は維持費未払いで今年の効果なし`);
    }
    change(s,{resources:yearlyResource,environment:yearlyEnv});
    s.yearReport.notes.push(`基礎環境負荷 +${CFG.baseEnvironmentBurdenPerYear}、継続効果を反映`);
    s.stage = 'policy';
    draw(s,rng);
  }
  function effectLabel(c) {
    const parts=[];
    const i=c.instantEffect || {};
    if (i.environment) parts.push(`即時：環境${i.environment>0?'+':''}${i.environment}`);
    if (i.technology) parts.push(`即時：技術+${i.technology}`);
    if (i.resources) parts.push(`即時：資源+${i.resources}`);
    const o=c.ongoingEffect;
    if (o) {
      if (o.resourcesPerYear) parts.push(`翌年から資源${o.resourcesPerYear>0?'+':''}${o.resourcesPerYear}/年 ×${o.durationYears}年`);
      if (o.environmentPerYear) parts.push(`翌年から環境${o.environmentPerYear>0?'+':''}${o.environmentPerYear}/年 ×${o.durationYears}年`);
      if (c.id === 'N08') parts.push('翌年から5年間、環境災害の数値被害30%軽減');
      if (c.id === 'S05') parts.push('翌年から3年間、再エネ施設の生産+1/基・年');
      if (c.id === 'S06') parts.push('翌年から3年間、環境災害の数値被害20%軽減');
      if (o.maintenanceCostPerYear) parts.push(`維持費 資源-${o.maintenanceCostPerYear}/年`);
    }
    const d = c.delayedResearch;
    if (d) parts.push(`${d.yearsUntilCompletion}年後：技術+${d.technology}${d.environment?`、環境${d.environment}`:''}`);
    if (c.id==='M01') parts.push('施設を選び「廃止・強化・延長」から1つ実行');
    return parts;
  }
  function applyAction(s,c) {
    s.resources -= c.cost;
    change(s,c.instantEffect || {});
    const o=c.ongoingEffect;
    if (c.category === 'energy' && o) {
      s.facilities.push({ id:idFor(s), cardId:c.id, start:s.year+1, end:s.year+o.durationYears,
        resourcePerYear:o.resourcesPerYear, environmentPerYear:o.environmentPerYear,
        upgraded:false,extended:false,pausedYear:null });
    } else if (o) {
      s.ongoing.push({ id:idFor(s), cardId:c.id,start:s.year+1,end:s.year+o.durationYears,
        upkeep:o.maintenanceCostPerYear || 0, resources:o.resourcesPerYear || 0,
        environment:o.environmentPerYear || 0 });
    }
    if (c.delayedResearch) {
      const d=c.delayedResearch;
      s.researches.push({ id:idFor(s), cardId:c.id, completeYear:s.year+d.yearsUntilCompletion,
        technology:d.technology, environment:d.environment });
    }
  }
  function playCard(s, id, rng = Math.random) {
    if (s.stage !== 'policy' || !s.shown.includes(id)) throw new Error('選択できないカードです');
    const c=CARD[id];
    if (!c || !eligible(s,c) || !canAfford(s,c)) throw new Error('この政策は現在実行できません');
    if (c.id==='M01') { s.stage='manage'; return; }
    applyAction(s,c);
    s.lastAction={id,name:c.name};
    s.yearReport.policy=c.name;
    // Record the whole offered hand BEFORE the new year draws its own cards.
    // The selected policy remains visible and the two unselected policies dim.
    s.previousYearOptions = s.shown.slice();
    s.previousYearChosenId = id;
    s.played.push({year:s.year,cardId:id,category:c.category});
    s.routeBias = c.category;
    s.routeHistory.push({year:s.year,cardId:id,category:c.category});
    rollEvent(s,rng);
  }
  function manage(s, facilityId, action, rng = Math.random) {
    if (s.stage !== 'manage' || !s.shown.includes('M01')) throw new Error('施設管理を選択できません');
    const opt=managementChoices(s).find(x => x.facilityId===facilityId && x.action===action);
    if (!opt || opt.cost>s.resources) throw new Error('施設管理の条件・費用を確認してください');
    const f=s.facilities.find(x=>x.id===facilityId);
    s.resources -= opt.cost;
    if (action==='decommission') s.facilities=s.facilities.filter(x=>x.id!==facilityId);
    if (action==='upgrade') {
      const x=ENERGY_UPGRADE[f.cardId];
      f.resourcePerYear+=x.resource;
      f.environmentPerYear+=x.environment;
      f.upgraded=true;
    }
    if (action==='extend') { f.end+=2; f.extended=true; }
    s.lastAction={id:'M01',name:`${CARD[f.cardId].name}：${opt.label}`};
    s.yearReport.policy=s.lastAction.name;
    s.previousYearOptions = s.shown.slice();
    s.previousYearChosenId = 'M01';
    s.played.push({year:s.year,cardId:'M01',category:'manage',target:f.cardId,action});
    s.routeBias = 'manage';
    s.routeHistory.push({year:s.year,cardId:'M01',category:'manage'});
    rollEvent(s,rng);
  }
  function climateChance(env) {
    // Continuous piecewise-linear interpolation of preliminary risk knots.
    const points = [[0,5],[20,10],[50,20],[70,35],[90,50],[100,55]];
    for (let i=1;i<points.length;i++) {
      const [a,p] = points[i-1], [b,q] = points[i];
      if (env<=b) return +(p+(q-p)*(env-a)/(b-a)).toFixed(1);
    }
    return 55;
  }
  function risk(s) {
    const climate=climateChance(s.environment);
    return { climate, independent:10, none: +(90-climate).toFixed(1) };
  }
  function climateMitigation(s) {
    let r=0;
    for(const p of s.ongoing) {
      if (!runningPolicy(p,s.year) || (p.upkeep && !s.paidIds.includes(p.id))) continue;
      if(p.cardId==='N08') r+=0.30;
      if(p.cardId==='S06') r+=0.20;
    }
    return Math.min(0.5,r);
  }
  function applicableIndependent(s) {
    const x = [
      {id:'market',weight:3}, {id:'earthquake',weight:2},
      {id:'unexpectedGrant',weight:2}, {id:'researchExchange',weight:2}
    ];
    if(s.played.some(p => p.category==='science')) x.push({id:'internationalLab',weight:3});
    if(s.played.some(p => p.cardId==='N03'||p.cardId==='N07')) x.push({id:'ecosystem',weight:3});
    if(s.played.some(p => p.category==='energy')) x.push({id:'localIndustry',weight:3});
    return x;
  }
  function pickWeighted(items,rng) {
    const total=items.reduce((n,x)=>n+x.weight,0);
    let value=rng()*total;
    for(const x of items) { value-=x.weight; if(value<0) return x.id; }
    return items[items.length-1].id;
  }
  function rollEvent(s, rng = Math.random) {
    const r=risk(s), u=rng()*100;
    if (u>=r.climate+r.independent) {
      s.currentEvent={id:'quiet',title:'穏やかな一年',description:'大きな突発的出来事は起こらなかった。',details:[],harmful:false};
      s.stage='event';
      return;
    }
    const isClimate=u<r.climate;
    const running=s.facilities.filter(f=>runningFacility(f,s.year));
    const climateTypes=[{id:'heavyRain',weight:3},{id:'heatwave',weight:3},{id:'drought',weight:3}];
    if(running.length) climateTypes.push({id:'damagedPlant',weight:2});
    if(s.researches.length) climateTypes.push({id:'labFlood',weight:2});
    const type=isClimate ? pickWeighted(climateTypes,rng) : pickWeighted(applicableIndependent(s),rng);
    const severity= Math.max(0,Math.floor((s.environment-30)/25));
    const mitigation=isClimate?climateMitigation(s):0;
    const resourceLoss=(base)=>Math.round((base+severity)*(1-mitigation));
    const obj={id:type,title:'',description:'',details:[],harmful:true,category:isClimate?'climate':'independent',response:null};
    switch(type) {
      case 'heavyRain': {
        obj.title='記録的な豪雨';obj.description='大雨でインフラに被害が生じた。';
        const loss=resourceLoss(6); change(s,{resources:-loss}); obj.details.push(`資源 -${loss}`);
        change(s,{environment:1});obj.details.push('環境負荷 +1');
        break;
      }
      case 'heatwave': {
        obj.title='記録的な猛暑';obj.description='熱波への対応に社会的な負担が生じた。';
        const loss=resourceLoss(5);change(s,{resources:-loss});obj.details.push(`資源 -${loss}`);
        break;
      }
      case 'drought': {
        obj.title='深刻な干ばつ';obj.description='水不足によって社会活動が停滞した。';
        const loss=resourceLoss(7);change(s,{resources:-loss});obj.details.push(`資源 -${loss}`);
        break;
      }
      case 'damagedPlant': {
        obj.title='発電設備の浸水被害';obj.description='施設の一部が被災。緊急復旧で生産停止を避けられる。';
        const loss=resourceLoss(3);change(s,{resources:-loss});obj.details.push(`資源 -${loss}`);
        const f=running[randInt(running.length,rng)];
        f.pausedYear=s.year+1;
        const repairCost=mitigation>0?2:5;
        obj.response={kind:'restorePlant',targetId:f.id,cost:repairCost,label:`資源${repairCost}で緊急復旧（翌年の停止を回避）`,
          decline:'復旧せず、翌年は生産停止',targetName:CARD[f.cardId].name};
        break;
      }
      case 'labFlood': {
        obj.title='研究設備の被災';obj.description='研究施設が被害を受け、進行中の研究が遅れる可能性がある。';
        const job=s.researches[randInt(s.researches.length,rng)];
        job.completeYear+=1;
        obj.details.push(`${CARD[job.cardId].name}の完成が1年遅延`);
        obj.response={kind:'repairLab',targetId:job.id,cost:5,label:'資源5で研究設備を復旧（遅延を回避）',
          decline:'復旧せず、研究は1年遅延',targetName:CARD[job.cardId].name};
        break;
      }
      case 'market':
        obj.title='世界的な景気後退';obj.description='経済情勢の悪化で財政収入が減少した。';
        change(s,{resources:-8});obj.details.push('資源 -8');s.reducedBaseIncomeYear=s.year+1;
        obj.details.push('翌年の基礎収入 -2');break;
      case 'earthquake':
        obj.title='地震によるインフラ被害';obj.description='地震は環境負荷に連動しない独立イベント。';
        change(s,{resources:-7});obj.details.push('資源 -7');break;
      case 'unexpectedGrant':
        obj.title='地域経済の好転';obj.description='予想外の税収増で政策予算に余裕が生まれた。';
        change(s,{resources:5});obj.details.push('資源 +5');obj.harmful=false;break;
      case 'researchExchange':
        obj.title='学術情報の国際共有';obj.description='研究成果の共有が技術基盤の改善につながった。';
        change(s,{technology:2});obj.details.push('科学技術 +2');obj.harmful=false;break;
      case 'internationalLab':
        obj.title='国際共同研究の進展';obj.description='これまでの研究投資が国際協力につながった。';
        change(s,{technology:4});obj.details.push('科学技術 +4');obj.harmful=false;break;
      case 'ecosystem':
        obj.title='生態系回復の兆し';obj.description='過去の森林・湿地保全が追加的な成果につながった。';
        change(s,{environment:-3});obj.details.push('環境負荷 -3');obj.harmful=false;break;
      case 'localIndustry':
        obj.title='エネルギー関連産業の発展';obj.description='これまでの施設投資をきっかけに地域産業が成長した。';
        change(s,{resources:6});obj.details.push('資源 +6');obj.harmful=false;break;
    }
    if(mitigation && isClimate && obj.harmful) obj.details.push(`防災政策により資源被害を${Math.round(mitigation*100)}%軽減`);
    s.currentEvent=obj;
    s.stage='event';
  }
  function resolveEvent(s, choice='accept') {
    if (s.stage!=='event' || !s.currentEvent) throw new Error('イベント処理中ではありません');
    const ev=s.currentEvent;
    if (ev.response) {
      if(choice==='repair') {
        if(s.resources<ev.response.cost) throw new Error('緊急対応のリソースが不足しています');
        s.resources-=ev.response.cost;
        if(ev.response.kind==='restorePlant') {
          const f=s.facilities.find(x=>x.id===ev.response.targetId);
          if(f) f.pausedYear=null;
        }
        if(ev.response.kind==='repairLab') {
          const j=s.researches.find(x=>x.id===ev.response.targetId);
          if(j) j.completeYear-=1;
        }
        ev.details.push(`緊急復旧：資源 -${ev.response.cost}`);
      } else {
        ev.details.push('緊急復旧は見送った');
      }
    }
    s.yearReport.event=ev.title;
    s.stage='result';
    s.lastYearReport=deep(s.yearReport);
  }
  function finishYear(s, rng = Math.random) {
    if(s.stage!=='result') throw new Error('年間結果を確認してから進んでください');
    s.timeline.push({year:s.year,resources:s.resources,environment:s.environment,
      technology:s.technology,policy:s.yearReport.policy,event:s.yearReport.event});
    if(s.year===20) { s.stage='ending'; return; }
    if(s.year % 5 === 0) {
      const first=s.year-4;
      const before = first===1 ? CFG.startState : s.timeline.find(t=>t.year===first-1);
      const five=s.timeline.filter(t=>t.year>=first && t.year<=s.year);
      const policyCounts={energy:0,env:0,science:0,manage:0};
      s.played.filter(x=>x.year>=first && x.year<=s.year).forEach(x=>policyCounts[x.category]++);
      s.milestone={year:s.year,from:first,to:s.year,counts:policyCounts,
        changes: {resources:s.resources-before.resources, environment:s.environment-before.environment,
          technology:s.technology-before.technology},
        events:five.filter(t=>t.event && t.event!=='穏やかな一年').map(t=>({year:t.year,name:t.event})),
        activeFacilities:s.facilities.filter(f=>f.end>=s.year).length};
      s.stage='milestone';
      return;
    }
    s.year++;
    startYear(s,rng);
  }
  function continueMilestone(s,rng=Math.random) {
    if (s.stage!=='milestone' || !s.milestone || s.year!==s.milestone.year) throw new Error('中間報告の状態ではありません');
    s.milestone=null;
    s.year++;
    startYear(s,rng);
  }
  function ending(s) {
    const green=s.environment<=CFG.endingThresholds.lowEnvironmentMax;
    const advanced=s.technology>=CFG.endingThresholds.highTechnologyMin;
    const id= green?(advanced?'green_advanced':'nature'):(advanced?'gray_advanced':'decline');
    const base={
      green_advanced:{name:'緑の先進文明',tag:'自然と技術の共存',description:'環境への負担を抑えながら、技術革新を社会に生かす未来が開けた。'},
      nature:{name:'自然共生文明',tag:'自然を優先した発展',description:'環境を守る基盤は築かれた。一方で、医療や産業を支える技術には課題も残る。'},
      gray_advanced:{name:'灰色の超技術文明',tag:'進歩と負荷の同居',description:'高度な技術を手にした社会。しかし、環境への負担は解決されていない。'},
      decline:{name:'衰退する文明',tag:'課題を残した未来',description:'環境問題への対応と技術の蓄積が追いつかず、社会には多くの課題が残された。'}
    }[id];
    const counts={energy:0,env:0,science:0,manage:0};
    for(const p of s.played) counts[p.category]++;
    const top=Object.entries(counts).filter(([k])=>k!=='manage').sort((a,b)=>b[1]-a[1])[0]?.[0] || 'env';
    const flavor={
      energy:'エネルギー供給を重視した20年間。経済を支える基盤と、その環境負荷の両方を次世代に残した。',
      env:'環境保全を重視した20年間。保全への取り組みを、次世代へ受け継ぐ文化の土台にした。',
      science:'研究への投資を重視した20年間。培った知識と研究基盤が、その後の世代の選択肢となった。'
    }[top];
    const legacy = [];
    for(const f of s.facilities.filter(f=>f.end>20)) legacy.push(`${CARD[f.cardId].name}：残り${f.end-20}年の計画`);
    for(const p of s.ongoing.filter(p=>p.end>20)) legacy.push(`${CARD[p.cardId].name}：残り${p.end-20}年の取り組み`);
    for(const j of s.researches.filter(j=>j.completeYear>20)) legacy.push(`${CARD[j.cardId].name}：${j.completeYear}年目完成予定`);
    return {id,...base,flavor,legacy,counts};
  }
  const API = {CFG,CARDS,CARD,RENEWABLE,newGame,eligible,canAfford,draw,startYear,resolveUpkeep,
    playCard,managementChoices,manage,risk,climateChance,climateMitigation,resolveEvent,finishYear,continueMilestone,ending,
    effectLabel,isLegacyOnly,routeOptions,clamp};
  root.SDGSEngine=API;
  if(typeof module!=='undefined' && module.exports) module.exports=API;
})(typeof window!=='undefined' ? window : globalThis);
