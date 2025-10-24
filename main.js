// ---------- State ----------
let activePortfolio = 'tech';
let uploadedResumeURL = null;

// ---------- Data ----------
const techProjects = [
  { title: 'NFT Garage', tags:['Next.js','Mapbox'], desc:'dApp enabling users to mint, customize, and display digital cars NFTs on the Sepolia testnet', link:'https://github.com/krisht6/NFT-Garage'},
  { title: 'HPF Datascrapes', tags:['Python','Pandas'], desc:'Data Processing for University at Buffalo Department of Behavioral Medicine', link:'https://github.com/krisht6/HPFdatascrapes' },
  { title: 'Catan AI/ML agent', tags:['Python','Q-Learning'], desc:'Self-play machine learning agent for Cities & Knights', link:'https://github.com/krisht6/AI-Catan-Agent' },
  { title: 'FIFA Position Predicter', tags:['Machine Learning','K-Clustering'], desc:'Performance and history statistical relations to provide insights on teams/players', link:'https://github.com/krisht6/Soccer-Player-Position-Model' },
  { title: 'Ontology Finder', tags:['EBI OLS4 API','Bioinformatics'], desc:'Browser-based interface for exploring biomedical ontologies (CL, GO, NCIT)', link:'https://github.com/krisht6/ontology-finder-ui' },
  { title: 'SAFE Optimization', tags:['Python','Forecasting'], desc:'Data-driven research and provided insights - Increased engagement on SA Meta Platforms by over 40%', link:'https://github.com/krisht6/Safe-Data-Scrape' },
];


// ---------- Rendering ----------
function renderProjects(){
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
      // If a project has a `link` property, render it as a clickable anchor that opens in a new tab.
      // Otherwise render a disabled placeholder button so you can add the link later.
      const linkHtml = p.link ?
        `<a class="btn small project-link" href="${p.link}" target="_blank" rel="noopener noreferrer" style="margin-top:10px;display:inline-block">View</a>` :
        `<button class="btn small project-link" disabled style="margin-top:10px;display:inline-block;opacity:0.5;cursor:default">Add link</button>`;

      card.innerHTML = `<h4>${p.title}</h4>
        <div class="meta">${p.tags.join(' • ')}</div>
        <p class="muted">${p.desc}</p>
        ${linkHtml}`;
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
