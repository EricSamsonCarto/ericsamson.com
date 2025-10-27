---
title: "Hurricane Florence"
description: "Analysis and visualization of Hurricane Florence's path and precipitation impact across the Carolinas"
date: 2018-11-09
thumbnail: "/images/projects/hurricane-florence/florence-3d.jpg"
---

![The Eye of Hurricane Florence](/images/projects/hurricane-florence/hurricane-florence.jpg "The Eye of Hurricane Florence by Alex Gerst")

Hurricane Florence caused historical flooding throughout the Carolinas, swamping towns throughout the region. I created the map below using ArcGIS Pro and data provided by NOAA's NHC. The general path of the storm is shown by the white line. The markers represent the location of the hurricane eye during the indicated date and time. Precipitation was visualized by collecting PRISM climate data. The total precipitation was calculated by combining daily rasters for the days of September 13th through September 17th. The hillshading seen on this graphic does not represent elevation, but is instead based on the precipitation values within the raster. This helps highlight areas that experienced more intense levels of precipitation.

![Hurricane Florence Path and Precipitation Map](/images/projects/hurricane-florence/florence-path.jpg "Hurricane Florence Path and Precipitation Map")

The image below shows the thermal signature of the hurricane. This was created in QGIS using brightness band 31 from a release of MODIS/Aqua Surface Reflectance Daily L3 Global 0.05 Deg CMG V006. Cold clouds remain at higher altitudes in the atmosphere and are displayed as a white color. The warmer, lower clouds are displayed as yellow.

![Hurricane Florence Thermal Signature](/images/projects/hurricane-florence/florence-3d.jpg "Hurricane Florence Thermal Signature")

*The maps and images contained in this post were inspired by graphics made by one of my favorite data visualizers and cartographers, [Joshua Stevens of NASA Earth Observatory](https://earthobservatory.nasa.gov/about/joshua-stevens).*
