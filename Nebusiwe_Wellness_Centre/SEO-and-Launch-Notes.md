# Nebusiwe Wellness Centre: launch notes

## 1. Replace these before the site goes live

| What | Where | Why |
|---|---|---|
| `https://www.example.com` | `sitemap.xml`, `robots.txt`, `og:image` / JSON-LD in every page head | Search engines need your real web address. Use Find and Replace across the folder. |
| `YOUR_FORM_ID` | `enquiry.html`, form `action="https://formspree.io/f/YOUR_FORM_ID"` | Sign up free at formspree.io, create a form, paste its address here. Until then the enquiry form runs in **demo mode** and nothing is delivered (the page says so and offers an "Email this enquiry" button). |
| Prices, minutes, walk-in / appointment | `js/data.js` | These are **placeholders** I made up so the cost and availability features work. Put in the clinic's real figures. |
| Phone number | `contact.html`, footer, `js/data.js` | Your Contact page said **011 634 3030**, but the services poster and welcome video show **010 634 3030**. Confirm which is correct. |
| Postcode | not shown on the site | Old Contact page said 1559, the poster says 1560. Add the right one once confirmed. |
| Delmas map pin | `js/data.js` (`branches`) | It marks the town centre only. Replace the latitude and longitude with the exact Griessel Street position. |
| "PDP assessment" description | `js/data.js` | I assumed PDP means professional driving permit. Correct it if not. |

## 2. What changed (matches the brief)

**Interactive elements**: FAQ accordion (home), tabs (about), modal (service details), lightbox gallery, interactive Leaflet map with two branches, location "How far am I?" button, CSS and JS animations (hero entrance, accordion, tabs, modal, cards), DOM-built content throughout.
**Dynamic content**: services load from `js/data.js`, with search, category filters and sorting. Enquiry time slots rebuild themselves from the chosen date and service.
**Forms**: HTML5 attributes + JavaScript rules, messages next to each field plus a summary, live character counters, AJAX (`fetch`) submit on the enquiry form with an estimated cost and availability response, and a compiled email on the contact form that the visitor sends to busiwane@gmail.com.
**On-page SEO**: unique title and meta description per page, one `h1` per page with `h2`/`h3` below, descriptive image file names and alt text, clean page names, internal links between pages, mobile viewport tag, Open Graph tags, and LocalBusiness structured data.
**Technical**: `robots.txt`, `sitemap.xml`, `.htaccess` (security headers, compression, caching, redirects from the old page names), Content-Security-Policy on every page, safe text handling (no `innerHTML` with visitor input), hidden spam-trap field.
**Speed**: welcome video 9.5 MB to 2.9 MB (loads only when played), images converted to WebP, lazy loading, scripts deferred.

Renamed: `gallary.html` to `gallery.html`, `enquiries.html` to `enquiry.html` (the brief uses that name). Old addresses redirect on Apache hosting.

## 3. Off-page SEO (actions for the clinic, not code)

**Local SEO (do this first, it has the biggest effect)**
1. Claim and complete the clinic's **Google Business Profile**: both branches, hours, phone, services, photos (use the gallery images).
2. Keep the name, address and phone number **identical** everywhere (site, Google, Facebook, directories).
3. Ask satisfied patients to leave Google reviews, and reply to each one.
4. Add the clinic to South African directories (Yellow Pages SA, Medpages, Cylex, Hotfrog) with a link to the site.

**Backlinks**
- Ask the local municipality, community and church pages, local business forums and any suppliers or employers you work with to link to the site.
- Offer a short health tip article to a local community newsletter or news site, with a link back.

**Social media**
- Create a Facebook page (and Instagram or TikTok, since the welcome video already exists). Link to the website from the bio.
- Post regularly: opening hours, health awareness days, short clips. The footer share buttons make it easy for visitors to share pages.

## 4. Keywords used in the content
clinic in Springs, primary healthcare Springs Gauteng, wellness centre, family clinic, baby wellness, antenatal and postnatal care, HIV testing and counselling, pap smear, circumcision, travel clinic, workplace health, Delmas clinic.
Check them with Google Keyword Planner or Google Trends and adjust wording as needed.

## 5. Note on libraries
Everything is plain JavaScript, so the accordion, tabs, modal and forms work offline. Only the map needs the internet (Leaflet from cdnjs plus OpenStreetMap tiles). If it cannot load, visitors get direction links instead.
