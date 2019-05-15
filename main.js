var utm = "+proj=utm +zone=32";
var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
const coordinates = proj4(utm, wgs84, [473366.239, 5549510.9]);
console.log(coordinates[1], coordinates[0]);