// const FilterType = {
//     TREE_SPECIES: 1,
//     CITY_DISTRICTS: 2
// };
const MapType = {
    HEATMAP: 1,
    CLUSTER: 2
};

const MAX_CLUSTER_POINTS_NUMBER = 25000;

let map, heatmap, selectDropdown, internalMap, numberOfSelectedTrees, cluster;
let processedData = [];
let view = MapType.HEATMAP;

let selectedTreeSpecies = [];
let availableTreeSpecies = [];
let selectedCityDistricts = [];

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

    appendMultiSelect([]);
    addTreeSpeciesBadges();
    addCityDistrictsBadges();

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


function filterDataByTreeSpecies(selectedItems) {
    const filteredData = selectedItems
        ? selectedItems.length > 0
            ? processedData.filter(d => selectedItems.indexOf(d.germanName) !== -1)
            : processedData
        : processedData.filter(d => selectDropdown[0].selectize.items.indexOf(d.germanName) !== -1);
    showFilteredDataPoints(filteredData);
}

function showFilteredDataPoints(filteredData) {
    if (view === MapType.HEATMAP) {
        heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)))
    } else {
        cluster.clearMarkers();
        if (numberOfSelectedTrees < MAX_CLUSTER_POINTS_NUMBER) {
            showMarkerCluster(filteredData);
        } else {
            heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)));
            heatmap.setMap(map);
            view = MapType.HEATMAP;
        }
    }
}

function changeView() {
    const selectedItems = selectDropdown[0].selectize.items;
    if (view === MapType.HEATMAP) {
        if (numberOfSelectedTrees < MAX_CLUSTER_POINTS_NUMBER) {
            document.getElementById("heatmap").className = document.getElementById("heatmap").className.replace(/\bactive\b/g, "");
            document.getElementById("cluster").className += ' active';
            view = MapType.CLUSTER;
            heatmap.setMap(null);
        } else {
            alert("Cluster view is only available for sets below 25K trees!");
            cluster.clearMarkers();
        }
    } else {
        document.getElementById("cluster").className = document.getElementById("cluster").className.replace(/\bactive\b/g, "");
        document.getElementById("heatmap").className += ' active';
        view = MapType.HEATMAP;
        cluster.clearMarkers();
    }
    filterDataByTreeSpecies(selectedItems);
}

function showMarkerCluster(filteredDataPoints) {
    const infoWindow = new google.maps.InfoWindow({content: ``});
    const markers = filteredDataPoints.map(function (treeInfo, i) {

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