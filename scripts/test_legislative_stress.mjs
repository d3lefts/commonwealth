import assert from "node:assert/strict";
import { evaluate, scan, versionAt, compareAt, warrantAt } from "../site/commonwealth-legislative-stress.mjs";
for (const v of ["v1","v2"]) {
  for(let x=0;x<=2000;x++){
    let grant=0;
    if(v==="v1") { if(x<=1000) grant=100; }
    else { for(let dollar=1;dollar<=100;dollar++) if(x<=1100-dollar) grant++; }
    assert.deepEqual(evaluate(v,x),{income:x,grant,net:x+grant});
  }
}
assert.deepEqual(scan("v1"),[{before:{income:1000,grant:100,net:1100},after:{income:1001,grant:0,net:1001},change:-99}]);
assert.deepEqual(scan("v2"),[]);
assert.equal(versionAt("2026-12-31"),"v1");
assert.equal(versionAt("2027-01-01"),"v2");
for(const x of [-1,2001,1.5,NaN,Infinity,"10"]) assert.throws(()=>evaluate("v1",x),RangeError);
assert.throws(()=>evaluate("v3",0),RangeError);
for(const d of ["2025-12-31","2027-02-30","2028-01-01",null]) assert.throws(()=>versionAt(d),RangeError);
console.log("PASS: 4002 model inputs, 4000 adjacent transitions, date boundaries and invalid inputs; fictional scope only.");

for(const date of ["2026-12-31","2027-01-01"]) for(let x=0;x<2000;x++){
  const c=compareAt(date,x);
  assert.equal(c.active,date.startsWith("2026")?"v1":"v2");
  for(const v of ["v1","v2"]){
    const before=evaluate(v,x), after=evaluate(v,x+1);
    assert.deepEqual(c.rules[v],{before,after,change:after.net-before.net});
  }
  assert.equal(c.additionalGrant,x>1000&&x<1100?1100-x:0);
}
assert.throws(()=>compareAt("2026-12-31",2000),RangeError);
const receipt=warrantAt("2027-01-01",1001);
assert.equal(receipt.authority,"LEGAL_AUTHORITY_NOT_ESTABLISHED");
assert.equal(receipt.comparison.additionalGrant,99);
assert.deepEqual(JSON.parse(JSON.stringify(receipt)),receipt);
console.log("PASS: 4000 paired amendment comparisons and reproducible fictional Warrant receipt.");
