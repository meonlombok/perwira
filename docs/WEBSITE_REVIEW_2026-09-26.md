# Perwira Visa Website Review

Date: 26 September 2026

## What changed

- Added `/guides/investing-in-lombok/` as a completed starting guide for foreign investors.
- Updated the homepage title, description, H1 and investor path; it now links to the starting guide and the existing moving-and-living guide.
- Updated the guide hub title, description, introduction and cards so readers can start with the investor sequence.
- Updated titles, descriptions and H1s for business setup, property, immigration, work and accounting pages.
- Updated the About title and H1 to say `Established in 1998`, and removed the unsupported claim that all services had more than 25 years of experience.
- Changed the contact action label to `Continue to WhatsApp`. The form still prepares a message locally; the visitor must review and press Send in WhatsApp.
- Removed the homepage `SearchAction` because the site has no search endpoint.
- Added the new guide to `sitemap.xml`.

The active root website was changed. `Ver1/` and `ver2/` were not changed.

## Official sources checked

Checked on 26 September 2026:

- Google Search Central: people-first content. Used to keep the new guide useful to investors rather than writing to a word count or search phrase list.
- Google Search Central: title links. Used to make titles descriptive, distinct and consistent with the visible H1.
- Google Search Central: LocalBusiness structured data. Used as a constraint. No LocalBusiness markup was added because business type and public opening hours were not confirmed and the existing homepage markup does not visibly present a complete local business profile.
- Directorate General of Immigration: visa application information and stay permit information. Used for links and cautious wording around visa, ITAS/KITAS and purpose of stay.
- OSS: KBLI and risk-based business licensing context. Used for the guide's general explanation of KBLI and NIB.
- Directorate General of Legal Administration: limited liability company information. Used as a reference link for the company-setup guide.

No government account, external listing, Search Console property, Google Business Profile, DNS setting or domain ownership was changed.

## Facts still requiring confirmation

- The exact tax reporting, tax advisory and specialist professional scope remains engagement-specific. The accounting page therefore describes direct Perwira Visa accounting and agreed administration without claiming licensed tax advisory status.
- Property checks and legal instruments depend on the specific property, holder, intended use and documents. The property page does not promise transaction security or act as a property catalogue.
- Work and immigration outcomes remain dependent on the applicant, employer, activity, documents and authority decisions.
- No analytics provider or measurement ID was present, so no analytics was added and no event data is sent.

## Checks run

- Checked Git status before editing; the active root worktree had no user changes to preserve.
- Ran `node --check assets/site.js`.
- Validated required headings, canonical metadata, local references on the new guide, the homepage and guide-hub links, and sitemap XML.
- Confirmed `sitemap.xml` contains 16 URLs including the new guide.
- Confirmed the contact action uses the main WhatsApp number `6281932087034` and the form formatter still uses `encodeURIComponent`.

A browser preview and visual checks should still be run locally before publishing. No PageSpeed, Core Web Vitals, Search Console or Rich Results result is claimed here.

## Local preview and maintenance

There is no package manager or build script in the active root project. Preview the static site with any local static server from the repository root, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`. Contact configuration is in `contact/index.html`, `assets/site.js` and `assets/enquiry.js`. The site does not send form data to a backend.

For future content changes, update the source HTML page, check its title/H1/canonical and internal links, update `sitemap.xml` only when a URL is added or removed, and record any source-check date only after checking the underlying official page.

## External follow-up for the owner

- Review Search Console coverage and submit the updated sitemap.
- Check Google Business Profile and other directories for old `perwira-visa.com` URLs.
- Confirm the final public service scope for tax, property and any professional referrals before making more specific claims.
- Run a final Rich Results Test and URL Inspection after publishing; these require the live domain and were not run locally.
