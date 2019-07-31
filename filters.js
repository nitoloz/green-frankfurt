const FilterType = {
    TREE_SPECIES: 1,
    CITY_DISTRICTS: 2
};
let filterType = FilterType.TREE_SPECIES;
let internalMap, numberOfSelectedTrees, selectDropdown

const treeSpecies = ['Ahorn', 'Birke', 'Buche', 'Eiche', 'Erle', 'Esche', 'Espe', 'Hainbuche', 'Hasel', 'Kastanie', 'Kiefer',
    'Kirsche', 'Linde', 'Magnolie', 'Platane', 'Robinie', 'Pappel', 'Ulme', 'Walnuss', 'Weide'];

const cityDistricts = ['Altstadt', 'Bahnhofsviertel', 'Bergen-Enkheim', 'Berkersheim', 'Bockenheim', 'Bonames', 'Bornheim',
    'Dornbusch', 'Eckenheim', 'Eschersheim', 'Fechenheim', 'Frankfurter Berg', 'Gallus', 'Ginnheim', 'Griesheim',
    'Gutleutviertel', 'Harheim', 'Hausen', 'Heddernheim', 'Höchst', 'Innenstadt', 'Kalbach-Riedberg', 'Nied', 'Nieder-Erlenbach',
    'Nieder-Eschbach', 'Niederrad', 'Niederursel', 'Nordend-Ost', 'Nordend-West', 'Oberrad', 'Ostend', 'Praunheim', 'Preungesheim',
    'Riederwald', 'Rödelheim', 'Sachsenhausen-N.', 'Sachsenhausen-S.', 'Schwanheim', 'Seckbach', 'Sindlingen', 'Sossenheim',
    'Unterliederbach', 'Westend-Nord', 'Westend-Süd', 'Zeilsheim'];

let selectedTreeSpecies = [];
let availableTreeSpecies = [];
let selectedCityDistrict;

function initializeSelectize(data) {
    internalMap = new Map();
    data.forEach(d => {
        internalMap[d.germanName]
            ? internalMap[d.germanName].count++
            : internalMap[d.germanName] = {count: 1, latinName: d.latinName, germanName: d.germanName};
    });
    availableTreeSpecies = Object.keys(internalMap);
    const values = availableTreeSpecies.map((key) => {
        return {
            value: key,
            count: internalMap[key].count,
            latinName: internalMap[key].latinName,
            germanName: internalMap[key].germanName
        };
    }).sort((a, b) => b.count - a.count);
    selectDropdown[0].selectize.addOption(values);
}

function appendMultiSelect(values) {
    selectDropdown = $('select').selectize({
        theme: 'links',
        plugins: ['remove_button', 'restore_on_backspace'],
        maxItems: null,
        valueField: 'value',
        searchField: 'value',
        options: values,
        render: {
            option: function (data, escape) {
                return `<div class="option">
                                <span class="title">${escape(data.germanName)}</span>
                                <span class="url"> (${escape(data.count)})</span>
                                <div class="url">${escape(data.latinName)}</div>
                            </div>`;
            },
            item: function (data, escape) {
                return `<div>${escape(data.germanName)} (${escape(data.count)})</div>`;
            }
        },
        onItemAdd: function (value, $item) {
            numberOfSelectedTrees = this.items.map(item => internalMap[item].count).reduce((a, b) => a + b);
            document.getElementById('show-selected').innerHTML = `Show ${numberOfSelectedTrees} trees!`;
        },
        onItemRemove: function (value, $item) {
            const countsArray = this.items.map(item => internalMap[item].count);
            numberOfSelectedTrees = countsArray.length > 0 ? countsArray.reduce((a, b) => a + b) : 0;
            document.getElementById('show-selected').innerHTML = `Show ${numberOfSelectedTrees} trees!`;
        }
    });
}

function changeFilters() {
    const treeSpeciesButton = document.getElementById("tree-species");
    const cityDistrictsButton = document.getElementById("city-districts");
    const speciesBadges = document.getElementById("species-badges");
    const districtBadges = document.getElementById("district-badges");
    const selectElement = document.getElementById("select");

    if (filterType === FilterType.TREE_SPECIES) {
        filterType = FilterType.CITY_DISTRICTS;
        treeSpeciesButton.className = treeSpeciesButton.className.replace(/\bactive\b/g, "");
        cityDistrictsButton.className += ' active';
        districtBadges.className = districtBadges.className.replace(/\bhidden\b/g, "");
        speciesBadges.className += ' hidden';
        selectElement.className += ' hidden';
    } else {
        filterType = FilterType.TREE_SPECIES;
        cityDistrictsButton.className = cityDistrictsButton.className.replace(/\bactive\b/g, "");
        treeSpeciesButton.className += ' active';
        speciesBadges.className = speciesBadges.className.replace(/\bhidden\b/g, "");
        districtBadges.className += ' hidden';
        selectElement.className = selectElement.className.replace(/\bhidden\b/g, "");
    }
}

function addTreeSpeciesBadges() {
    treeSpecies.forEach(species => {
        let filterSpan = document.createElement("span");
        filterSpan.className = 'badge badge-secondary filter-badge flex-grow-1';
        filterSpan.innerHTML = `${species}`;
        filterSpan.onclick = function () {
            const index = selectedTreeSpecies.indexOf(this.innerText);
            if (index === -1) {
                selectedTreeSpecies.push(this.innerText);
                this.className = this.className.replace('secondary', 'primary');
            } else {
                selectedTreeSpecies.splice(index, 1);
                this.className = this.className.replace('primary', 'secondary');
            }
            selectDropdown[0].selectize.setValue(availableTreeSpecies.filter(species => {
                return selectedTreeSpecies.some(selectedSpecies => species.indexOf(selectedSpecies) !== -1);
            }));
        };

        document.getElementById("species-badges").appendChild(filterSpan);
    })
}

function addCityDistrictsBadges() {
    cityDistricts.forEach(disctrict => {
        let filterSpan = document.createElement("span");
        filterSpan.className = 'badge badge-secondary filter-badge flex-grow-1';
        filterSpan.innerHTML = `${disctrict}`;
        filterSpan.onclick = function () {
            selectedCityDistrict = this.innerText;
            const filteredData = getFilteredData();
            numberOfSelectedTrees = filteredData.length;
            showFilteredDataPoints(filteredData);
            Array.from(document.getElementsByClassName("badge")).forEach(element => element.className = element.className.replace('primary', 'secondary'));
            this.className = this.className.replace('secondary', 'primary');
        };

        document.getElementById("district-badges").appendChild(filterSpan);
    })
}
