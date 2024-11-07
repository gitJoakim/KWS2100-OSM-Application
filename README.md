[![Link to deployed application](https://img.shields.io/badge/Link_to_Deployed_Application-blue)](https://gitjoakim.github.io/KWS2100-OSM-Application/)

## KWS2100 - Map-based web systems - Exam (72-hour exam)

The application uses OpenLayers for the map functionality and is built with React and TypeScript.

### Data sources

- **Earthquake Data**: [Fetched from USGS.GOV](https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-04-01&endtime=2024-04-30&minmagnitude=4)

  The link grabs all earthquakes from 1st of April til the 30th of April 2024.

  Due to the close proximity of multiple earthquakes, I've set a relatively low resolution limit for de-clustering the points. As a result, users will need to zoom in a fair amount before the points start to de-cluster and become clickable. When an earthquake is selected, its data will be displayed in a card on the left side of the screen.

- **Tectonic Plates Data**: [Retrieved from Github](https://github.com/fraxen/tectonicplates/tree/master/GeoJSON)

  Two GeoJSON datasets: one with polygons outlining and containing data for tectonic plates, and another with linestrings showing the tectonic borders. The GeoJSON polygon dataset had issues with lines stretching across the entire globe in vertical and horizontal directions (check the "PB2002_plates.json" for reference). To address this, I decided to display the borders from the tectonic border dataset while using the tectonic plate names from the original polygon dataset. This approach worked out well, as it maintains clarity and provides accurate information.

  I've intentionally kept the tectonic borders layer permanently toggled on, as it offers valuable context when viewing the volcano and earthquake layers. It effectively illustrates the connections between tectonic plates, earthquakes, and volcanoes. Additionally, I’ve included a checkbox for the tectonic plate names, as they can sometimes add visual clutter when focusing on other elements.

- **Volcanic Eruptions Data**: [Retrieved from Global Volcanism Program](https://webservices.volcano.si.edu/geoserver/GVP-VOTW/wms?service=WFS&version=1.0.0&request=GetFeature&typeName=GVP-VOTW:E3WebApp_Eruptions1960&outputFormat=application%2Fjson)

  GeoJSON dataset of volcanic eruptions over the years. This was originally quite large and contained numerous points in the same locations, creating visual noise and clutter. I’ve trimmed it down to display only unique eruptions. Since volcanoes are more spread out than earthquakes, the resolution required for them to de-cluster is 10 times larger. As a result, users will still need to zoom in a bit before they can click on a point to view its data in the datacard on the left side of the screen.

- **SVG-Icons**: [All SVG icons are from SVG Repo](https://www.svgrepo.com/)

---

#### Tile Layers

- The base tilelayer is pulled from ArcGIS, its called "World Imagery". I have put OSM as a choice in a dropdown menu, but it should also work as a backup automatically if the program can't fetch the photo layer on launch. If you experience any issues please swap to the OSM layer.

#### Drawing Layer and functionality

- The drawing layer and its functionality were implemented in a bit of a rush due to time constraints and a severe lack of sleep 🙃. As a result, the implementation isn’t the cleanest and relies on basic alerts for interaction, which I definitely wouldn’t recommend for a more polished version. It’s functional for now, but certainly not the most elegant solution!
