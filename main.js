const MapType = {
    HEATMAP: 1,
    CLUSTER: 2
};

const MAX_CLUSTER_POINTS_NUMBER = 25000;

let map, heatmap, cluster;
let processedData = [];
let view = MapType.HEATMAP;

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
        initializeSelectize(processedData);
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

function getFilteredData() {
    if (filterType === FilterType.TREE_SPECIES) {
        const selectedItems = selectDropdown[0].selectize.items;
        return selectedItems
            ? selectedItems.length > 0
                ? processedData.filter(d => selectedItems.indexOf(d.germanName) !== -1)
                : processedData
            : processedData.filter(d => selectDropdown[0].selectize.items.indexOf(d.germanName) !== -1);
    } else {
        const cityDistrictGoogleMapPolygons = getCityDistrictGoogleMapPolygons(selectedCityDistrict);
        return processedData.filter(d => {
            const point = new google.maps.LatLng(d.lat, d.lng);
            return cityDistrictGoogleMapPolygons.some(polygon => google.maps.geometry.poly.containsLocation(point, polygon));
        });
    }

}

function showFilteredDataPoints(filteredData) {
    cluster.clearMarkers();
    if (view === MapType.HEATMAP) {
        heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)))
    } else {
        if (numberOfSelectedTrees < MAX_CLUSTER_POINTS_NUMBER) {
            heatmap.setMap(null);
            showMarkerCluster(filteredData);
        } else {
            heatmap.setData(filteredData.map(d => new google.maps.LatLng(d.lat, d.lng)));
            heatmap.setMap(map);
            view = MapType.HEATMAP;
        }
    }
}

function toggleMapType() {
    const clusterButton = document.getElementById("cluster");
    const heatmapButton = document.getElementById("heatmap");
    if (view === MapType.HEATMAP) {
        if (numberOfSelectedTrees < MAX_CLUSTER_POINTS_NUMBER) {
            heatmapButton.className = heatmapButton.className.replace(/\bactive\b/g, "");
            clusterButton.className += ' active';
            view = MapType.CLUSTER;
        } else {
            alert("Cluster view is only available for sets below 25K trees!");
        }
    } else {
        clusterButton.className = clusterButton.className.replace(/\bactive\b/g, "");
        heatmapButton.className += ' active';
        view = MapType.HEATMAP;
    }
    showFilteredDataPoints(getFilteredData());
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