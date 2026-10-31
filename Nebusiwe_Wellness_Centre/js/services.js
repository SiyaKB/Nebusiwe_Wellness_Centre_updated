/* =========================================================
   services.js - dynamic services list
   Loads the services from js/data.js, then lets the visitor
   search, filter by category, sort, and open a details pop-up.
   All text is added with textContent (never innerHTML), so
   nothing a visitor types can inject code into the page.
   ========================================================= */
(function () {
    'use strict';

    var SERVICES = window.NEBUSIWE.services;
    var grid = document.getElementById('service-grid');
    if (!grid) { return; }

    var searchEl = document.getElementById('service-search');
    var sortEl = document.getElementById('service-sort');
    var chipsEl = document.getElementById('service-chips');
    var countEl = document.getElementById('service-count');
    var emptyEl = document.getElementById('service-empty');
    var resetBtn = document.getElementById('service-reset');
    var dialog = document.getElementById('service-dialog');

    var state = { query: '', category: 'All', sort: 'name' };

    function slug(s) { return s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    function money(n) { return n === 0 ? 'Free' : 'R' + n.toLocaleString('en-ZA'); }
    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) { e.className = cls; }
        if (text !== undefined) { e.textContent = text; }
        return e;
    }

    /* ---------- Category chips (built from the data) ---------- */
    var categories = ['All'];
    SERVICES.forEach(function (s) { if (categories.indexOf(s.category) === -1) { categories.push(s.category); } });

    function buildChips() {
        chipsEl.textContent = '';
        categories.forEach(function (cat) {
            var n = cat === 'All' ? SERVICES.length : SERVICES.filter(function (s) { return s.category === cat; }).length;
            var b = el('button', 'chip', cat + ' (' + n + ')');
            b.type = 'button';
            b.setAttribute('aria-pressed', String(state.category === cat));
            b.addEventListener('click', function () { state.category = cat; update(); });
            chipsEl.appendChild(b);
        });
    }

    /* ---------- Filter + sort ---------- */
    function visible() {
        var words = state.query.toLowerCase().split(/\s+/).filter(Boolean);
        var list = SERVICES.filter(function (s) {
            if (state.category !== 'All' && s.category !== state.category) { return false; }
            var hay = (s.name + ' ' + s.description + ' ' + s.category).toLowerCase();
            return words.every(function (w) { return hay.indexOf(w) !== -1; });
        });
        list.sort(function (a, b) {
            if (state.sort === 'price-low') { return a.price - b.price || a.name.localeCompare(b.name); }
            if (state.sort === 'price-high') { return b.price - a.price || a.name.localeCompare(b.name); }
            return a.name.localeCompare(b.name);
        });
        return list;
    }

    /* ---------- Card ---------- */
    function card(s, i) {
        var li = el('li', 'service-card');
        li.style.animationDelay = Math.min(i, 8) * 30 + 'ms';
        li.appendChild(el('p', 'tag', s.category));
        li.appendChild(el('h3', '', s.name));
        li.appendChild(el('p', 'desc', s.description));
        var price = el('p', 'price', 'From ' + money(s.price) + ' ');
        price.appendChild(el('small', '', '\u2022 about ' + s.minutes + ' min'));
        li.appendChild(price);
        var meta = el('p', '');
        meta.appendChild(el('span', 'badge' + (s.booking === 'appointment' ? ' appt' : ''), s.booking === 'appointment' ? 'Book ahead' : 'Walk-in welcome'));
        li.appendChild(meta);
        var row = el('div', 'btn-row');
        var more = el('button', 'btn btn-ghost btn-small', 'Details');
        more.type = 'button';
        more.setAttribute('aria-label', 'Details for ' + s.name);
        more.addEventListener('click', function () { openDetails(s); });
        var enq = el('a', 'btn btn-primary btn-small', 'Enquire');
        enq.href = 'enquiry.html?service=' + encodeURIComponent(s.id) + '#enquiry-form';
        enq.setAttribute('aria-label', 'Enquire about ' + s.name);
        row.appendChild(more);
        row.appendChild(enq);
        li.appendChild(row);
        return li;
    }

    /* ---------- Render ---------- */
    function update() {
        var list = visible();
        grid.textContent = '';
        list.forEach(function (s, i) { grid.appendChild(card(s, i)); });
        countEl.textContent = list.length === SERVICES.length
            ? 'Showing all ' + list.length + ' services'
            : 'Showing ' + list.length + ' of ' + SERVICES.length + ' services';
        emptyEl.hidden = list.length !== 0;
        grid.hidden = list.length === 0;
        buildChips();
        if (history.replaceState) {
            history.replaceState(null, '', state.category === 'All' ? location.pathname : '#' + slug(state.category));
        }
    }

    /* ---------- Details pop-up (native <dialog>) ---------- */
    function openDetails(s) {
        document.getElementById('dlg-title').textContent = s.name;
        document.getElementById('dlg-text').textContent = s.description;
        document.getElementById('dlg-category').textContent = s.category;
        document.getElementById('dlg-price').textContent = 'From ' + money(s.price) + ' per person';
        document.getElementById('dlg-time').textContent = 'About ' + s.minutes + ' minutes';
        document.getElementById('dlg-booking').textContent = s.booking === 'appointment'
            ? 'Please book ahead so we can reserve time for you'
            : 'No booking needed during opening hours';
        document.getElementById('dlg-enquire').href = 'enquiry.html?service=' + encodeURIComponent(s.id) + '#enquiry-form';
        if (typeof dialog.showModal === 'function') { dialog.showModal(); } else { dialog.setAttribute('open', ''); }
    }
    dialog.querySelector('.dialog-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) { dialog.close(); } });

    /* ---------- Controls ---------- */
    var timer;
    searchEl.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { state.query = searchEl.value.trim(); update(); }, 150);
    });
    sortEl.addEventListener('change', function () { state.sort = sortEl.value; update(); });
    resetBtn.addEventListener('click', function () {
        state = { query: '', category: 'All', sort: state.sort };
        searchEl.value = '';
        update();
        searchEl.focus();
    });

    /* A link such as services.html#mother-and-child opens with that filter on */
    function fromHash() {
        var wanted = location.hash.replace('#', '');
        categories.forEach(function (c) { if (slug(c) === wanted) { state.category = c; } });
    }
    fromHash();
    window.addEventListener('hashchange', function () { fromHash(); update(); });

    update();
})();
