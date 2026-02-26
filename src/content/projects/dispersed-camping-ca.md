---
title: "Dispersed Camping in California Mapping Application"
description: "Leaflet Map created to find dispersed camping locations throughout the state of California."
date: 2020-01-01
github: "https://github.com/EricSamsonCarto/Dispersed-Camping-in-CA-Leaflet"
thumbnail: "/images/projects/dispersed-camping-ca/main_dispersed_image.jpg"
---

<h3>
<a href="/dispersed-camping-project/dispersed-camping-app.html" target="_blank">live application</a>
</h3>

I created this map based off of a project I originally had in ArcGIS Pro. I opened the project whenever I was searching for camping spots and found it to be useful, so I decided to make it available via this leaflet map.

Dispersed camping is camping outside of a designated campground. You are allowed to disperse camp in most national forests and on BLM land, with some exceptions. The areas where you are allowed to camp are indicated by the green polygons for national forests, and yellow polygons for BLM land. When one of the green polygons is clicked, a popup will appear that includes a link to the National Forest's camping page, which will most of the time include information regarding their dispersed camping policy.

You are not allowed to camp close to major highways or roadways. It is easiest to locate camp spots near or off of Forest Service roads. These roads will appear on the map at a zoom level of 14. Paved roads will appear as purple lines, and unpaved as yellow lines. A private land layer will also appear at the zoom level of 12, <b>but not all private land is included on this layer</b>. 

Make sure to double check that the location you have found is not on someones private property.

The GIF below goes through an example of finding dispersed camping locations.

<Image src="/images/projects/dispersed-camping-ca/camp_1_gif.gif" alt="Camping locations example" width={1200} height={800} />

There are official campgrounds displayed on the map as well (see legend above map). These campgrounds can be “first come first serve” or reservation based, depending on the site. Clicking on a camp icon will open a pop-up, from which you can visit the campground's forest service website to find additional information. I have also added some trailheads:

<Image src="/images/projects/dispersed-camping-ca/camp_2_img.JPG" alt="trailheads" width={1200} height={800} />

The layers button can be used to switch between the satellite basemap and the topographic basemap. Some layers can also be turned on and off. When zoomed in and exploring, the green "DispersedCampLand" layer will turn off automatically at zoom level 13.

The marker button allows users to place a point where they find a potential camping spot. When clicking on a marker after it's placed, the popup will give several clickable link options. The first link simply searches the coordinates on google, which can then be opened in google maps. If the Lat,Lon is on a major road, Google Street View can be launched via the second link. If you want to know the weather at the marker location, a National Weather Service NOAA link is included. The markers can then be exported to a geoJSON or a KML file:

<Image src="/images/projects/dispersed-camping-ca/camp_3_img.JPG" alt="creating camping points" width={1200} height={800} />

When exporting to KML, the points can be added to Google Maps by first visiting My Maps. Click "CREATE A NEW MAP" and follow the GIF below. The new custom map can be opened on the mobile Google Maps app by going to "Your places" -> scrolling the top bar to the right -> "Maps." There you will find all of your custom maps.

The GIF below quickly shows how to add the Dispersed Campsite points to a custom Google Map:

<Image src="/images/projects/dispersed-camping-ca/camp_3_gif.gif" alt="creating google maps" width={1200} height={800} />


