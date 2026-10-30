const assert=require('node:assert/strict'),boot=require('./dom-harness.cjs');
for(const page of ['index.html','desktop.html']){
 const a=boot(page);a.click('scoretable');assert(a.els.app.innerHTML.includes('mahjong-table'));for(const seat of ['bottom','right','top','left'])assert(a.els.app.innerHTML.includes('seat-'+seat));assert.equal((a.els.app.innerHTML.match(/data-table-player=/g)||[]).length,4);assert.equal(a.storage['riichi-table-v1'],undefined);
 a.change('tablebottom',2);assert(a.els.app.innerHTML.includes('seat-bottom" data-table-player="2"'));assert.equal(JSON.parse(a.storage['riichi-ui-v3']).tableView,'table');const b=boot(page,a.storage);assert(b.els.app.innerHTML.includes('mahjong-table'));assert.equal(b.els.tablebottom.value,'2');
 a.data.filter(e=>e.dataset.riichi==='0').at(-1).onclick();assert(a.els.app.innerHTML.includes('24,000'));assert(a.els.app.innerHTML.includes('table-riichi'));assert.equal(JSON.parse(a.storage['riichi-table-v1']).pot,1);a.click('undo');assert.equal(JSON.parse(a.storage['riichi-table-v1']).pot,0);
 a.change('language','en');assert(a.els.app.innerHTML.includes('Table view'));a.click('openrules');a.click('saverules');assert.equal(JSON.parse(a.storage['riichi-ui-v3']).tableView,'table');a.click('scorelist');assert(a.els.app.innerHTML.includes('class="players"'));assert(!a.els.app.innerHTML.includes('class="mahjong-table"'));
 const storage={...a.storage,'riichi-ui-v3':JSON.stringify({defaultMode:'numbers',han:1,fu:30,method:'ron',tableView:'bad',tableBottom:99})};assert(boot(page,storage).els.app.innerHTML.includes('class="players"'));
}
console.log('Passed: table/list toggle, all seats, viewpoint, persistence, shared riichi/undo, language, preferences, invalid saved settings.');
