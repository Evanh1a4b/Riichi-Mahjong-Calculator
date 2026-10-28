const assert=require('assert/strict'),M=require('../app/manual-engine'),E=require('../app/engine');
let r=M.calculate({ids:['riichi','pinfu','tsumo'],tsumo:true});assert.equal(r.han,3);assert.equal(r.fu,20);assert.equal(r.total,2700);
assert.equal(M.calculate({ids:['chiitoi']}).fu,25);assert.equal(M.calculate({ids:['sanshoku','tanyao'],closed:false,fu:30}).han,2);
assert.equal(M.calculate({ids:['kokushi13']}).yakuman,2);assert.equal(M.calculate({ids:['kokushi13'],doubleYakuman:false}).yakuman,1);assert.equal(M.calculate({ids:['daisangen','tsuuiisou']}).yakuman,2);
assert.equal(M.calculate({ids:['daisangen','tsuuiisou'],stackYakuman:false}).yakuman,1);
assert.equal(M.calculate({ids:['chinitsu','ryanpeikou','riichi','tsumo','pinfu'],tsumo:true,dora:1}).limit,'累计役满');
for(const ids of [['riichi','doubleRiichi'],['chiitoi','pinfu'],['iipeikou','ryanpeikou'],['daisangen','riichi'],['ippatsu'],['shousangen'],['white','green','red'],['pinfu','white'],['tanyao','honitsu']])assert.throws(()=>M.calculate({ids}));
assert.throws(()=>M.calculate({ids:['riichi'],closed:false}));assert.throws(()=>M.calculate({ids:['suuankou'],tsumo:false}));assert.throws(()=>M.calculate({ids:['tanyao'],ura:1}));assert.throws(()=>M.calculate({ids:['tanyao'],fu:30,closed:true}));
const compare=[
[{hand:'123456m123p456s55p',win:'6s',riichi:1,tsumo:true},{ids:['riichi','pinfu','tsumo'],tsumo:true}],
[{hand:'1122m3344p5566s77z',win:'7z'},{ids:['chiitoi']}],
[{hand:'234m456p22s',win:'6p',melds:'555z 678s'},{ids:['white'],closed:false,fu:30}],
[{hand:'19m19p19s12345677z',win:'7z'},{ids:['kokushi13']}]
];for(const[a,b]of compare){const x=E.calculate(a),y=M.calculate(b);assert.equal(y.total,x.total);assert.equal(y.fu,x.fu);assert.equal(y.han,x.han);}
console.log('Manual-yaku checks passed: han, fu, open/closed, yakuman stacking, conflicts, and equivalence with automatic scorer. Catalog: '+M.catalog.length);
