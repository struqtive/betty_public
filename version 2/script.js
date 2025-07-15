let map, summaryEl;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: { lat: 0, lng: 0 }
  });
  summaryEl = document.getElementById("summary");
}

function drawViz(data, config) {
  const street = config.street || "Elm Street";
  const radius = config.radiusMeters || 300;
  const rows = data.tables.DEFAULT;

  geocodeStreet(street, centerCoords => {
    map.setCenter(centerCoords);
    let firetruckCount = 0;

    rows.forEach(row => {
      const lat = parseFloat(row[0].value);
      const lng = parseFloat(row[1].value);
      const firetruck = row[2].value === 'true';

      const dist = haversine(centerCoords.lat, centerCoords.lng, lat, lng);
      if (dist < radius) {
        if (firetruck) firetruckCount++;
        new google.maps.Marker({
          map,
          position: { lat, lng },
          icon: firetruck
            ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            : null
        });
      }
    });

    summaryEl.innerText = `🚒 Firetruck Incidents near "${street}": ${firetruckCount}`;
  });
}

function geocodeStreet(street, callback) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: street }, (results, status) => {
    if (status === "OK" && results[0]) {
      const loc = results[0].geometry.location;
      callback({ lat: loc.lat(), lng: loc.lng() });
    } else {
      summaryEl.innerText = `Could not geocode: ${street}`;
    }
  });
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
