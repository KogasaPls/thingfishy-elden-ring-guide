(function () {
  "use strict";

  /* ==========================================================
     Lightbox: click any screenshot to view it enlarged.
     ========================================================== */
  function initLightbox() {
    var overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = '<img alt="">';
    document.body.appendChild(overlay);
    var lbImg = overlay.querySelector("img");

    function open(img) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-lock");
    }
    function close() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-lock");
    }

    document.querySelectorAll("figure img").forEach(function (img) {
      img.addEventListener("click", function () {
        open(img);
      });
    });
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ==========================================================
     Progress tracker
     ==========================================================
     Cumulative loot totals at each of the guide's 20 numbered
     legs, in document order.

     "somber" is the set of Somber Smithing Stone tiers picked up
     by the end of that leg (each tier appears exactly once on
     this route, straight from the guide's prose).

     "standard" is a per-tier running count of standard Smithing
     Stones. The video calls out specific tiers for most pickups
     (e.g. "Smithing Stone [5]") but leaves some "grab some
     Smithing Stones" moments unquantified. Where a tier is stated,
     or is unambiguous from surrounding context (e.g. a same-area
     continuation of an explicitly-tiered pickup, or the "four
     remaining Smithing Stone [3]s" line implying 8 were already in
     hand), it's counted directly. Fully unspecified mentions (the
     merchant buyout, a few standalone "grab more stones" moments)
     are given a conservative regional estimate. Tiers 6-8 never
     get any such anchor anywhere in the route: Twin Maiden Husks
     only sell a tier once its Bell Bearing is turned in (Bearing
     [1] unlocks 1-2, [2] unlocks 3-4, [3] unlocks 5-6, [4] unlocks
     7-8), and this route only finds Bearing [1], yet still buys
     tiers 3-4 at the Roundtable, implying Bearing [2] came from
     outside this route. There's no equivalent explanation for
     tier 6, so the affordability calculation below honestly falls
     a couple of levels short of the +16 the video claims, rather
     than inventing a source for the gap.
     ========================================================== */
  var PROGRESS = [
    { seeds: 0,  tears: 0, somber: [],                somberN: 0, standard: {1: 1,  2: 0,  3: 0,  4: 0,  5: 0} },   // 1. Limgrave: Church of Elleh & Gatefront
    { seeds: 0,  tears: 0, somber: [1],               somberN: 1, standard: {1: 9,  2: 0,  3: 0,  4: 0,  5: 0} },   // 2. South to Weeping Peninsula
    { seeds: 1,  tears: 1, somber: [1,2],             somberN: 2, standard: {1: 9,  2: 0,  3: 0,  4: 0,  5: 0} },   // 3. Castle Morne Rampart & the coast
    { seeds: 1,  tears: 3, somber: [1,2],             somberN: 2, standard: {1: 9,  2: 0,  3: 0,  4: 0,  5: 0} },   // 4. The three remaining Weeping Peninsula churches
    { seeds: 2,  tears: 3, somber: [1,2],             somberN: 2, standard: {1: 9,  2: 0,  3: 0,  4: 0,  5: 0} },   // 5. Back to Limgrave: Warmaster's Shack & the Golden Vow
    { seeds: 2,  tears: 4, somber: [1,2],             somberN: 2, standard: {1: 12, 2: 0,  3: 0,  4: 0,  5: 0} },   // 6. Saints Bridge to the Third Church of Marika
    { seeds: 3,  tears: 4, somber: [1,2],             somberN: 2, standard: {1: 12, 2: 0,  3: 0,  4: 0,  5: 0} },   // 7. Fort Haight & the Dectus Medallion (left half)
    { seeds: 4,  tears: 5, somber: [1,2],             somberN: 2, standard: {1: 12, 2: 0,  3: 0,  4: 0,  5: 0} },   // 8. Dragonbarrow: Lenne's Rise & Fort Faroth
    { seeds: 4,  tears: 5, somber: [1,2,8,9],         somberN: 4, standard: {1: 12, 2: 0,  3: 0,  4: 0,  5: 0} },   // 9. The Divine Tower of Caelid
    { seeds: 4,  tears: 6, somber: [1,2,8,9],         somberN: 4, standard: {1: 12, 2: 8,  3: 0,  4: 0,  5: 0} },   // 10. Back to Stormhill and down into Liurnia
    { seeds: 5,  tears: 6, somber: [1,2,8,9],         somberN: 4, standard: {1: 12, 2: 12, 3: 0,  4: 0,  5: 0} },   // 11. Liurnia ruins to Raya Lucaria Academy
    { seeds: 5,  tears: 6, somber: [1,2,8,9],         somberN: 4, standard: {1: 12, 2: 12, 3: 0,  4: 0,  5: 0} },   // 12. Through Raya Lucaria to the Abductor Virgin shortcut
    { seeds: 5,  tears: 6, somber: [1,2,5,6,8,9],     somberN: 6, standard: {1: 12, 2: 12, 3: 2,  4: 0,  5: 0} },   // 13. Volcano Manor: Somber Smithing Stones
    { seeds: 5,  tears: 6, somber: [1,2,4,5,6,8,9],   somberN: 7, standard: {1: 12, 2: 12, 3: 2,  4: 0,  5: 8} },   // 14. The Academy Crystal Cave
    { seeds: 5,  tears: 7, somber: [1,2,3,4,5,6,8,9], somberN: 8, standard: {1: 12, 2: 12, 3: 2,  4: 0,  5: 8} },   // 15. Wrapping up Liurnia
    { seeds: 9,  tears: 7, somber: [1,2,3,4,5,6,8,9], somberN: 8, standard: {1: 12, 2: 12, 3: 2,  4: 0,  5: 8} },   // 16. Altus Plateau
    { seeds: 9,  tears: 7, somber: [1,2,3,4,5,6,8,9], somberN: 8, standard: {1: 12, 2: 12, 3: 2,  4: 0,  5: 11} },  // 17. The Sealed Tunnel
    { seeds: 10, tears: 7, somber: [1,2,3,4,5,6,8,9], somberN: 8, standard: {1: 12, 2: 12, 3: 12, 4: 12, 5: 11} },  // 18. Liurnia mop-up
    { seeds: 10, tears: 7, somber: [1,2,3,4,5,6,8,9], somberN: 8, standard: {1: 12, 2: 12, 3: 12, 4: 12, 5: 11} },  // 19. Night's Cavalry at Lenne's Rise
    { seeds: 10, tears: 7, somber: [1,2,3,4,5,6,8,9], somberN: 8, standard: {1: 12, 2: 12, 3: 12, 4: 12, 5: 11} }   // 20. Elder Dragon Greyoll at Fort Faroth
  ];
  var ZERO = { seeds: 0, tears: 0, somber: [], somberN: 0, standard: {} };
  var SOMBER_TIERS = [1,2,3,4,5,6,7,8,9];
  var STANDARD_TIERS = [1,2,3,4,5,6,7,8];

  // Standard weapon reinforcement: 3 levels per tier, costing 2/4/6 of
  // that tier's stone; +25 needs an Ancient Dragon Smithing Stone
  // instead (out of scope for this route, so not modeled here).
  var STANDARD_COST = [];
  for (var lvl = 1; lvl <= 24; lvl++) {
    STANDARD_COST.push({ level: lvl, tier: Math.ceil(lvl / 3), qty: [2, 4, 6][(lvl - 1) % 3] });
  }
  // Somber weapon reinforcement: 1 stone per tier, tier N unlocks +N.
  var SOMBER_COST = SOMBER_TIERS.map(function (t) { return { level: t, tier: t, qty: 1 }; });

  function affordableLevel(counts, costTable) {
    var remaining = {};
    Object.keys(counts).forEach(function (t) { remaining[t] = counts[t]; });
    var best = 0;
    for (var i = 0; i < costTable.length; i++) {
      var step = costTable[i];
      var have = remaining[step.tier] || 0;
      if (have >= step.qty) {
        remaining[step.tier] = have - step.qty;
        best = step.level;
      } else {
        break;
      }
    }
    return best;
  }

  function costTableRows(tiers, costTable) {
    return tiers.map(function (t) {
      var steps = costTable.filter(function (s) { return s.tier === t; });
      var costStr = steps.map(function (s) { return s.qty + "&rarr;+" + s.level; }).join(", ");
      return (
        '<div class="cost-row' + (t === 7 ? " cost-row-skip" : "") + '">' +
          '<span class="cost-tier">[' + t + "]</span>" +
          '<span class="cost-have" data-cost-have="' + t + '">0</span>' +
          '<span class="cost-need">' + costStr + "</span>" +
        "</div>"
      );
    }).join("");
  }

  function initTracker() {
    var headings = Array.prototype.slice.call(document.querySelectorAll("h3[id]"));
    if (headings.length !== PROGRESS.length) return; // guide structure changed; don't show stale data

    var toggle = document.createElement("button");
    toggle.className = "tracker-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "tracker-panel");
    toggle.textContent = "Progress";

    var panel = document.createElement("div");
    panel.className = "tracker-panel";
    panel.id = "tracker-panel";
    panel.hidden = true;
    panel.innerHTML =
      '<div class="tracker-head">' +
        '<span>Loot so far</span>' +
        '<button type="button" class="tracker-close" aria-label="Close progress tracker">&times;</button>' +
      "</div>" +
      '<div class="tracker-row"><span class="tracker-label">Golden Seeds</span><span class="tracker-num" data-k="seeds">0</span></div>' +
      '<div class="tracker-row"><span class="tracker-label">Sacred Tears</span><span class="tracker-num" data-k="tears">0</span></div>' +

      '<div class="tracker-group tracker-group-somber">' +
        '<div class="tracker-group-head">' +
          '<span class="tracker-label">Somber weapon <span class="tracker-afford" data-k="somberAfford">+0</span></span>' +
          '<span class="info" tabindex="0">' +
            '<button type="button" class="info-icon" aria-label="Somber Smithing Stone costs">?</button>' +
            '<div class="info-pop">' +
              '<div class="cost-head"><span>Tier</span><span>Have</span><span>Unlocks</span></div>' +
              costTableRows(SOMBER_TIERS, SOMBER_COST) +
              '<div class="cost-note">Somber Smithing Stone [7] never turns up on this route, so tiers [8]/[9] sit unused until you backfill it.</div>' +
            "</div>" +
          "</span>" +
        "</div>" +
        '<div class="tracker-chips">' +
          SOMBER_TIERS.map(function (t) {
            return '<span class="chip' + (t === 7 ? " chip-skip" : "") + '" data-tier="' + t + '">' + t + "</span>";
          }).join("") +
        "</div>" +
      "</div>" +

      '<div class="tracker-group tracker-group-standard">' +
        '<div class="tracker-group-head">' +
          '<span class="tracker-label">Standard weapon <span class="tracker-afford" data-k="standardAfford">+0</span></span>' +
          '<span class="info" tabindex="0">' +
            '<button type="button" class="info-icon" aria-label="Standard Smithing Stone costs">?</button>' +
            '<div class="info-pop">' +
              '<div class="cost-head"><span>Tier</span><span>Have</span><span>Unlocks</span></div>' +
              costTableRows(STANDARD_TIERS, STANDARD_COST) +
              '<div class="cost-note">The Twin Maiden Husks only sell a tier once you\'ve handed in its Bell Bearing: [1] unlocks tiers 1-2, [2] unlocks 3-4, [3] unlocks 5-6, [4] unlocks 7-8. This route only finds Bearing [1] (in the Sealed Tunnel), yet still buys tiers 3-4 at the Roundtable, so Bearing [2] must already be in hand from outside this route. Tiers 6-8 have no such explanation anywhere in the video, so this tracker can\'t verify the last couple of levels needed for the claimed +16, rather than guess. +25 needs a separate Ancient Dragon Smithing Stone either way, not tracked here.</div>' +
            "</div>" +
          "</span>" +
        "</div>" +
        '<div class="tracker-chips">' +
          STANDARD_TIERS.map(function (t) {
            return '<span class="chip chip-wide" data-tier="' + t + '"><span class="chip-tier">' + t + '</span><span class="chip-count" data-count="' + t + '">0</span></span>';
          }).join("") +
        "</div>" +
      "</div>" +

      '<div class="tracker-section">At: <span data-k="section">start of guide</span></div>';

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    var numEls = {
      seeds: panel.querySelector('[data-k="seeds"]'),
      tears: panel.querySelector('[data-k="tears"]'),
      section: panel.querySelector('[data-k="section"]'),
      somberAfford: panel.querySelector('[data-k="somberAfford"]'),
      standardAfford: panel.querySelector('[data-k="standardAfford"]')
    };
    var somberChips = panel.querySelectorAll(".tracker-group-somber .chip");
    var standardChips = panel.querySelectorAll(".chip-wide");
    var standardCountEls = panel.querySelectorAll("[data-count]");
    var somberHaveEls = panel.querySelectorAll(".tracker-group-somber [data-cost-have]");
    var standardHaveEls = panel.querySelectorAll(".tracker-group-standard [data-cost-have]");

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.classList.toggle("is-open", open);
      try { localStorage.setItem("erGuideTrackerOpen", open ? "1" : "0"); } catch (e) {}
    }
    toggle.addEventListener("click", function () { setOpen(panel.hidden); });
    panel.querySelector(".tracker-close").addEventListener("click", function () { setOpen(false); });

    var initiallyOpen = false;
    try { initiallyOpen = localStorage.getItem("erGuideTrackerOpen") === "1"; } catch (e) {}
    setOpen(initiallyOpen);

    function render() {
      var currentIndex = -1;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= 140) currentIndex = i;
        else break;
      }
      var snap = currentIndex === -1 ? ZERO : PROGRESS[currentIndex];

      numEls.seeds.textContent = snap.seeds;
      numEls.tears.textContent = snap.tears;
      numEls.section.textContent = currentIndex === -1 ? "start of guide" : headings[currentIndex].textContent;

      somberChips.forEach(function (chip) {
        var tier = Number(chip.getAttribute("data-tier"));
        chip.classList.toggle("chip-got", snap.somber.indexOf(tier) !== -1);
      });
      var somberCounts = {};
      SOMBER_TIERS.forEach(function (t) { somberCounts[t] = snap.somber.indexOf(t) !== -1 ? 1 : 0; });
      numEls.somberAfford.textContent = "+" + affordableLevel(somberCounts, SOMBER_COST);
      somberHaveEls.forEach(function (el) {
        var tier = Number(el.getAttribute("data-cost-have"));
        el.textContent = somberCounts[tier] || 0;
      });

      var standardCounts = snap.standard || {};
      standardChips.forEach(function (chip) {
        var tier = Number(chip.getAttribute("data-tier"));
        var count = standardCounts[tier] || 0;
        chip.classList.toggle("chip-got", count > 0);
      });
      standardCountEls.forEach(function (el) {
        var tier = Number(el.getAttribute("data-count"));
        el.textContent = standardCounts[tier] || 0;
      });
      standardHaveEls.forEach(function (el) {
        var tier = Number(el.getAttribute("data-cost-have"));
        el.textContent = standardCounts[tier] || 0;
      });
      numEls.standardAfford.textContent = "+" + affordableLevel(standardCounts, STANDARD_COST);
    }

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { render(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", render);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLightbox();
    initTracker();
  });
})();
