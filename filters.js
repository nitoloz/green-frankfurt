const FilterType = {
    TREE_SPECIES: 1,
    CITY_DISTRICTS: 2
};
// const MapType = {
//     HEATMAP: 1,
//     CLUSTER: 2
// };
//
// let map, heatmap, selectDropdown, internalMap, numberOfSelectedTrees, cluster;
// let processedData = [];
// let view = MapType.HEATMAP;
let filterType = FilterType.TREE_SPECIES;
//
// const treeSpecies = ['Ahorn', 'Birke', 'Buche', 'Eiche', 'Erle', 'Esche', 'Espe', 'Hainbuche', 'Hasel', 'Kastanie', 'Kiefer',
//     'Kirsche', 'Linde', 'Magnolie', 'Platane', 'Robinie', 'Pappel', 'Ulme', 'Walnuss', 'Weide'];
//
// const cityDistricts = ['Altstadt', 'Bahnhofsviertel', 'Bergen-Enkheim', 'Berkersheim', 'Bockenheim', 'Bonames', 'Bornheim',
//     'Dornbusch', 'Eckenheim', 'Eschersheim', 'Fechenheim', 'Flughafen', 'Frankfurter Berg', 'Gallus', 'Ginnheim', 'Griesheim',
//     'Gutleutviertel', 'Harheim', 'Hausen', 'Heddernheim', 'Höchst', 'Innenstadt', 'Kalbach-Riedberg', 'Nied', 'Nieder-Erlenbach',
//     'Nieder-Eschbach', 'Niederrad', 'Niederursel', 'Nordend-Ost', 'Nordend-West', 'Oberrad', 'Ostend', 'Praunheim', 'Preungesheim',
//     'Riederwald', 'Rödelheim', 'Sachsenhausen-N.', 'Sachsenhausen-S.', 'Schwanheim', 'Seckbach', 'Sindlingen', 'Sossenheim',
//     'Unterliederbach', 'Westend-Nord', 'Westend-Süd', 'Zeilsheim'];
//
// let selectedTreeSpecies = [];
// let availableTreeSpecies = [];
// let selectedCityDistricts = [];
//
// function initMap() {
//     map = new google.maps.Map(document.getElementById("map"), {
//         zoom: 12.8,
//         center: new google.maps.LatLng(50.128728, 8.667937),
//         mapTypeId: 'satellite',
//         styles: [
//             {
//                 featureType: "all",
//                 elementType: "labels",
//                 stylers: [
//                     {visibility: "off"}
//                 ]
//             }
//         ]
//     });
//     map.data.loadGeoJson('frankfurt.geojson');
//     map.data.setStyle({visible: false});
//
//     appendMultiSelect([]);
//     addTreeSpeciesBadges();
//     addCityDistrictsBadges();
//
//     d3.csv("processed.csv").then(data => {
//         processedData = data;
//         internalMap = new Map();
//         processedData.forEach(d => {
//             internalMap[d.germanName]
//                 ? internalMap[d.germanName].count++
//                 : internalMap[d.germanName] = {count: 1, latinName: d.latinName, germanName: d.germanName};
//         });
//
//         availableTreeSpecies = Object.keys(internalMap);
//         const values = availableTreeSpecies.map((key) => {
//             return {
//                 value: key,
//                 count: internalMap[key].count,
//                 latinName: internalMap[key].latinName,
//                 germanName: internalMap[key].germanName
//             };
//         }).sort((a, b) => b.count - a.count);
//         selectDropdown[0].selectize.addOption(values);
//
//         heatmap = new google.maps.visualization.HeatmapLayer({
//             data: processedData.map(d => new google.maps.LatLng(d.lat, d.lng)),
//             map: map,
//             opacity: 1,
//             radius: 5
//         });
//         cluster = new MarkerClusterer(map, [],
//             {
//                 imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
//                 minimumClusterSize: 25
//             });
//     });
// }
//
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
//
// function filteredDataByTreeSpecies(selectedItems) {
//     const filteredData = selectedItems
//         ? selectedItems.length > 0
//             ? processedData.filter(d => selectedItems.indexOf(d.germanName) !== -1)
//             : processedData
//         : processedData.filter(d => selectDropdown[0].selectize.items.indexOf(d.germanName) !== -1);
//     showFilteredDataPoints(filteredData);
// }
//
// function showFilteredDataPoints(filteredData) {
//     if (view === MapType.HEATMAP) {
//         heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)))
//     } else {
//         if (numberOfSelectedTrees < 25000) {
//             cluster.clearMarkers();
//             showMarkerCluster(filteredData);
//         } else {
//             cluster.clearMarkers();
//             heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)));
//             heatmap.setMap(map);
//             view = MapType.HEATMAP;
//         }
//     }
// }
//
// function changeView() {
//     const selectedItems = selectDropdown[0].selectize.items;
//     if (view === MapType.HEATMAP) {
//         if (numberOfSelectedTrees < 25000) {
//             document.getElementById("heatmap").className = document.getElementById("heatmap").className.replace(/\bactive\b/g, "");
//             document.getElementById("cluster").className += ' active';
//             view = MapType.CLUSTER;
//             heatmap.setMap(null);
//             filteredDataByTreeSpecies(selectedItems);
//         } else {
//             alert("Cluster view is only available for sets below 25K trees!");
//             cluster.clearMarkers();
//             filteredDataByTreeSpecies(selectedItems);
//             heatmap.setMap(map);
//         }
//     } else {
//         document.getElementById("cluster").className = document.getElementById("cluster").className.replace(/\bactive\b/g, "");
//         document.getElementById("heatmap").className += ' active';
//         view = MapType.HEATMAP;
//         cluster.clearMarkers();
//         filteredDataByTreeSpecies(selectedItems);
//         heatmap.setMap(map);
//     }
// }

