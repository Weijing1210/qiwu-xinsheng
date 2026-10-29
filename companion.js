(()=>{
const root=document.createElement('aside');root.className='companion';root.setAttribute('aria-label','修复小助手');root.innerHTML='<p class="companion-bubble" role="status"></p><button class="companion-body" aria-label="修复小助手，点击互动，拖动可移动到两侧"><svg viewBox="20 960 230 230" aria-hidden="true"><image href="assets__mascot__transparent.png" width="1414" height="2000"/></svg></button><button class="companion-fold" aria-label="收起或展开小助手">收起</button>';document.body.append(root);
const body=root.querySelector('.companion-body'),svg=root.querySelector('svg'),bubble=root.querySelector('p');let timer,idle,drag=null,moved=false;
const frames={hello:[20,960,230,230],happy:[260,960,230,230],think:[490,960,230,230],cheer:[720,960,230,230],sleep:[20,1265,240,210],wow:[265,1265,220,210],proud:[490,1265,230,210]};
function react(state,text){clearTimeout(timer);const f=frames[state]||frames.hello;svg.setAttribute('viewBox',f.join(' '));bubble.textContent=text;root.classList.add('talking');root.dataset.mood=state;timer=setTimeout(()=>{root.classList.remove('talking');svg.setAttribute('viewBox',frames.hello.join(' '));root.dataset.mood='hello'},Math.max(6000,text.length*180));resetIdle()}
function resetIdle(){clearTimeout(idle);idle=setTimeout(()=>{svg.setAttribute('viewBox',frames.sleep.join(' '));root.dataset.mood='sleep'},45000)}
window.qiwuCompanion=react;
let saved;try{saved=JSON.parse(localStorage.getItem('qiwu-companion-position'))}catch{}if(saved){root.style.top=Math.max(100,Math.min(innerHeight-170,saved.y))+'px';if(saved.side==='left'){root.classList.add('on-left')}}
let hoverTimer,lastHover=0,hoverIndex=0;
const hoverLines=['你来啦～一起看看器物上的小秘密吧！','轻轻摸摸，我就来陪你啦～','需要帮忙吗？点击我可以重看操作提示。'];
body.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||drag)return;root.classList.add('hovered');clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>{if(drag||Date.now()-lastHover<2500)return;lastHover=Date.now();react('cheer',hoverLines[hoverIndex++%hoverLines.length])},180)});
body.addEventListener('pointerleave',()=>{clearTimeout(hoverTimer);root.classList.remove('hovered')});
body.addEventListener('pointerdown',e=>{clearTimeout(hoverTimer);root.classList.remove('hovered');if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,top:root.getBoundingClientRect().top,left:root.getBoundingClientRect().left};moved=false;body.setPointerCapture(e.pointerId)});
body.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)moved=true;if(!moved)return;root.classList.add('dragging');root.style.right='auto';root.style.left=Math.max(0,Math.min(innerWidth-120,drag.left+e.clientX-drag.x))+'px';root.style.top=Math.max(85,Math.min(innerHeight-155,drag.top+e.clientY-drag.y))+'px'});
function end(e){if(!drag)return;drag=null;root.classList.remove('dragging');if(moved){const left=e.clientX<innerWidth/2;root.classList.toggle('on-left',left);root.style.left='';root.style.right='';try{localStorage.setItem('qiwu-companion-position',JSON.stringify({side:left?'left':'right',y:root.getBoundingClientRect().top}))}catch{}react('hello','就在这里陪你修复～')}else guide()}
body.addEventListener('pointerup',end);body.addEventListener('pointercancel',end);
body.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();guide()}});
root.querySelector('.companion-fold').onclick=()=>{root.classList.toggle('folded');root.querySelector('.companion-fold').textContent=root.classList.contains('folded')?'小助手':'收起'};
const guides={home:'欢迎来到器物新生。按空格或点击可跳过开场，选择一种工艺开始探索。',craft:'悬停查看步骤图，点击了解工艺细节；左右按钮可以翻看更多步骤。下方可选择修复实例。',quiz:'选择一个答案即可查看解析，完成后点击下一题。这里展示的是现当代仿古器物修复示例。',puzzle:'把碎片拖到对应格子，放对就会锁定。也可先点击碎片，再点击格子；拼合后可查看三维器物。',model:'左键拖动旋转，滚轮缩放，Shift＋左键或右键平移；触屏可单指旋转、双指缩放。试试重置视角吧！'};
function guide(kind){if(!kind){const route=location.hash.slice(1).split('/')[0];kind=route==='case'?(document.querySelector('.puzzle-panel')?'puzzle':'quiz'):route||'home'}react('hello',guides[kind]||guides.home)}
window.qiwuCompanionGuide=guide;window.addEventListener('hashchange',()=>setTimeout(()=>guide(),250));
window.addEventListener('resize',()=>{root.style.top=Math.max(85,Math.min(innerHeight-155,root.getBoundingClientRect().top))+'px'});guide();
})();
