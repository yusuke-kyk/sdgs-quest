const assert = require('assert');
const E = require('../js/engine.js');
function random(seed) {let a=seed>>>0;return ()=>{a=(1664525*a+1013904223)>>>0;return a/2**32;};}
assert.strictEqual(E.CARDS.length,24);
const allNames=new Set(E.CARDS.map(c=>c.id));assert.strictEqual(allNames.size,24);
assert.equal(E.risk({environment:70}).climate,35);
assert.equal(E.risk({environment:70}).none,55);
const r=random(99);
const s=E.newGame(r);
assert.equal(s.year,1);assert.equal(s.resources,33);assert.equal(s.environment,51);
assert(s.shown.length===3);assert(s.shown.some(id=>E.canAfford(s,E.CARD[id])));
let tested=0,seen=new Set(),managed=0,researches=0,upkeeps=0,responses=0;
for(let seed=0;seed<450;seed++) {
 const rng=random(seed+42),s=E.newGame(rng);
 let choices=0,guard=0;
 while(s.stage!=='ending' && guard++<90) {
  if(s.stage==='upkeep') {
   upkeeps++;
   const selected=[];let total=0;
   for(const p of s.ongoing.filter(p=>s.currentUpkeep.includes(p.id))) if(total+p.upkeep<=s.resources){selected.push(p.id);total+=p.upkeep}
   E.resolveUpkeep(s,selected,rng);
  } else if(s.stage==='policy') {
   assert(s.shown.length===3);
   const opts=s.shown.filter(id=>E.eligible(s,E.CARD[id]) && E.canAfford(s,E.CARD[id]));
   assert(opts.length>0,'No affordable card on turn '+s.year);
   let id=opts[Math.floor(rng()*opts.length)];
   if(opts.includes('M01')&&rng()<.4) id='M01';
   seen.add(id);
   E.playCard(s,id,rng);
   if(id!=='M01') {choices++;if(id.startsWith('S')) researches++}
  } else if(s.stage==='manage') {
   const opts=E.managementChoices(s).filter(x=>x.cost<=s.resources);
   assert(opts.length>0);
   const opt=opts[Math.floor(rng()*opts.length)];
   E.manage(s,opt.facilityId,opt.action,rng);choices++;managed++;
  } else if(s.stage==='event') {
   if(s.currentEvent.response) responses++;
   const choice=s.currentEvent.response&&s.currentEvent.response.cost<=s.resources&&rng()>.5?'repair':'accept';
   E.resolveEvent(s,choice);
  } else if(s.stage==='result') {
   E.finishYear(s,rng);
  } else if(s.stage==='milestone') {
   assert([5,10,15].includes(s.year));
   assert(s.milestone && s.milestone.year===s.year);
   E.continueMilestone(s,rng);
  } else throw new Error('bad stage '+s.stage);
  assert(s.resources>=0 && s.environment>=0 && s.environment<=100 && s.technology>=0 && s.technology<=100);
 }
 assert.equal(s.stage,'ending');assert.equal(s.year,20);assert.equal(choices,20);assert.equal(s.timeline.length,20);
 assert(E.ending(s).name);
 tested++;
}
console.log(`PASS ${tested} complete games; seen cards=${seen.size}/24; management=${managed}, upkeep shortages=${upkeeps}, researches chosen=${researches}, event responses=${responses}`);
// Targeted upkeep shortage: two active paid policies, only one can be maintained.
{
 const x=E.newGame(random(11));
 x.year=2;x.resources=0;x.ongoing=[
  {id:100,cardId:'N03',start:2,end:5,upkeep:2,resources:0,environment:-4},
  {id:101,cardId:'N05',start:2,end:5,upkeep:2,resources:0,environment:-3},
 ];
 E.startYear(x,random(4));
 assert.equal(x.stage,'upkeep');
 assert.equal(x.resources,3);
 E.resolveUpkeep(x,[100],random(4));
 assert.equal(x.stage,'policy');
 assert.equal(x.resources,1);
 assert.equal(x.environment,48); // initial 51: base +1, forest -4 => 48
}
// Endgame/legacy: a delayed research finishing after year 20 must not count as 20th-year science gain.
{
 const x=E.newGame(random(8));
 x.year=20; x.stage='policy'; x.resources=30;x.technology=50;x.shown=['S08','N01','S01'];
 const before=x.technology;
 E.playCard(x,'S08',()=>0.99); // No random event
 assert.equal(x.technology,before);
 E.resolveEvent(x);E.finishYear(x);
 assert.equal(x.stage,'ending');
 assert(E.ending(x).legacy.some(z=>z.includes('CO₂')));
}
console.log('PASS targeted upkeep shortage and endgame legacy tests');

// Roadmap: after committing to a policy, at least one of next year's three
// cards must be from its connected subjects whenever an affordable candidate exists.
{
 const x=E.newGame(random(401));
 E.playCard(x,x.shown.find(id=>E.CARD[id].id!=='M01' && E.canAfford(x,E.CARD[id])),random(2));
 const selected=x.routeBias;
 assert(E.routeOptions(selected).length>=1);
 E.resolveEvent(x,'accept');E.finishYear(x,random(3));
 const eligibleConnected=E.CARDS.filter(c=>E.routeOptions(selected).includes(c.category)&&E.eligible(x,c)&&E.canAfford(x,c));
 if(eligibleConnected.length) assert(x.shown.some(id=>E.routeOptions(selected).includes(E.CARD[id].category)));
}
// Five-year milestone fires after exactly 5 completed years, without
// advancing the year or consuming the once-per-year policy action.
{
 const rng=random(555),x=E.newGame(rng);
 for(let year=1;year<=5;year++){
  const selected=x.shown.find(id=>id!=='M01'&&E.canAfford(x,E.CARD[id]));
  assert(selected);
  E.playCard(x,selected,rng);E.resolveEvent(x,'accept');E.finishYear(x,rng);
 }
 assert.equal(x.stage,'milestone');assert.equal(x.year,5);assert.equal(x.timeline.length,5);
 assert.equal(x.milestone.from,1);assert.equal(x.milestone.to,5);
 E.continueMilestone(x,rng);assert.equal(x.year,6);assert.equal(x.stage,'policy');
}
console.log('PASS roadmap branch and year-5 milestone tests');

// Ver.0.3: persist last year's whole hand and highlightable chosen policy.
{
 const rng=random(142),x=E.newGame(rng);
 const choices=x.shown.slice();
 const chosen=choices.find(id=>id!=='M01'&&E.canAfford(x,E.CARD[id]));
 assert(chosen);
 E.playCard(x,chosen,rng);
 assert.deepStrictEqual(x.previousYearOptions,choices);
 assert.equal(x.previousYearChosenId,chosen);
 E.resolveEvent(x,'accept'); E.finishYear(x,rng);
 assert.equal(x.year,2);
 assert.deepStrictEqual(x.previousYearOptions,choices);
 assert.equal(x.previousYearChosenId,chosen);
 assert.equal(x.previousYearOptions.filter(id=>id!==chosen).length,2);
}
console.log('PASS v0.3 previous-year hand persistence');