function changeFilters() {
    if (filterType === FilterType.TREE_SPECIES) {
        filterType = FilterType.CITY_DISTRICTS;
        document.getElementById("tree-species").className = document.getElementById("tree-species").className.replace(/\bactive\b/g, "");
        document.getElementById("city-districts").className += ' active';
        document.getElementById("district-badges").className = document.getElementById("district-badges").className.replace(/\bhidden\b/g, "visible");
        document.getElementById("species-badges").className = document.getElementById("species-badges").className.replace(/\bvisible\b/g, "hidden");
        document.getElementById("select").className += ' hidden';
    } else {
        filterType = FilterType.TREE_SPECIES;
        document.getElementById("city-districts").className = document.getElementById("city-districts").className.replace(/\bactive\b/g, "");
        document.getElementById("tree-species").className += ' active';
        document.getElementById("species-badges").className = document.getElementById("species-badges").className.replace(/\bhidden\b/g, "visible");
        document.getElementById("district-badges").className = document.getElementById("district-badges").className.replace(/\bvisible\b/g, "hidden");
        document.getElementById("select").className = document.getElementById("select").className.replace(/\bhidden\b/g, "");
    }
}
//
//
// function showMarkerCluster(filteredData) {
//     const infoWindow = new google.maps.InfoWindow({content: ``});
//     const markers = filteredData.map(function (treeInfo, i) {
//
//         const marker = new google.maps.Marker({
//             position: {lat: parseFloat(treeInfo.lat), lng: parseFloat(treeInfo.lng)},
//             icon: {
//                 path: google.maps.SymbolPath.CIRCLE,
//                 scale: 5,
//                 fillColor: "red",
//                 fillOpacity: 1,
//                 strokeWeight: 1
//             }
//         });
//         marker.addListener('click', function () {
//             infoWindow.setContent(`<span>German name: ${treeInfo.germanName}</span><a target="_blank" rel="noopener noreferrer" href="http://www.google.com/search?q=${treeInfo.germanName}"> (Google it!)</a></br>
//                         <span>Latin name: ${treeInfo.latinName}</span></br>
//                         <span>Planting year: ${treeInfo.Pflanzjahr}</span></br>
//                         <span>Crown diameter: ${treeInfo.Kronendurchmesser}m.</span></br>
//                         <span>Location: ${treeInfo.Objekt}</span>`);
//             infoWindow.open(map, marker);
//         });
//         return marker;
//     });
//     cluster.addMarkers(markers);
// }
//
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
            const index = selectedCityDistricts.indexOf(this.innerText);
            // TODO use after geojson initialization!!!
            console.log(map.data.getFeatureById(this.innerText));
            const allLocalMultiPolys = [];
            const googleGeometryMultiPoly = [];
            map.data.getFeatureById(this.innerText).getGeometry().getArray().map((item, i) => {
                allLocalMultiPolys[i] = [];
                let curPolyNum = item.getLength();
                for (let j = 0; j < curPolyNum; j++) {
                    allLocalMultiPolys[i].push(item.getAt(j).getArray());
                }
                googleGeometryMultiPoly.push(new google.maps.Polygon({
                    paths: allLocalMultiPolys[i]
                }));
            });
            const filteredData = processedData.filter(d => {
                const point = new google.maps.LatLng(d.lat, d.lng);
                return googleGeometryMultiPoly.some(polygon => google.maps.geometry.poly.containsLocation(point, polygon));
            });
            numberOfSelectedTrees = filteredData.length;
            showFilteredDataPoints(filteredData);
            if (index === -1) {
                selectedCityDistricts.push(this.innerText);
                this.className = this.className.replace('secondary', 'primary');
            } else {
                selectedCityDistricts.splice(index, 1);
                this.className = this.className.replace('primary', 'secondary');
            }
        };

        document.getElementById("district-badges").appendChild(filterSpan);
    })
}