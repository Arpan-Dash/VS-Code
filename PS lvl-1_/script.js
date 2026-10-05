const ACT_NUMBER = "Act 4";
const NEXT_ACT_DATE = "2026-10-13T13:00:00";
const RUPEES_PER_VP = 0.80;
const API_URL = "https://valorant-api.com/v1";

let allAgents = [];
let allSkins = [];


const popularWeapons = [
  "Classic", "Ghost", "Sheriff", "Spectre", "Judge",
  "Bulldog", "Phantom", "Vandal", "Operator", "Odin"
];
const popularSkinKeywords = [
  "prime", "reaver", "ion", "oni", "glitchpop", "rgx",
  "elderflame", "sovereign", "magepunk", "ruination", "forsaken",
  "champions", "kuronami", "araxys", "neo frontier", "singularity",
  "gaia", "prelude", "origin"
];



document.getElementById("actNumber").textContent = ACT_NUMBER;

function updateCountdown() {
  const nextAct = new Date(NEXT_ACT_DATE).getTime();
  const currentTime = new Date().getTime();

  const difference = nextAct - currentTime;

  if (difference <= 0) {
    document.getElementById("days").textContent = "00";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    return;
  }

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (difference / 1000) % 60
  );

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
}

updateCountdown();
setInterval(updateCountdown, 1000);


async function getData(endpoint) {
  const response = await fetch(API_URL + endpoint);

  if (!response.ok) {
    throw new Error("Could not load data");
  }

  const result = await response.json();

  return result.data;
}

async function loadAgents() {
  const loadingText = document.getElementById("agentLoading");

  try {
    allAgents = await getData("/agents?isPlayableCharacter=true");

    allAgents.sort(function(firstAgent, secondAgent) {
      return firstAgent.displayName.localeCompare(
        secondAgent.displayName
      );
    });

    loadingText.style.display = "none";

    showAgents();
  } catch (error) {
    loadingText.textContent =
      "Agents could not be loaded. Please check your internet connection.";
  }
}


function showAgents() {
  const agentGrid = document.getElementById("agentGrid");
  const searchText = document
    .getElementById("agentSearch")
    .value
    .toLowerCase();

  const selectedRole = document.getElementById("agentRole").value;

  agentGrid.innerHTML = "";

  const filteredAgents = allAgents.filter(function(agent) {
    const matchesSearch =
      agent.displayName.toLowerCase().includes(searchText);

    const matchesRole =
      selectedRole === "all" ||
      agent.role.displayName === selectedRole;

    return matchesSearch && matchesRole;
  });

  filteredAgents.forEach(function(agent) {
    const card = document.createElement("div");
    card.className = "agent-card";

    card.innerHTML = `
      <img
        class="agent-card-image"
        src="${agent.fullPortrait}"
        alt="${agent.displayName}"
      />

      <div class="agent-card-overlay">
        <span class="agent-role">
          ${agent.role ? agent.role.displayName : "Agent"}
        </span>

        <h3>${agent.displayName}</h3>      
      </div>
    `;

    card.addEventListener("click", function() {
      openAgentDetails(agent);
    });

    agentGrid.appendChild(card);
  });
}


document
  .getElementById("agentSearch")
  .addEventListener("input", showAgents);

document
  .getElementById("agentRole")
  .addEventListener("change", showAgents);


function openAgentDetails(agent) {
  const modal = document.getElementById("agentModal");
  const details = document.getElementById("agentDetails");

  const abilitiesHTML = agent.abilities.map(function(ability) {
    return `
      <div class="ability">
        <strong>${ability.displayName}</strong>
      </div>
    `;
  }).join("");

  details.innerHTML = `
    <p>
      <b>Role:</b>
      ${agent.role ? agent.role.displayName : "Not available"}
    </p>

    <h3>Abilities</h3>

    ${abilitiesHTML}
  `;

  modal.classList.remove("hidden");
}

document
  .getElementById("closeModal")
  .addEventListener("click", function() {
    document
      .getElementById("agentModal")
      .classList.add("hidden");
  });

document
  .getElementById("agentModal")
  .addEventListener("click", function(event) {
    if (event.target.id === "agentModal") {
      document
        .getElementById("agentModal")
        .classList.add("hidden");
    }
  });



