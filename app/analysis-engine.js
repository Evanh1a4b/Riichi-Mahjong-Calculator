(function(root){
'use strict';
const E=root.Riichi,code=x=>(x.red?0:x.t<27?x.t%9+1:x.t-26)+(x.t<27?'mps'[Math.floor(x.t/9)]:'z');
function analyze(input){
 const o={...root.Rules.custom,seat:28,round:27,honba:0,sticks:0,riichi:0,ippatsu:false,event:'',hand:'',melds:'',dora:'',ura:'',kind:'waits',...input};
 if(!['waits','complete'].includes(o.kind))throw Error('analysisInvalid');
 const hand=E.parse(o.hand),dora=E.parse(o.dora),ura=E.parse(o.ura),melds=o.melds.trim()?o.melds.trim().split(/[\s,，]+/).map(s=>{const closed=s.startsWith('[')&&s.endsWith(']'),tiles=E.parse(closed?s.slice(1,-1):s).sort((a,b)=>a.t-b.t),trip=tiles.length>=3&&tiles.every(x=>x.t===tiles[0].t),seq=tiles.length===3&&tiles[0].t<27&&tiles[0].t%9<=6&&tiles[1].t===tiles[0].t+1&&tiles[2].t===tiles[0].t+2;
 if(!(tiles.length===4&&trip||tiles.length===3&&(trip||seq))||closed&&tiles.length!==4)throw Error('analysisInvalidMeld');return {closed,tiles,kan:tiles.length===4};}):[];
 const required=(o.kind==='waits'?13:14)-melds.length*3;if(melds.length>4||hand.length!==required)throw Error(o.kind==='waits'?'analysisNeed13':'analysisNeed14');
 if(![27,28,29,30].includes(o.seat)||![27,28,29,30].includes(o.round)||![0,1,2].includes(o.riichi)||!['','haitei','houtei','rinshan','chankan','tenhou','chiihou'].includes(o.event)||[o.honba,o.sticks].some(n=>!Number.isInteger(n)||n<0||n>100))throw Error('analysisInvalid');
 const closed=melds.every(m=>m.closed),kans=melds.filter(m=>m.kan).length;
 if(o.riichi&&!closed||o.ippatsu&&!o.riichi||o.ippatsu&&!o.ippatsuAllowed||o.riichi===2&&!o.doubleRiichiAllowed||ura.length&&(!o.riichi||!o.uraDora)||dora.length>5||ura.length>5||!o.kanDora&&(dora.length>1||ura.length>1))throw Error('analysisInvalidConditions');
 if(o.event==='rinshan'&&(!kans||o.ippatsu)||['tenhou','chiihou'].includes(o.event)&&(melds.length||o.riichi||o.ippatsu)||o.event==='tenhou'&&o.seat!==27||o.event==='chiihou'&&o.seat===27)throw Error('analysisInvalidConditions');
 const physical=[...hand,...melds.flatMap(m=>m.tiles),...dora,...ura],counts=Array(34).fill(0),reds=Array(34).fill(0);for(const x of physical){counts[x.t]++;if(x.red)reds[x.t]++;}if(counts.some(n=>n>4))throw Error('analysisTooMany');
 const limits=[o.redM,o.redP,o.redS];for(let s=0;s<3;s++){const t=s*9+4,n=limits[s];if(!Number.isInteger(n)||n<0||n>4||reds[t]>n||counts[t]-reds[t]>4-n)throw Error('analysisRedLimit');}
 function score(h,w,tsumo){try{return {status:'win',result:E.calculate({...o,hand:h.map(code).join(''),win:code(w),tsumo})};}catch(e){const message=e.message;if(message.includes('没有役'))return {status:'noYaku'};if(message.includes('尚未构成和牌牌型'))return {status:'notComplete'};if(message.includes('特殊条件与荣和'))return {status:'condition'};throw e;}}
 if(o.kind==='complete'){const win=E.parse(o.win||'');if(win.length!==1||!hand.some(x=>x.t===win[0].t&&x.red===win[0].red))throw Error('analysisNeedWin');return {kind:o.kind,rows:[{tile:win[0],ron:score(hand,win[0],false),tsumo:score(hand,win[0],true)}],required,closed};}
 const rows=[];for(let t=0;t<34;t++){const five=t<27&&t%9===4,variants=five?[false,true]:[false];for(const red of variants){const remaining=five?(red?limits[Math.floor(t/9)]-reds[t]:4-limits[Math.floor(t/9)]-(counts[t]-reds[t])):4-counts[t];if(remaining<=0)continue;const tile={t,red},h=[...hand,tile],ron=score(h,tile,false),tsumo=score(h,tile,true);if([ron.status,tsumo.status].some(s=>s==='win'||s==='noYaku'))rows.push({tile,remaining,ron,tsumo});}}
 return {kind:o.kind,rows,required,closed};
}
root.HandAnalysis={analyze,code};if(typeof module!=='undefined')module.exports=root.HandAnalysis;
})(typeof window!=='undefined'?window:globalThis);
