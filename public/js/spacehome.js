const routes = {
    home: `
      <div class="space-body">
        <div class="left-section">
          <h3>So, you want to travel to</h3>
          <h1 class="space">Space</h1>
          <p>
            Let’s face it; if you want to go to space, you might as well genuinely
            go to outer space and not hover kind of on the edge of it. Well, sit back and relax because we’ll give you a truly out-of-this world
            experience!
          </p>
        </div>
        <button class="explore-button">Explore</button>
      </div>
    `,
    destination: `
      <div class="space-container destination-container">
        <div class="left-section">
<h2 class="destination-title">
  <span class="step-number"></span> Pick your destination
</h2>

          <!-- FIX: The img tag was broken. It's now a single, valid tag. -->
          <img id="planet-img" class="planet-image" src="/assets/destination/image-moon.png" alt="Moon"/>
        </div>
        <div class="right-section">
          <ul class="destination-list">
            <!-- Note: The onclick calls are correct, but the function below needed fixing. -->
            <li><a href="#" id="tab-moon" onclick="showPlanet('moon'); return false;">Moon</a></li>
            <li><a href="#" id="tab-mars" onclick="showPlanet('mars'); return false;">Mars</a></li>
            <li><a href="#" id="tab-europa" onclick="showPlanet('europa'); return false;">Europa</a></li>
            <li><a href="#" id="tab-titan" onclick="showPlanet('titan'); return false;">Titan</a></li>
          </ul>
          <div class="planet-info">
            <h2 id="planet-name">Moon</h2>
            <p id="planet-desc">The Moon is Earth's only natural satellite. Experience the tranquility of the lunar surface.</p>
            <div class="stats">
              <div><strong>Avg. Distance:</strong> <span id="planet-distance">384,400 km</span></div>
              <div><strong>Est. Travel Time:</strong> <span id="planet-travel">3 days</span></div>
            </div>
          </div>
        </div>
      </div>
    `,
    crew: `
      <div class="space-container">
        <h3>Meet Your Crew</h3>
        <h1>Crew</h1>
        <!-- Crew bios, images, etc. -->
     <img  class="ansari-image" src="/assets/crew/image-anousheh-ansari.png" alt="Anousheh-ansari" />


      </div>
    `,
    technology: `
      <div class="space-container">
        <h1>Technology</h1>
        <p>Discover the tech that makes space travel possible.</p>
        <!-- Add images, diagrams, or descriptions -->
      </div>
    `,
};

const bgClasses = {
    home: 'home-bg',
    destination: 'destination-bg',
    crew: 'crew-bg',
    technology: 'technology-bg'
};

const planetData = {
    moon: {
        name: "Moon",
        image: "/assets/destination/image-moon.png",
        desc: "The Moon is Earth's only natural satellite. Experience the tranquility of the lunar surface.",
        distance: "384,400 km",
        travel: "3 days"
    },
    mars: {
        name: "Mars",
        image: "/assets/destination/image-mars.png",
        desc: "The red planet offers a stark landscape and the adventure of a lifetime.",
        distance: "225 mil. km",
        travel: "9 months"
    },
    europa: {
        name: "Europa",
        image: "/assets/destination/image-europa.png",
        desc: "Europa, the smallest of Jupiter’s four Galilean moons, is covered in ice.",
        distance: "628 mil. km",
        travel: "6 years"
    },
    titan: {
        name: "Titan",
        image: "/assets/destination/image-titan.png",
        desc: "Saturn’s largest moon, with lakes of liquid methane and a dense atmosphere.",
        distance: "1.6 bil. km",
        travel: "7 years"
    }
};

// --- Page Functions ---


/**
 * FIX: Changed function signature from showPlanet(e, key) to showPlanet(key).
 * The original inline onclick="showPlanet('moon')" only passes one argument.
 * The 'e.preventDefault()' was also removed as it was incorrect and redundant.
 */
function showPlanet(key) {
    const p = planetData[key];
    if (!p) return; // Exit if data for the key doesn't exist

    const planetImgElement = document.getElementById('planet-img');

    // Only attempt to update if the elements actually exist in the DOM right now
    if (planetImgElement) {
        planetImgElement.src = p.image;
        planetImgElement.alt = p.name;
    }

    const nameEl = document.getElementById('planet-name');
    if (nameEl) nameEl.textContent = p.name;

    const descEl = document.getElementById('planet-desc');
    if (descEl) descEl.textContent = p.desc;

    const distEl = document.getElementById('planet-distance');
    if (distEl) distEl.textContent = p.distance;

    const travelEl = document.getElementById('planet-travel');
    if (travelEl) travelEl.textContent = p.travel;

    // Highlight the active tab
    ['moon', 'mars', 'europa', 'titan'].forEach(planet => {
        const tabEl = document.getElementById('tab-' + planet);
        if (tabEl) tabEl.classList.remove('active');
    });

    const activeTab = document.getElementById('tab-' + key);
    if (activeTab) activeTab.classList.add('active');
}

/**
 * FIX: Modified to initialize the destination page content when loaded.
 * This prevents errors when trying to run showPlanet() on other pages.
 */
function loadRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const app = document.getElementById('app');

    if (!app) return;

    // Load the correct content into the main element
    app.innerHTML = routes[hash] || routes.home;

    // Update the body's background class
    document.body.className = "space-body"; // Reset class first
    document.body.classList.add(bgClasses[hash] || bgClasses.home);

    // If the destination page is loaded, initialize it with the default planet (Moon)
    if (hash === 'destination') {
        // Use setTimeout to ensure DOM is updated before trying to select elements
        setTimeout(() => {
            showPlanet('moon');
        }, 0);
    }
}

// --- Event Listeners ---

// FIX: Removed the redundant window.onload which would cause errors.
// The logic is now correctly handled inside loadRoute.
window.addEventListener('hashchange', loadRoute);
window.addEventListener('DOMContentLoaded', loadRoute);
