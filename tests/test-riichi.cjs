const assert=require('node:assert/strict');
const {calculate:C}=require('../app/engine.js');
let n=0;
function test(name,o,expected){let r=C(o);for(const[k,v]of Object.entries(expected))assert.equal(r[k],v,`${name}: ${k} got ${r[k]}`);n++;console.log('PASS',name);}
function bad(name,o){assert.throws(()=>C(o));n++;console.log('PASS',name);}
const pin={hand:'123456m123p456s55p',win:'6s',riichi:1,tsumo:true};
test('平和自摸',pin,{han:3,fu:20,total:2700});
test('门清平和荣和',{...pin,tsumo:false},{han:2,fu:30,total:2000});
test('庄家自摸',{...pin,seat:27},{total:3900});
test('本场供托',{...pin,honba:2,sticks:1},{total:4300});
test('七对子',{hand:'1122m3344p5566s77z',win:'7z'},{han:2,fu:25,total:1600});
test('副露役牌',{hand:'234m456p22s',win:'6p',melds:'555z 678s'},{han:1,fu:30,total:1000});
test('食断最低30符',{hand:'234m456p22s',win:'6p',melds:'234s 678s'},{han:1,fu:30,total:1000});
test('国士十三面',{hand:'19m19p19s12345677z',win:'7z'},{yakuman:2,total:64000});
test('普通国士',{hand:'19m19p19s12345677z',win:'1m'},{yakuman:1,total:32000});
test('双倍役满关闭',{hand:'19m19p19s12345677z',win:'7z',doubleYakuman:false},{yakuman:1});
test('四暗刻单骑',{hand:'111m222p333s444z55z',win:'5z'},{yakuman:2});
test('荣和刻子算明刻',{hand:'111m222p333s444z55z',win:'1m'},{yakuman:0,han:4,fu:60,total:8000});
test('暗杠不破门清',{hand:'234p456s789m22z',win:'9m',melds:'[1111m]',riichi:1},{closed:true,han:1,fu:70,total:2300});
test('宝牌及里宝',{...pin,dora:'4p',ura:'4p'},{han:7,fu:20,total:12000});
test('切上关闭',{...pin,tsumo:false,riichi:2,ippatsu:true},{han:4,fu:30,total:7700});
test('切上开启',{...pin,tsumo:false,riichi:2,ippatsu:true,kiriage:true},{total:8000});
test('二杯口与七对竞合',{hand:'112233m445566p77s',win:'7s'},{han:3,fu:40,total:5200});
test('赤宝牌',{...pin,hand:'123456m123p456s05p'},{han:4,fu:20,total:5200});
bad('不足张数',{hand:'123m',win:'3m'});
bad('无役不得以宝牌和牌',{hand:'234m456p22s',win:'6p',melds:'123s 678s',dora:'1s'});
bad('关闭食断',{hand:'234m456p22s',win:'6p',melds:'234s 678s',kuitan:false});
bad('副露立直',{hand:'234m456p22s',win:'6p',melds:'555z 678s',riichi:1});
bad('未立直一发',{...pin,riichi:0,ippatsu:true});
bad('无杠岭上',{...pin,event:'rinshan'});
bad('同牌超过4枚',{hand:'11111m234p567s111z',win:'1m'});
bad('指示牌超过实体枚数',{...pin,dora:'555p'});
bad('自摸抢杠',{...pin,event:'chankan'});
console.log(`${n} checks passed.`);

