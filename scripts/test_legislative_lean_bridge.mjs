import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluate, scan, versionAt } from "../site/commonwealth-legislative-stress.mjs";

const rows = readFileSync(process.argv[2], "utf8").split(/\r?\n/);
const theoremNames = ["phaseout_monotone","phaseout_grant_bounded","phaseout_plateau",
  "phaseout_grant_eq_clamp","v1_cliff_exact","v1_unique_cliff","v2_monotone","v2_no_adjacent_cliff",
  "version_2026","version_2027","version_invalid_day","version_unsupported_year",
  "amendment_boundary","invalid_february"];
for (const name of theoremNames) {
  const line = rows.find(s => s.includes("Commonwealth.LegislativeStress."+name+"'") &&
    (s.includes("depends on axioms:") || s.includes("does not depend on any axioms")));
  assert.ok(line, "Missing Lean axiom audit: " + name);
  if (line.includes("depends on axioms:")) {
    const ax = line.match(/\[(.*)\]/);
    assert.ok(ax, line);
    for (const a of ax[1].split(",").map(x=>x.trim()).filter(Boolean))
      assert.ok(["propext","Classical.choice","Quot.sound"].includes(a), "Unexpected axiom: "+a);
  }
}
const actual = new Map();
for(const row of rows.filter(r=>r.startsWith("CW|"))) {
  const fields=row.split("|");
  assert.equal(fields.length,6);
  const key=fields.slice(1,fields[1]==="income"?4:5).join("|");
  assert.ok(!actual.has(key),"Duplicate Lean row: "+key);
  actual.set(key,fields.slice(fields[1]==="income"?4:5));
}
let incomes=0, dates=0;
for(const v of ["v1","v2"]) for(let x=0;x<=2000;x++){
  const key=["income",v,x].join("|"), a=evaluate(v,x);
  assert.deepEqual(actual.get(key),[String(a.grant),String(a.net)],key);
  actual.delete(key); incomes++;
}
for(let y=2025;y<=2028;y++) for(let m=0;m<14;m++) for(let d=0;d<33;d++){
  const date=[y,String(m).padStart(2,"0"),String(d).padStart(2,"0")].join("-");
  let v="none";try{v=versionAt(date)}catch(e){assert.ok(e instanceof RangeError)}
  const key=["date",y,m,d].join("|");
  assert.deepEqual(actual.get(key),[v],key);
  actual.delete(key); dates++;
}
assert.equal(actual.size,0,"Unexpected Lean rows");
assert.equal(incomes,4002);
assert.equal(dates,1848);
assert.equal(scan("v1").length,1);
assert.equal(scan("v2").length,0);
console.log("PASS: "+theoremNames.length+" theorem axiom audits; "+incomes+" income and "+dates+" date rows agree with production JavaScript.");
