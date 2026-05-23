'use strict';
/* ============================================
   EID AL-ADHA — script.js (Moon Crack v4)
   ============================================ */

// ══════════════════════════════════════════
// CUSTOM CURSOR + SPARKLE TRAIL
// ══════════════════════════════════════════
const cursorDot  = document.createElement('div');
const cursorRing = document.createElement('div');
cursorDot.className  = 'cursor-dot';
cursorRing.className = 'cursor-ring';
document.body.appendChild(cursorDot);
document.body.appendChild(cursorRing);

let mx=-100,my=-100,rx=-100,ry=-100;
let lastSpark=0;

document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  const now=Date.now();
  if(now-lastSpark>38){lastSpark=now; spawnSparkle(e.clientX,e.clientY);}
});

(function ringFollow(){
  rx+=(mx-rx)*.11; ry+=(my-ry)*.11;
  cursorDot.style.left=mx+'px'; cursorDot.style.top=my+'px';
  cursorRing.style.left=rx+'px'; cursorRing.style.top=ry+'px';
  requestAnimationFrame(ringFollow);
})();

// Expand cursor on interactive elements
document.querySelectorAll('button,a,[role=button],.bdg,.cel-btn,.moon-click').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursorRing.classList.add('big'));
  el.addEventListener('mouseleave',()=>cursorRing.classList.remove('big'));
});

function spawnSparkle(x,y){
  const colors=['#D4AF37','#F5E070','#FFD700','#FFEEAA','#FFF5CC'];
  const el=document.createElement('div');
  el.className='cursor-sparkle';
  const size=Math.random()*8+3;
  const sx=(Math.random()-.5)*55;
  const sy=-(Math.random()*45+12);
  el.style.cssText=`
    left:${x}px;top:${y}px;
    width:${size}px;height:${size}px;
    background:${colors[Math.floor(Math.random()*colors.length)]};
    border-radius:${Math.random()>.5?'50%':'3px'};
    --sx:${sx}px;--sy:${sy}px;
    box-shadow:0 0 ${size}px rgba(212,175,55,.8);
  `;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),950);
}

// ══════════════════════════════════════════
// PRELOADER
// ══════════════════════════════════════════
window.addEventListener('load',()=>{
  setTimeout(()=>{
    const pre=document.getElementById('preloader');
    pre.classList.add('done');
    pre.addEventListener('animationend',()=>{
      pre.style.display='none';
      showMoonScene();
    },{once:true});
  },200);
});

// ══════════════════════════════════════════
// AURORA (reusable)
// ══════════════════════════════════════════
const AURORA=[
  [70,30,170],[40,80,210],[20,120,150],
  [90,20,160],[25,55,185],[160,120,20]
];
function initAurora(id){
  const cv=document.getElementById(id); if(!cv)return null;
  const cx=cv.getContext('2d');
  function rs(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
  rs(); window.addEventListener('resize',rs);
  class Blob{
    constructor(){this.reset(true);}
    reset(init=false){
      this.x=Math.random()*cv.width;
      this.y=init?Math.random()*cv.height:-200;
      this.r=Math.random()*380+160;
      this.vx=(Math.random()-.5)*.4; this.vy=(Math.random()-.5)*.25;
      this.col=AURORA[Math.floor(Math.random()*AURORA.length)];
      this.phase=Math.random()*Math.PI*2;
    }
    update(){
      this.x+=this.vx; this.y+=this.vy; this.phase+=.005;
      this.alpha=Math.sin(this.phase)*.03+.05;
      if(this.x<-this.r||this.x>cv.width+this.r)this.vx*=-1;
      if(this.y<-this.r||this.y>cv.height+this.r)this.vy*=-1;
    }
    draw(){
      const[r,g,b]=this.col;
      const grad=cx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r);
      grad.addColorStop(0,`rgba(${r},${g},${b},${this.alpha})`);
      grad.addColorStop(1,'rgba(0,0,0,0)');
      cx.fillStyle=grad;
      cx.beginPath();cx.arc(this.x,this.y,this.r,0,Math.PI*2);cx.fill();
    }
  }
  const blobs=Array.from({length:8},()=>new Blob());
  let running=true;
  (function loop(){
    if(!running)return;
    cx.clearRect(0,0,cv.width,cv.height);
    blobs.forEach(b=>{b.update();b.draw();});
    requestAnimationFrame(loop);
  })();
  return ()=>{running=false;};
}

