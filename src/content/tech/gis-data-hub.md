---
title: "PMTiles on GitHub Pages"
description: "Using a GitHub Pages repo to host PMTiles and geoparquet GIS data. No Server."
date: 2026-10-21
thumbnail: "../../assets/images/writing/tech/gis-hub.jpg"
github: "https://github.com/EricSamsonCarto/gis-data-hub"
---

In my [PMTiles post](/writing/tech/pmtiles) I mentioned that the Colorado buildings file lives on a [GitHub Pages site](https://ericsamsoncarto.github.io/gis-data-hub/).

Here's how it works.

I wanted a free place to put cloud-native files (PMTiles and GeoParquet) that I could read straight from a URL in MapLibre, QGIS, DuckDB or GDAL. Setting up an S3 bucket, with billing and CORS settings, felt like overkill for a handful of side-project files. I read online (I can't remember where, reddit or something?) that you can just do this on GitHub pages, so I decided to give it a shot myself.

Reddit was right, it turns out GitHub Pages already does the two things these formats need. It supports HTTP range requests, so a client can grab only the bytes it needs, and it sends `Access-Control-Allow-Origin: *`, so a map on any other site can read the file. You can check with curl:

```sh
curl -I -H "Range: bytes=0-99" \
  https://ericsamsoncarto.github.io/gis-data-hub/data/pmtiles/colorado-buildings.pmtiles
```

If you get back a `206 Partial Content`, you're good to go.

### The setup

The repo is basically two folders:

```
data/
├── pmtiles/
└── geoparquet/
```

Turn on Pages (Settings > Pages > Deploy from branch > `main` / root), and every file is available at `https://ericsamsoncarto.github.io/gis-data-hub/data/<format>/<file>`.

For the landing page, I just used the standard Jekyll, which Pages runs by default. Jekyll exposes every file in the repo as `site.static_files`, so `index.md` just filters that list by extension and builds a table:

```liquid
{% assign pmtiles = site.static_files | where: "extname", ".pmtiles" %}

| File | URL |
|------|-----|
{% for f in pmtiles %}| [{{ f.name }}](https://pmtiles.io/#url={{ f.path | absolute_url }}) | `{{ f.path | absolute_url }}` |
{% endfor %}
```

That's it! I just upload the files I need to this repo and push to main. And I never have to update a list by hand. I drop a file in `data/`, push, and it shows up. Each file name links to a viewer ([pmtiles.io](https://pmtiles.io) for PMTiles, [geoparquet-visualizer](https://do-me.github.io/geoparquet-visualizer/) for GeoParquet), so I can click through and check it right after pushing.

### The catches

GitHub rejects any file over 100 MB, and Git LFS won't save you here because Pages serves the LFS pointer file instead of the data. So the files have to be small.

For PMTiles, max zoom is what blows up the file size (more on that in the [PMTiles post](/writing/tech/pmtiles)). For GeoParquet, I wrote a [small script](https://github.com/EricSamsonCarto/gis-data-hub/blob/main/scripts/prep-geoparquet.sh) that runs everything through `ogr2ogr` with zstd compression, a bbox column and spatial sorting, so remote readers can skip the chunks they don't need. It also yells at me if the output is over 100 MB.

The other thing to watch is git history. Every time you replace a file, the old version sticks around in the repo. I don't care about history here, so every so often I squash it:

```sh
git checkout --orphan fresh && git add -A && git commit -m "Squash history"
git branch -D main && git branch -m main && git push -f origin main
```

Pages also has a soft limit of 100 GB of bandwidth a month and about 1 GB for the whole site, which should be plenty.

On the PMTiles site, they describe the process for serving the files within a cloudflare R2 instance. Cloudflare is hinting majorly that they are going to be [rolling out spend caps](https://x.com/argofowl/status/2110732097417777226?s=20) for all services. This has been the primary reason why I have held back from using an R2 instance before. Once that's implemented, I'm going to give it a try and write up my experience.
