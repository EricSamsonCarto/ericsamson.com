# patriots dynasty

this folder contains the original source files for the patriots dynasty project.

## files

- `patriots-leaflet.js` - cleaned up javascript for the leaflet map (source file)
- `style.css` - css for standalone html version
- `patriot-dynasty-map.html` - original standalone html page

## project integration

the patriots dynasty project has been integrated into the main site:

- **mdx file**: `src/content/projects/patriots-dynasty.mdx`
- **javascript (map)**: `public/js/projects/patriots-dynasty.js` (copy of patriots-leaflet.js)
- **javascript (chart)**: `public/js/projects/patriots-chart.js` (amcharts bar chart)
- **css**: `public/css/patriots-dynasty.css`
- **images**: `public/images/projects/patriots-dynasty/`

## notes

the javascript was refactored from 434 lines to 159 lines by using a data-driven approach for team logos instead of 31 individual overlay blocks. the amcharts code was also cleaned up and separated into its own file.
