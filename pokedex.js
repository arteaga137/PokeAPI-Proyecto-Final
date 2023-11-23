// Select the DOM elements where the Pokédex and filter will be displayed
const pokemonList = document.querySelector("#pokedex");
const typeFilter = document.querySelector('#typeFilter');

// Base URL for the Pokémon API
const baseUrl = "https://pokeapi.co/api/v2/pokemon/";

// Global variable to store Pokémon data
let pokemons = [];

/**
 * Asynchronously fetches Pokémon data from the API.
 * Iterates through the first 151 Pokémon and fetches their data, including species descriptions.
 */
async function fetchPokemonData() {
  for (let i = 1; i <= 151; i++) { // Loop through the first 151 Pokémon
    try {
      const url = baseUrl + i; // Build URL for each Pokémon
      const response = await fetch(url); // Fetch data from the API
      if (!response.ok) {
        throw new Error(`ERROR: ${response}`);
      } 
      const pokemonData = await response.json(); // Convert response to JSON

      // Fetch species data for descriptions
      const speciesResponse = await fetch(pokemonData.species.url);
      if (!speciesResponse.ok) {
        throw new Error('Failed to fetch Pokémon species data');
      } 

      const speciesData = await speciesResponse.json(); // Convert species response to JSON
console.log(speciesData) // ERASE LATER. Consolelog to check where the description is.
      // Find English description from Pokémon Red version
      const englishFlavorText = speciesData.flavor_text_entries.find(entry => 
        entry.language.name === 'en' && entry.version.name === 'red');
//         let description;
// if (englishFlavorText) {
//     description = englishFlavorText.flavor_text.replace(/(\f|\n|\r)/g, ' ');
// } else {
//     description = 'Description not available';
// }
      const description = englishFlavorText ? englishFlavorText.flavor_text.replace(/(\f|\n|\r)/g, ' ') : 'Description not available'; //The API descriptions contain the combination of characters that I'm replacing with spaces

      // Create Pokémon object with relevant data
      const pokemon = {
        name: pokemonData.name,
        image: pokemonData.sprites["front_default"],
        shiny: pokemonData.sprites["front_shiny"],
        type: pokemonData.types.map((type) => type.type.name).join(", "),
        number: pokemonData.id,
        description: description,
      };

      pokemons.push(pokemon); // Add Pokémon object to global array
    } catch (error) {
      console.error("Error fetching the data", error); // Log any fetch errors
    }
  }
}

/**
 * Renders Pokémon data to the DOM.
 * Takes an array of Pokémon objects and creates HTML elements to display their data.
 * @param {Array} pokemons - An array of Pokémon objects.
 */
function displayPokemons(pokemons) {
  const pokemonHTMLString = pokemons.map((pokemon) => `
    <li class='card'>
      <div class='pokemon-number'>${pokemon.number}</div>
      <img class='card-image' src=${pokemon.image} alt=${pokemon.name} id="image-${pokemon.number}">
      <h2 class='card-title'>${pokemon.name}</h2>
      <p class='card-subtitle'>
        ${pokemon.type.split(', ').map(type => `<span class='type-bubble type-${type.toLowerCase()}'>${type}</span>`).join('')}
      </p>
      <p class='pokemon-description'>${pokemon.description}</p>
      <button class='show-shiny' data-number='${pokemon.number}'>Show Shiny</button>
    </li>
  `).join(""); // Create HTML string for each Pokémon and join them

  pokemonList.innerHTML = pokemonHTMLString; // Set inner HTML of Pokémon list
  addEventListenersToButtons(); // Add event listeners to the new buttons
}

/**
 * Adds event listeners to 'Show Shiny' buttons.
 * Each button toggles the image of its respective Pokémon between standard and shiny.
 */
function addEventListenersToButtons() {
  const buttons = document.querySelectorAll('.show-shiny'); // Select all 'Show Shiny' buttons
  buttons.forEach(button => {
    button.addEventListener('click', (event) => {
      const number = event.target.getAttribute('data-number'); // Get Pokémon number from button
      showShiny(number); // Toggle Pokémon image
    });
  });
}

/**
 * Switches the image of a Pokémon between its standard and shiny versions.
 * @param {number} number - The Pokémon's number (ID).
 */
function showShiny(number) {
  const imageElement = document.getElementById(`image-${number}`); // Select image element by ID
  const currentSrc = imageElement.src; // Get current image source
  const isShiny = currentSrc.includes('shiny'); // Check if current image is shiny
  const pokemon = pokemons.find(p => p.number == number); // Find Pokémon object by number

//   if (isShiny) {
//     imageElement.src = pokemon.image; // Change to standard version
//   } else {
//     imageElement.src = pokemon.shiny; // Change to shiny version
//   }

imageElement.src = isShiny ? pokemon.image : pokemon.shiny; // Changed the code block to terniary.
}

// _________________________________Filters and Search_________________________________________________________________

/**
 * Event listener for the type filter dropdown.
 * Filters the displayed Pokémon based on the selected type.
 */
typeFilter.addEventListener('change', function() {
  const selectedType = this.value; // Get selected type value
  displayFilteredPokemons(selectedType); // Display filtered Pokémon list
});

/**
 * Filters and displays Pokémon based on their type.
 * @param {string} type - The selected type to filter Pokémon by.
 */
function displayFilteredPokemons(type) {
  const filteredPokemons = pokemons.filter(pokemon => 
    type === '' || pokemon.type.includes(type)); // Filter Pokémon by type
  displayPokemons(filteredPokemons); // Display the filtered list
}

/**
 * Filters and displays Pokémon based on a search query.
 * @param {string} searchQuery - The search input from the user.
 */
function searchPokemon(searchQuery) {
  const filteredPokemons = pokemons.filter(pokemon => 
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pokemon.number.toString() === searchQuery); // Filter by name or number
  displayPokemons(filteredPokemons); // Display filtered Pokémon
}

// Event listener for search box input
document.querySelector('#searchBox').addEventListener('input', (event) => {
  searchPokemon(event.target.value); // Call search function on input change
});

/**
 * Main function to initiate the script.
 * Fetches Pokémon data and displays it on the webpage.
 */
async function mainFunction() {
  await fetchPokemonData(); // Fetch Pokémon data
  displayPokemons(pokemons); // Display Pokémon on webpage
}

mainFunction(); // Execute the main function