let pokemonData = [];
let favorites = [];

// Get the header element
let header = document.querySelector('header');

let collectionSortOrder = 1;
let favoritesSortOrder = 1;

// Function to sort the Pokemon in alphabetical order
function sortPokemon(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

// Create the sort button for the collection
let sortCollectionButton = document.createElement('button');
sortCollectionButton.innerText = 'Sort Collection';
sortCollectionButton.addEventListener('click', () => {
    pokemonData.sort((a, b) => sortPokemon(a, b) * collectionSortOrder);
    collectionSortOrder *= -1;
    displayPokemon();
});

// Append the sort button to the header
header.appendChild(sortCollectionButton);

// Create the sort button for the favorites
let sortFavoritesButton = document.createElement('button');
sortFavoritesButton.innerText = 'Sort Favorites';
sortFavoritesButton.addEventListener('click', () => {
    favorites.sort((a, b) => sortPokemon(a, b) * favoritesSortOrder);
    favoritesSortOrder *= -1;
    displayFavorites();
});

// Append the sort button to the header
header.appendChild(sortFavoritesButton);

fetch('https://pokeapi.co/api/v2/pokemon?limit=30')
    .then(response => {
        console.log('Received response', response);
        return response.json();
    })
    .then(data => {
        console.log('Received data', data);
        // Fetch the details for each Pokemon
        const detailsPromises = data.results.map(pokemon => fetch(pokemon.url).then(response => response.json()));
        Promise.all(detailsPromises)
            .then(details => {
                console.log('Received details', details);
                pokemonData = details;
                displayPokemon();
            });
    });

// Modify the displayPokemon function to include the total attack
function displayPokemon() {
    pokemonData.sort((a, b) => sortPokemon(a, b) * collectionSortOrder);
    const totalAttack = pokemonData.reduce((sum, pokemon) => sum + pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat, 0);
    const collectionDiv = document.getElementById('pokemon-collection');
    collectionDiv.innerHTML = `<h2>Collection (Total Attack: ${totalAttack})</h2>` + pokemonData.map(pokemon => `
        <div class="pokemon-card" onclick="addToFavorites('${pokemon.name}')">
            <h3>${pokemon.name}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Attack: ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</p>
            <p>HP: ${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</p>
            <div class="additional-div"></div> <!-- Add this line -->
        </div>
    `).join('');
}

// Function to add a Pokemon to the favorites
function addToFavorites(name) {
    // Find the Pokemon with the given name
    const index = pokemonData.findIndex(pokemon => pokemon.name === name);
    if (index !== -1) {
        // Add the Pokemon to the favorites list and remove it from the collection
        favorites.push(pokemonData[index]);
        pokemonData.splice(index, 1);
        displayFavorites();
        displayPokemon();
    } else {
        console.error(`Could not find Pokemon with name ${name}`);
    }
}

// Function to remove a Pokemon from the favorites
function removeFromFavorites(name) {
    // Find the Pokemon with the given name
    const index = favorites.findIndex(pokemon => pokemon.name === name);
    if (index !== -1) {
        // Add the Pokemon back to the collection and remove it from the favorites
        pokemonData.push(favorites[index]);
        favorites.splice(index, 1);
        displayFavorites();
        displayPokemon();
    } else {
        console.error(`Could not find Pokemon with name ${name}`);
    }
}

// Modify the displayFavorites function to include the total attack
function displayFavorites() {
    favorites.sort((a, b) => sortPokemon(a, b) * favoritesSortOrder);
    const totalAttack = favorites.reduce((sum, pokemon) => sum + pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat, 0);
    const favoritesDiv = document.getElementById('favorites-list');
    favoritesDiv.innerHTML = `<h2>Favorites (Total Attack: ${totalAttack})</h2>` + favorites.map(pokemon => `
        <div class="pokemon-card" onclick="removeFromFavorites('${pokemon.name}')">
            <h3>${pokemon.name}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p>Attack: ${pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat}</p>
            <p>HP: ${pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat}</p>
        </div>
    `).join('');
}