(() => {
  const $ = (id) => document.getElementById(id);
  const menu = $("sideMenu"), toggle = $("menuToggle"), scrim = $("scrim");
  const intro = $("intro"), wrap = $("gameWrap"), donatePage = $("donatePage"), canvas = $("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = $("score"), statusEl = $("gameStatus"), messageEl = $("gameMessage");
  const restart = $("restartButton");

  let running = false, over = false, raf = 0, last = 0, score = 0, speed = 3.25;
  let dino, obstacles, clouds, groundOffset, spawnTimer = 0;

  function openMenu(show) {
    menu.classList.toggle("open", show);
    scrim.classList.toggle("show", show);
    toggle.setAttribute("aria-expanded", String(show));
    menu.setAttribute("aria-hidden", String(!show));
  }
  toggle.addEventListener("click", () => openMenu(!menu.classList.contains("open")));
  scrim.addEventListener("click", () => openMenu(false));
  $("menuPlay").addEventListener("click", () => { openMenu(false); startGame(); });
  $("menuDonate").addEventListener("click", () => {
    openMenu(false); cancelAnimationFrame(raf); running = false;
    intro.hidden = true; wrap.hidden = true; donatePage.hidden = false;
  });
  $("backFromDonate").addEventListener("click", () => {
    donatePage.hidden = true; intro.hidden = false;
  });
  $("playButton").addEventListener("click", startGame);
  restart.addEventListener("click", startGame);

  function reset() {
    score = 0; speed = 2.7; groundOffset = 0; spawnTimer = 3.0; over = false;
    dino = { x: 82, y: 211, w: 72, h: 56, vy: 0, grounded: true, step: 0 };
    obstacles = [];
    clouds = [{x:360,y:62},{x:690,y:92},{x:820,y:48}];
    scoreEl.textContent = "00000"; statusEl.textContent = "RUNNING";
    messageEl.textContent = "Tap or press SPACE to jump"; restart.hidden = true;
  }
  function startGame() {
    cancelAnimationFrame(raf); intro.hidden = true; donatePage.hidden = true;
    wrap.hidden = false; reset(); running = true; last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function jump() {
    if (!running || over) return;
    if (dino.grounded) { dino.vy = -12.4; dino.grounded = false; }
  }
  window.addEventListener("keydown", e => {
    if (["Space","ArrowUp","KeyW"].includes(e.code)) { e.preventDefault(); jump(); }
    if (e.code === "Escape") openMenu(false);
  });
  canvas.addEventListener("pointerdown", jump);
  $("gameWrap").addEventListener("touchstart", e => {
    if (e.target === canvas) e.preventDefault();
  }, {passive:false});

  // Original side-profile dinosaur with a smooth silhouette and animated feet.
  function drawDino() {
    const x = dino.x, y = dino.y;
    const ink = "#171717";
    ctx.fillStyle = ink;
    // Long tapered tail.
    ctx.beginPath();
    ctx.moveTo(x+7,y+34); ctx.lineTo(x-1,y+29); ctx.lineTo(x+5,y+39);
    ctx.lineTo(x+24,y+42); ctx.lineTo(x+28,y+35); ctx.closePath(); ctx.fill();
    // Rounded torso and chest.
    ctx.beginPath();
    ctx.ellipse(x+34,y+34,22,15,-.08,0,Math.PI*2); ctx.fill();
    // Upright neck flowing into a broad head and short muzzle.
    ctx.beginPath();
    ctx.moveTo(x+42,y+35); ctx.quadraticCurveTo(x+44,y+24,x+47,y+17);
    ctx.lineTo(x+47,y+8); ctx.quadraticCurveTo(x+48,y+1,x+57,y+2);
    ctx.lineTo(x+67,y+6); ctx.quadraticCurveTo(x+72,y+9,x+70,y+14);
    ctx.lineTo(x+64,y+17); ctx.lineTo(x+55,y+17);
    ctx.quadraticCurveTo(x+53,y+28,x+55,y+39); ctx.closePath(); ctx.fill();
    // Tiny arm and a small curved mouth notch.
    ctx.strokeStyle=ink; ctx.lineWidth=4; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(x+49,y+27); ctx.lineTo(x+57,y+31); ctx.stroke();
    ctx.strokeStyle="#fff"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(x+64,y+14); ctx.lineTo(x+69,y+13); ctx.stroke();
    // Eye.
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(x+61,y+7,2.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ink; ctx.beginPath(); ctx.arc(x+62,y+7,1,0,Math.PI*2); ctx.fill();
    // Two separate legs with a clear running cycle.
    const stride=dino.grounded ? Math.floor(dino.step)%2 : 0;
    ctx.strokeStyle=ink; ctx.lineWidth=6; ctx.lineCap="square";
    ctx.beginPath();
    if(stride===0){
      ctx.moveTo(x+28,y+43); ctx.lineTo(x+25,y+51); ctx.lineTo(x+18,y+53);
      ctx.moveTo(x+43,y+43); ctx.lineTo(x+46,y+50); ctx.lineTo(x+54,y+50);
    } else {
      ctx.moveTo(x+28,y+43); ctx.lineTo(x+30,y+50); ctx.lineTo(x+38,y+51);
      ctx.moveTo(x+43,y+43); ctx.lineTo(x+40,y+51); ctx.lineTo(x+33,y+53);
    }
    ctx.stroke();
  }
  function drawCactus(o) {
    const x = Math.round(o.x), base = 270, h = o.h, top = base-h;
    ctx.fillStyle = "#202020";
    // Each plant has a different silhouette and a small pebble at its foot.
    if (o.variant === 0) {
      ctx.fillRect(x+12,top+3,14,h-3);
      ctx.fillRect(x+5,top+Math.floor(h*.48),9,7);
      ctx.fillRect(x+5,top+Math.floor(h*.31),6,19);
      ctx.fillRect(x+25,top+Math.floor(h*.62),10,7);
      ctx.fillRect(x+29,top+Math.floor(h*.42),6,22);
      ctx.fillRect(x+15,top,8,7);
      ctx.fillStyle="#f4f4f4"; ctx.fillRect(x+18,top+12,2,h-20);
    } else if (o.variant === 1) {
      ctx.fillRect(x+4,base-18,15,18); ctx.fillRect(x+9,top+5,7,h-20);
      ctx.fillRect(x+19,base-29,17,29); ctx.fillRect(x+24,top,8,h-25);
      ctx.fillStyle="#f4f4f4"; ctx.fillRect(x+12,top+13,2,h-34); ctx.fillRect(x+28,top+9,2,h-35);
    } else {
      ctx.beginPath(); ctx.moveTo(x+2,base); ctx.lineTo(x+8,top+10);
      ctx.lineTo(x+18,top); ctx.lineTo(x+30,top+12); ctx.lineTo(x+38,base); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#f4f4f4"; ctx.fillRect(x+18,top+15,3,h-25);
    }
    ctx.fillStyle="#202020"; ctx.fillRect(x+3,base-2,37,2);
  }

  function drawBird(o) {
    const x = Math.round(o.x), y = Math.round(o.y);
    const flap = Math.sin(o.phase) > 0;
    ctx.fillStyle = "#202020";
    // Rounded body and head, with a pointed beak and split tail.
    ctx.beginPath(); ctx.ellipse(x+23,y+14,15,7,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+37,y+9,7,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+43,y+8); ctx.lineTo(x+52,y+11); ctx.lineTo(x+43,y+13); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+9,y+13); ctx.lineTo(x,y+8); ctx.lineTo(x+4,y+17); ctx.fill();
    // Broad feathered wing changes pose smoothly on each flap.
    ctx.beginPath();
    if (flap) {
      ctx.moveTo(x+16,y+13); ctx.quadraticCurveTo(x+18,y-8,x+34,y-9);
      ctx.quadraticCurveTo(x+30,y+2,x+25,y+14);
    } else {
      ctx.moveTo(x+15,y+14); ctx.quadraticCurveTo(x+18,y+30,x+35,y+27);
      ctx.quadraticCurveTo(x+29,y+19,x+25,y+13);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(x+39,y+7,1.8,0,Math.PI*2); ctx.fill();
  }

  function draw() {
    ctx.clearRect(0,0,900,300);
    ctx.fillStyle="#e8e8e8";
    clouds.forEach(c=>{ctx.fillRect(c.x,c.y,42,2);ctx.fillRect(c.x+10,c.y-5,20,2);});
    ctx.fillStyle="#171717"; ctx.fillRect(0,270,900,2);
    for(let x=groundOffset%36; x<900; x+=36) ctx.fillRect(x,278,3,1);
    obstacles.forEach(o => o.type === "bird" ? drawBird(o) : drawCactus(o));
    drawDino();
  }

  function endGame() {
    running=false; over=true; statusEl.textContent="FINISHED";
    messageEl.textContent="Nice run. Want another try?"; restart.hidden=false;
    cancelAnimationFrame(raf); draw();
    ctx.fillStyle="rgba(255,255,255,.88)"; ctx.fillRect(0,0,900,300);
    ctx.fillStyle="#111"; ctx.textAlign="center";
    ctx.font="800 34px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("GAME OVER",450,130);
    ctx.font="14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("SCORE  "+String(Math.floor(score)).padStart(5,"0"),450,160);
  }

  function loop(now) {
    if(!running) return;
    const dt=Math.min((now-last)/16.67,2); last=now;
    score += dt*0.11;
    // Starts forgiving, then gradually increases speed and obstacle frequency.
    const difficulty = Math.min(1, score/1200);
    speed = 2.7 + difficulty*1.5;
    scoreEl.textContent=String(Math.floor(score)).padStart(5,"0");
    groundOffset += speed*dt; dino.step += speed*dt*.18;
    dino.vy += .62*dt; dino.y += dino.vy*dt;
    if(dino.y>=211){dino.y=211;dino.vy=0;dino.grounded=true;}

    spawnTimer -= dt/60;
    if(spawnTimer <= 0) {
      const canBird = score > 160;
      const makeBird = canBird && Math.random() < Math.min(.22, .08 + score/3000);
      if(makeBird) {
        const heights = [174,190,205];
        obstacles.push({type:"bird",x:930,y:heights[Math.floor(Math.random()*heights.length)],w:52,h:32,phase:0});
      } else {
        const h = 26 + Math.random()*Math.min(12, 3+score*.012);
        obstacles.push({type:"cactus",x:930,h,w:42,variant:Math.floor(Math.random()*3)});
      }
      const gap = 3.35 - difficulty*.35 + Math.random()*.65;
      spawnTimer = gap;
    }

    obstacles.forEach(o=>{o.x-=speed*dt; if(o.type==="bird") o.phase+=dt*.18;});
    obstacles=obstacles.filter(o=>o.x>-75);
    clouds.forEach(c=>{c.x-=speed*.22*dt;if(c.x<-60)c.x=930;});

    const playerBox={x:dino.x+10,y:dino.y+8,w:43,h:43};
    for(const o of obstacles) {
      const box = o.type==="bird"
        ? {x:o.x+5,y:o.y+4,w:43,h:24}
        : {x:o.x+3,y:270-o.h+3,w:35,h:o.h-3};
      if(playerBox.x < box.x+box.w-6 && playerBox.x+playerBox.w-6 > box.x &&
         playerBox.y < box.y+box.h && playerBox.y+playerBox.h > box.y+3) {
        endGame(); return;
      }
    }
    draw(); raf=requestAnimationFrame(loop);
  }
  reset(); running = false; draw();
})();