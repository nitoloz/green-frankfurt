const utm = "+proj=utm +zone=32";
const wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
let coordinates;

function initMap() {
    let map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12.8,
        center: new google.maps.LatLng(50.128728, 8.667937)
    });

    let heatmap;
    let processedData = [];
    d3.csv("data.csv").then(data => {
        processedData = data.map((d, i) => {
            coordinates = proj4(utm, wgs84, [parseFloat(d.RECHTSWERT), parseFloat(d.HOCHWERT)]);
            return {
                ...d, ...{'lat': coordinates[1], 'lng': coordinates[0]}
            };
        });
        const internalMap = new Map();
        processedData.forEach(d => internalMap[d['Gattung/Art/Deutscher Name']] ? internalMap[d['Gattung/Art/Deutscher Name']]++ : internalMap[d['Gattung/Art/Deutscher Name']] = 1);
        const values = Object.keys(internalMap).map((key) => {
            return {value: key, count: internalMap[key]};
        }).sort((a, b) => b.count - a.count);
        console.log(values);

       const multiSelect =  $('select').selectize({
            theme: 'links',
            plugins: ['remove_button','restore_on_backspace'],
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
            onItemAdd: function (value, $item) {
                console.log(this.items);
            },
            onItemRemove: function (value, $item) {
                console.log(this.items);
            }

        });

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: processedData.map(d => new google.maps.LatLng(d.lat, d.lng)),
            map: map
        });
        console.log('Data processed!');
    });
}