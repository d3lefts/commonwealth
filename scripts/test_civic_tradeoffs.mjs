// Independent exact-arithmetic audit of the Commonwealth fictional budget model.
import assert from "node:assert/strict";
import {MODEL,evaluatePlan,receipt,exportedPlan} from "../site/civic-tradeoffs-core.mjs";

const opts=MODEL.options;
assert.equal(opts.length,9);
assert.equal(new Set(opts.map(x=>x.id)).size,opts.length);
assert.ok(opts.every(x=>Number.isSafeInteger(x.amount)&&x.amount>0));
for(const [name,s] of Object.entries(MODEL.scenarios)){
  assert.equal(MODEL.annualServices-s.funding,s.gap);
  const zero=evaluatePlan({scenario:name});
  assert.equal(zero.covered,0);
  assert.equal(zero.remaining,s.gap);
  assert.equal(zero.percent,0);
  for(let mask=0;mask<(1<<opts.length);mask++){
    const selected=opts.filter((_,i)=>mask&(1<<i)).map(x=>x.id);
    for(let levy=0;levy<=MODEL.levyMax;levy+=MODEL.levyStep){
      const p=evaluatePlan({scenario:name,selected,levy});
      // Independent recomputation: never trust the evaluated totals as expected values.
      const expectedCut=selected.reduce((s,id)=>{
        const x=opts.find(o=>o.id===id);return s+(x.group==="cut"?x.amount:0);
      },0);
      const expectedRevenue=selected.reduce((s,id)=>{
        const x=opts.find(o=>o.id===id);return s+(x.group==="revenue"?x.amount:0);
      },levy);
      const expectedCovered=expectedCut+expectedRevenue;
      assert.equal(p.cuts,expectedCut);
      assert.equal(p.revenue,expectedRevenue);
      assert.equal(p.covered,expectedCovered);
      assert.equal(p.remaining,Math.max(0,s.gap-expectedCovered));
      assert.equal(p.surplus,Math.max(0,expectedCovered-s.gap));
      assert.equal(p.targetMet,expectedCovered>=s.gap);
      assert.equal(p.remaining*p.surplus,0);
      assert.equal(s.gap+p.surplus,p.covered+p.remaining);
    }
  }
}
const dup=evaluatePlan({selected:["parks","parks","parking"],levy:0});
assert.equal(dup.covered,450000+360000,"Duplicate options cannot double-count");
assert.throws(()=>evaluatePlan({selected:["nonexistent"]}),RangeError);
assert.throws(()=>evaluatePlan({scenario:"actual-government-budget"}),RangeError);
for(const levy of [-100000,100001,1500001,0.1,NaN,Infinity])
  assert.throws(()=>evaluatePlan({levy}),RangeError);
const p={scenario:"baseline",selected:["parks","parking"],levy:100000};
const receiptText=receipt(p);
assert.match(receiptText,/Fictional|FICTIONAL/);
assert.match(receiptText,/No government submission/);
assert.match(receiptText,/\$910,000/);
const json=JSON.parse(exportedPlan(p));
assert.equal(json.calculation.covered,910000);
assert.equal(json.calculation.targetMet,false);
assert.equal(json.schema,"commonwealth-fictional-plan/v1");
console.log("PASS: 16,384 synthetic scenarios, exact arithmetic, source boundaries, no double counting.");
