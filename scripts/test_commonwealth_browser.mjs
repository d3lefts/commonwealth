// Browser acceptance test for the independent Commonwealth *release*, not the NIGHTFALL host.
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile, mkdir} from "node:fs/promises";
import {resolve, join, extname, sep} from "node:path";
import {chromium} from "playwright-core";

const root=resolve(process.argv[2] || "/tmp/commonwealth-repository/site");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
  ".svg":"image/svg+xml",".json":"application/json",".xml":"application/xml"};
const server=createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,"http://localhost");
    const relative=decodeURIComponent(u.pathname).replace(/^\/+/,"")||"index.html";
    const absolute=resolve(join(root,relative));
    if(absolute!==root&&!absolute.startsWith(root+sep)){res.writeHead(403).end();return;}
    const bytes=await readFile(absolute);
    res.writeHead(200,{"Content-Type":mime[extname(absolute)]||"application/octet-stream",
      "X-Content-Type-Options":"nosniff"}).end(bytes);
  }catch{res.writeHead(404).end("Not Found");}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
  browser=await chromium.launch({headless:true,
    executablePath:process.env.CHROME_BIN||"/usr/bin/chromium",
    args:["--no-sandbox","--disable-dev-shm-usage"]});
  const origin="http://127.0.0.1:"+server.address().port+"/";
  await mkdir("browser-artifacts",{recursive:true});
  for(const width of [390,1280]){
    const context=await browser.newContext({viewport:{width,height:850},reducedMotion:"reduce"});
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",error=>errors.push("JS: "+error.message));
    page.on("response",response=>{
      if(response.url().startsWith(origin)&&response.status()>=400)
        errors.push("HTTP "+response.status()+" "+response.url());
    });
    const journeys=[
      ["index.html","A More Informed Republic"],
      ["commonwealth-os.html","Commonwealth"],
      ["commonwealth-intelligence.html","Commonwealth"],
      ["commonwealth-browser/index.html","Commonwealth"],
      ["commonwealth-demos/living-voter.html","Living Voter"],
      ["journey.html","Commonwealth"],
      ["civic-tradeoffs.html","Commonwealth"],
      ["commonwealth-warrant.html","The Warrant"]
    ];
    for(const [route,title] of journeys){
      const response=await page.goto(origin+route,{waitUntil:"load",timeout:30000});
      assert.equal(response.status(),200,"Unavailable page "+route);
      assert.match(await page.title(),new RegExp(title,"i"),route+" title");
      assert.ok(await page.locator("main").count()>0,"No main element: "+route);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+4),
        route+" overflows "+width+"px screen");
      await page.waitForTimeout(200);
    }
    // New role-specific first visit, synthetic disagreement and explicit evidence gaps.
    await page.goto(origin+"commonwealth-browser/index.html",{waitUntil:"load"});
    assert.equal(await page.locator("#cwexp").isVisible(),true,"Guided civic entrance hidden");
    await page.locator('[data-cwexp-role="developer"]').click();
    assert.equal(await page.locator('[data-cwexp-panel="developer"]').isVisible(),true);
    assert.match(await page.locator('[data-cwexp-panel="developer"]').innerText(),/no live MCP endpoint/i);
    await page.locator('[data-cwexp-role="representative"]').click();
    assert.equal(await page.locator('[data-cwexp-panel="representative"]').isVisible(),true);
    await page.locator('[data-cwexp-role="resident"]').click();
    await page.locator('[data-cwexp-answer="support"]').click();
    assert.equal(await page.locator("#cwexp-perspectives").isVisible(),true);
    assert.equal((await page.locator("#cwexp-viewpoint-total").innerText()).trim(),"24");
    assert.match(await page.locator("#cwexp-perspectives").innerText(),/not respondents/i);
    await page.locator('[data-cwexp-step="4"]').click();
    assert.match(await page.locator("#cwexp-step-evidence").innerText(),/UNKNOWN/i);
    await page.locator("#cwexp-clear-button").click();
    assert.equal(await page.locator("#cwexp-perspectives").isVisible(),false);
    assert.equal(await page.locator('[data-cwexp-answer="support"]').getAttribute("aria-pressed"),"false");
    await page.locator("#cwexp-reveal-button").click();
    assert.equal(await page.locator("#cwexp-perspectives").isVisible(),true);
    assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);

    // Synthetic local-only budget: scenario, choices, stress case, exact totals, reset.
    await page.goto(origin+"civic-tradeoffs.html",{waitUntil:"load"});
    assert.equal(await page.locator("#gap-target").innerText(),"$2,400,000");
    assert.equal(await page.locator("#covered-total").innerText(),"$0");
    await page.locator('[data-budget-option="parks"]').check();
    await page.locator('[data-budget-option="parking"]').check();
    await page.locator("#levy-input").fill("100000");
    assert.equal(await page.locator("#covered-total").innerText(),"$910,000");
    assert.equal(await page.locator("#remaining-total").innerText(),"$1,490,000");
    await page.locator('input[name="scenario"][value="stress"]').check();
    assert.equal(await page.locator("#gap-target").innerText(),"$3,200,000");
    assert.equal(await page.locator("#remaining-total").innerText(),"$2,290,000");
    assert.match(await page.locator("#receipt-choices").innerText(),/parking permit/i);
    await page.locator("#reset-plan").click();
    assert.equal(await page.locator("#covered-total").innerText(),"$0");
    assert.equal(await page.locator("[data-budget-option]:checked").count(),0);
    assert.equal(await page.locator("#levy-input").inputValue(),"0");
    assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0,
      "Trade-off lab must not persist preferences");

    // Public Warrant never promotes fictional evidence into legal authorization.
    await page.goto(origin+"commonwealth-warrant.html",{waitUntil:"load"});
    assert.equal(await page.locator("#warrant-case-status").innerText(),"ILLUSTRATIVE");
    await page.locator('[data-warrant-layer="evidence"]').click();
    assert.equal(await page.locator('[data-warrant-panel="evidence"]').isVisible(),true);
    assert.match(await page.locator('[data-warrant-panel="evidence"]').innerText(),/SYNTHETIC_UNVERIFIED/);
    await page.locator('[data-warrant-layer="assurance"]').click();
    assert.equal(await page.locator('[data-warrant-panel="assurance"]').isVisible(),true);
    await page.locator("#warrant-change-source").click();
    assert.equal(await page.locator("#warrant-recheck-state").innerText(),"RECHECK_REQUIRED");
    await page.locator("#warrant-change-source").click();
    assert.match(await page.locator("#warrant-recheck-state").innerText(),/illustrative only/i);
    assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);

    // Four complete civic stages, validation, reset and in-memory-only preference.
    await page.goto(origin+"journey.html",{waitUntil:"load"});
    await page.locator("#cw-next").click();
    assert.equal(await page.locator("#cw-error").isVisible(),true,"No-choice validation missing");
    await page.locator('input[name="cw-stance"][value="oppose"]').check();
    await page.locator("#cw-next").click();
    assert.equal(await page.locator("#cw-compare-heading").isVisible(),true,"Comparison stage not rendered");
    assert.match(await page.locator("#cw-comparison").innerText(),/differs from your selected preference/i);
    await page.locator("#cw-next").click();
    assert.equal(await page.locator("#cw-evidence-heading").isVisible(),true,"Evidence stage not rendered");
    assert.match(await page.locator(".cw-guided-passport").innerText(),/Not assessed/);
    await page.locator("#cw-next").click();
    assert.equal(await page.locator("#cw-outcome-heading").isVisible(),true,"Response stage not rendered");
    assert.equal(await page.locator("#cw-outcome-preference").innerText(),"Oppose");
    assert.equal(await page.locator("#cw-progress").getAttribute("value"),"4");
    assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0,"No preference may be persisted");
    await page.locator("#cw-next").click();
    assert.equal(await page.locator("#cw-step-heading").isVisible(),true,"Reset must return to step one");
    assert.equal(await page.locator('input[name="cw-stance"]:checked').count(),0,"Reset must discard choice");
    await page.screenshot({path:"browser-artifacts/commonwealth-journey-"+width+".png",fullPage:false});
    await page.goto(origin,{waitUntil:"load"});
    assert.equal(await page.locator('link[href="site.css"],script[src="site.js"]').count(),0,
      "No NIGHTFALL runtime should be loaded");
    assert.equal(await page.locator(".nf-home-route-nav,.nf-journey-rail").count(),0,
      "No research navigation in independent Commonwealth");
    assert.equal(await page.locator("a[href='./']").count()>0,true,"Independent civic home missing");
    if(width===390){
      const menu=page.locator("#menu-button");
      assert.equal(await menu.isVisible(),true,"Mobile menu is unavailable");
      await menu.click();
      assert.equal(await menu.getAttribute("aria-expanded"),"true");
      assert.equal(await page.locator("#site-nav").evaluate(el=>el.classList.contains("open")),true);
      await page.screenshot({path:"browser-artifacts/commonwealth-independent-mobile.png",fullPage:false});
      await menu.click();
      assert.equal(await menu.getAttribute("aria-expanded"),"false");
    }else{
      await page.screenshot({path:"browser-artifacts/commonwealth-independent-desktop.png",fullPage:false});
    }
    assert.deepEqual(errors,[],width+"px browser faults");
    await context.close();
  }
  console.log("PASS: independent Commonwealth root, workbench, Discover, browser and Living Voter at 390/1280px; menu, local resources and no NIGHTFALL chrome");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
