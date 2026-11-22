/**
 * Commonwealth Civic Trade-off Lab.
 * Synthetic, annual, local-only arithmetic. These are NOT official budget data.
 * All figures are exact integer US dollars, not floating-point estimates.
 */
export const MODEL = Object.freeze({
  version: "commonwealth-civic-tradeoffs/v1",
  community: "Harborview (fictional)",
  annualServices: 12400000,
  scenarios: Object.freeze({
    baseline: Object.freeze({title: "Baseline exercise", funding: 10000000, gap: 2400000}),
    stress: Object.freeze({title: "Funding stress test", funding: 9200000, gap: 3200000})
  }),
  levyMax: 1500000,
  levyStep: 100000,
  options: Object.freeze([
    {id:"library",group:"cut",name:"Reduce library hours",amount:320000,
     detail:"Shorter opening hours could make learning and public-computer access less convenient."},
    {id:"parks",group:"cut",name:"Scale back parks maintenance",amount:450000,
     detail:"Less frequent upkeep could affect grounds, equipment and public spaces."},
    {id:"transit",group:"cut",name:"Reduce community transit",amount:620000,
     detail:"Some trips and service frequencies would need reconsideration."},
    {id:"streets",group:"cut",name:"Defer sidewalk and street work",amount:980000,
     detail:"Some repairs would move to later years, possibly increasing maintenance needs."},
    {id:"youth",group:"cut",name:"Reduce after-school programming",amount:410000,
     detail:"Fewer sessions or places could be available for young people."},
    {id:"housing",group:"cut",name:"Reduce housing navigation support",amount:500000,
     detail:"Residents could receive less assistance finding services and information."},
    {id:"parking",group:"revenue",name:"Increase parking permit revenue",amount:360000,
     detail:"People who purchase permits would carry additional costs."},
    {id:"events",group:"revenue",name:"Increase facility and event fees",amount:240000,
     detail:"Groups and residents using public facilities could pay more."},
    {id:"licenses",group:"revenue",name:"Increase commercial license revenue",amount:420000,
     detail:"Eligible businesses could face higher annual fees."}
  ])
});
const OPTION_BY_ID = new Map(MODEL.options.map(option => [option.id, option]));
export const money = n => "$" + Number(n).toLocaleString("en-US", {maximumFractionDigits:0});

export function evaluatePlan({scenario="baseline",selected=[],levy=0}={}) {
  if (!Object.hasOwn(MODEL.scenarios, scenario)) throw new RangeError("Unknown scenario");
  if (!Array.isArray(selected) || selected.some(id => typeof id !== "string" || !OPTION_BY_ID.has(id)))
    throw new RangeError("Unknown budget option");
  if (!Number.isSafeInteger(levy) || levy < 0 || levy > MODEL.levyMax || levy % MODEL.levyStep !== 0)
    throw new RangeError("Revenue lever must be a valid integer step");
  const unique = new Set(selected);
  const options = MODEL.options.filter(option => unique.has(option.id));
  const cuts = options.filter(option => option.group==="cut").reduce((s,option)=>s+option.amount,0);
  const otherRevenue = options.filter(option => option.group==="revenue").reduce((s,option)=>s+option.amount,0);
  const revenue = otherRevenue + levy;
  const target = MODEL.scenarios[scenario].gap;
  const covered = cuts + revenue;
  return {
    version:MODEL.version, scenario, target, selected:options.map(x=>x.id),
    cuts, otherRevenue, levy, revenue, covered,
    remaining:Math.max(0,target-covered), surplus:Math.max(0,covered-target),
    percent:Math.min(100,Math.round(covered*100/target)),
    targetMet:covered>=target
  };
}

export function receipt(plan) {
  const p=evaluatePlan(plan);
  const lines=[
    "COMMONWEALTH / FICTIONAL CIVIC TRADE-OFF EXERCISE",
    "No government submission or public opinion measurement",
    "Model: "+p.version,
    "Community: "+MODEL.community,
    "Scenario: "+MODEL.scenarios[p.scenario].title,
    "Annual illustrative services: "+money(MODEL.annualServices),
    "Annual illustrative funding: "+money(MODEL.scenarios[p.scenario].funding),
    "Illustrative funding gap: "+money(p.target),
    "",
    "Selected options:"
  ];
  for (const option of MODEL.options.filter(x=>p.selected.includes(x.id)))
    lines.push("- "+option.name+": "+money(option.amount)+" ("+(option.group==="cut"?"reduced cost":"added revenue")+")");
  if(!p.selected.length)lines.push("- None");
  lines.push("Additional illustrative revenue lever: "+money(p.levy));
  lines.push("Cuts: "+money(p.cuts)+"; Revenue: "+money(p.revenue));
  lines.push("Gap closed: "+money(p.covered)+"; Remaining: "+money(p.remaining)+"; Surplus: "+money(p.surplus));
  lines.push("Target met: "+(p.targetMet?"YES":"NO"));
  lines.push("Assumptions: fixed annual amounts; no behavioral, equity, tax incidence, legal or second-order effects modeled.");
  lines.push("Local-only scenario; neither official figures nor advocacy.");
  return lines.join("\n");
}

export function exportedPlan(plan) {
  const p=evaluatePlan(plan);
  return JSON.stringify({
    schema:"commonwealth-fictional-plan/v1",
    model:MODEL.version,
    disclaimer:"Synthetic, nonbinding illustration; no government receipt or voter submission.",
    scenario:p.scenario,
    selected:p.selected,
    levy:p.levy,
    calculation:{target:p.target,cuts:p.cuts,revenue:p.revenue,covered:p.covered,remaining:p.remaining,surplus:p.surplus,targetMet:p.targetMet}
  }, null, 2)+"\n";
}