async function loadSkins() {
  const loadingText = document.getElementById("skinLoading");

  try {
    const weapons = await getData("/weapons");

    allSkins = [];

    weapons.forEach(function(weapon) {
      if (!popularWeapons.includes(weapon.displayName)) {
        return;
      }

      weapon.skins.forEach(function(skin) {
        if (
          skin.displayName &&
          skin.displayIcon &&
          !skin.displayName.toLowerCase().includes("standard")
        ) {
          const skinTier = getSkinTier(skin.displayName);
          const vpPrice = getSkinPrice(skinTier);

          allSkins.push({
            name: skin.displayName,
            weapon: weapon.displayName,
            image: skin.displayIcon,
            tier: skinTier,
            vp: vpPrice,
            rupees: Math.round(vpPrice * RUPEES_PER_VP)
          });
        }
      });
    });

    allSkins.sort(function(firstSkin, secondSkin) {
      return getSkinPopularity(secondSkin) - getSkinPopularity(firstSkin);
    });

    allSkins = allSkins.slice(0, 150);

    loadingText.style.display = "none";

    showSkins();
  } catch (error) {
    loadingText.textContent =
      "Skins could not be loaded. Please check your internet connection.";
  }
}

function getSkinPopularity(skin) {
  const skinName = skin.name.toLowerCase();
  const keywordIndex = popularSkinKeywords.findIndex(function(keyword) {
    return skinName.includes(keyword);
  });

  return keywordIndex === -1
    ? 0
    : popularSkinKeywords.length - keywordIndex;
}


function getSkinTier(skinName) {
  const name = skinName.toLowerCase();

  if (
    name.includes("prime") ||
    name.includes("reaver") ||
    name.includes("ion") ||
    name.includes("glitchpop")
  ) {
    return "Premium";
  }

  if (
    name.includes("sakura") ||
    name.includes("rush") ||
    name.includes("silvanus")
  ) {
    return "Deluxe";
  }

  if (
    name.includes("champions") ||
    name.includes("elderflame") ||
    name.includes("arcane")
  ) {
    return "Ultra";
  }

  return "Select";
}

function getSkinPrice(tier) {
  if (tier === "Select") {
    return 875;
  }

  if (tier === "Deluxe") {
    return 1275;
  }

  if (tier === "Premium") {
    return 1775;
  }

  if (tier === "Ultra") {
    return 2475;
  }

  return 875;
}


function showSkins() {
  const skinGrid = document.getElementById("skinGrid");
  const searchText = document
    .getElementById("skinSearch")
    .value
    .toLowerCase();

  const sortType = document.getElementById("skinSort").value;

  let filteredSkins = allSkins.filter(function(skin) {
    return (
      skin.name.toLowerCase().includes(searchText) ||
      skin.weapon.toLowerCase().includes(searchText)
    );
  });

  if (sortType === "low") {
    filteredSkins.sort(function(firstSkin, secondSkin) {
      return firstSkin.vp - secondSkin.vp;
    });
  }

  if (sortType === "high") {
    filteredSkins.sort(function(firstSkin, secondSkin) {
      return secondSkin.vp - firstSkin.vp;
    });
  }

  if (sortType === "name") {
    filteredSkins.sort(function(firstSkin, secondSkin) {
      return firstSkin.name.localeCompare(secondSkin.name);
    });
  }

  skinGrid.innerHTML = "";

  filteredSkins.forEach(function(skin) {
    const card = document.createElement("div");
    card.className = "skin-card";

    card.innerHTML = `
      <img
        class="skin-card-image"
        src="${skin.image}"
        alt="${skin.name}"
      />

      <div class="skin-card-content">
        <h3>${skin.name}</h3>

        <p class="skin-weapon">
          ${skin.weapon} | ${skin.tier}
        </p>

        <div class="skin-price">
          <span class="vp-price">${skin.vp} VP</span>
          <span class="inr-price">₹${skin.rupees}</span>
        </div>
      </div>
    `;

    skinGrid.appendChild(card);
  });
}

document
  .getElementById("skinSearch")
  .addEventListener("input", showSkins);

document
  .getElementById("skinSort")
  .addEventListener("change", showSkins);

loadAgents();
loadSkins();
