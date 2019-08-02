
let processedData = [];

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
