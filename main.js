let utm = "+proj=utm +zone=32";
let wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
let coordinates;
// = proj4(utm, wgs84, [473366.239, 5549510.9]);
// console.log(coordinates[1], coordinates[0]);

function initMap() {
    let myLatlng = new google.maps.LatLng(50.113651, 8.678511);
    let mapOptions = {
        zoom: 10,
        center: myLatlng
    };
    let map = new google.maps.Map(document.getElementById("map"), mapOptions);

    let processedData = [];
    d3.csv("data.csv").then(data => {
        processedData = data.map((d, i) => {
            coordinates = proj4(utm, wgs84, [parseFloat(d.RECHTSWERT), parseFloat(d.HOCHWERT)]);
            if (i < 1000) {

                let marker = new google.maps.Marker({
                    position: new google.maps.LatLng(coordinates[1], coordinates[0]),
                    title: "Hello World!"
                });
                marker.setMap(map);
            }

            return {
                d, ...{'latitude': coordinates[1], 'longitude': coordinates[0]}
            };
        });
        console.log(processedData[10]);
    });
}