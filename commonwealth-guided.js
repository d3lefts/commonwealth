"use strict";
/* Local-only fictional civic journey: no network requests or browser storage. */
(()=>{
  const panels=Array.from(document.querySelectorAll("[data-tour-step]"));
  const back=document.getElementById("cw-back"),next=document.getElementById("cw-next");
  const progress=document.getElementById("cw-progress"),stepIndex=document.getElementById("cw-step-index");
  const stepName=document.getElementById("cw-step-name"),error=document.getElementById("cw-error");
  const inputs=Array.from(document.querySelectorAll('input[name="cw-stance"]'));
  const names=["YOUR PREFERENCE","SIMULATED COMPARISON","EVIDENCE BOUNDARIES","ILLUSTRATIVE RESPONSE"];
  const labels={support:"Support",unsure:"Unsure",oppose:"Oppose"};
  let step=0;
  const chosen=()=>inputs.find(el=>el.checked)?.value||null;
  const setText=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=value;};
  function render(focus){
    panels.forEach((panel,i)=>{panel.hidden=i!==step;});
    progress.value=step+1;
    stepIndex.textContent=String(step+1).padStart(2,"0")+" / 04";
    stepName.textContent=names[step];
    back.disabled=step===0;
    next.textContent=step===0?"Compare representation →":step===1?"Inspect evidence →":step===2?"See outcome →":"Start again";
    error.hidden=true;
    if(step>0){
      const label=labels[chosen()]||"No position selected";
      setText("cw-your-stance",label.toLowerCase());
      setText("cw-choice-display",label);
      setText("cw-outcome-preference",label);
      const message=chosen()==="support"?"This fictional position matches your selected preference. Matching alone proves no real representation.":chosen()==="oppose"?"This fictional position differs from your selected preference. A real comparison would require authenticated roll calls.":"You have not taken a side. The fictional position cannot be treated as agreement or disagreement.";
      setText("cw-comparison",message);
    }
    if(focus){const heading=panels[step].querySelector("h2");heading?.focus();}
  }
  next.addEventListener("click",()=>{
    if(step===3){inputs.forEach(input=>{input.checked=false;});step=0;render(true);return;}
    if(step===0&&!chosen()){error.hidden=false;inputs[0]?.focus();return;}
    step++;render(true);
  });
  back.addEventListener("click",()=>{if(step>0){step--;render(true);}});
  inputs.forEach(input=>input.addEventListener("change",()=>{error.hidden=true;}));
  render(false);
})();
