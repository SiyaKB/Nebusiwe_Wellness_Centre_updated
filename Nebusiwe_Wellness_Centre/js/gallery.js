/* =========================================================
   gallery.js - lightbox
   Click a photo to see it larger. Use the arrow buttons, the
   left/right arrow keys, or swipe on a phone. Esc closes it.
   ========================================================= */
(function () {
    'use strict';

    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var box = document.getElementById('lightbox');
    if (!items.length || !box) { return; }

    var img = box.querySelector('img');
    var cap = box.querySelector('figcaption');
    var count = box.querySelector('.lb-count');
    var current = 0;

    function show(i) {
        current = (i + items.length) % items.length;
        var src = items[current].getAttribute('data-full');
        var alt = items[current].querySelector('img').alt;
        img.style.animation = 'none';          // restart the fade-in
        void img.offsetWidth;
        img.style.animation = '';
        img.src = src;
        img.alt = alt;
        cap.textContent = items[current].getAttribute('data-caption');
        count.textContent = (current + 1) + ' of ' + items.length;
        // load the neighbours early so next/previous feels instant
        [current + 1, current - 1].forEach(function (n) {
            var pre = new Image();
            pre.src = items[(n + items.length) % items.length].getAttribute('data-full');
        });
    }
    function open(i) {
        show(i);
        if (typeof box.showModal === 'function') { box.showModal(); } else { box.setAttribute('open', ''); }
    }

    items.forEach(function (btn, i) { btn.addEventListener('click', function () { open(i); }); });
    box.querySelector('.dialog-close').addEventListener('click', function () { box.close(); });
    box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) { box.close(); } });
    box.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { show(current + 1); }
        if (e.key === 'ArrowLeft') { show(current - 1); }
    });

    // swipe support
    var startX = null;
    box.addEventListener('touchstart', function (e) { startX = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
        if (startX === null) { return; }
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) { show(current + (dx < 0 ? 1 : -1)); }
        startX = null;
    }, { passive: true });
})();