// ══════════════════════════════════════════
// SPACE CANVAS — Stars + Shooting Stars
// ══════════════════════════════════════════
function initSpace(){
  const cv=document.getElementById('space-canvas'); if(!cv)return;
  const cx=cv.getContext('2d');
  function rs(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
  rs(); window.addEventListener('resize',rs);

  // Static stars
  const stars=[];
  for(let i=0;i<280;i++){
    stars.push({
      x:Math.random()*cv.width,
      y:Math.random()*cv.height,
      r:Math.random()*1.8+.3,
      alpha:Math.random()*.8+.1,
      twinkle:Math.random()*Math.PI*2,
      speed:Math.random()*.03+.005
    });
  }

  // Shooting stars
  const shoots=[];
  function spawnShoot(){
    shoots.push({
      x:Math.random()*cv.width*.7,
      y:Math.random()*cv.height*.4,
      len:Math.random()*180+80,
      speed:Math.random()*14+8,
      alpha:1,
      angle:Math.PI/4+Math.random()*.4
    });
  }
  setInterval(spawnShoot,2800);

  (function loop(){
    cx.clearRect(0,0,cv.width,cv.height);

    // Draw stars
    stars.forEach(s=>{
      s.twinkle+=s.speed;
      const a=s.alpha*(Math.sin(s.twinkle)*.4+.6);
      cx.beginPath();cx.arc(s.x,s.y,s.r,0,Math.PI*2);
      cx.fillStyle=`rgba(255,255,255,${a})`;cx.fill();
    });

    // Shooting stars
    for(let i=shoots.length-1;i>=0;i--){
      const sh=shoots[i];
      sh.x+=Math.cos(sh.angle)*sh.speed;
      sh.y+=Math.sin(sh.angle)*sh.speed;
      sh.alpha-=.025;
      if(sh.alpha<=0){shoots.splice(i,1);continue;}

      cx.save();
      cx.globalAlpha=sh.alpha;
      const grd=cx.createLinearGradient(
        sh.x-Math.cos(sh.angle)*sh.len, sh.y-Math.sin(sh.angle)*sh.len,
        sh.x, sh.y
      );
      grd.addColorStop(0,'rgba(245,224,112,0)');
      grd.addColorStop(.7,'rgba(245,224,112,.6)');
      grd.addColorStop(1,'rgba(255,255,255,.9)');
      cx.strokeStyle=grd;
      cx.lineWidth=2;
      cx.beginPath();
      cx.moveTo(sh.x-Math.cos(sh.angle)*sh.len, sh.y-Math.sin(sh.angle)*sh.len);
      cx.lineTo(sh.x,sh.y);
      cx.stroke();
      cx.restore();
    }

    requestAnimationFrame(loop);
  })();
}

// ══════════════════════════════════════════
// ORBIT RING around moon
// ══════════════════════════════════════════
function initOrbit(){
  const moonWrap=document.getElementById('moon-wrap');
  if(!moonWrap)return;
  const moonSize=moonWrap.offsetWidth;
  const orbitR=moonSize/2+50;
  const size=orbitR*2+60;

  const cv=document.getElementById('orbit-canvas');
  cv.width=size; cv.height=size;
  cv.style.marginLeft=(-size/2)+'px';
  cv.style.marginTop =(-size/2)+'px';

  const cx=cv.getContext('2d');
  const cx0=size/2,cy0=size/2;

  const particles=[];
  for(let i=0;i<22;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=(Math.random()*.5+.3)*(Math.random()>.5?1:-1);
    particles.push({
      angle,speed,
      r:Math.random()*2.5+1,
      alpha:Math.random()*.8+.2,
      twinkle:Math.random()*Math.PI*2,
      orbitR:orbitR+(Math.random()-0.5)*20
    });
  }

  let startTime=null;
  (function loop(ts){
    if(!startTime)startTime=ts;
    const elapsed=(ts-startTime)/1000;
    cx.clearRect(0,0,size,size);

    // Draw faint orbit circle
    cx.beginPath();
    cx.arc(cx0,cy0,orbitR,0,Math.PI*2);
    cx.strokeStyle='rgba(212,175,55,0.08)';
    cx.lineWidth=1;
    cx.stroke();

    particles.forEach(p=>{
      p.angle+=p.speed*.008;
      p.twinkle+=.05;
      const a=p.alpha*(Math.sin(p.twinkle)*.3+.7);
      const x=cx0+Math.cos(p.angle)*p.orbitR;
      const y=cy0+Math.sin(p.angle)*p.orbitR;

      // Glow
      const grd=cx.createRadialGradient(x,y,0,x,y,p.r*3);
      grd.addColorStop(0,`rgba(245,224,112,${a})`);
      grd.addColorStop(1,'rgba(245,224,112,0)');
      cx.fillStyle=grd;
      cx.beginPath();cx.arc(x,y,p.r*3,0,Math.PI*2);cx.fill();

      cx.beginPath();cx.arc(x,y,p.r,0,Math.PI*2);
      cx.fillStyle=`rgba(255,240,160,${a})`;cx.fill();
    });

    requestAnimationFrame(loop);
  })();
}

// ══════════════════════════════════════════
// SHOW MOON SCENE
// ══════════════════════════════════════════
function showMoonScene(){
  const scene=document.getElementById('moon-scene');
  scene.classList.remove('hidden');
  scene.classList.add('fade-in');
  initSpace();
  setTimeout(initOrbit,600);
}

// ══════════════════════════════════════════
// MOON CRACK SEQUENCE
// ══════════════════════════════════════════
let moonCracked=false;

function crackMoon(){
  if(moonCracked)return;
  moonCracked=true;

  const moonBody  =document.getElementById('moon-body');
  const moonInner =document.getElementById('moon-inner-light');
  const moonCracks=document.getElementById('moon-cracks');
  const fragWrap  =document.getElementById('frag-wrap');
  const moonFlash =document.getElementById('moon-flash');
  const moonScene =document.getElementById('moon-scene');
  const cardScene =document.getElementById('card-scene');
  const invite    =document.getElementById('moon-invite');
  const moonWrap  =document.getElementById('moon-wrap');
  const glow      =document.getElementById('card-glow-wrap');

  // Hide invite
  invite.style.opacity='0';

  // STEP 1: Shake the moon
  const shakeCSS=document.createElement('style');
  shakeCSS.textContent=`@keyframes moon-shake{0%,100%{transform:translateY(0);}10%{transform:translate(-8px,-4px);}20%{transform:translate(8px,4px);}30%{transform:translate(-6px,6px);}40%{transform:translate(6px,-6px);}50%{transform:translate(-4px,4px);}60%{transform:translate(4px,-2px);}70%{transform:translate(-2px,2px);}80%{transform:translate(3px,-3px);}90%{transform:translate(-2px,2px);}}`;
  document.head.appendChild(shakeCSS);
  moonWrap.style.animation='moon-shake 0.5s ease';

  // STEP 2: Reveal cracks
  setTimeout(()=>{
    moonWrap.style.animation='';
    moonCracks.style.opacity='1';

    // Animate each crack with staggered delay
    const cracks=moonCracks.querySelectorAll('.crack');
    cracks.forEach((c,i)=>{
      const len=c.getTotalLength?c.getTotalLength():200;
      c.style.strokeDasharray=len;
      c.style.strokeDashoffset=len;
      c.style.transition=`stroke-dashoffset ${0.2+Math.random()*0.15}s ease ${i*0.06}s`;
      requestAnimationFrame(()=>{ c.style.strokeDashoffset='0'; });
    });

    // Inner glow intensifies
    moonInner.style.transition='opacity 0.5s ease, background 0.5s ease';
    moonInner.style.background='radial-gradient(circle,rgba(255,220,80,.5) 0%,rgba(255,180,40,.2) 50%,transparent 70%)';
    moonInner.style.opacity='1';

  },520);

  // STEP 3: Explosion
  setTimeout(()=>{
    // Hide original moon, show fragments
    moonBody.style.opacity='0';
    fragWrap.classList.add('exploding');

    // Big flash
    moonFlash.classList.add('active');

    // Giant confetti burst from moon center
    const rect=moonWrap.getBoundingClientRect();
    const cx=rect.left+rect.width/2;
    const cy=rect.top+rect.height/2;
    for(let i=0;i<60;i++){
      setTimeout(()=>spawnConf({x:cx,y:cy,up:true,spread:280}),i*15);
    }

  },950);

  // STEP 4: Show card scene
  setTimeout(()=>{
    cardScene.classList.remove('hidden');
    cardScene.classList.add('fade-in');
    initCardScene();
  },1100);

  // STEP 5: Fade moon scene
  setTimeout(()=>{
    moonScene.classList.add('fade-out');
  },1500);

  // STEP 6: Reveal card with spring
  setTimeout(()=>{
    moonScene.style.display='none';
    glow.classList.add('revealed');
    launchEntranceConfetti();
    setTimeout(startTypewriters,700);
  },2100);
}

// Trigger
document.getElementById('moon-click').addEventListener('click',crackMoon);
document.getElementById('moon-click').addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' ')crackMoon();
});
// Also click moon body directly
document.getElementById('moon-body').addEventListener('click',crackMoon);

