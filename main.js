const utm = "+proj=utm +zone=32";
const wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
let coordinates, map, heatmap, selectDropdown, internalMap, numberOfSelectedTrees, cluster;
let processedData = [];
let view = 'heatmap';
const treeSpecies = ['Ahorn', 'Birke', 'Buche', 'Eiche', 'Erle', 'Esche', 'Espe', 'Hainbuche', 'Hasel', 'Kastanie', 'Kiefer', 'Kirsche',
    'Linde', 'Olivenbaum', 'Plantane', 'Robinie', 'Schwarzpappel', 'Ulme', 'Weide'];
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

    appendMultiSelect([]);
    addBadges();

    d3.csv("processed.csv").then(data => {
        // console.log("start processing");
        // let endTime = new Date().getTime();
        // console.log("duration [ms] = " + (endTime - startTime));
        processedData = data;
        internalMap = new Map();
        processedData.forEach(d => {
            internalMap[d.germanName]
                ? internalMap[d.germanName].count++
                : internalMap[d.germanName] = {count: 1, latinName:d.latinName, germanName:d.germanName};
        });

        // let csvContent = "data:text/csv;charset=utf-8,";
        // csvContent += Object.keys(processedData[0]).join(",") + "\r\n";
        // processedData.forEach(function(tree) {
        //     let row =  Object.keys(tree).map(key => tree[key]).join(",");
        //     csvContent += row + "\r\n";
        // });
        // let encodedUri = encodeURI(csvContent);
        // let link = document.createElement("a");
        // link.setAttribute("href", encodedUri);
        // link.setAttribute("download", "my_data.csv");
        // document.body.appendChild(link);
        // link.click();

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
        },
        onItemRemove: function (value, $item) {
            const countsArray = this.items.map(item => internalMap[item].count);
            numberOfSelectedTrees = countsArray.length > 0 ? countsArray.reduce((a, b) => a + b) : 0;
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
            heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)))
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

function processCoordinates(data) {
    return data.map((d, i) => {
        coordinates = proj4(utm, wgs84, [parseFloat(d.RECHTSWERT), parseFloat(d.HOCHWERT)]);
        return {...d, ...{'lat': coordinates[1], 'lng': coordinates[0]}};
    });
}

function showMarkerCluster(filteredData) {
    const markers = filteredData.map(function (treeInfo, i) {
        const infoWindow = new google.maps.InfoWindow({
            content: `<span>German name: ${treeInfo.germanName}</span></br>
                        <span>Latin name: ${treeInfo.latinName}</span></br>
                        <span>Planting year: ${treeInfo.Pflanzjahr}</span></br>
                        <span>Crown diameter: ${treeInfo.Kronendurchmesser}m.</span></br>
                        <span>Location: ${treeInfo.Objekt}</span>`
        });
        const marker = new google.maps.Marker({
            position: {lat: treeInfo.lat, lng: treeInfo.lng},
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: "red",
                fillOpacity: 1,
                strokeWeight: 1
            }
        });
        marker.addListener('click', function () {
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

        document.getElementById("badges").appendChild(filterSpan);
    })
}