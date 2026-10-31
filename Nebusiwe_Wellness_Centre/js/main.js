/* =========================================================
   main.js - features used on every page
   - mobile menu, back-to-top button, share links
   - live "open / closed" status (South African time)
   - accordion (FAQ), tabs (About), scroll reveal
   - small toast helper used by other scripts
   Everything is plain JavaScript (no libraries needed).
   ========================================================= */
(function () {
    'use strict';

    var C = window.NEBUSIWE;
    document.documentElement.classList.remove('no-js');

    /* ---------- Clinic time helpers (always South African time) ---------- */
    var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    function sastNow() {
        var p = {};
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Johannesburg', weekday: 'short', year: 'numeric', month: '2-digit',
            day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
        return {
            dow: DOW[p.weekday], minutes: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10),
            iso: p.year + '-' + p.month + '-' + p.day
        };
    }
    function toMin(hhmm) { var a = hhmm.split(':'); return parseInt(a[0], 10) * 60 + parseInt(a[1], 10); }
    function hoursFor(dow) { return (dow >= 1 && dow <= 5) ? C.hours.weekday : C.hours.weekend; }
    function fmtMin(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }

    /* Shared with forms.js */
    window.NebusiweTime = { sastNow: sastNow, toMin: toMin, hoursFor: hoursFor, fmtMin: fmtMin, DAY_NAMES: DAY_NAMES };

    /* ---------- Toast message ---------- */
    var toastEl;
    window.NebusiweUI = {
        toast: function (text) {
            if (!toastEl) {
                toastEl = document.createElement('div');
                toastEl.className = 'toast';
                toastEl.setAttribute('role', 'status');
                document.body.appendChild(toastEl);
            }
            toastEl.textContent = text;
            toastEl.classList.add('show');
            clearTimeout(toastEl._t);
            toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
        }
    };

    /* ---------- Mobile menu ---------- */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    /* ---------- Open / closed status + today's row in the hours table ---------- */
    function updateStatus() {
        var now = sastNow();
        var h = hoursFor(now.dow);
        var open = now.minutes >= toMin(h.open) && now.minutes < toMin(h.close);
        var text;
        if (open) {
            text = 'Open now, closes at ' + h.close;
        } else if (now.minutes < toMin(h.open)) {
            text = 'Closed now, opens today at ' + h.open;
        } else {
            text = 'Closed now, opens tomorrow at ' + hoursFor((now.dow + 1) % 7).open;
        }
        document.querySelectorAll('[data-open-status]').forEach(function (el) {
            el.classList.toggle('is-open', open);
            el.classList.toggle('is-closed', !open);
            el.querySelector('.status-text').textContent = text;
        });
        document.querySelectorAll('.hours tr[data-days]').forEach(function (row) {
            var days = row.getAttribute('data-days').split(',');
            row.classList.toggle('is-today', days.indexOf(String(now.dow)) !== -1);
        });
    }
    updateStatus();
    setInterval(updateStatus, 60000);

    /* ---------- Accordion: one panel open at a time ---------- */
    document.querySelectorAll('.accordion').forEach(function (acc) {
        var triggers = acc.querySelectorAll('.acc-trigger');
        triggers.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var wasOpen = btn.getAttribute('aria-expanded') === 'true';
                triggers.forEach(function (t) {
                    t.setAttribute('aria-expanded', 'false');
                    document.getElementById(t.getAttribute('aria-controls')).classList.remove('open');
                });
                if (!wasOpen) {
                    btn.setAttribute('aria-expanded', 'true');
                    document.getElementById(btn.getAttribute('aria-controls')).classList.add('open');
                }
            });
        });
    });

    /* ---------- Tabs (arrow keys, Home/End, and #hash links) ---------- */
    document.querySelectorAll('[data-tabs]').forEach(function (box) {
        var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
        function select(tab, focus) {
            tabs.forEach(function (t) {
                var on = t === tab;
                t.setAttribute('aria-selected', String(on));
                t.tabIndex = on ? 0 : -1;
                document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
            });
            if (focus) { tab.focus(); }
        }
        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () {
                select(tab);
                if (history.replaceState) { history.replaceState(null, '', '#' + tab.getAttribute('aria-controls')); }
            });
            tab.addEventListener('keydown', function (e) {
                var n = null;
                if (e.key === 'ArrowRight') { n = tabs[(i + 1) % tabs.length]; }
                if (e.key === 'ArrowLeft') { n = tabs[(i - 1 + tabs.length) % tabs.length]; }
                if (e.key === 'Home') { n = tabs[0]; }
                if (e.key === 'End') { n = tabs[tabs.length - 1]; }
                if (n) { e.preventDefault(); select(n, true); }
            });
        });
        var fromHash = tabs.filter(function (t) { return '#' + t.getAttribute('aria-controls') === location.hash; })[0];
        select(fromHash || tabs[0]);
        window.addEventListener('hashchange', function () {
            var t = tabs.filter(function (x) { return '#' + x.getAttribute('aria-controls') === location.hash; })[0];
            if (t) { select(t); }
        });
    });

    /* ---------- Scroll reveal (only for elements marked .reveal) ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
            });
        }, { threshold: 0.15 });
        reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Back-to-top button ---------- */
    var top = document.createElement('button');
    top.className = 'to-top';
    top.type = 'button';
    top.setAttribute('aria-label', 'Back to top');
    top.textContent = '\u2191';
    document.body.appendChild(top);
    window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 600); }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0 }); });

    /* ---------- Share links in the footer (social media promotion) ---------- */
    var url = encodeURIComponent(location.href);
    var msg = encodeURIComponent('Nebusiwe Wellness Centre - family clinic in Springs');
    var targets = {
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
        whatsapp: 'https://wa.me/?text=' + msg + '%20' + url,
        x: 'https://twitter.com/intent/tweet?text=' + msg + '&url=' + url
    };
    document.querySelectorAll('[data-share]').forEach(function (a) {
        var t = targets[a.getAttribute('data-share')];
        if (t) { a.href = t; }
    });
})();
