# Frankfurt green spaces on Google Maps
Data for this report was collected from [Frankfurt Baumkataster](http://offenedaten.frankfurt.de/dataset/baumkataster-frankfurt-am-main)
![Frankfurt Center](/images/green_frankfurt_cluster.png)

## Available visualizations:
* Cluster (every tree displayed as a point with information shown in tooltip)
* Heatmap (shows trees density over different city areas)

| | | |
|:-------------------------:|:-------------------------:|:-------------------------:|
|<img width="1604" alt="Green Frankfurt" src="/images/green_frankfurt_cluster.png">  Green Frankfurt |  <img width="1604" alt="Trees in Frankfurt Innenstadt" src="/images/green_frankfurt_cluster_district.png"> Trees in Frankfurt Innenstadt | <img width="1604" alt="Trees in Frankfurt Innenstadt" src="/images/green_frankfurt_heatmap.png"> Heatmap of Frankfurt green spaces|

## Use-cases
* It's getting warmer and flowering season is coming? Check out the best spots to capture a beautiful magnolia or cherry blossoms.
* Allergic to some sort of plant? Moving to a new flat or house? Check your neighbourhood if there are any of those species.
* Autumn is coming and you eager to pick up nuts? Find the best parks with hazelnuts or walnuts!
## Development

Map is integrated using the [Google Maps Platform](https://cloud.google.com/maps-platform/). Every tree is represented on a map with a [Markers](https://developers.google.com/maps/documentation/javascript/markers), that are joined into [Clusters](https://developers.google.com/maps/documentation/javascript/marker-clustering) in order to increase performance.
Every marker on the map is clickable and opens on click window with a short summary about the tree using the [InfoWindow](https://developers.google.com/maps/documentation/javascript/infowindows).
Heatmap visualization demonstrates a density of the trees in every part of Frankfurt using [HeatMap](https://developers.google.com/maps/documentation/javascript/heatmaplayer).

Both cluster and heatmap support filtering of trees by type of the tree or by city district.

To start the application locally simply open the `index.html`.