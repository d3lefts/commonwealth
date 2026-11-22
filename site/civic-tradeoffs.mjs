"use strict";
import {MODEL,evaluatePlan,money,receipt,exportedPlan} from "./civic-tradeoffs-core.mjs";

/* No network, cookies, browser storage, analytics or public submissions. */
const byId=id=>document.getElementById(id);
const selected=new Set();
const slider=byId("levy-input");
const fallback=byId("copy-fallback");
const actionMessage=byId("action-message");
const choiceContainer=byId("receipt-choices");
let scenario="baseline";

for (const group of ["cut","revenue"]) {
  const container=byId(group==="cut"?"cut-options":"revenue-options");
  container.replaceChildren();
  for (const option of MODEL.options.filter(item=>item.group===group)) {
    const label=document.createElement("label");
    label.className="lab-option";
    const input=document.createElement("input");
    input.type="checkbox";
    input.dataset.budgetOption=option.id;
    input.value=option.id;
    input.setAttribute("aria-label",option.name);
    const copy=document.createElement("span");
    copy.className="lab-option-copy";
    const heading=document.createElement("strong");
    heading.textContent=option.name;
    const detail=document.createElement("small");
    detail.textContent=option.detail;
    copy.append(heading,detail);
    const amount=document.createElement("span");
    amount.className="lab-option-amount";
    amount.textContent=(group==="cut"?"-":"+")+money(option.amount);
    label.append(input,copy,amount);
    container.append(label);
    input.addEventListener("change",()=>{
      if(input.checked)selected.add(option.id);
      else selected.delete(option.id);
      render();
    });
  }
}
const currentPlan=()=>({scenario,selected:Array.from(selected),levy:Number(slider.value)});
function text(id,value){byId(id).textContent=String(value);}
function render(){
  const p=evaluatePlan(currentPlan());
  text("scenario-name",scenario==="baseline"?"BASELINE":"STRESS TEST");
  text("gap-target",money(p.target));
  text("cut-total",money(p.cuts));
  text("revenue-total",money(p.revenue));
  text("covered-total",money(p.covered));
  text("levy-output",money(p.levy));
  text("gap-percent",p.percent+"%");
  byId("gap-progress").value=p.percent;
  byId("gap-progress").textContent=p.percent+"%";
  text("gap-status",p.targetMet?"Target addressed":"Gap remaining");
  text("balance-label",p.surplus>0?"Above target":p.targetMet?"Gap remaining":"Still to address");
  text("remaining-total",money(p.surplus>0?p.surplus:p.remaining));
  text("receipt-target",money(p.target));
  text("receipt-addressed",money(p.covered));
  text("receipt-balance",p.surplus>0?money(p.surplus)+" surplus":money(p.remaining)+" remaining");
  text("receipt-status",p.targetMet?"Arithmetic target met":"Gap not yet closed");
  choiceContainer.replaceChildren();
  const options=MODEL.options.filter(option=>selected.has(option.id));
  if(!options.length && p.levy===0){
    const empty=document.createElement("p");
    empty.textContent="No choices selected yet.";
    choiceContainer.append(empty);
  }else{
    const ul=document.createElement("ul");
    for (const option of options) {
      const li=document.createElement("li");
      const name=document.createElement("span");
      const amount=document.createElement("span");
      name.textContent=option.name;
      amount.textContent=(option.group==="cut"?"-":"+")+money(option.amount);
      li.append(name,amount);
      ul.append(li);
    }
    if (p.levy){
      const li=document.createElement("li");
      const label=document.createElement("span");
      const value=document.createElement("span");
      label.textContent="Additional general revenue";
      value.textContent="+"+money(p.levy);
      li.append(label,value);
      ul.append(li);
    }
    choiceContainer.append(ul);
  }
  actionMessage.textContent="";
  fallback.hidden=true;
}
document.querySelectorAll('input[name="scenario"]').forEach(input=>{
  input.addEventListener("change",()=>{
    if(input.checked){scenario=input.value;render();}
  });
});
slider.addEventListener("input",render);
byId("reset-plan").addEventListener("click",()=>{
  selected.clear();
  scenario="baseline";
  document.querySelector('input[name="scenario"][value="baseline"]').checked=true;
  document.querySelectorAll("[data-budget-option]").forEach(input=>{input.checked=false;});
  slider.value="0";
  render();
  actionMessage.textContent="Choices reset. Nothing was retained.";
});
byId("copy-plan").addEventListener("click",async()=>{
  const content=receipt(currentPlan());
  try{
    if(!navigator.clipboard?.writeText)throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(content);
    actionMessage.textContent="Plain-language scenario copied. Nothing was submitted.";
    fallback.hidden=true;
  }catch{
    fallback.value=content;
    fallback.hidden=false;
    fallback.focus();
    fallback.select();
    actionMessage.textContent="Automatic copy unavailable. Select the text below to copy manually.";
  }
});
byId("download-plan").addEventListener("click",()=>{
  const content=exportedPlan(currentPlan());
  const blob=new Blob([content],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download="commonwealth-fictional-budget-plan.json";
  link.hidden=true;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  actionMessage.textContent="JSON scenario generated locally. No government submission occurred.";
});
render();