// ══════════════════════════════════════════
// FLOATING PARTICLES
// ══════════════════════════════════════════
function initParticles(id){
  const cv=document.getElementById(id); if(!cv)return;
  const cx=cv.getContext('2d');
  function rs(){cv.width=window.innerWidth;cv.height=window.innerHeight;}
  rs(); window.addEventListener('resize',rs);
  const GOLDS=[[212,175,55],[245,224,112],[160,124,30],[255,255,200],[255,200,80]];
  class P{
    constructor(){this.reset(true);}
    reset(init=false){
      this.x=Math.random()*cv.width;
      this.y=init?Math.random()*cv.height:cv.height+10;
      this.r=Math.random()*2+.5;
      this.speed=Math.random()*.55+.15;
      this.drift=(Math.random()-.5)*.35;
      this.alpha=Math.random()*.5+.1;
      this.fade=(Math.random()*.007+.002)*(Math.random()>.5?1:-1);
      this.col=GOLDS[Math.floor(Math.random()*GOLDS.length)];
    }
    update(){
      this.y-=this.speed;this.x+=this.drift;this.alpha+=this.fade;
      if(this.alpha>.8||this.alpha<.04)this.fade*=-1;
      if(this.y<-10||this.x<-10||this.x>cv.width+10)this.reset();
    }
    draw(){
      cx.beginPath();cx.arc(this.x,this.y,this.r,0,Math.PI*2);
      cx.fillStyle=`rgba(${this.col[0]},${this.col[1]},${this.col[2]},${this.alpha})`;
      cx.fill();
    }
  }
  const pts=Array.from({length:65},()=>new P());
  (function loop(){
    cx.clearRect(0,0,cv.width,cv.height);
    pts.forEach(p=>{p.update();p.draw();});
    requestAnimationFrame(loop);
  })();
}

