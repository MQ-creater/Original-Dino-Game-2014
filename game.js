(() => {
  const $ = (id) => document.getElementById(id);
  const menu = $("sideMenu"), toggle = $("menuToggle"), scrim = $("scrim");
  const intro = $("intro"), wrap = $("gameWrap"), canvas = $("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = $("score"), statusEl = $("gameStatus"), messageEl = $("gameMessage");
  const restart = $("restartButton");
  const donate = $("donateDialog");
  let running = false, over = false, raf = 0, last = 0, score = 0, speed = 5;
  let dino, obstacles, clouds, groundOffset;

  function openMenu(show) {
    menu.classList.toggle("open", show);
    scrim.classList.toggle("show", show);
    toggle.setAttribute("aria-expanded", String(show));
    menu.setAttribute("aria-hidden", String(!show));
  }
  toggle.addEventListener("click", () => openMenu(!menu.classList.contains("open")));
  scrim.addEventListener("click", () => openMenu(false));
  $("menuPlay").addEventListener("click", () => { openMenu(false); startGame(); });
  $("menuDonate").addEventListener("click", () => { openMenu(false); donate.showModal(); });
  $("closeDonate").addEventListener("click", () => donate.close());
  $("playButton").addEventListener("click", startGame);
  restart.addEventListener("click", startGame);

  function reset() {
    score = 0; speed = 5; groundOffset = 0; over = false;
    dino = { x: 90, y: 222, w: 42, h: 48, vy: 0, grounded: true };
    obstacles = []; clouds = [{x:360,y:62},{x:690,y:92}];
    scoreEl.textContent = "00000";
    statusEl.textContent = "RUNNING";
    messageEl.textContent = "Tap or press SPACE to jump";
    restart.hidden = true;
  }
  function startGame() {
    cancelAnimationFrame(raf);
    intro.hidden = true; wrap.hidden = false;
    reset(); running = true; last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function jump() {
    if (!running || over) return;
    if (dino.grounded) { dino.vy = -12.5; dino.grounded = false; }
  }
  window.addEventListener("keydown", e => {
    if (["Space","ArrowUp","KeyW"].includes(e.code)) { e.preventDefault(); jump(); }
    if (e.code === "Escape") openMenu(false);
  });
  canvas.addEventListener("pointerdown", jump);
  $("gameWrap").addEventListener("touchstart", e => {
    if (e.target === canvas) e.preventDefault();
  }, {passive:false});

  function drawDino() {
    // Original geometric dino silhouette, drawn in solid monochrome.
    ctx.fillStyle = "#111";
    const x=dino.x, y=dino.y;
    ctx.fillRect(x+12,y+5,25,24);
    ctx.fillRect(x+27,y,15,15);
    ctx.fillRect(x+38,y+5,10,5);
    ctx.fillRect(x+7,y+25,32,10);
    ctx.fillRect(x,y+20,13,7);
    ctx.fillRect(x+15,y+33,8,13);
    ctx.fillRect(x+30,y+33,8,13);
    ctx.clearRect(x+37,y+4,3,3);
    ctx.fillStyle="#fff"; ctx.fillRect(x+37,y+4,3,3);
    if (dino.grounded && running && Math.floor(score/7)%2===0) {
      ctx.fillStyle="#111"; ctx.fillRect(x+14,y+43,5,5); ctx.fillRect(x+31,y+43,5,5);
    }
  }
  function drawObstacle(o) {
    ctx.fillStyle="#111";
    if (o.type===0) {
      ctx.fillRect(o.x+8, 224, 11, 48);
      ctx.fillRect(o.x, 237, 10, 7);
      ctx.fillRect(o.x+17, 244, 10, 7);
      ctx.fillRect(o.x+2, 215, 7, 14);
    } else {
      ctx.fillRect(o.x+3, 235, 13, 37);
      ctx.fillRect(o.x+15, 222, 12, 50);
      ctx.fillRect(o.x+25, 242, 11, 30);
    }
  }
  function draw() {
    ctx.clearRect(0,0,900,300);
    ctx.fillStyle="#f0f0f0";
    clouds.forEach(c=>{ctx.fillRect(c.x,c.y,42,2);ctx.fillRect(c.x+10,c.y-5,20,2);});
    ctx.fillStyle="#111"; ctx.fillRect(0,270,900,2);
    for(let x=groundOffset%36; x<900; x+=36) ctx.fillRect(x,278,3,1);
    drawDino();
    obstacles.forEach(drawObstacle);
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
    score += dt*0.11; speed=Math.min(10,5+score/180);
    scoreEl.textContent=String(Math.floor(score)).padStart(5,"0");
    groundOffset += speed*dt;
    dino.vy += .62*dt; dino.y += dino.vy*dt;
    if(dino.y>=222){dino.y=222;dino.vy=0;dino.grounded=true;}
    if(Math.random()<.018*dt) obstacles.push({x:920,type:Math.random()<.5?0:1,w:38});
    obstacles.forEach(o=>o.x-=speed*dt);
    obstacles=obstacles.filter(o=>o.x>-50);
    clouds.forEach(c=>{c.x-=speed*.22*dt;if(c.x<-60)c.x=930;});
    const hitbox={x:dino.x+7,y:dino.y+7,w:33,h:38};
    for(const o of obstacles){
      const ox=o.x+2, oy=o.type===0?215:222, ow=o.type===0?27:34, oh=270-oy;
      if(hitbox.x < ox+ow-4 && hitbox.x+hitbox.w-4 > ox && hitbox.y < oy+oh && hitbox.y+hitbox.h > oy+4){endGame();return;}
    }
    draw(); raf=requestAnimationFrame(loop);
  }
  draw();
})();