// Original Commonwealth fictional model. No real legislation or personal input is collected.
export function evaluate(version,income){if(!Number.isSafeInteger(income)||income<0||income>2000)throw new RangeError("Income must be an integer from 0 to 2000");if(version!=="v1"&&version!=="v2")throw new RangeError("Unknown rule");const grant=version==="v1"?(income<=1000?100:0):Math.max(0,Math.min(100,1100-income));return {income,grant,net:income+grant}}
export function scan(version){const witnesses=[];for(let x=0;x<2000;x++){const before=evaluate(version,x),after=evaluate(version,x+1);if(after.net<before.net)witnesses.push({before,after,change:after.net-before.net})}return witnesses}
export function versionAt(date){if(typeof date!=="string"||!/^202[67]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(date)||new Date(date+"T00:00:00Z").toISOString().slice(0,10)!==date)throw new RangeError("Unsupported or invalid date");return date<"2027-01-01"?"v1":"v2"}

// The comparison is a presentation-level composition of the certified rule evaluator.
// It does not model population costs or real household behavior.
export function compareAt(date, income) {
  const active = versionAt(date);
  if (!Number.isSafeInteger(income) || income < 0 || income >= 2000)
    throw new RangeError("Comparison requires integer earnings from 0 to 1999");
  const rules = {};
  for (const v of ["v1", "v2"]) {
    const before = evaluate(v, income), after = evaluate(v, income + 1);
    rules[v] = {before, after, change: after.net - before.net};
  }
  return {date, active, income, rules, additionalGrant: rules.v2.before.grant - rules.v1.before.grant};
}
export function warrantAt(date, income) {
  return {
    schema: "commonwealth-legislative-warrant/v1",
    id: "CW-W-STRESS-001",
    authority: "LEGAL_AUTHORITY_NOT_ESTABLISHED",
    evidence: "SYNTHETIC_UNVERIFIED",
    assurance: ["LEAN_MODEL_CHECKED", "FINITE_DOMAIN_IMPLEMENTATION_AGREEMENT"],
    formalSource: "https://github.com/d3lefts/commonwealth/blob/d3959dc9a66fc570c51e5edba2a7d93fc34da035/lean/LegislativeStress.lean",
    verificationReceipt: "https://github.com/d3lefts/commonwealth/actions/runs/45553699274",
    domain: {incomeMin: 0, incomeMax: 2000, currency: "USD", units: "integer dollars"},
    comparison: compareAt(date, income),
    limitations: ["Fictional rules; no legal validity or actual entitlement.",
      "No population, budget, behavioral or distributional model.",
      "Lean covers the formal rule semantics, not arbitrary JavaScript execution or this receipt format.",
      "No government submission or official decision."]
  };
}
if (typeof document !== "undefined") {
  const root = document.getElementById("legislative-stress");
  if (root) {
    const el = id => root.querySelector("#cw-stress-" + id);
    const income = el("income"), date = el("date");
    const money = x => (x < 0 ? "−" : "") + "$" + Math.abs(x).toLocaleString("en-US");
    function render() {
      const c = compareAt(date.value, Number(income.value));
      el("income-label").textContent = money(c.income);
      for (const v of ["v1", "v2"]) {
        const r = c.rules[v];
        el(v + "-grant").textContent = money(r.before.grant);
        el(v + "-net").textContent = money(r.before.net);
        el(v + "-next").textContent = money(r.after.net);
        el(v + "-change").textContent = money(r.change);
        el(v + "-active").hidden = c.active !== v;
      }
      const r = c.rules[c.active], w = scan(c.active);
      el("result").textContent = c.active + " | At " + money(c.income) + ": grant " + money(r.before.grant) +
        ", resources " + money(r.before.net) + ". At " + money(c.income + 1) + ": resources " +
        money(r.after.net) + ". Change: " + money(r.change) + ". Full domain sweep: " + w.length + " adjacent decrease(s).";
      el("cost").textContent = "Additional grant under amendment at this income: " + money(c.additionalGrant) + ".";
    }
    income.addEventListener("input", render);
    date.addEventListener("change", render);
    el("witness").addEventListener("click", () => { income.value = "1000"; render(); });
    el("reset").addEventListener("click", () => { income.value = "1000"; date.value = "2026-12-31"; render(); });
    el("export").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(warrantAt(date.value, Number(income.value)), null, 2) + "\n"], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "commonwealth-legislative-warrant.json";
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    render();
  }
}
