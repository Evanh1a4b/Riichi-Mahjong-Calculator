/* Standalone four-player riichi scorer. No external dependencies. */
(function(root){
'use strict';
const honor=['东','南','西','北','白','发','中'];
const name=t=>t<27?`${t%9+1}${['万','筒','索'][Math.floor(t/9)]}`:honor[t-27];
const terminal=t=>t>=27||t%9===0||t%9===8;
function parse(s){
 s=s.replace(/\s/g,'').toLowerCase(); if(!s)return [];
 if(!/^(?:[0-9]+[mpsz])+$/.test(s))throw Error('牌谱格式应为 123m456p789s11z；字牌用 1–7z。');
 let out=[]; for(const m of s.matchAll(/([0-9]+)([mpsz])/g))for(const d of m[1]){let n=+d;if(m[2]==='z'&&(n<1||n>7))throw Error('字牌只允许 1–7z。');out.push({t:'mps'.includes(m[2])?'mps'.indexOf(m[2])*9+(n===0?5:n)-1:26+n,red:n===0});}return out;
}
function decompositions(c,n){let out=[];function rec(a,g){let i=a.findIndex(x=>x>0);if(i<0){if(g.length===n)out.push(g);return;}if(g.length>=n)return;if(a[i]>=3){a[i]-=3;rec(a,[...g,{t:i,k:'trip',open:false}]);a[i]+=3;}if(i<27&&i%9<=6&&a[i+1]&&a[i+2]){a[i]--;a[i+1]--;a[i+2]--;rec(a,[...g,{t:i,k:'seq',open:false}]);a[i]++;a[i+1]++;a[i+2]++;}}rec(c.slice(),[]);return out;}
function calculate(o){
 o={hand:'',melds:'',win:'',tsumo:false,seat:28,round:27,riichi:0,ippatsu:false,event:'',dora:'',ura:'',honba:0,sticks:0,kuitan:true,doubleYakuman:true,kiriage:false,kazoe:true,doubleWindFu:4,redDora:true,redM:1,redP:1,redS:1,uraDora:true,kanDora:true,ippatsuAllowed:true,doubleRiichiAllowed:true,stackYakuman:true,kazoeMultiple:false,honbaValue:300,...o};
 const hand=parse(o.hand), w=parse(o.win);if(w.length!==1)throw Error('请指定一张和牌。'); const win=w[0].t;if(!hand.some(x=>x.t===win))throw Error('和牌必须包含在手牌中。手牌需包含最后和到的牌。');
 const melds=o.melds.trim()?o.melds.trim().split(/[\s,，]+/).map(s=>{const closed=s.startsWith('[')&&s.endsWith(']');let a=parse(closed?s.slice(1,-1):s).sort((a,b)=>a.t-b.t);let k=a.length===4&&a.every(x=>x.t===a[0].t)?'kan':a.length===3&&a.every(x=>x.t===a[0].t)?'trip':a.length===3&&a[0].t<27&&a[0].t%9<=6&&a[1].t===a[0].t+1&&a[2].t===a[0].t+2?'seq':null;if(!k||closed&&k!=='kan')throw Error('副露应为顺子、刻子或杠；只有暗杠使用方括号，例如 [1111m]。');return {t:a[0].t,k,open:!closed,tiles:a};}):[];
 if(melds.length>4||hand.length!==14-melds.length*3)throw Error(`当前需输入 ${14-melds.length*3} 张手牌（包含和牌，副露另填）。`);
 const all=[...hand,...melds.flatMap(g=>g.tiles)],counts=Array(34).fill(0);all.forEach(x=>counts[x.t]++);if(counts.some(x=>x>4))throw Error('同一种牌不能超过四张。');
 for(let suit=0;suit<3;suit++){const limit=[o.redM,o.redP,o.redS][suit];if(all.filter(x=>x.red&&Math.floor(x.t/9)===suit).length>limit)throw Error('赤五数量超过当前规则设置。');}if(o.ippatsu&&!o.ippatsuAllowed)throw Error('当前规则关闭一发。');if(o.riichi===2&&!o.doubleRiichiAllowed)throw Error('当前规则关闭两立直。');
 const closed=melds.every(g=>!g.open),kans=melds.filter(g=>g.k==='kan').length;
 if(o.riichi&&!closed)throw Error('副露后不能立直。');if(o.ippatsu&&!o.riichi)throw Error('一发需要立直或两立直。');
 if(['haitei','rinshan','tenhou','chiihou'].includes(o.event)&&!o.tsumo||['houtei','chankan'].includes(o.event)&&o.tsumo)throw Error('所选特殊条件与荣和／自摸不一致。');
 if(o.event==='rinshan'&&!kans)throw Error('岭上开花需要有杠。');if(['tenhou','chiihou'].includes(o.event)&&(!closed||melds.length||o.riichi||o.ippatsu))throw Error('天和／地和不能包含副露、杠或立直。');
 if(o.event==='tenhou'&&o.seat!==27||o.event==='chiihou'&&o.seat===27)throw Error('天和仅限庄家，地和仅限闲家。');
 if(o.ippatsu&&o.event==='rinshan')throw Error('开杠会中断一发。');
 for(const v of [o.honba,o.sticks])if(!Number.isInteger(v)||v<0||v>100)throw Error('本场和供托应为 0–100 的整数。');
 const indicators=parse(o.dora),ura=parse(o.ura);if(indicators.length>5||ura.length>5)throw Error('宝牌／里宝牌指示牌最多各五张。');if(ura.length&&!o.riichi)throw Error('里宝牌仅在立直和牌时计算。');
 if(ura.length&&!o.uraDora)throw Error('当前规则关闭里宝牌，请清空里宝牌区。');if(!o.kanDora&&(indicators.length>1||ura.length>1))throw Error('当前规则关闭杠宝牌，仅允许一张指示牌。');
 const physical=counts.slice();[...indicators,...ura].forEach(x=>physical[x.t]++);if(physical.some(n=>n>4))throw Error('手牌与宝牌指示牌合计出现了超过四张的同种牌。');
 const c=Array(34).fill(0);hand.forEach(x=>c[x.t]++);const candidates=[];
 if(!melds.length&&c.filter(x=>x===2).length===7)candidates.push({special:'seven'});
 const orphans=[0,8,9,17,18,26,27,28,29,30,31,32,33];
 if(!melds.length&&orphans.every(t=>c[t])&&c.every((n,t)=>!n||orphans.includes(t)))candidates.push({special:'orphans'});
 for(let p=0;p<34;p++)if(c[p]>=2){c[p]-=2;for(const gs of decompositions(c,4-melds.length)){if(p===win)candidates.push({p,gs,wi:-1});gs.forEach((g,i)=>{if(g.t===win||g.k==='seq'&&win>g.t&&win<=g.t+2)candidates.push({p,gs,wi:i});});}c[p]+=2;}
 if(!candidates.length)throw Error('这副牌尚未构成和牌牌型，请检查手牌与副露。');
 const results=candidates.map(d=>score(d));results.sort((a,b)=>b.total-a.total||b.han-a.han||b.fu-a.fu);if(!results[0].yakuman&&!results[0].yaku.some(y=>!y.bonus))throw Error('牌型成立，但没有役。宝牌不能单独作为和牌的役。');return {...results[0],winningTile:win,meldInfo:melds.map(g=>({t:g.t,k:g.k,open:g.open})),alternatives:results.length,closed};
 function score(d){
 let yaku=[],ym=[],details=[];const add=(n,h)=>yaku.push({name:n,han:h}),yak=(n,m=1)=>ym.push({name:n,mult:m});
 const gs=d.gs?[...d.gs,...melds]:[],seq=gs.filter(g=>g.k==='seq'),trips=gs.filter(g=>g.k!=='seq');
 const isConcealed=g=>!g.open&&!(d.gs&&d.wi>=0&&d.gs[d.wi]===g&&g.k==='trip'&&!o.tsumo);
 const concealed=trips.filter(isConcealed).length;let wait='';if(d.gs){if(d.wi===-1)wait='单骑';else{let g=d.gs[d.wi];wait=g.k!=='seq'?'双碰':win===g.t+1?'嵌张':g.t%9===0&&win===g.t+2||g.t%9===6&&win===g.t?'边张':'两面';}}
 if(o.event==='tenhou')yak('天和');if(o.event==='chiihou')yak('地和');
 if(d.special==='orphans'){let pure=c[win]===2;yak(pure?'国士无双十三面':'国士无双',pure&&o.doubleYakuman?2:1);}
 if(all.every(x=>x.t>=27))yak('字一色');if(all.every(x=>x.t<27&&terminal(x.t)))yak('清老头');if(all.every(x=>[19,20,21,23,25,32].includes(x.t)))yak('绿一色');
 if(trips.filter(g=>g.t>=31).length===3)yak('大三元');const winds=trips.filter(g=>g.t>=27&&g.t<=30).length;if(winds===4)yak('大四喜',o.doubleYakuman?2:1);else if(winds===3&&d.p>=27&&d.p<=30)yak('小四喜');
 if(concealed===4)yak(wait==='单骑'?'四暗刻单骑':'四暗刻',wait==='单骑'&&o.doubleYakuman?2:1);if(kans===4)yak('四杠子');
 const suits=new Set(all.filter(x=>x.t<27).map(x=>Math.floor(x.t/9))),hasHonor=all.some(x=>x.t>=27);
 if(closed&&!melds.length&&!hasHonor&&suits.size===1){let base=[3,1,1,1,1,1,1,1,3],offset=[...suits][0]*9;if(base.every((n,i)=>c[offset+i]>=n)){let before=c.slice();before[win]--;let pure=base.every((n,i)=>before[offset+i]===n);yak(pure?'纯正九莲宝灯':'九莲宝灯',pure&&o.doubleYakuman?2:1);}}
 let fu=0;
 if(!ym.length){
 if(o.riichi)add(o.riichi===2?'两立直':'立直',o.riichi===2?2:1);if(o.ippatsu)add('一发',1);if(closed&&o.tsumo)add('门前清自摸和',1);
 const events={haitei:'海底摸月',houtei:'河底捞鱼',rinshan:'岭上开花',chankan:'抢杠'};if(events[o.event])add(events[o.event],1);
 if(all.every(x=>!terminal(x.t))&&(closed||o.kuitan))add('断幺九',1);
 if(suits.size===1)add(hasHonor?'混一色':'清一色',hasHonor?(closed?3:2):(closed?6:5));
 if(d.special==='seven'){add('七对子',2);fu=25;details.push(['七对子固定符',25]);if(all.every(x=>terminal(x.t)))add('混老头',2);}
 else if(d.gs){
 let pairFu=(d.p>=31?2:0)+(d.p===o.seat?2:0)+(d.p===o.round?2:0);if(d.p===o.seat&&d.p===o.round)pairFu=o.doubleWindFu;let pinfu=closed&&seq.length===4&&!pairFu&&wait==='两面';if(pinfu)add('平和',1);
 trips.forEach(g=>{if(g.t>=31)add(`役牌·${name(g.t)}`,1);if(g.t===o.seat)add('自风·'+name(g.t),1);if(g.t===o.round)add('场风·'+name(g.t),1);});
 if(closed){let freq={};seq.forEach(g=>freq[g.t]=(freq[g.t]||0)+1);let pairs=Object.values(freq).reduce((a,n)=>a+Math.floor(n/2),0);if(pairs)add(pairs===2?'二杯口':'一杯口',pairs===2?3:1);}
 if(seq.some(g=>[0,9,18].every(s=>seq.some(h=>h.t===g.t%9+s))))add('三色同顺',closed?2:1);
 if([0,9,18].some(s=>[0,3,6].every(n=>seq.some(g=>g.t===s+n))))add('一气通贯',closed?2:1);
 if(trips.length===4)add('对对和',2);if(concealed>=3)add('三暗刻',2);if(kans===3)add('三杠子',2);
 if(trips.some(g=>g.t<27&&[0,9,18].every(s=>trips.some(h=>h.t===g.t%9+s))))add('三色同刻',2);
 if(trips.filter(g=>g.t>=31).length===2&&d.p>=31)add('小三元',2);
 if(all.every(x=>terminal(x.t)))add('混老头',2);else if(terminal(d.p)&&gs.every(g=>g.k==='seq'?(g.t%9===0||g.t%9===6):terminal(g.t)))add(hasHonor?'混全带幺九':'纯全带幺九',hasHonor?(closed?2:1):(closed?3:2));
 details.push(['副底',20]);if(closed&&!o.tsumo)details.push(['门前清荣和',10]);if(pairFu)details.push(['役牌雀头（连风累计）',pairFu]);
 trips.forEach(g=>details.push([`${isConcealed(g)?'暗':'明'}${g.k==='kan'?'杠':'刻'} · ${name(g.t)}`,(g.k==='kan'?8:2)*(isConcealed(g)?2:1)*(terminal(g.t)?2:1)]));
 if(['单骑','嵌张','边张'].includes(wait))details.push([wait+'听牌',2]);if(o.tsumo&&!pinfu)details.push(['自摸',2]);fu=details.reduce((a,x)=>a+x[1],0);if(!closed&&fu===20){details.push(['副露无加符最低30符',10]);fu=30;}let rounded=Math.ceil(fu/10)*10;if(rounded!==fu)details.push(['向上取整到十位',rounded-fu]);fu=rounded;
 }
 const next=t=>t<27?Math.floor(t/9)*9+(t%9+1)%9:t<31?27+(t-27+1)%4:31+(t-31+1)%3;
 for(const [label,n] of [['宝牌',indicators.reduce((s,x)=>s+counts[next(x.t)],0)],['里宝牌',ura.reduce((s,x)=>s+counts[next(x.t)],0)],['赤宝牌',o.redDora?all.filter(x=>x.red).length:0]])if(n)yaku.push({name:label,han:n,bonus:true});
 }
 const han=yaku.reduce((a,y)=>a+y.han,0),yakuman=o.stackYakuman?ym.reduce((a,y)=>a+y.mult,0):Math.max(0,...ym.map(y=>y.mult));let base=fu*Math.pow(2,han+2),limit='';
 if(yakuman){base=8000*yakuman;limit=yakuman===1?'役满':yakuman+'倍役满';}else if(han>=13&&o.kazoe){base=8000*(o.kazoeMultiple?Math.floor(han/13):1);limit=(base>8000?base/8000+'倍':'')+'累计役满';}else if(han>=11){base=6000;limit='三倍满';}else if(han>=8){base=4000;limit='倍满';}else if(han>=6){base=3000;limit='跳满';}else if(han>=5||base>=2000||o.kiriage&&base===1920){base=2000;limit='满贯';}
 const ceil=n=>Math.ceil(n/100)*100,dealer=o.seat===27;let payments,total;if(o.tsumo){let a=ceil(base*2)+o.honba*o.honbaValue/3,b=ceil(base)+o.honba*o.honbaValue/3;payments=dealer?`每家支付 ${a} 点`:`庄家支付 ${a} 点，另外两家各 ${b} 点`;total=dealer?a*3:a+b*2;}else{total=ceil(base*(dealer?6:4))+o.honba*o.honbaValue;payments=`放铳者支付 ${total} 点`;}total+=o.sticks*1000;
 if(!yakuman&&!yaku.some(y=>!y.bonus))total=-1;
 return {base,han,fu,yaku,yakuman,ym,details,wait,limit,payments,total,sticks:o.sticks,groups:d.gs?[[d.p,d.p],...gs.map(g=>g.k==='seq'?[g.t,g.t+1,g.t+2]:Array(g.k==='kan'?4:3).fill(g.t))]:[],special:d.special};
 }
}
root.Riichi={calculate,parse,name};if(typeof module!=='undefined')module.exports=root.Riichi;
})(typeof window!=='undefined'?window:globalThis);
