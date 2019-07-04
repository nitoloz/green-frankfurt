let map, heatmap, selectDropdown, internalMap, numberOfSelectedTrees, cluster;
let processedData = [];
let view = 'heatmap';
const treeSpecies = ['Ahorn', 'Birke', 'Buche', 'Eiche', 'Erle', 'Esche', 'Espe', 'Hainbuche', 'Hasel', 'Kastanie', 'Kiefer',
    'Kirsche', 'Linde', 'Magnolie', 'Platane', 'Robinie', 'Pappel', 'Ulme', 'Walnuss', 'Weide'];

const cityDistricts = ['Altstadt', 'Bahnhofsviertel', 'Bergen-Enkheim', 'Berkersheim', 'Bockenheim', 'Bonames', 'Bornheim',
    'Dornbusch', 'Eckenheim', 'Eschersheim', 'Fechenheim', 'Flughafen', 'Frankfurter Berg', 'Gallus', 'Ginnheim', 'Griesheim',
    'Gutleutviertel', 'Harheim', 'Hausen', 'Heddernheim', 'Höchst', 'Innenstadt', 'Kalbach-Riedberg', 'Nied', 'Nieder-Erlenbach',
    'Nieder-Eschbach', 'Niederrad', 'Niederursel', 'Nordend-Ost', 'Nordend-West', 'Oberrad', 'Ostend', 'Praunheim', 'Preungesheim',
    'Riederwald', 'Rödelheim', 'Sachsenhausen-N.', 'Sachsenhausen-S.', 'Schwanheim', 'Seckbach', 'Sindlingen', 'Sossenheim',
    'Unterliederbach', 'Westend-Nord', 'Westend-Süd', 'Zeilsheim'];

let selectedTreeSpecies = [];
let availableTreeSpecies = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12.8,
        center: new google.maps.LatLng(50.128728, 8.667937),
        mapTypeId: 'satellite',
        styles: [
            {
                featureType: "all",
                elementType: "labels",
                stylers: [
                    {visibility: "off"}
                ]
            }
        ]
    });
    map.data.loadGeoJson('frankfurt.geojson');
    map.data.setStyle({visible: false});
    // TODO use after geojson initialization!!!
    // map.data.getFeatureById('Altstadt')
    appendMultiSelect([]);
    addBadges();

    d3.csv("processed.csv").then(data => {
        processedData = data;
        internalMap = new Map();
        processedData.forEach(d => {
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

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: processedData.map(d => new google.maps.LatLng(d.lat, d.lng)),
            map: map,
            opacity: 1,
            radius: 5
        });
        cluster = new MarkerClusterer(map, [],
            {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                minimumClusterSize: 25
            });
    });
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

function showFilteredData(selectedItems) {
    const filteredData = selectedItems
        ? selectedItems.length > 0
            ? processedData.filter(d => selectedItems.indexOf(d.germanName) !== -1)
            : processedData
        : processedData.filter(d => selectDropdown[0].selectize.items.indexOf(d.germanName) !== -1);
    if (view === 'heatmap') {
        heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)))
    } else {
        if (numberOfSelectedTrees < 25000) {
            cluster.clearMarkers();
            showMarkerCluster(filteredData);
        } else {
            cluster.clearMarkers();
            heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)));
            heatmap.setMap(map);
            view = 'heatmap';
        }
    }
}

function changeView() {
    const selectedItems = selectDropdown[0].selectize.items;
    if (view === 'heatmap') {
        if (numberOfSelectedTrees < 25000) {
            view = 'cluster';
            heatmap.setMap(null);
            showFilteredData(selectedItems);
        } else {
            cluster.clearMarkers();
            showFilteredData(selectedItems);
            heatmap.setMap(map);
        }
    } else {
        view = 'heatmap';
        cluster.clearMarkers();
        showFilteredData(selectedItems);
        heatmap.setMap(map);
    }
}


function showMarkerCluster(filteredData) {
    const infoWindow = new google.maps.InfoWindow({content: ``});
    const markers = filteredData.map(function (treeInfo, i) {

        const marker = new google.maps.Marker({
            position: {lat: parseFloat(treeInfo.lat), lng: parseFloat(treeInfo.lng)},
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: "red",
                fillOpacity: 1,
                strokeWeight: 1
            }
        });
        marker.addListener('click', function () {
            infoWindow.setContent(`<span>German name: ${treeInfo.germanName}</span><a target="_blank" rel="noopener noreferrer" href="http://www.google.com/search?q=${treeInfo.germanName}"> (Google it!)</a></br>
                        <span>Latin name: ${treeInfo.latinName}</span></br>
                        <span>Planting year: ${treeInfo.Pflanzjahr}</span></br>
                        <span>Crown diameter: ${treeInfo.Kronendurchmesser}m.</span></br>
                        <span>Location: ${treeInfo.Objekt}</span>`);
            infoWindow.open(map, marker);
        });
        return marker;
    });
    cluster.addMarkers(markers);
}

function addBadges() {
    treeSpecies.forEach(species => {
        let filterSpan = document.createElement("span");
        filterSpan.className = 'badge badge-secondary filter-badge flex-grow-1';
        filterSpan.innerHTML = `${species}`;
        filterSpan.onclick = function (event) {
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