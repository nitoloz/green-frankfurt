let utm = "+proj=utm +zone=32";
let wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
let coordinates;

function initMap() {
    let myLatlng = new google.maps.LatLng(50.128728, 8.667937);
    let mapOptions = {
        zoom: 12.8,
        center: myLatlng
    };
    let map = new google.maps.Map(document.getElementById("map"), mapOptions);
    let heatmap;
    let processedData = [];
    d3.csv("data.csv").then(data => {
        processedData = data.map((d, i) => {
            coordinates = proj4(utm, wgs84, [parseFloat(d.RECHTSWERT), parseFloat(d.HOCHWERT)]);
            return {
                ...d, ...{'latitude': coordinates[1], 'longitude': coordinates[0]}
            };
        });
        const internalMap = new Map();
        processedData.forEach(d => internalMap[d['Gattung/Art/Deutscher Name']] ? internalMap[d['Gattung/Art/Deutscher Name']]++ : internalMap[d['Gattung/Art/Deutscher Name']] = 1);
        const values = Object.keys(internalMap).map((key) => {
            return {value: key, count: internalMap[key]};
        }).sort((a, b) => b.count - a.count);
        console.log(values);

        $('select').selectize({
            theme: 'links',
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
            },
            // create: function (input) {
            //     return {
            //         id: 0,
            //         title: input,
            //         url: '#'
            //     };
            // }
        });

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: processedData.map(d => new google.maps.LatLng(d.latitude, d.longitude)),
            map: map
        });
        console.log('Data processed!');
    });
}