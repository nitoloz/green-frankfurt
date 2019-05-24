const utm = "+proj=utm +zone=32";
const wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
let coordinates, map, heatmap, selectDropdown;
let processedData = [];
// let view = 'heatmap';
// let cluster;

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

        const internalMap = new Map();
        processedData.forEach(d => {
            const [latinName, germanName] = d['Gattung/Art/Deutscher Name'].split('. ');
            d['germanName'] = germanName;
            d['latinName'] = latinName;
            internalMap[d['Gattung/Art/Deutscher Name']] ? internalMap[d['Gattung/Art/Deutscher Name']]++ : internalMap[d['Gattung/Art/Deutscher Name']] = 1;
        });
        const values = Object.keys(internalMap).map((key) => {
            return {value: key, count: internalMap[key]};
        }).sort((a, b) => b.count - a.count);
        selectDropdown[0].selectize.addOption(values);
        // const markers = processedData.map(function (location, i) {
        //     return new google.maps.Marker({
        //         position: {lat: location.lat, lng: location.lng},
        //         icon: {
        //             path: google.maps.SymbolPath.CIRCLE,
        //             scale: 5,
        //             fillColor: "green",
        //             fillOpacity: 0.4,
        //             strokeWeight: 0.4
        //         }
        //     });
        // });
        // // Add a marker clusterer to manage the markers.
        // cluster = new MarkerClusterer(map, markers,
        //     {
        //         imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        //         minimumClusterSize: 25
        //     });
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: processedData.map(d => new google.maps.LatLng(d.lat, d.lng)),
            map: map,
            opacity: 1,
            radius: 5
            // gradient: [
            //     'rgba(0, 255, 255, 0)',
            //     'rgba(0, 255, 255, 1)',
            //     'rgba(0, 191, 255, 1)',
            //     'rgba(0, 127, 255, 1)',
            //     'rgba(0, 63, 255, 1)',
            //     'rgba(0, 0, 255, 1)',
            //     'rgba(0, 0, 223, 1)',
            //     'rgba(0, 0, 191, 1)',
            //     'rgba(0, 0, 159, 1)',
            //     'rgba(0, 0, 127, 1)',
            //     'rgba(63, 0, 91, 1)',
            //     'rgba(127, 0, 63, 1)',
            //     'rgba(191, 0, 31, 1)',
            //     'rgba(255, 0, 0, 1)'
            // ]
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
                                <span class="title">${escape(data.value)}</span>
                                <span class="url"> (${escape(data.count)})</span>
                            </div>`;
            },
            item: function (data, escape) {
                return '<div class="item">' + escape(data.value) + '</div>';
            }
        }

    });
}

function filterView() {
    console.log(selectDropdown[0].selectize.items);
    const selectedItems = selectDropdown[0].selectize.items;
    heatmap.setData(processedData.filter(d => selectedItems.indexOf(d['Gattung/Art/Deutscher Name']) !== -1)
        .map(d => new google.maps.LatLng(d.lat, d.lng)))
}

function changeView() {
    heatmap.setMap(null);
    console.log(selectDropdown[0].selectize.items);
    const selectedItems = selectDropdown[0].selectize.items;
    const markers = processedData.filter(d => selectedItems.indexOf(d['Gattung/Art/Deutscher Name']) !== -1).map(function (location, i) {
        return new google.maps.Marker({
            position: {lat: location.lat, lng: location.lng},
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: "green",
                fillOpacity: 0.4,
                strokeWeight: 0.4
            }
        });
    });
    cluster = new MarkerClusterer(map, markers,
        {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            minimumClusterSize: 25
        });
}

function processCoordinates(data) {
    return data.map((d, i) => {
        coordinates = proj4(utm, wgs84, [parseFloat(d.RECHTSWERT), parseFloat(d.HOCHWERT)]);
        return {...d, ...{'lat': coordinates[1], 'lng': coordinates[0]}};
    });
}