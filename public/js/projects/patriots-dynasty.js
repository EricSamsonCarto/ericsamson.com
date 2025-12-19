const patriots_gist = $.ajax({
  url: "https://gist.githubusercontent.com/EricSamsonCarto/2d9a467900c64cce8f157a165aa33ee1/raw/02b5a2ec003d9ee12f1d8670396896bd0aa6a39c/FootballTeams4.geojson",
  dataType: "json",
  success: console.log("patriots gist data successfully loaded."),
  error: function(xhr) {
    alert(`patriots gist: ${xhr.statusText}`);
  }
});

const teamLogos = [
  { url: 'washingtonredskins.png', bounds: [[37.912420, -78.539668], [35.856460, -76.100251]], opacity: 0.70 },
  { url: 'newenglandpatriots.png', bounds: [[45.419945, -74.005206], [42.549512, -68.995864]], opacity: 0.70 },
  { url: 'newyorkgiants.png', bounds: [[43.379935, -75.421532], [42.046349, -73.637020]], opacity: 0.70 },
  { url: 'newyorkjets.png', bounds: [[41.158388, -74.807525], [40.391126, -73.680544]], opacity: 0.70 },
  { url: 'philadelphiaeagles.png', bounds: [[40.431636, -75.800993], [39.222755, -74.108507]], opacity: 0.70 },
  { url: 'baltimoreravens.png', bounds: [[41.269788, -78.454560], [39.692282, -76.248478]], opacity: 0.70 },
  { url: 'buffalobills.png', bounds: [[43.402269, -78.983153], [42.024426, -76.264337]], opacity: 0.70 },
  { url: 'pittsburghsteelers.png', bounds: [[40.883616, -80.782815], [39.326119, -78.809531]], opacity: 0.70 },
  { url: 'carolinapanthers.png', bounds: [[37.234773, -81.873248], [34.045758, -78.731979]], opacity: 0.70 },
  { url: 'jacksonvillejaguars.png', bounds: [[31.974913, -84.155131], [29.643415, -81.228753]], opacity: 0.70 },
  { url: 'tampabaybuccaneers.png', bounds: [[28.848659, -82.462202], [27.607150, -80.900520]], opacity: 0.70 },
  { url: 'miamidolphins.png', bounds: [[26.927279, -81.590871], [25.305630, -79.763118]], opacity: 0.70 },
  { url: 'atlantafalcons.png', bounds: [[34.727588, -86.142870], [32.148246, -82.870609]], opacity: 0.70 },
  { url: 'neworleanssaints.png', bounds: [[33.476793, -92.462164], [29.795205, -88.307790]], opacity: 0.70 },
  { url: 'tennesseetitans.png', bounds: [[37.001624, -88.865623], [34.543291, -85.850209]], opacity: 0.70 },
  { url: 'cincinnatibengals.png', bounds: [[39.779318, -84.828459], [38.220037, -82.652657]], opacity: 0.70 },
  { url: 'clevelandbrowns.png', bounds: [[41.279507, -82.857032], [40.183326, -81.329211]], opacity: 0.70 },
  { url: 'detroitlions.png', bounds: [[43.905159, -85.676449], [42.041071, -82.862506]], opacity: 0.70 },
  { url: 'greenbaypackers.png', bounds: [[45.925163, -90.204053], [43.768969, -87.305336]], opacity: 0.70 },
  { url: 'chicagobears.png', bounds: [[42.713702, -89.963704], [40.555192, -86.787458]], opacity: 0.70 },
  { url: 'indianapoliscolts.png', bounds: [[40.593017, -87.588649], [38.848041, -85.407381]], opacity: 0.70 },
  { url: 'minnesotavikings.png', bounds: [[47.862334, -98.351675], [44.682355, -93.060834]], opacity: 0.70 },
  { url: 'kansascitychiefs.png', bounds: [[41.313533, -97.329178], [36.584862, -90.852914]], opacity: 0.70 },
  { url: 'dallascowboys.png', bounds: [[35.526345, -101.325258], [31.666476, -96.815758]], opacity: 0.70 },
  { url: 'houstontexans.png', bounds: [[30.776777, -97.452102], [28.584706, -93.980692]], opacity: 0.70 },
  { url: 'denverbroncos.png', bounds: [[44.906171, -110.653376], [38.947852, -101.875153]], opacity: 0.70 },
  { url: 'arizonacardinals.png', bounds: [[36.546172, -114.252905], [31.509936, -108.1246702]], opacity: 0.70 },
  { url: 'losangeleschargers.png', bounds: [[33.894102, -117.423558], [32.641769, -114.792806]], opacity: 0.90 },
  { url: 'losangelesrams.png', bounds: [[36.043787, -118.854277], [34.160957, -115.813293]], opacity: 0.70 },
  { url: 'oaklandraiders.png', bounds: [[40.598305, -121.818011], [38.088822, -118.810378]], opacity: 0.70 },
  { url: 'seattleseahawks.png', bounds: [[47.954088, -122.813720], [42.883126, -115.016283]], opacity: 0.70 },
  { url: 'sanfrancisco49ers.png', bounds: [[38.929033, -124.028213], [37.061122, -121.783732]], opacity: 0.70 }
];

