/* =========================================================
   forms.js - validation + submission for both forms
   enquiry.html  -> validates, sends with AJAX (fetch), then shows
                    an estimated cost and availability for the
                    visitor's chosen service, date and time.
   contact.html  -> validates, compiles an email and lets the
                    visitor send it to the clinic's address.

   Validation has three layers:
     1. HTML5 attributes (required, type, pattern, min/max, length)
     2. Small JavaScript rules for things HTML cannot check
        (names, dates, clinic opening hours)
     3. Friendly messages next to each field + a summary on top
   Everything visitors type is added back to the page with
   textContent, never innerHTML.
   ========================================================= */
(function () {
    'use strict';

    var C = window.NEBUSIWE;
    var T = window.NebusiweTime;

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) { e.className = cls; }
        if (text !== undefined) { e.textContent = text; }
        return e;
    }
    function money(n) { return 'R' + n.toLocaleString('en-ZA'); }
    function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
    function serviceById(id) { return C.services.filter(function (s) { return s.id === id; })[0]; }
    function longDate(iso) {
        var p = iso.split('-');
        return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            .format(new Date(+p[0], +p[1] - 1, +p[2]));
    }
    function dowOf(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); }

    /* ---------- Layer 2: extra rules ---------- */
    var RULES = {
        name: function (v) {
            return /^[\p{L}][\p{L}\s'.\-]{1,59}$/u.test(v) ? '' : 'Use letters only, between 2 and 60 characters. For example: Thandi Mokoena.';
        },
        date: function (v, f) {
            if (f.min && v < f.min) { return 'That date has passed. Choose today or a later date.'; }
            if (f.max && v > f.max) { return 'We can only take enquiries up to 90 days ahead. Choose an earlier date.'; }
            return '';
        },
        subject: function (v) {
            return /[\p{L}\p{N}]/u.test(v) ? '' : 'Add a few words that describe your message.';
        }
    };

    /* ---------- Layer 1 + 2: find the message for one field ---------- */
    function errorFor(f) {
        var label = f.getAttribute('data-label') || 'this field';
        var val = f.value;
        if (f.type === 'checkbox') { return f.checked ? '' : (f.getAttribute('data-missing') || 'Please tick this box to continue.'); }
        if (val === '') { return f.required ? (f.getAttribute('data-missing') || 'Please fill in ' + label + '.') : ''; }
        var v = f.validity;
        if (v.typeMismatch) { return f.type === 'email' ? 'Enter a valid email address, like name@example.com.' : 'Enter a valid ' + label + '.'; }
        if (v.badInput) { return 'Enter a valid ' + label + '.'; }
        if (v.patternMismatch) { return f.getAttribute('data-pattern-msg') || 'Check the format of ' + label + '.'; }
        if (f.minLength > 0 && val.length < f.minLength) {
            return label.charAt(0).toUpperCase() + label.slice(1) + ' needs at least ' + f.minLength + ' characters. You have typed ' + val.length + '.';
        }
        if (f.maxLength > 0 && val.length > f.maxLength) { return 'Please keep ' + label + ' under ' + f.maxLength + ' characters.'; }
        if (f.type === 'number') {
            var n = Number(val);
            if (f.min !== '' && n < Number(f.min)) { return 'Enter ' + f.min + ' or more.'; }
            if (f.max !== '' && n > Number(f.max)) { return 'Enter ' + f.max + ' or fewer. For bigger groups, please call us.'; }
            if (!Number.isInteger(n)) { return 'Enter a whole number.'; }
        }
        var rule = f.getAttribute('data-rule');
        if (rule && RULES[rule]) { return RULES[rule](val, f); }
        return '';
    }

    function setError(f, msg) {
        var out = document.getElementById(f.id + '-error');
        if (msg) {
            out.textContent = msg;
            out.hidden = false;
            f.setAttribute('aria-invalid', 'true');
        } else {
            out.textContent = '';
            out.hidden = true;
            f.removeAttribute('aria-invalid');
        }
    }

    /* ---------- Layer 3: wire up a form ---------- */
    function setupForm(form, onValid) {
        form.noValidate = true;   // we show our own messages instead of the browser's pop-ups
        var fields = Array.prototype.slice.call(form.querySelectorAll('[data-validate]'));
        var summary = form.querySelector('.form-summary');
        var status = form.querySelector('.form-status');
        var submitBtn = form.querySelector('button[type="submit"]');
        var hp = form.querySelector('.hp input');
        var lastSent = 0;

        function check(f, trim) {
            if (trim && f.type !== 'checkbox' && f.tagName !== 'SELECT') { f.value = f.value.trim(); }
            var msg = errorFor(f);
            setError(f, msg);
            return msg;
        }

        fields.forEach(function (f) {
            var liveEvent = (f.tagName === 'SELECT' || f.type === 'checkbox' || f.type === 'date') ? 'change' : 'input';
            f.addEventListener('blur', function () { if (f.value !== '') { check(f, true); } });
            f.addEventListener(liveEvent, function () { if (f.getAttribute('aria-invalid')) { check(f, false); } });
        });

        // live character counters
        form.querySelectorAll('[data-counter]').forEach(function (ta) {
            var out = document.getElementById(ta.id + '-counter');
            function show() { out.textContent = ta.value.length + ' of ' + ta.maxLength + ' characters'; }
            ta.addEventListener('input', show);
            show();
            ta._refreshCounter = show;
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var problems = [];
            fields.forEach(function (f) {
                var msg = check(f, true);
                if (msg) { problems.push({ field: f, msg: msg }); }
            });

            if (problems.length) {
                summary.textContent = '';
                summary.appendChild(el('p', '', 'Please fix ' + plural(problems.length, 'problem') + ' before sending:'));
                var ul = el('ul');
                problems.forEach(function (p) {
                    var li = el('li');
                    var a = el('a', '', p.msg);
                    a.href = '#' + p.field.id;
                    a.addEventListener('click', function (ev) { ev.preventDefault(); p.field.focus(); });
                    li.appendChild(a);
                    ul.appendChild(li);
                });
                summary.appendChild(ul);
                summary.hidden = false;
                problems[0].field.focus();
                return;
            }
            summary.hidden = true;

            // spam trap: real visitors never see or fill this field
            if (hp && hp.value) { form.reset(); return; }
            // stop accidental double-clicks
            if (Date.now() - lastSent < 3000) { return; }
            lastSent = Date.now();

            onValid({
                form: form, status: status, button: submitBtn,
                data: function () {
                    var d = {};
                    fields.forEach(function (f) { d[f.getAttribute('data-key') || f.name] = f.type === 'checkbox' ? f.checked : f.value; });
                    return d;
                }
            });
        });

        form.addEventListener('reset', function () {
            setTimeout(function () {
                fields.forEach(function (f) { setError(f, ''); if (f._refreshCounter) { f._refreshCounter(); } });
                summary.hidden = true;
                status.textContent = '';
            }, 0);
        });
    }

    /* ---------- AJAX: send JSON with fetch ----------
       The form's action="" attribute holds the address that receives the data.
       While it still says YOUR_FORM_ID the page runs in demo mode (nothing is sent). */
    function isConfigured(form) {
        var url = form.getAttribute('action') || '';
        return /^https?:\/\//.test(url) && !/YOUR_FORM_ID/.test(url);
    }
    function sendAjax(form, payload) {
        if (!isConfigured(form)) {
            return new Promise(function (resolve) { setTimeout(function () { resolve({ demo: true }); }, 900); });
        }
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, 12000);
        return fetch(form.getAttribute('action'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
            signal: ctrl.signal
        }).then(function (r) {
            clearTimeout(timer);
            if (!r.ok) { throw new Error('Server answered ' + r.status); }
            return r.json().catch(function () { return {}; });
        });
    }

    /* =====================================================
       ENQUIRY FORM
       ===================================================== */
    var enq = document.getElementById('enquiry-form');
    if (enq) {
        var serviceEl = document.getElementById('enq-service');
        var dateEl = document.getElementById('enq-date');
        var timeEl = document.getElementById('enq-time');
        var timeHint = document.getElementById('enq-time-hint');
        var panel = document.getElementById('enquiry-response');

        // fill the service list from the data (grouped by category)
        var groups = {};
        C.services.forEach(function (s) {
            if (!groups[s.category]) {
                groups[s.category] = el('optgroup');
                groups[s.category].label = s.category;
                serviceEl.appendChild(groups[s.category]);
            }
            var o = el('option', '', s.name);
            o.value = s.id;
            groups[s.category].appendChild(o);
        });
        var other = el('option', '', 'Something else');
        other.value = 'other';
        serviceEl.appendChild(other);

        // allowed dates: today up to 90 days ahead (South African time)
        var today = T.sastNow().iso;
        var p = today.split('-');
        var limit = new Date(+p[0], +p[1] - 1, +p[2] + 90);
        dateEl.min = today;
        dateEl.max = limit.getFullYear() + '-' + String(limit.getMonth() + 1).padStart(2, '0') + '-' + String(limit.getDate()).padStart(2, '0');

        // time slots follow the date and the service (DOM built on the fly)
        function slotMinutes() { var s = serviceById(serviceEl.value); return s ? s.minutes : 30; }
        function rebuildSlots() {
            var keep = timeEl.value;
            timeEl.textContent = '';
            var first = el('option', '', 'Choose a time');
            first.value = '';
            timeEl.appendChild(first);
            var d = dateEl.value;
            if (!d || errorFor(dateEl)) {
                timeEl.disabled = true;
                first.textContent = 'Choose a date first';
                timeHint.textContent = 'Slots match our opening hours for the day you pick.';
                return;
            }
            var h = T.hoursFor(dowOf(d));
            var start = T.toMin(h.open), end = T.toMin(h.close) - slotMinutes();
            if (d === today) { start = Math.max(start, Math.ceil((T.sastNow().minutes + 30) / 30) * 30); }
            var n = 0;
            for (var m = start; m <= end; m += 30) {
                var o = el('option', '', T.fmtMin(m));
                o.value = T.fmtMin(m);
                timeEl.appendChild(o);
                n++;
            }
            timeEl.disabled = n === 0;
            if (n === 0) {
                first.textContent = 'No times left';
                timeHint.textContent = 'There are no time slots left on this day. Please choose another date.';
            } else {
                timeHint.textContent = 'We are open ' + h.open + ' to ' + h.close + ' on ' + T.DAY_NAMES[dowOf(d)] + 's.';
                if (keep) { timeEl.value = keep; }
            }
        }
        dateEl.addEventListener('change', rebuildSlots);
        serviceEl.addEventListener('change', rebuildSlots);
        rebuildSlots();

        // arriving from "Enquire" on the services page pre-selects that service
        var wanted = new URLSearchParams(location.search).get('service');
        if (wanted && (serviceById(wanted) || wanted === 'other')) { serviceEl.value = wanted; rebuildSlots(); }

        /* Build the answer shown after a successful send */
        function showResponse(d, demo) {
            var s = serviceById(d.service);
            var people = parseInt(d.people, 10);
            var first = d.name.split(/\s+/)[0];
            panel.textContent = '';

            panel.appendChild(el('h2', '', 'Thank you, ' + first));
            panel.appendChild(el('p', '', 'Here is what we can tell you now. Our team will reply to ' + d.email + ' to confirm the details.'));
            if (demo) {
                panel.appendChild(el('p', 'demo-note', 'Demo mode: the form is not connected to a mail service yet, so this enquiry was not delivered. Use the email button below to send it to the clinic.'));
            }

            var q = el('div', 'quote');
            var dl = el('dl');
            function row(k, v, cls) {
                dl.appendChild(el('dt', '', k));
                dl.appendChild(el('dd', cls || '', v));
            }
            row('Service', s ? s.name : 'Something else');
            row('People', String(people));
            if (s) {
                var total = s.price * people;
                row('Estimated cost', total === 0 ? 'Free' : money(total), 'big');
                if (people > 1 && s.price > 0) { row('How we worked it out', money(s.price) + ' \u00d7 ' + people + ' people'); }
                row('Time needed', 'About ' + s.minutes + ' minutes per person');
            } else {
                row('Estimated cost', 'We will confirm when we reply');
            }
            row('Your preferred time', longDate(d.date) + ' at ' + d.time);
            q.appendChild(dl);
            panel.appendChild(q);

            var h = T.hoursFor(dowOf(d.date));
            var warn = !s || s.booking === 'appointment';
            var a = el('div', 'avail' + (warn ? ' warn' : ''));
            var msg;
            if (!s) {
                msg = 'We are open ' + h.open + ' to ' + h.close + ' that day. We will check availability for your request and let you know.';
            } else if (s.booking === 'appointment') {
                msg = 'We are open ' + h.open + ' to ' + h.close + ' that day. ' + s.name + ' needs time reserved for you, so your slot is not confirmed until we reply or you call ' + C.phoneDisplay + '.';
            } else {
                msg = 'Good news: ' + s.name + ' is available without an appointment. We are open ' + h.open + ' to ' + h.close + ' that day, so you can come at your preferred time.';
            }
            a.appendChild(el('p', '', msg));
            panel.appendChild(a);
            panel.appendChild(el('p', 'fine-print', 'The cost is an estimate. The final amount depends on what you need on the day, such as tests or medication, and is confirmed at the clinic. Public holidays follow our weekend hours.'));

            var lines = [
                'Enquiry from the website', '',
                'Name: ' + d.name, 'Email: ' + d.email, 'Phone: ' + (d.phone || 'not given'),
                'Service: ' + (s ? s.name : 'Something else'), 'People: ' + people,
                'Preferred time: ' + longDate(d.date) + ' at ' + d.time, '', d.message
            ].join('\n');
            var mail = el('a', 'btn ' + (demo ? 'btn-sun' : 'btn-ghost'), 'Email this enquiry to the clinic');
            mail.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Enquiry: ' + (s ? s.name : 'Something else')) + '&body=' + encodeURIComponent(lines);
            var again = el('button', 'btn btn-primary', 'Make another enquiry');
            again.type = 'button';
            again.addEventListener('click', function () {
                panel.hidden = true;
                enq.hidden = false;
                enq.reset();
                rebuildSlots();
                serviceEl.focus();
            });
            var row2 = el('div', 'btn-row');
            row2.appendChild(mail);
            row2.appendChild(again);
            panel.appendChild(row2);

            enq.hidden = true;
            panel.hidden = false;
            panel.setAttribute('tabindex', '-1');
            panel.focus();
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        setupForm(enq, function (ctx) {
            var d = ctx.data();
            var payload = {
                name: d.name, email: d.email, phone: d.phone, service: d.service,
                serviceName: (serviceById(d.service) || { name: 'Something else' }).name,
                people: d.people, preferredDate: d.date, preferredTime: d.time, message: d.message,
                consent: d.consent, sentAt: new Date().toISOString()
            };
            ctx.button.disabled = true;
            ctx.button.setAttribute('aria-busy', 'true');
            ctx.button.textContent = '';
            ctx.button.appendChild(el('span', 'spinner'));
            ctx.button.appendChild(document.createTextNode('Sending\u2026'));
            ctx.status.textContent = 'Sending your enquiry\u2026';

            sendAjax(enq, payload).then(function (res) {
                ctx.status.textContent = '';
                showResponse(d, !!res.demo);
            }).catch(function () {
                ctx.status.textContent = 'We could not send your enquiry. Please check your internet connection and try again, or call us on ' + C.phoneDisplay + '.';
            }).then(function () {
                ctx.button.disabled = false;
                ctx.button.removeAttribute('aria-busy');
                ctx.button.textContent = 'Get my estimate';
            });
        });
    }

    /* =====================================================
       CONTACT FORM -> compiled email
       ===================================================== */
    var con = document.getElementById('contact-form');
    if (con) {
        var preview = document.getElementById('contact-preview');
        var previewText = document.getElementById('preview-text');
        var sendLink = document.getElementById('send-email');
        var copyBtn = document.getElementById('copy-email');
        var editBtn = document.getElementById('edit-email');
        var current = '';

        setupForm(con, function (ctx) {
            var d = ctx.data();
            var subject = ('[Website] ' + d.type + ': ' + d.subject).replace(/[\r\n]+/g, ' ');
            var body = [
                'Hello Nebusiwe Wellness Centre,', '',
                d.message, '',
                '--',
                'Name: ' + d.name,
                'Email: ' + d.email,
                'Phone: ' + (d.phone || 'not given'),
                'Type of message: ' + d.type,
                'Sent from the website contact form'
            ].join('\n');

            current = 'To: ' + C.email + '\nSubject: ' + subject + '\n\n' + body;
            previewText.textContent = current;
            sendLink.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

            con.hidden = true;
            preview.hidden = false;
            preview.setAttribute('tabindex', '-1');
            preview.focus();
            preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        editBtn.addEventListener('click', function () {
            preview.hidden = true;
            con.hidden = false;
            document.getElementById('con-message').focus();
        });
        copyBtn.addEventListener('click', function () {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(current).then(
                    function () { window.NebusiweUI.toast('Email text copied'); },
                    function () { window.NebusiweUI.toast('Could not copy. Select the text and copy it by hand.'); }
                );
            } else {
                window.NebusiweUI.toast('Could not copy. Select the text and copy it by hand.');
            }
        });
        sendLink.addEventListener('click', function () {
            window.NebusiweUI.toast('Opening your email app\u2026');
        });
    }
})();
