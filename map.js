const MapType = {
    HEATMAP: 1,
    CLUSTER: 2
};
let view = MapType.HEATMAP;

const MAX_CLUSTER_POINTS_NUMBER = 25000;

let map, heatmap, cluster;

function showFilteredDataPoints(filteredData) {
    cluster.clearMarkers();
    if (view === MapType.HEATMAP) {
        if(!heatmap.getMap()){
            heatmap.setMap(map);
        }
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

function getCityDistrictGoogleMapPolygons(cityDistrictName) {
    const cityDistrictPolygons = [];
    const googleGeometryMultiPoly = [];
    map.data.getFeatureById(cityDistrictName).getGeometry().getArray().map((item, i) => {
        cityDistrictPolygons[i] = [];
        let curPolyNum = item.getLength();
        for (let j = 0; j < curPolyNum; j++) {
            cityDistrictPolygons[i].push(item.getAt(j).getArray());
        }
        googleGeometryMultiPoly.push(new google.maps.Polygon({
            paths: cityDistrictPolygons[i]
        }));
    });
    return googleGeometryMultiPoly;
}