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
    score = 0; speed = 4.2; groundOffset = 0; spawnTimer = 3.8; over = false;
    dino = { x: 82, y: 213, w: 87, h: 57, vy: 0, grounded: true, step: 0 };
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

  // Original block-pixel T-rex silhouette, facing right.
  // Tail, raised head, short arms and two feet remain distinct at game scale.
  const dinoPixels = [
    "....................#######",
    "...................#########",
    "...................##########",
    "...................###########",
    "....................##########",
    ".................############.",
    "...............#############...",
    "............###############.....",
    ".......###################.......",
    "....#####################.........",
    ".########################..........",
    "#######################............",
    "....###################............",
    ".......################............",
    "..........##############...........",
    "..........#####....#####............",
    "..........#####....#####............",
    ".........######....######...........",
    ".........######....######..........."
  ];
  function drawDino() {
    const cell=3, ox=Math.round(dino.x), oy=Math.round(dino.y);
    ctx.fillStyle="#171717";
    dinoPixels.forEach((row,ry)=>{
      for(let cx=0;cx<row.length;cx++) if(row[cx]==="#") ctx.fillRect(ox+cx*cell,oy+ry*cell,cell,cell);
    });
    ctx.fillStyle="#fff";
    ctx.fillRect(ox+25*cell,oy+2*cell,cell,cell);
    ctx.fillRect(ox+28*cell,oy+4*cell,cell,cell);
  }

  // Pixel-grid saguaro cactus with a thick trunk and two raised arms.
  const cactusPixels = [
    "........##........","........##........","........##........",
    "........##..####..","........##..####..","........##..####..",
    "...####.##..####..","...####.##..##....","...##...##..##....",
    "...##...##..##....","...##...##..##....","...##...##..##....",
    "...##...##..##....","...######...##....","...######...##....",
    "........##..##....","........##..##....","........##..##....",
    "........##..##....","........##..##....","........##..##....",
    "........##..##....","........##..##....","........##..##....",
    "........##..##....","........##..##....","........##..##....",
    "........##..##...."
  ];
  function drawCactus(o) {
    const cell=3, x=Math.round(o.x), top=270-cactusPixels.length*cell;
    ctx.fillStyle="#202020";
    cactusPixels.forEach((row,ry)=>{
      for(let cx=0;cx<row.length;cx++) if(row[cx]==="#") ctx.fillRect(x+cx*cell,top+ry*cell,cell,cell);
    });
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
    const difficulty = Math.min(1, score/1100);
    speed = 4.2 + difficulty*2.4;
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
        const h = 84;
        obstacles.push({type:"cactus",x:930,h,w:54,variant:0});
      }
      const gap = 3.8 - difficulty*.65 + Math.random()*.65;
      spawnTimer = gap;
    }

    obstacles.forEach(o=>{o.x-=speed*dt; if(o.type==="bird") o.phase+=dt*.18;});
    obstacles=obstacles.filter(o=>o.x>-75);
    clouds.forEach(c=>{c.x-=speed*.22*dt;if(c.x<-60)c.x=930;});

    const playerBox={x:dino.x+4,y:dino.y+5,w:80,h:49};
    for(const o of obstacles) {
      const box = o.type==="bird"
        ? {x:o.x+5,y:o.y+4,w:43,h:24}
        : {x:o.x+3,y:270-o.h+2,w:53,h:o.h-2};
      if(playerBox.x < box.x+box.w-6 && playerBox.x+playerBox.w-6 > box.x &&
         playerBox.y < box.y+box.h && playerBox.y+playerBox.h > box.y+3) {
        endGame(); return;
      }
    }
    draw(); raf=requestAnimationFrame(loop);
  }
  reset(); running = false; draw();
})();