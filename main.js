// iOS Safari toolbar-safe viewport height fix
function setVhVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
setVhVar();
window.addEventListener("resize", setVhVar);
window.addEventListener("orientationchange", setVhVar);

const projects = [
  { title: "NFT Garage", tags:["Next.js","Mapbox"], desc:"dApp enabling users to mint, customize, and display digital cars NFTs on the Sepolia testnet", link:"https://github.com/krisht6/NFT-Garage", lane:"web" },
  { title: "Ontology Finder", tags:["EBI OLS4 API","Bioinformatics"], desc:"Browser-based interface for exploring biomedical ontologies (CL, GO, NCIT)", link:"https://github.com/krisht6/ontology-finder-ui", lane:"web" },
  { title: "HPF Datascrapes", tags:["Python","Pandas"], desc:"Data Processing for University at Buffalo Department of Behavioral Medicine", link:"https://github.com/krisht6/HPFdatascrapes", lane:"enterprise" },
  { title: "Catan AI/ML agent", tags:["Python","Q-Learning"], desc:"Self-play machine learning agent for Cities & Knights", link:"https://github.com/krisht6/AI-Catan-Agent", lane:"ml" },
  { title: "FIFA Position Predictor", tags:["Machine Learning","K-Clustering"], desc:"Performance and history statistical relations to provide insights on teams/players", link:"https://github.com/krisht6/Soccer-Player-Position-Model", lane:"ml" },
  { title: "SAFE Optimization", tags:["Python","Forecasting"], desc:"Data-driven research and provided insights - Increased engagement on SA Meta Platforms by over 40%", link:"https://github.com/krisht6/Safe-Data-Scrape", lane:"enterprise" },
  { title: "Heuristic Yahtzee", tags:["HTML","Heuristics"], desc:"Algorithm-powered CPU opponent in a web-based retro Yahtzee game.", link:"https://krishthakkar.com/yahtzeeGame/", lane:"web" },
  { title: "GoT Map", tags:["Webkit","Scripting"], desc:"Interactive map of GoT, allowing users to zoom, pan, and click on locations to reveal detailed lore", link:"http://krishthakkar.com/got-map/", lane:"web" }
];

// Which tiles should feel “bigger”
const featuredTitles = new Set();

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function tileTemplate(p) {
  const isFeatured = featuredTitles.has(p.title);
  const tileClasses = [
    "tile",
    isFeatured ? "tile--feature tile--span2" : ""
  ].join(" ").trim();

  const tags = p.tags.map(t => `<span class="tile__tag">${escapeHtml(t)}</span>`).join("");

  const laneLabel = p.lane === "ml" ? "ML" : (p.lane === "web" ? "Web" : "Enterprise");

  return `
    <a class="${tileClasses}" href="${p.link}" target="_blank" rel="noreferrer" data-lane="${escapeHtml(p.lane)}">
      <h3 class="tile__title">${escapeHtml(p.title)}</h3>
      <p class="tile__desc">${escapeHtml(p.desc)}</p>

      <div class="tile__tags" aria-label="Tags">
        ${tags}
      </div>

      <div class="tile__foot">
        <span class="tile__lane">${laneLabel}</span>
        <span class="tile__open">Open</span>
      </div>
    </a>
  `;
}

const tiles = document.getElementById("tiles");
tiles.innerHTML = projects.map(tileTemplate).join("");

// Filters
const filterButtons = document.querySelectorAll(".filter");
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    filterButtons.forEach(b => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });

    document.querySelectorAll(".tile").forEach(tile => {
      const lane = tile.getAttribute("data-lane");
      const show = filter === "all" || lane === filter;
      tile.style.display = show ? "" : "none";
    });
  });
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

/*
  FUTURE PHOTO TILE (we’ll do later)
  Example:
  - Add class "tile--image" to the tile element
  - Set background image:
      tile.style.backgroundImage = "url('src/images/yourgrain.jpg')"
  - Overlay + white text already handled in CSS (.tile--image)
*/
