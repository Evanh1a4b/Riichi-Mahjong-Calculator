const assert=require('node:assert/strict'),T=require('../app/ledger'),R=require('../app/rules'),boot=require('./dom-harness.cjs');
T.configure(R.custom);let s=T.fresh();s.honba=2;s.pot=2;s.points[3]-=2000;const r={manualPoints:{ron:8000,child:2000,dealer:4000}};
assert.deepEqual(T.transfers(s,1,2,false,r),[0,10600,-8600,0]);assert.deepEqual(T.transfers(s,1,0,true,r),[-4200,10600,-2200,-2200]);assert.deepEqual(T.transfers(s,0,1,true,r),[8600,-2200,-2200,-2200]);
const after=T.win(s,1,2,false,r);assert(T.check(after));assert.equal(after.pot,0);assert.deepEqual(T.undo(after).points,s.points);assert.throws(()=>T.transfers(s,1,2,false,{manualPoints:{ron:8050}}),/invalidPoints/);assert.throws(()=>T.transfers(s,1,2,false,{...r,pao:{player:0}}),/pointsPao/);s.blocked[1]=true;assert.throws(()=>T.transfers(s,1,2,false,r),/foulBlocked/);
for(const page of ['index.html','desktop.html']){
const a=boot(page);a.click('opentool');assert(a.els.tooldialog.open);assert(a.els['tool-inverseplayer']);a.els.toolpoints0.value='45000';a.change('tool-inverseplayer',3);assert.equal(a.els.toolpoints0.value,'45000');a.click('runtool');assert.equal(a.storage['riichi-table-v1'],undefined);a.click('closetool');
a.data.filter(x=>x.dataset.view==='points').at(-1).onclick();assert(a.els.ronpoints);a.els.ronpoints.value='8000';a.els.ronpoints.oninput({target:a.els.ronpoints});a.click('settle');const game=JSON.parse(a.storage['riichi-table-v1']);assert.deepEqual(game.points,[33000,17000,25000,25000]);assert.equal(game.honba,1);a.click('undo');assert.deepEqual(JSON.parse(a.storage['riichi-table-v1']).points,[25000,25000,25000,25000]);
a.click('openrules');a.change('prefmode','points');a.click('saverules');assert.equal(JSON.parse(a.storage['riichi-ui-v3']).defaultMode,'points');assert(boot(page,a.storage).els.ronpoints);
}
console.log('Passed: raw ron/tsumo, honba/deposits, conservation/undo, invalid payments/foul/pao guards, independent hypothetical inputs, mobile/desktop UI, saved default.');
