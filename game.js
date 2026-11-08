(() => {
  const $ = (id) => document.getElementById(id);
  const menu = $("sideMenu"), toggle = $("menuToggle"), scrim = $("scrim");
  const intro = $("intro"), wrap = $("gameWrap"), donatePage = $("donatePage"), canvas = $("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = $("score"), statusEl = $("gameStatus"), messageEl = $("gameMessage");
  const restart = $("restartButton");

  let running = false, over = false, raf = 0, last = 0, score = 0, speed = 4.1;
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
    openMenu(false);
    cancelAnimationFrame(raf);
    running = false;
    intro.hidden = true;
    wrap.hidden = true;
    donatePage.hidden = false;
  });
  $("backFromDonate").addEventListener("click", () => {
    donatePage.hidden = true;
    intro.hidden = false;
  });
  $("playButton").addEventListener("click", startGame);
  restart.addEventListener("click", startGame);

  function reset() {
    score = 0; speed = 4.1; groundOffset = 0; spawnTimer = 1.25; over = false;
    dino = { x: 88, y: 222, w: 48, h: 48, vy: 0, grounded: true, step: 0 };
    obstacles = [];
    clouds = [{x:360,y:62},{x:690,y:92},{x:820,y:48}];
    scoreEl.textContent = "00000";
    statusEl.textContent = "RUNNING";
    messageEl.textContent = "Tap or press SPACE to jump";
    restart.hidden = true;
  }
  function startGame() {
    cancelAnimationFrame(raf);
    intro.hidden = true; donatePage.hidden = true; wrap.hidden = false;
    reset(); running = true; last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function jump() {
    if (!running || over) return;
    if (dino.grounded) { dino.vy = -12.8; dino.grounded = false; }
  }
  window.addEventListener("keydown", e => {
    if (["Space","ArrowUp","KeyW"].includes(e.code)) { e.preventDefault(); jump(); }
    if (e.code === "Escape") openMenu(false);
  });
  canvas.addEventListener("pointerdown", jump);
  $("gameWrap").addEventListener("touchstart", e => {
    if (e.target === canvas) e.preventDefault();
  }, {passive:false});

  // Original pixel-art runner: a friendly, long-tailed dinosaur silhouette.
  function drawDino() {
    const x = Math.round(dino.x), y = Math.round(dino.y);
    const ink = "#171717";
    ctx.fillStyle = ink;
    // Tail, back, body and raised head.
    ctx.fillRect(x+1,y+24,10,7);
    ctx.fillRect(x+7,y+19,8,8);
    ctx.fillRect(x+13,y+12,25,27);
    ctx.fillRect(x+25,y+5,18,18);
    ctx.fillRect(x+36,y+11,12,11);
    // Small arms and lower jaw.
    ctx.fillRect(x+29,y+25,10,5);
    ctx.fillRect(x+38,y+22,9,5);
    // Pixel eye and nostril.
    ctx.fillStyle = "#fff";
    ctx.fillRect(x+37,y+9,4,4);
    ctx.fillStyle = ink;
    ctx.fillRect(x+39,y+10,2,2);
    ctx.fillRect(x+45,y+17,2,2);
    // Two animated legs.
    const stride = dino.grounded ? Math.floor(dino.step)%2 : 0;
    ctx.fillStyle = ink;
    if (stride === 0) {
      ctx.fillRect(x+17,y+36,7,9); ctx.fillRect(x+13,y+43,12,4);
      ctx.fillRect(x+31,y+36,7,7); ctx.fillRect(x+34,y+42,10,4);
    } else {
      ctx.fillRect(x+17,y+36,7,7); ctx.fillRect(x+14,y+42,10,4);
      ctx.fillRect(x+31,y+36,7,9); ctx.fillRect(x+29,y+43,12,4);
    }
  }

  function drawCactus(o) {
    const x = Math.round(o.x), base = 270, h = o.h;
    const top = base-h;
    ctx.fillStyle = "#202020";
    // Main stem with stepped shoulders.
    ctx.fillRect(x+11,top+5,13,h-5);
    ctx.fillRect(x+14,top,7,8);
    // Arms vary slightly by cactus size.
    ctx.fillRect(x+2,top+Math.floor(h*.48),10,7);
    ctx.fillRect(x+2,top+Math.floor(h*.32),6,18);
    ctx.fillRect(x+23,top+Math.floor(h*.62),11,7);
    ctx.fillRect(x+28,top+Math.floor(h*.43),6,22);
    // Light cut-outs give the monochrome cactus a crisp, dimensional look.
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(x+17,top+10,2,Math.max(8,h-22));
    ctx.fillRect(x+5,top+Math.floor(h*.36),2,8);
    ctx.fillRect(x+30,top+Math.floor(h*.49),2,9);
    ctx.fillStyle = "#202020";
    ctx.fillRect(x+8,base-2,23,2);
  }

  function drawBird(o) {
    const x = Math.round(o.x), y = Math.round(o.y);
    const flap = Math.floor(o.phase)%2 === 0;
    ctx.fillStyle = "#202020";
    // Body, head, beak and tail.
    ctx.fillRect(x+12,y+9,23,11);
    ctx.fillRect(x+29,y+4,11,11);
    ctx.fillRect(x+38,y+9,8,4);
    ctx.fillRect(x+4,y+11,10,5);
    // Wings flap between two simple pixel-art poses.
    if (flap) {
      ctx.fillRect(x+15,y+1,8,9); ctx.fillRect(x+21,y+4,9,6);
    } else {
      ctx.fillRect(x+16,y+15,9,8); ctx.fillRect(x+22,y+14,10,5);
    }
    ctx.fillStyle = "#fff";
    ctx.fillRect(x+35,y+7,3,3);
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
    messageEl.textContent="Nice run. Want another try?";
    restart.hidden=false;
    cancelAnimationFrame(raf);
    draw();
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
    // A gentle opening, followed by a steady increase in pace.
    speed = Math.min(9.8, 4.1 + score*0.012);
    scoreEl.textContent=String(Math.floor(score)).padStart(5,"0");
    groundOffset += speed*dt;
    dino.step += speed*dt*.18;
    dino.vy += .62*dt; dino.y += dino.vy*dt;
    if(dino.y>=222){dino.y=222;dino.vy=0;dino.grounded=true;}

    spawnTimer -= dt/60;
    if(spawnTimer <= 0) {
      const canBird = score > 90;
      const makeBird = canBird && Math.random() < Math.min(.34, .12 + score/900);
      if(makeBird) {
        obstacles.push({type:"bird",x:930,y:score>220 && Math.random()<.5?190:207,w:46,h:24,phase:0});
      } else {
        const h = 34 + Math.random()*Math.min(22, 8+score*.035);
        obstacles.push({type:"cactus",x:930,h,w:36});
      }
      const difficulty = Math.min(1, score/450);
      const gap = 1.95 - difficulty*.48 + Math.random()*.55;
      spawnTimer = Math.max(.92,gap) * (4.1/speed);
    }

    obstacles.forEach(o=>{o.x-=speed*dt; if(o.type==="bird") o.phase+=dt*.22;});
    obstacles=obstacles.filter(o=>o.x>-70);
    clouds.forEach(c=>{c.x-=speed*.22*dt;if(c.x<-60)c.x=930;});

    const playerBox={x:dino.x+9,y:dino.y+7,w:34,h:38};
    for(const o of obstacles) {
      const box = o.type==="bird"
        ? {x:o.x+7,y:o.y+5,w:35,h:17}
        : {x:o.x+3,y:270-o.h+3,w:30,h:o.h-3};
      if(playerBox.x < box.x+box.w-5 && playerBox.x+playerBox.w-5 > box.x &&
         playerBox.y < box.y+box.h && playerBox.y+playerBox.h > box.y+3) {
        endGame(); return;
      }
    }
    draw(); raf=requestAnimationFrame(loop);
  }
  reset();
  running = false;
  draw();
})();
