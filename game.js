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
    score = 0; speed = 3.25; groundOffset = 0; spawnTimer = 5.0; over = false;
    dino = { x: 82, y: 214, w: 62, h: 56, vy: 0, grounded: true, step: 0 };
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

  // A recognizable, right-facing pixel dinosaur with a long tail,
  // rounded back, neck, snout, tiny arm and two planted feet.
  function drawDino() {
    const px=3, ox=Math.round(dino.x), oy=Math.round(dino.y);
    const rows=[
      "                   ########",
      "                  ##########",
      "                  ###########",
      "                   ###########",
      "                    ##########",
      "               ###############",
      "          ####################",
      "     #########################",
      "  ############################",
      " #############################",
      "  ###########################",
      "       #####################",
      "             #######",
      "             ######",
      "          ###     ###",
      "          ###     ###",
      "          ###     ###",
      "        #####     #####"
    ];
    ctx.fillStyle="#171717";
    rows.forEach((row,ry)=>{
      for(let cx=0;cx<row.length;cx++){
        if(row[cx]==="#") ctx.fillRect(ox+cx*px,oy+ry*px,px,px);
      }
    });
    // Eye and nostril, both crisp single-pixel highlights.
    ctx.fillStyle="#fff";
    ctx.fillRect(ox+23*px,oy+2*px,px,px);
    ctx.fillRect(ox+27*px,oy+5*px,px,px);
  }
    function drawCactus(o) {
    const x=Math.round(o.x), base=270, h=o.h, top=base-h;
    ctx.fillStyle="#202020";
    // Classic saguaro silhouette: tall central trunk and two raised arms.
    ctx.fillRect(x+14,top+7,12,h-7);
    ctx.fillRect(x+16,top,8,10);
    // Left arm curves upward in square pixel steps.
    ctx.fillRect(x+4,top+Math.floor(h*.48),10,7);
    ctx.fillRect(x+4,top+Math.floor(h*.29),7,22);
    ctx.fillRect(x+4,top+Math.floor(h*.25),12,7);
    // Right arm, at a different height.
    ctx.fillRect(x+26,top+Math.floor(h*.61),11,7);
    ctx.fillRect(x+31,top+Math.floor(h*.40),7,24);
    ctx.fillRect(x+27,top+Math.floor(h*.37),11,7);
    ctx.fillRect(x+8,base-2,28,2);
  }
  function drawBird(o) {
    const x=Math.round(o.x), y=Math.round(o.y), flap=Math.floor(o.phase)%2===0;
    ctx.fillStyle="#202020";
    ctx.fillRect(x+12,y+9,23,11); ctx.fillRect(x+29,y+4,11,11);
    ctx.fillRect(x+38,y+9,8,4); ctx.fillRect(x+4,y+11,10,5);
    if(flap){ctx.fillRect(x+15,y+1,8,9);ctx.fillRect(x+21,y+4,9,6);}
    else {ctx.fillRect(x+16,y+15,9,8);ctx.fillRect(x+22,y+14,10,5);}
    ctx.fillStyle="#fff"; ctx.fillRect(x+35,y+7,3,3);
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
    const difficulty = Math.min(1, score/1500);
    speed = 3.25 + difficulty*2.0;
    scoreEl.textContent=String(Math.floor(score)).padStart(5,"0");
    groundOffset += speed*dt; dino.step += speed*dt*.18;
    dino.vy += .62*dt; dino.y += dino.vy*dt;
    if(dino.y>=214){dino.y=214;dino.vy=0;dino.grounded=true;}

    spawnTimer -= dt/60;
    if(spawnTimer <= 0) {
      const canBird = score > 300;
      const makeBird = canBird && Math.random() < Math.min(.18, .06 + score/4000);
      if(makeBird) {
        const heights = [174,190,205];
        obstacles.push({type:"bird",x:930,y:heights[Math.floor(Math.random()*heights.length)],w:52,h:32,phase:0});
      } else {
        const h = 43 + Math.random()*Math.min(13, 3+score*.008);
        obstacles.push({type:"cactus",x:930,h,w:43,variant:0});
      }
      const gap = 5.0 - difficulty*1.0 + Math.random()*.8;
      spawnTimer = gap;
    }

    obstacles.forEach(o=>{o.x-=speed*dt; if(o.type==="bird") o.phase+=dt*.18;});
    obstacles=obstacles.filter(o=>o.x>-75);
    clouds.forEach(c=>{c.x-=speed*.22*dt;if(c.x<-60)c.x=930;});

    const playerBox={x:dino.x+8,y:dino.y+8,w:66,h:46};
    for(const o of obstacles) {
      const box = o.type==="bird"
        ? {x:o.x+5,y:o.y+4,w:43,h:24}
        : {x:o.x+2,y:270-o.h+3,w:40,h:o.h-3};
      if(playerBox.x < box.x+box.w-6 && playerBox.x+playerBox.w-6 > box.x &&
         playerBox.y < box.y+box.h && playerBox.y+playerBox.h > box.y+3) {
        endGame(); return;
      }
    }
    draw(); raf=requestAnimationFrame(loop);
  }
  reset(); running = false; draw();
})();