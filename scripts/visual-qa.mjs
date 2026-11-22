import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('visual-qa', { recursive: true });
const browser = await chromium.launch({
 headless:true,
 args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']
});
const page=await browser.newPage({viewport:{width:1100,height:680},deviceScaleFactor:1});
const issues=[];
page.on('console',m=>{if(m.type()==='error')issues.push('console: '+m.text())});
page.on('pageerror',e=>issues.push('js: '+e.stack));
page.on('requestfailed',r=>issues.push('network: '+r.url()+' -> '+r.failure()?.errorText));
await page.addInitScript(()=>{
  // Synthetic Playwright pointer-lock events can shift the camera by
  // hundreds of pixels before the screenshot; use a deterministic view.
  HTMLCanvasElement.prototype.requestPointerLock=function(){return Promise.resolve()};
});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded',timeout:60000});
try{
 await page.waitForFunction(()=>window.__APARTMENT_GLB_READY===true,{timeout:70000});
}catch(e){
 console.error('GLB did not load in Chromium:',e.message);
}
await page.locator('.enter').click({timeout:30000});
await page.waitForTimeout(1200);
await page.waitForFunction(()=>typeof window.__APARTMENT_SET_VIEW==='function',{timeout:8000});
await page.evaluate(()=>window.__APARTMENT_SET_VIEW([1.15,1.71,5.25],.20,-.06));
await page.waitForTimeout(1500);
console.log('BROWSER CAMERA',JSON.stringify(await page.evaluate(()=>window.__APARTMENT_CAMERA)));
await page.screenshot({path:'visual-qa/apartment-browser.png',fullPage:false,timeout:90000,animations:'disabled'});
const sizes=await page.evaluate(()=>({width:innerWidth,height:innerHeight,canvas:!!document.querySelector('canvas'),loaded:window.__APARTMENT_GLB_READY===true,nav:document.querySelectorAll('nav button').length}));
console.log('PLAYWRIGHT VIEW',JSON.stringify(sizes));
console.log('PLAYWRIGHT BROWSER ERRORS',JSON.stringify(issues.slice(0,15)));
await browser.close();
if(!sizes.loaded)process.exitCode=1;
if(issues.some(i=>/WebGL|three.*Error|Error loading|shader/i.test(i)))process.exitCode=1;
