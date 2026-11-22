import {chromium} from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('visual-qa',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded',timeout:60000});
await page.locator('.enter').waitFor({state:'visible'});
try{
 await page.waitForFunction(()=>{const b=document.querySelector('button.enter');return b&&!b.disabled},null,{timeout:60000});
}catch(e){
 console.error('Entrance not enabled',JSON.stringify(await page.evaluate(()=>({button:document.querySelector('button.enter')?.outerHTML,root:document.querySelector('#root')?.innerText.slice(0,1200),imageRequests:performance.getEntriesByType('resource').filter(x=>x.name.includes('photo-apartment')).map(x=>({name:x.name,status:x.responseStatus}))}))));
 console.error('PAGE ERRORS',JSON.stringify(errors));
 await page.screenshot({path:'visual-qa/photo-depth-debug.png',timeout:90000});
 throw e;
}
await page.locator('button.enter').click({timeout:10000});
await page.waitForFunction(()=>window.__PHOTO_DEPTH_READY===true,null,{timeout:65000});
await page.waitForTimeout(1400);
await page.screenshot({path:'visual-qa/photo-depth-start.png',timeout:90000,animations:'disabled'});
const start=await page.evaluate(()=>window.__PHOTO_CAMERA);
await page.evaluate(()=>window.__PHOTO_TEST_MOVE(.46,-.92));
await page.waitForTimeout(1600);
await page.screenshot({path:'visual-qa/photo-depth-stepped-inside.png',timeout:90000,animations:'disabled'});
const moved=await page.evaluate(()=>window.__PHOTO_CAMERA);
console.log('DEPTH PHOTO INITIAL',JSON.stringify(start));
console.log('DEPTH PHOTO STEPPED INSIDE',JSON.stringify(moved));
console.log('PAGE ERRORS',JSON.stringify(errors.slice(0,10)));
await browser.close();
if(!moved||moved.position[2]>-.5||moved.position[0]<.20){
 console.error('Real perspective camera failed to move within the depth reconstructed room');
 process.exitCode=1;
}
if(errors.some(e=>/WebGL|THREE|shader|depth.*not available/i.test(e)))process.exitCode=1;
