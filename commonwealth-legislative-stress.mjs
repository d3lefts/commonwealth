// Original Commonwealth fictional model. No real legislation or personal input is collected.
export function evaluate(version,income){if(!Number.isSafeInteger(income)||income<0||income>2000)throw new RangeError("Income must be an integer from 0 to 2000");if(version!=="v1"&&version!=="v2")throw new RangeError("Unknown rule");const grant=version==="v1"?(income<=1000?100:0):Math.max(0,Math.min(100,1100-income));return {income,grant,net:income+grant}}
export function scan(version){const witnesses=[];for(let x=0;x<2000;x++){const before=evaluate(version,x),after=evaluate(version,x+1);if(after.net<before.net)witnesses.push({before,after,change:after.net-before.net})}return witnesses}
export function versionAt(date){if(typeof date!=="string"||!/^202[67]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(date)||new Date(date+"T00:00:00Z").toISOString().slice(0,10)!==date)throw new RangeError("Unsupported or invalid date");return date<"2027-01-01"?"v1":"v2"}
if (typeof document !== "undefined") {
  const root=document.getElementById("legislative-stress");
  if(root){
    const income=root.querySelector("#cw-stress-income"), date=root.querySelector("#cw-stress-date"), result=root.querySelector("#cw-stress-result");
    function render(){const x=Number(income.value), version=versionAt(date.value), a=evaluate(version,x), b=evaluate(version,x+1), w=scan(version);root.querySelector("#cw-stress-income-label").textContent="$"+x;result.textContent=version+" | At $"+x+": grant $"+a.grant+", resources $"+a.net+". At $"+(x+1)+": resources $"+b.net+". Change: "+(b.net-a.net)+" dollars. Full domain sweep: "+w.length+" adjacent decrease(s).";}
    income.addEventListener("input",render);date.addEventListener("change",render);render();
  }
}