$.when(patriots_gist).done(function() {
  const map = L.map("map").setView([39.072825, -92.598557], 4);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 6,
    minZoom: 4,
  }).addTo(map);

  function teamBoundaryStyle(feature) {
    return {
      color: feature.properties.COLOR,
      weight: 1.3
    };
  }

  map.createPane("boundaryPane");
  map.createPane("logoPane");

  const boundary_geojson = L.geoJSON(patriots_gist.responseJSON, {
    style: teamBoundaryStyle,
    fillOpacity: 0.75,
    pane: "boundaryPane",
  }).addTo(map);

  boundary_geojson.bindPopup(function(e) {
    const props = e.feature.properties;
    return `<div style="font-family: montserrat, sans-serif;">
      <div style="text-align:center;color:${props.COLOR};">
        <font size="3">${props.TEAM_0}</font>
      </div>
      <div style="text-align:center">
        Patriots vs The ${props.TEAM}:<br>
        <b>From 2001 to Present</b>
      </div>
      <hr style="margin:0;padding:0;">
      <div style="text-align:center">
        Total Games: <font size="2"><b>${props.TOTALGAMES}</b></font>
      </div>
      <div style="text-align:center">
        Winning Percentage: <font size="2"><b>${props.WinningPercentage2}%</b></font>
      </div>
      <div id="chart">
        <canvas id="winLossChart"></canvas>
      </div>
      <div style="text-align:center">
        Point Differential: <b>+${props.PointDifferential}</b>
      </div>
      <div id="chart">
        <canvas id="pointDifferentialChart"></canvas>
      </div>
      <div style="text-align:center; color:${props.COLOR};">
        <font size="3">
          <a href="${props.BESTMOMENT}" target="_blank" style="text-align:center; color:${props.COLOR}; text-decoration:none;">Highlights</a>
        </font>
      </div>
      <br>
    </div>`;
  }).addTo(map);

  boundary_geojson.on('popupopen', function(e) {
    console.log('propagatedFrom', e.propagatedFrom);

    const props = e.propagatedFrom.feature.properties;

    const winLossData = {
      labels: ["Losses", "Wins"],
      datasets: [{
        data: [props.LOSSES, props.WINS],
        backgroundColor: ["#B0B7BC", "#002244"]
      }]
    };

    const winLossCtx = $("#winLossChart");
    new Chart(winLossCtx, {
      type: 'pie',
      data: winLossData,
      options: {
        legend: {
          display: false
        }
      }
    });

    const pointsData = {
      labels: ["Points Allowed", "Points Scored"],
      datasets: [{
        data: [props.POINTS_OPP, props.POINTS_SCORED],
        backgroundColor: ["#B0B7BC", "#002244"]
      }]
    };

    const pointDifferentialCtx = $("#pointDifferentialChart");
    new Chart(pointDifferentialCtx, {
      type: 'pie',
      data: pointsData,
      options: {
        legend: {
          display: false
        }
      }
    });
  });

  const baseUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/3352342/';

  teamLogos.forEach(team => {
    L.imageOverlay(`${baseUrl}${team.url}`, team.bounds, {
      pane: "logoPane",
    })
    .setOpacity(team.opacity)
    .addTo(map);
  });
});
