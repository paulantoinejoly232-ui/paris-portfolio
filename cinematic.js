(() => {
    const photos = [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Sunset_%40_Seine_%40_Pont_des_Arts_%40_Paris_%2833017547140%29.jpg/1920px-Sunset_%40_Seine_%40_Pont_des_Arts_%40_Paris_%2833017547140%29.jpg",
        credit: "Guilhem Vellut · CC BY 2.0",
        source: "https://commons.wikimedia.org/wiki/File:Sunset_@_Seine_@_Pont_des_Arts_@_Paris_(33017547140).jpg",
        license: "https://creativecommons.org/licenses/by/2.0/"
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Paris_-_Seine_%287%29.jpg/1920px-Paris_-_Seine_%287%29.jpg",
        credit: "Johannes Reimer · CC BY 4.0",
        source: "https://commons.wikimedia.org/wiki/File:Paris_-_Seine_(7).jpg",
        license: "https://creativecommons.org/licenses/by/4.0/"
      },
      {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Paris_-_Seine_(21).jpg?width=1440",
        credit: "Johannes Reimer · CC BY 4.0",
        source: "https://commons.wikimedia.org/wiki/File:Paris_-_Seine_(21).jpg",
        license: "https://creativecommons.org/licenses/by/4.0/"
      },
      {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Paris_-_Seine_(24).jpg?width=1920",
        credit: "Johannes Reimer · CC BY 4.0",
        source: "https://commons.wikimedia.org/wiki/File:Paris_-_Seine_(24).jpg",
        license: "https://creativecommons.org/licenses/by/4.0/"
      }
    ];
    const projects = [
      { name: "Making AI useful.", org: "Microsoft", type: "PRODUCT STRATEGY", loc: "Los Angeles · 2026", dek: "Helping teams understand how educators adopt AI.", text: "Led a five-person team across research, synthesis and product recommendations for Copilot in education. We combined interviews with quantitative analysis to identify adoption barriers and opportunities for a better product experience.", facts: ["100+ educator interviews", "2,000+ data points", "Product roadmap"] },
      { name: "Making complexity simpler.", org: "Société Générale", type: "MARKET RISK & AUTOMATION", loc: "Paris · Summer 2026", dek: "Finding a better way through complex systems.", text: "Mapped operational processes across market risk, built automated workflows with Python and Power Automate, and helped teams work more clearly and efficiently.", facts: ["28 processes mapped", "~90% less manual follow-up", "Python & Power Automate"] },
      { name: "The future of work.", org: "Rostra", type: "AI STRATEGY", loc: "Los Angeles · 2025–26", dek: "Turning the impact of AI into a strategic question.", text: "Analyzed how AI could reshape occupations and industries, translating extensive quantitative research into strategic implications.", facts: ["800+ occupations", "120 industries", "AI research"] },
      { name: "Strategy is a team sport.", org: "Bruin Strategy Network", type: "LEADERSHIP", loc: "UCLA · Los Angeles", dek: "Ambitious work is better when it's collaborative.", text: "As Vice President of Consulting, I help lead consulting projects, case competitions, workshops and partnerships that bring people together to solve interesting problems.", facts: ["VP of Consulting", "Case competitions", "Student community"] },
      { name: "Three cities, one curiosity.", org: "About me", type: "THE PERSON", loc: "Hong Kong · Los Angeles · Paris", dek: "A life lived between places and perspectives.", text: "I grew up in Hong Kong, study mathematics and philosophy at UCLA, and keep finding my way back to Paris. I'm drawn to people, products, culture, and making ideas real.", facts: ["UCLA · Class of 2028", "Mathematics & Philosophy", "English & French"] },
      { name: "Always in motion.", org: "Beyond the desk", type: "THE HUMAN SIDE", loc: "Everywhere", dek: "There's more to life than a résumé.", text: "Formula 1, tennis, running, hiking, and years of scouting have taught me to embrace curiosity and enjoy the company of people who like to explore.", facts: ["Tennis & Formula 1", "Running & hiking", "Scouting"] },
      { name: "Something worth building.", org: "The future", type: "WHAT'S NEXT", loc: "An open road", dek: "A long-term ambition to build products that matter.", text: "I want to help make thoughtful products that solve real problems, eventually building something of my own. I'm drawn to zero-to-one teams, AI, and the human side of technology.", facts: ["Product development", "AI & human experience", "Zero to one"] },
      { name: "Say bonjour.", org: "Contact", type: "GET IN TOUCH", loc: "From anywhere", dek: "Good things begin with a conversation.", text: "Interested in product, strategy, technology, or an ambitious new project? I'd love to hear from you. Thanks for taking the scenic route.", facts: ["Open to collaboration", "Product & strategy", "Let's connect"] }
    ];
    const stops = [
      { label: "LE DÉPART", place: "PONT DES ARTS · PARIS", title: "A life in<br><em>motion.</em>", description: "From Hong Kong to Los Angeles and back to the streets of Paris. A little walk through the projects, people and ideas that shaped my journey.", p: [4, 0] },
      { label: "LES IDÉES", place: "AU BORD DE LA SEINE", title: "Ideas are made<br><em>to travel.</em>", description: "Research, product thinking, and a fascination with turning complicated problems into something genuinely useful.", p: [1, 2] },
      { label: "LES GENS", place: "QUAI DE SEINE", title: "Made better<br><em>together.</em>", description: "Case competitions, close-knit teams, and the kind of work that happens when people care about solving things together.", p: [3, 5] },
      { label: "LA SUITE", place: "PARIS, AFTER DARK", title: "The best part<br><em>is still ahead.</em>", description: "A few ideas about what comes next—and an invitation to start a conversation.", p: [6, 7] }
    ];
    const host = document.createElement("div");
    host.id = "cinematic-tour";
    host.innerHTML = `
      <div class="c-backdrops" aria-hidden="true">${photos.map((p, i) => `<div class="c-scene ${i === 0 ? "active" : ""}" style="background-image:url('${p.url}')"></div>`).join("")}</div>
      <div class="c-vignette" aria-hidden="true"></div><div class="c-noise" aria-hidden="true"></div>
      <header class="c-header">
        <a href="#home" class="c-brand" aria-label="Return to beginning"><span class="c-monogram">PAJ<span>.</span></span><span class="c-brand-name">PAUL-ANTOINE<br>JOLY</span></a>
        <nav class="c-nav" aria-label="Main navigation"><button data-nav="home">THE WALK</button><button data-nav="work">SELECTED WORK</button><button data-nav="about">ABOUT</button><button data-nav="contact" class="c-contact">SAY BONJOUR ↗</button></nav>
      </header>
      <div class="c-place"><span class="c-rule"></span><span id="c-place-name">PONT DES ARTS · PARIS</span><span class="c-sun">✳</span> GOLDEN HOUR</div>
      <section class="c-copy" aria-live="polite">
        <div class="c-kicker"><span id="c-num">01</span> / 04 &nbsp; — &nbsp; <span id="c-label">LE DÉPART</span></div>
        <h1 id="c-title">A life in<br><em>motion.</em></h1>
        <p id="c-description">From Hong Kong to Los Angeles and back to the streets of Paris.</p>
        <div class="c-actions"><button id="c-forward" class="c-main-action"><span>CONTINUE THE WALK</span><b>↗</b></button><button id="c-3d" class="c-3d">EXPLORE IN 3D <span>↗</span></button></div>
      </section>
      <div class="c-side-note"><span>A PERSONAL PORTFOLIO</span><i></i><p>Curious about people.<br>Drawn to products.<br>Always exploring.</p><small>PAUL-ANTOINE JOLY<br>HONG KONG · LOS ANGELES · PARIS</small></div>
      <section class="c-stalls" aria-label="Explore stories"><div class="c-stalls-heading"><span>✳</span><div><small>LES BOUQUINISTES</small><strong>Stories along the Seine</strong></div></div><div id="c-stall-cards"></div></section>
      <footer class="c-footer"><div class="c-progress"><span id="c-progress-num">01</span><div class="c-progress-lines">${stops.map((_, i) => `<button data-step="${i}" aria-label="Visit chapter ${i + 1}" class="${i === 0 ? "active" : ""}"><i></i></button>`).join("")}</div><span>04</span></div><span class="c-keyboard">SCROLL OR <kbd>W</kbd> TO WALK</span><div class="c-buttons"><button id="c-back" aria-label="Previous chapter">←</button><button id="c-next" aria-label="Next chapter">→</button></div></footer>
      <div class="c-photo-credit">PHOTO: <a id="c-credit-source" target="_blank" rel="noopener" href="${photos[0].source}">${photos[0].credit}</a> · <a id="c-credit-license" target="_blank" rel="noopener" href="${photos[0].license}">LICENSE</a> · COLOUR TREATMENT APPLIED</div>
      <div id="c-detail" class="c-detail" role="dialog" aria-modal="true" aria-label="Project details" hidden><div class="c-scrim" data-dismiss></div><article class="c-detail-box"><button class="c-close" data-dismiss>CLOSE ✕</button><div id="c-detail-image" class="c-detail-image"></div><div class="c-detail-info"><span id="c-detail-type"></span><h2 id="c-detail-heading"></h2><p id="c-detail-org"></p><h3 id="c-detail-dek"></h3><p id="c-detail-text"></p><div id="c-detail-facts"></div><a class="c-email" href="mailto:paulantoinejoly@g.ucla.edu">START A CONVERSATION ↗</a></div></article></div>
      <div id="c-work" class="c-work" role="dialog" aria-modal="true" aria-label="Selected portfolio works" hidden><div class="c-scrim" data-work-close></div><aside class="c-work-panel"><button class="c-close" data-work-close>CLOSE ✕</button><small>THE COLLECTION / 2026</small><h2>Eight stories.<br><em>One journey.</em></h2><div class="c-work-items">${projects.map((p, i) => `<button data-project="${i}"><span>${String(i + 1).padStart(2, "0")}</span><strong>${p.name}</strong><small>${p.org}</small><b>↗</b></button>`).join("")}</div></aside></div>`;
    document.querySelector("#app").appendChild(host);
    document.body.classList.add("cinematic-mode");
    let current = 0, lastWheel = 0, initialTouch = null;
    const q = s => host.querySelector(s);
    const txt = (s, v) => q(s).textContent = v;
    const displayed = id => !q(id).hasAttribute("hidden");
    photos.slice(1).forEach(p => { const preload = new Image(); preload.src = p.url; });
    function step(i) {
      current = Math.max(0, Math.min(stops.length - 1, i));
      const data = stops[current], photo = photos[current];
      host.querySelectorAll(".c-scene").forEach((el, idx) => el.classList.toggle("active", idx === current));
      txt("#c-place-name", data.place); txt("#c-num", String(current + 1).padStart(2, "0")); txt("#c-label", data.label);
      q("#c-title").innerHTML = data.title; txt("#c-description", data.description);
      txt("#c-progress-num", String(current + 1).padStart(2, "0"));
      txt("#c-credit-source", photo.credit); q("#c-credit-source").href = photo.source; q("#c-credit-license").href = photo.license;
      q("#c-stall-cards").innerHTML = data.p.map(i => `<button class="c-stall" data-project="${i}"><span>${String(i + 1).padStart(2, "0")} / 08</span><div><small>${projects[i].org.toUpperCase()}</small><strong>${projects[i].name}</strong></div><b>↗</b></button>`).join("");
      host.querySelectorAll("[data-step]").forEach((el, i) => el.classList.toggle("active", i === current));
      txt("#c-forward span", current === stops.length - 1 ? "START AGAIN" : "CONTINUE THE WALK");
      q("#c-back").disabled = current === 0; host.dataset.stage = String(current);
    }
    function forward() { step(current === stops.length - 1 ? 0 : current + 1); }
    function back() { step(current - 1); }
    function closeDetail() { q("#c-detail").setAttribute("hidden", ""); }
    function closeWork() { q("#c-work").setAttribute("hidden", ""); }
    function openProject(i) {
      const p = projects[i]; if (!p) return; closeWork();
      txt("#c-detail-type", p.type); txt("#c-detail-heading", p.name); txt("#c-detail-org", p.org + " · " + p.loc);
      txt("#c-detail-dek", p.dek); txt("#c-detail-text", p.text);
      q("#c-detail-facts").innerHTML = p.facts.map(f => `<span>${f}</span>`).join("");
      q("#c-detail-image").style.backgroundImage = `linear-gradient(0deg,rgba(7,20,23,.5),transparent),url("${photos[Math.min(3, Math.floor(i / 2))].url}")`;
      q("#c-detail").removeAttribute("hidden");
    }
    function work() { closeDetail(); q("#c-work").removeAttribute("hidden"); }
    function enter3D() {
      closeDetail(); closeWork(); host.setAttribute("hidden", "");
      document.body.classList.remove("cinematic-mode"); document.body.classList.add("in-three");
      document.querySelector("#begin")?.click();
    }
    const toTour = document.createElement("button");
    toTour.className = "c-return"; toTour.textContent = "PHOTO TOUR ↶";
    document.querySelector(".topbar nav")?.prepend(toTour);
    toTour.addEventListener("click", () => {
      document.exitPointerLock?.();
      document.querySelector("#close-gallery")?.click();
      document.querySelector("#close-modal")?.click();
      document.body.classList.remove("in-three"); document.body.classList.add("cinematic-mode"); host.removeAttribute("hidden");
    });
    host.addEventListener("click", e => {
      if (e.target.closest("[data-dismiss]")) closeDetail();
      if (e.target.closest("[data-work-close]")) closeWork();
      const project = e.target.closest("[data-project]"); if (project) openProject(Number(project.dataset.project));
      const node = e.target.closest("[data-nav]");
      if (node) {
        if (node.dataset.nav === "home") step(0);
        if (node.dataset.nav === "work") work();
        if (node.dataset.nav === "about") openProject(4);
        if (node.dataset.nav === "contact") openProject(7);
      }
      const waypoint = e.target.closest("[data-step]"); if (waypoint) step(Number(waypoint.dataset.step));
    });
    q(".c-brand").addEventListener("click", e => { e.preventDefault(); closeDetail(); closeWork(); step(0); });
    q("#c-forward").onclick = forward; q("#c-next").onclick = forward; q("#c-back").onclick = back; q("#c-3d").onclick = enter3D;
    window.addEventListener("keydown", e => {
      if (!document.body.classList.contains("cinematic-mode")) return;
      if (e.key === "Escape") { closeDetail(); closeWork(); return; }
      if (displayed("#c-detail") || displayed("#c-work")) return;
      if (["ArrowDown", "ArrowRight", "w", "W", " ", "PageDown"].includes(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); forward(); }
      if (["ArrowUp", "ArrowLeft", "s", "S", "PageUp"].includes(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); back(); }
    }, true);
    window.addEventListener("wheel", e => {
      if (!document.body.classList.contains("cinematic-mode") || displayed("#c-detail") || displayed("#c-work")) return;
      if (Math.abs(e.deltaY) < 14) return;
      e.preventDefault(); const now = Date.now();
      if (now - lastWheel < 900) return; lastWheel = now;
      if (e.deltaY > 0) forward(); else back();
    }, { passive: false });
    host.addEventListener("touchstart", e => { initialTouch = e.touches[0]?.clientY ?? null; }, { passive: true });
    host.addEventListener("touchend", e => {
      if (initialTouch === null || displayed("#c-detail") || displayed("#c-work")) return;
      const delta = initialTouch - (e.changedTouches[0]?.clientY ?? initialTouch);
      initialTouch = null;
      if (Math.abs(delta) > 85) { if (delta > 0) forward(); else back(); }
    }, { passive: true });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      host.addEventListener("pointermove", e => {
        host.style.setProperty("--shift-x", ((e.clientX / innerWidth - .5) * -1.3) + "%");
        host.style.setProperty("--shift-y", ((e.clientY / innerHeight - .5) * -1.1) + "%");
      }, { passive: true });
    }
    step(0);
  })();