// ══════════════════════════════════════════
// CARD SCENE INIT
// ══════════════════════════════════════════
function initCardScene(){
  initAurora('aurora-canvas');
  initParticles('particles-canvas');

  // Card stars
  const starsEl=document.getElementById('card-stars');
  for(let i=0;i<90;i++){
    const d=document.createElement('div');
    d.className='star-dot';
    const sz=Math.random()*2.5+.5;
    d.style.cssText=`width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--td:${(Math.random()*3+2).toFixed(1)}s;--tdl:${(Math.random()*4).toFixed(1)}s;`;
    starsEl.appendChild(d);
  }

  // Parallax tilt
  const glow=document.getElementById('card-glow-wrap');
  if(window.innerWidth>768){
    document.addEventListener('mousemove',e=>{
      const rect=glow.getBoundingClientRect();
      if(!rect.width)return;
      const dx=(e.clientX-(rect.left+rect.width/2))/(window.innerWidth/2);
      const dy=(e.clientY-(rect.top+rect.height/2))/(window.innerHeight/2);
      glow.style.transform=`perspective(1200px) rotateX(${dy*-4}deg) rotateY(${dx*4}deg) scale(1.01)`;
    });
    document.addEventListener('mouseleave',()=>{glow.style.transform='';});
  }

  // Badge pop
  const bStyle=document.createElement('style');
  bStyle.textContent=`@keyframes bdg-pop{from{opacity:0;transform:scale(.4) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}`;
  document.head.appendChild(bStyle);
  const obs=new IntersectionObserver(entries=>{
    entries.forEach((en,i)=>{
      if(en.isIntersecting){
        setTimeout(()=>{en.target.style.animation='bdg-pop .5s cubic-bezier(.22,1,.36,1) both';},i*100);
        obs.unobserve(en.target);
      }
    });
  },{threshold:.2});
  document.querySelectorAll('.bdg').forEach(b=>obs.observe(b));

  document.getElementById('cel-btn').addEventListener('click',launchConfetti);
}

