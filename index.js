// === Constants ===
const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2507-FTB-ET-WEB-FT-Twinkle"; // Make sure to change this!
const RESOURCE = "/players";
const API = BASE + COHORT + RESOURCE;

// === State ===
let puppies = [];
let selectedPuppy;

/** Updates state with all puppies from the API */

async function getPuppies() {
  try {
    const response = await fetch(API);
    const result = await response.json();
   
    puppies = result.data.players;
    render();
  } catch (e) {
    console.log("Failed to fetch puppies:", e);
  }
}

/** Updates state with single puppy from the API */

async function getPuppy(id) {
  try {
    const response = await fetch(`${API}/${id}`);
    const result = await response.json();
    selectedPuppy = result.data.player;
    render();
  } catch (e) {
    console.error("Failed to fetch puppy:", e);
  }
}
//  Add a new puppy to the API

async function addPuppy(newPuppy) {
  try {
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPuppy),
    });
    if (!response.ok) throw new Error("Failed to add puppy");

    await getPuppies();
  } catch (e) {
    console.error("Error adding puppy", e);
  }
}

// Deletes the puppy with the given ID via the API

async function removePuppy(id) {
  try {
    const response = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to remove puppy");

    selectedPuppy = null;
    await getPuppies();
  } catch (e) {
    console.error("Error removing puppy", e);
  }
}

// === Components ===

// Puppy name that shows more details about the puppy when clicked

function PuppyListItem(puppy) {
  const $li = document.createElement("li");
  $li.innerHTML = `<a href = "#selected">${puppy.name}</a>`;
  $li.addEventListener("click", () => getPuppy(puppy.id));
  return $li;
}

// ** A list of names of all puppies *

function PuppyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("puppy-list");

  const $puppies = puppies.map(PuppyListItem);
  $ul.replaceChildren(...$puppies);

  return $ul;
}

/** Detailed information about the selected puppy */
function PuppyDetails() {
  if (!selectedPuppy) {
    const $p = document.createElement("p");
    $p.textContent = "Please select an puppy to learn more about puppy";
    return $p;
  }
  const $puppy = document.createElement("section");
  $puppy.classList.add("puppy");
  $puppy.innerHTML = `
  <figure> 
    <img alt = "${selectedPuppy.name}" src ="${selectedPuppy.imageUrl}"/>
  </figure>
  <h3> <b>Name: </b>${selectedPuppy.name}  </h3>
  <h3> <b>ID: </b> #${selectedPuppy.id}  </h3>
  <h3> <b>Breed: </b> #${selectedPuppy.breed}  </h3>
  <h3> <b>Team: </b> #${selectedPuppy.teamId ? selectedPuppy.teamId: "no teamId"}  </h3>
  <h3> <b>Status: </b> #${selectedPuppy.status}  </h3>
  <button> Remove from roster</button>
  `;

  const $button = $puppy.querySelector("button");
  $button.addEventListener("click", () => {
    removePuppy(selectedPuppy.id);
  });
  return $puppy;
}

/** Form to add a new puppy */

function NewPuppyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `

    <label>
      Name
      <input name="name" required />
    </label>
    <label>
       Breed
      <input name="breed" required />
    </label>
    <label>
       Status
      <input name="status" required />
    </label>
    <label>
       Image URL
      <input name="imageUrl" required />
    </label>
    <button> Invite puppy </button>
    `;

  $form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData($form);
    const newPuppy = {
      name: formData.get("name"),
      breed: formData.get("breed"),
      status: formData.get("status"),
      imageUrl: formData.get("imageUrl"),
    };

    await addPuppy(newPuppy);
    $form.reset();
  });
  const $wrapper = document.createElement("div");
  $wrapper.id = "puppy-form";
  $wrapper.appendChild($form);

  return $wrapper;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");

  $app.innerHTML = `
    <h1>Puppy Bowl</h1>
    <main> 
      <section id="puppy-list">
      <Roster></Roster>
      <h3>Invite a puppy</h3>
      <NewPuppyForm></NewPuppyForm>

      </section>
     
      <section id="puppy-form"></section>
      <section id="selected" >
        <h2>Puppy details</h2>
        <PuppyDetails></PuppyDetails>

      </section>
    </main>  
  `;

  $app.querySelector("Roster").replaceWith(PuppyList());
  $app.querySelector("PuppyDetails").appendChild(PuppyDetails());
  $app.querySelector("NewPuppyForm").replaceWith(NewPuppyForm());
}
  

async function init() {
  await getPuppies();
  render();
}
init();
