// ---------- State ----------
let activePortfolio = 'tech';
let uploadedResumeURL = null;

// ---------- Data ----------
const techProjects = [
  { title: 'NFT Garage', tags:['Next.js','Mapbox'], desc:'dApp enabling users to mint, customize, and display digital cars NFTs on the Sepolia testnet' },
  { title: 'HPF Datascrapes', tags:['Python','Pandas'], desc:'Data Processing for University at Buffalo Department of Behavioral Medicine' },
  { title: 'Catan AI/ML agent', tags:['Python','Q-Learning'], desc:'Self-play machine learning agent for Cities & Knights' },
  { title: 'NBA Analytics Database', tags:['SQL','PgAdmin'], desc:'Performace and history statistical relations to provide insights on teams/players' },
];

const creative = {
  tracks: [
    { title: '88', src: 'src/88 Samba.mp3' },
    { title: 'We Up We Out', src: 'src/untitled.mp3' },
    { title: 'Inner Gates', src: 'src/wisdom teeth cookup.mp3' },
  ],
  photoshop: [
    { src: 'src/reflections6.jpg' },
    { src: 'src/tracksgradient.jpg'}
  ],
  renders: [
    { src: 'src/krishblenderlogo.MP4' }
  ]
};

// ---------- Rendering ----------
function renderProjects(){
  // Helper: show modal overlay with enlarged media
  function showModal(src, type, title) {
    let modal = document.getElementById('mediaModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'mediaModal';
      modal.style = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;`;
      modal.innerHTML = `<div id='modalContent' style='max-width:90vw;max-height:90vh;position:relative;'><button id='closeModal' style='position:absolute;top:12px;right:12px;font-size:2rem;background:none;border:none;color:#fff;cursor:pointer;z-index:2'>&times;</button></div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
      modal.querySelector('#closeModal').onclick = () => modal.remove();
    } else {
      modal.style.display = 'flex';
    }
    const content = modal.querySelector('#modalContent');
    content.innerHTML = `<button id='closeModal' style='position:absolute;top:12px;right:12px;font-size:2rem;background:none;border:none;color:#fff;cursor:pointer;z-index:2'>&times;</button>`;
    if(type==='img') {
      content.innerHTML += `<img src='${src}' alt='${title}' title='${title}' style='max-width:100%;max-height:80vh;border-radius:16px;box-shadow:0 2px 24px #0008;' />`;
    } else if(type==='video') {
      content.innerHTML += `<video src='${src}' controls autoplay style='max-width:100%;max-height:80vh;border-radius:16px;box-shadow:0 2px 24px #0008;'></video>`;
    }
    if(title) content.innerHTML += `<div style='color:#fff;text-align:center;margin-top:8px;font-size:1.1rem;'>${title}</div>`;
    content.querySelector('#closeModal').onclick = () => modal.remove();
  }
    // Animated Sky Background
    window.addEventListener('DOMContentLoaded', function() {
      const canvas = document.getElementById('skybg');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Cloud properties
      const cloudCount = 18;
      const clouds = [];
      for (let i = 0; i < cloudCount; i++) {
        clouds.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 60 + Math.random() * 120,
          speed: 0.15 + Math.random() * 0.35,
          opacity: 0.13 + Math.random() * 0.22,
          layers: Math.floor(2 + Math.random() * 3)
        });
      }

      function drawSky() {
        // Blue gradient sky
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0a2340');
        grad.addColorStop(0.4, '#1a4a7a');
        grad.addColorStop(0.7, '#2b6cb0');
        grad.addColorStop(1, '#10141e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      function drawCloud(cloud, t) {
        ctx.save();
        ctx.globalAlpha = cloud.opacity;
        for (let l = 0; l < cloud.layers; l++) {
          // Pulsing effect
          const pulse = 1 + 0.08 * Math.sin(t/600 + cloud.x/200 + l);
          // Vertical drifting
          const drift = 8 * Math.sin(t/900 + cloud.x/300 + l*2);
          // Subtle color shift
          const blueShift = Math.floor(230 + 10 * Math.sin(t/1200 + cloud.x/400 + l));
          const offset = l * 12;
          ctx.beginPath();
          ctx.arc(cloud.x + offset, cloud.y + offset * 0.5 + drift, (cloud.r - l * 18) * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220,${blueShift},255,${0.18-cloud.opacity*0.2*l})`;
          ctx.shadowColor = `rgba(80,120,180,0.18)`;
          ctx.shadowBlur = 18 - l * 4;
          ctx.fill();
        }
        ctx.restore();
      }

      function animate() {
        const t = performance.now();
        drawSky();
        for (let cloud of clouds) {
          cloud.x += cloud.speed;
          if (cloud.x - cloud.r > canvas.width) {
            cloud.x = -cloud.r;
            cloud.y = Math.random() * canvas.height;
            cloud.r = 60 + Math.random() * 120;
            cloud.opacity = 0.13 + Math.random() * 0.22;
            cloud.layers = Math.floor(2 + Math.random() * 3);
          }
          drawCloud(cloud, t);
        }
        requestAnimationFrame(animate);
      }
      animate();
    });
  const mount = document.getElementById('projectsContent');
  mount.innerHTML = '';

  if(activePortfolio === 'tech'){
    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    techProjects.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'project';
      card.innerHTML = `<h4>${p.title}</h4>
        <div class="meta">${p.tags.join(' • ')}</div>
        <p class="muted">${p.desc}</p>`;
      grid.appendChild(card);
    })
    mount.appendChild(grid);
  } else {
    // Creative layout: audio + galleries
    const wrap = document.createElement('div');
    wrap.className = 'audio-wrap';
    wrap.innerHTML = `
      <div class="card pad" style="background:rgba(255,255,255,0.04)">
        <h3 style="margin-bottom:8px">Highlighted Tracks</h3>
        <audio id="player" controls style="width:100%"></audio>
        <div class="tracklist" id="tracklist" style="margin-top:10px"></div>
        <p class="muted" style="margin-top:8px">Clicking a track will load & play.</p>
      </div>
      <div>
        <div class="card pad" style="margin-bottom:16px">
          <h3>Photoshop Gallery</h3>
          <div class="gallery" id="psGallery" style="margin-top:10px"></div>
        </div>
        <div class="card pad">
          <h3>Blender Renders</h3>
          <div class="gallery" id="renderGallery" style="margin-top:10px"></div>
        </div>
      </div>`;
    mount.appendChild(wrap);

    // Fill tracks
    const tl = wrap.querySelector('#tracklist');
    creative.tracks.forEach((t, i)=>{
      const row = document.createElement('div');
      row.className = 'track';
      row.innerHTML = `<span>${i+1}. ${t.title}</span><span>▶︎</span>`;
      row.addEventListener('click', ()=>{
        const player = document.getElementById('player');
        if(t.src){ player.src = t.src; player.play(); }
        else alert('No audio URL set yet for \"'+t.title+'\". Edit creative.tracks in main.js.');
      })
      tl.appendChild(row);
    })

    // Fill galleries with actual images and videos
    const psG = wrap.querySelector('#psGallery');
    creative.photoshop.forEach(photo => {
      const div = document.createElement('div');
      div.className = 'thumb';
      div.style = 'display:flex;align-items:center;justify-content:center;height:100px;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin-bottom:8px;cursor:pointer;';
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.title;
      img.title = photo.title;
      img.style = 'width:100%;height:auto;border-radius:8px;object-fit:cover;';
      div.appendChild(img);
      div.onclick = () => showModal(photo.src, 'img', photo.title);
      psG.appendChild(div);
    });
    const rG = wrap.querySelector('#renderGallery');
    creative.renders.forEach(render => {
      const div = document.createElement('div');
      div.className = 'thumb render';
      div.style = 'display:flex;align-items:center;justify-content:center;height:140px;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin-bottom:8px;cursor:pointer;';
      if(render.src.match(/\.(mp4|webm|ogg)$/i)) {
        const video = document.createElement('video');
        video.src = render.src;
        video.controls = true;
        video.title = render.title;
        video.style = 'width:100%;height:auto;border-radius:8px;object-fit:cover;';
        div.appendChild(video);
        div.onclick = () => showModal(render.src, 'video', render.title);
      } else {
        const img = document.createElement('img');
        img.src = render.src;
        img.alt = render.title;
        img.title = render.title;
        img.style = 'width:100%;height:auto;border-radius:8px;object-fit:cover;';
        div.appendChild(img);
        div.onclick = () => showModal(render.src, 'img', render.title);
      }
      rG.appendChild(div);
    });
  }
}

// ---------- Tabs sync (About + Projects) ----------
function setActive(target){
  activePortfolio = target;
  // About pills
  document.querySelectorAll('.pill').forEach(p=>{
    const on = p.dataset.target === target; p.classList.toggle('active', on); p.setAttribute('aria-selected', String(on));
  });
  // Project tab buttons
  document.querySelectorAll('.tab-btn').forEach(b=>{
    const on = b.dataset.target === target; b.classList.toggle('active', on);
  });
  renderProjects();
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.pill').forEach(p=> p.addEventListener('click', ()=>{
    setActive(p.dataset.target);
    document.querySelector('#projects').scrollIntoView({behavior:'smooth'});
  }));
  document.querySelectorAll('.tab-btn').forEach(b=> b.addEventListener('click', ()=> setActive(b.dataset.target)));

  // ---------- Resume handling ----------
  const uploadBtn = document.getElementById('uploadResume');
  const fileInput = document.getElementById('resumeUpload');
  const downloadBtn = document.getElementById('downloadResume');

  uploadBtn.addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', ()=>{
    const file = fileInput.files[0];
    if(file){ uploadedResumeURL = URL.createObjectURL(file); alert('PDF loaded! “Download Resume” will now download your uploaded PDF.'); }
  });

  downloadBtn.addEventListener('click', ()=>{
    if(uploadedResumeURL){ 
      const a = document.createElement('a');
      a.href = uploadedResumeURL; a.download = 'Krish_Resume.pdf'; a.click();
    } else {
      const html = `<!doctype html><html><head><meta charset='utf-8'><title>Resume</title>
        <style>body{font:16px/1.5 Inter,system-ui;padding:40px;max-width:800px;margin:auto;color:#111}
        h1{margin:0 0 6px} .muted{color:#555}</style></head>
        <body><h1>Krish Thakkar</h1><div class='muted'>Your City · email@example.com · linkedin.com/in/you</div>
        <h2>Experience</h2><h3>Senior Software Engineer</h3><ul><li>Build things</li><li>Collaborate</li><li>Ship</li></ul>
        <h2>Projects</h2><ul><li>Transit Explorer</li><li>Catan RL Agent</li></ul></body></html>`;
      const blob = new Blob([html], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'Krish_Resume.html'; a.click();
      URL.revokeObjectURL(url);
    }
  });

  // Initial render
  renderProjects();
});
