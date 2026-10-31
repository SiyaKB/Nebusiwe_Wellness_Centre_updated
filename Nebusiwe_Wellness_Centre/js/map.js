/* =========================================================
   map.js - interactive map (Leaflet + OpenStreetMap)
   - a pin for each branch with a pop-up
   - buttons that fly the map to a branch
   - "How far am I?" uses the visitor's location (only if they
     allow it) and shows the straight-line distance
   - directions links open Google Maps
   ========================================================= */
(function () {
    'use strict';

    var mapEl = document.getElementById('map');
    if (!mapEl) { return; }

    var branches = window.NEBUSIWE.branches;
    var result = document.getElementById('map-result');

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) { e.className = cls; }
        if (text !== undefined) { e.textContent = text; }
        return e;
    }
    function directionsUrl(b) { return 'https://www.google.com/maps/dir/?api=1&destination=' + b.lat + ',' + b.lng; }

    /* Leaflet failed to load (offline, or blocked)? Show a plain link instead. */
    if (typeof L === 'undefined') {
        var loc = document.getElementById('locate-me');
        if (loc) { loc.hidden = true; }
        mapEl.classList.add('map-fallback');
        mapEl.appendChild(el('p', '', 'The interactive map could not load. You can still get directions:'));
        var ul = el('ul', 'plain-list');
        branches.forEach(function (b) {
            var li = el('li');
            var a = el('a', '', 'Directions to ' + b.name);
            a.href = directionsUrl(b);
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            li.appendChild(a);
            ul.appendChild(li);
        });
        mapEl.appendChild(ul);
        return;
    }

    var map = L.map(mapEl, { scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var markers = [];
    branches.forEach(function (b) {
        var icon = L.divIcon({ className: '', html: '<div class="pin"></div>', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28] });
        var m = L.marker([b.lat, b.lng], { icon: icon, title: b.name, keyboard: true }).addTo(map);
        var pop = el('div');
        pop.appendChild(el('strong', '', b.name));
        pop.appendChild(el('br'));
        pop.appendChild(document.createTextNode(b.address));
        if (b.approximate) {
            pop.appendChild(el('br'));
            pop.appendChild(el('em', '', 'Pin is approximate (town centre).'));
        }
        pop.appendChild(el('br'));
        var a = el('a', '', 'Get directions');
        a.href = directionsUrl(b);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        pop.appendChild(a);
        m.bindPopup(pop);
        markers.push(m);
    });

    var bounds = L.latLngBounds(branches.map(function (b) { return [b.lat, b.lng]; }));
    map.fitBounds(bounds, { padding: [50, 50] });
    markers[0].openPopup();

    /* Let people zoom with the scroll wheel only after clicking the map,
       so the page still scrolls normally. */
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

    /* ---------- Buttons: fly to a branch ---------- */
    var tools = document.getElementById('map-tools');
    branches.forEach(function (b, i) {
        var btn = el('button', 'btn btn-ghost btn-small', 'Show ' + b.short);
        btn.type = 'button';
        btn.addEventListener('click', function () {
            map.flyTo([b.lat, b.lng], 15, { duration: 1.1 });
            markers[i].openPopup();
        });
        tools.appendChild(btn);
    });
    

    /* ---------- "How far am I?" ---------- */
    function km(lat1, lng1, lat2, lng2) {
        var R = 6371, rad = Math.PI / 180;
        var dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 2 * R * Math.asin(Math.sqrt(a));
    }
    var locate = document.getElementById('locate-me');
    if (locate) {
        if (!('geolocation' in navigator)) { locate.hidden = true; }
        locate.addEventListener('click', function () {
            result.textContent = 'Finding your location\u2026';
            navigator.geolocation.getCurrentPosition(function (pos) {
                var lat = pos.coords.latitude, lng = pos.coords.longitude;
                var best = null;
                branches.forEach(function (b, i) {
                    var d = km(lat, lng, b.lat, b.lng);
                    if (!best || d < best.d) { best = { d: d, b: b, i: i }; }
                });
                L.circleMarker([lat, lng], { radius: 8, color: '#1b4431', fillColor: '#2f6f4f', fillOpacity: 1 }).addTo(map).bindPopup('You are here');
                map.flyToBounds(L.latLngBounds([[lat, lng], [best.b.lat, best.b.lng]]), { padding: [60, 60], duration: 1.1 });
                result.textContent = 'Closest branch: ' + best.b.name + ', about ' + best.d.toFixed(1) + ' km away in a straight line. Driving distance will be longer.';
            }, function () {
                result.textContent = 'We could not get your location. You can allow location access in your browser, or use the directions links instead.';
            }, { timeout: 10000 });
        });
    }
})();
