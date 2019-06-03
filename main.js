const utm = "+proj=utm +zone=32";
const wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
let coordinates, map, heatmap, selectDropdown, internalMap, numberOfSelectedTrees, cluster;
let processedData = [];
let view = 'heatmap';

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

    d3.csv("data.csv").then(data => {
        console.log("start processing");
        let startTime = new Date().getTime();
        processedData = processCoordinates(data);
        let endTime = new Date().getTime();
        console.log("duration [ms] = " + (endTime - startTime));

        internalMap = new Map();
        processedData.forEach(d => {
            const [latinName, germanName] = d['Gattung/Art/Deutscher Name'].split('. ');
            d.germanName = germanName;
            d.latinName = latinName;
            internalMap[d.germanName]
                ? internalMap[d.germanName].count++
                : internalMap[d.germanName] = {count: 1, latinName, germanName};
        });
        const values = Object.keys(internalMap).map((key) => {
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

function showFilteredData() {
    const selectedItems = selectDropdown[0].selectize.items;
    const filteredData = selectedItems.length > 0 ? processedData.filter(d => selectedItems.indexOf(d.germanName) !== -1) : processedData;
    if (view === 'heatmap') {
        heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)))
    } else {
        if (numberOfSelectedTrees < 15000) {
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
    if (view === 'heatmap') {
        if (numberOfSelectedTrees < 15000) {
            view = 'cluster';
            heatmap.setMap(null);
            showFilteredData();
        } else {
            cluster.clearMarkers();
            showFilteredData();
            heatmap.setMap(map);
        }
    } else {
        view = 'heatmap';
        cluster.clearMarkers();
        showFilteredData();
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
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
        return marker;
    });
    cluster.addMarkers(markers);
}