// ══════════════════════════════════════════
// TYPEWRITER
// ══════════════════════════════════════════
function typewrite(el,text,speed=30){
  if(!el)return;
  el.textContent='';
  let i=0;
  const t=setInterval(()=>{
    el.textContent+=text[i++];
    if(i>=text.length)clearInterval(t);
  },speed);
}
function startTypewriters(){
  typewrite(document.getElementById('tw-fr'),
    "En ce jour béni de l'Aïd Al-Adha, je vous souhaite santé, bonheur et paix.",28);
  setTimeout(()=>typewrite(document.getElementById('tw-da'),
    "عيد مبارك سعيد — ربي يتقبل منا ومنكم وياخد بيدنا لكل خير 🤲",40),1800);
  setTimeout(()=>typewrite(document.getElementById('tw-en'),
    "May Allah accept our prayers, bless our families and fill our hearts with gratitude. Eid Mubarak!",28),4200);
}

// ══════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════
const CONF_COLORS=['#D4AF37','#F5E070','#A07C1E','#0D6E7A','#4FC3F7',
                   '#E91E63','#7C4DFF','#69F0AE','#FFFFFF','#FFD700','#FF6B6B'];

function spawnConf({x=window.innerWidth/2,y=window.innerHeight*.55,up=false,spread=300}={}){
  const el=document.createElement('div');
  el.className='conf-piece';
  const col=CONF_COLORS[Math.floor(Math.random()*CONF_COLORS.length)];
  const cx=(Math.random()-.5)*spread*2;
  const cy=up?-(Math.random()*400+100):(Math.random()*400+100);
  const cr=(Math.random()>.5?1:-1)*(360+Math.random()*720);
  const cd=(Math.random()*1.5+1.5).toFixed(2);
  const sz=Math.random()*12+5;
  const sh=Math.random()>.4?'border-radius:50%':'';
  el.style.cssText=`background:${col};left:${x+(Math.random()-.5)*60}px;top:${y}px;width:${sz}px;height:${sz}px;${sh};--cx:${cx}px;--cy:${cy}px;--cr:${cr}deg;--cd:${cd}s;--cdl:0s;`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),parseFloat(cd)*1000+300);
}

function launchEntranceConfetti(){
  for(let i=0;i<55;i++) setTimeout(()=>spawnConf({up:true,spread:260}),i*22);
  ['🌙','⭐','✨','🎊','🕌','💛','🐑'].forEach((em,i)=>{
    setTimeout(()=>{
      const el=document.createElement('div');
      el.style.cssText=`position:fixed;font-size:${Math.random()*1.8+1.2}rem;left:${Math.random()*window.innerWidth}px;top:${window.innerHeight*.5}px;z-index:201;pointer-events:none;animation:conf-fall 2.5s ease-in both;--cx:${(Math.random()-.5)*320}px;--cy:-${180+Math.random()*320}px;--cr:${(Math.random()-.5)*720}deg;--cd:2.5s;--cdl:0s;`;
      el.textContent=em;
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),3000);
    },i*90);
  });
}

function launchConfetti(){
  for(let i=0;i<100;i++) setTimeout(()=>spawnConf({spread:window.innerWidth*.45}),i*14);
  const emojis=['🌙','⭐','✨','🎊','🎉','🕌','💛','🐑','🎈','🌟'];
  for(let i=0;i<18;i++){
    setTimeout(()=>{
      const el=document.createElement('div');
      el.style.cssText=`position:fixed;font-size:${Math.random()*1.9+1}rem;left:${Math.random()*window.innerWidth}px;top:${window.innerHeight*.55}px;z-index:201;pointer-events:none;animation:conf-fall 2.8s ease-in both;--cx:${(Math.random()-.5)*400}px;--cy:-${200+Math.random()*350}px;--cr:${(Math.random()-.5)*720}deg;--cd:2.8s;--cdl:0s;`;
      el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),3200);
    },i*65);
  }
}
