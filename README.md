# MedCheck: openFDA Drug Safety & Adverse Event Explorer

## What It Is
MedCheck is a small web app for looking up what's been reported about a medication. Type in a drug name and it pulls adverse event reports from the openFDA Drug Adverse Event API, showing the reactions listed for each report, how many there are, and whether the report was flagged as serious. You can narrow the results to `All Reports`, `Serious`, or `Non-Serious`, and sort them by `Default Order`, `Most Reactions`, or `Drug Name (A–Z)`. If something goes wrong (a bad search, no results, a network hiccup), the app tells you plainly instead of just sitting there. A reset button clears everything and puts you back at the start.

It's built with plain HTML5, CSS3, and modern JavaScript, with no frameworks.

- **Live site (Lb01):** `http://<LB01_IP_OR_DOMAIN>/`
- **Demo video (under 2 minutes):** `https://<DEMO_VIDEO_URL>`

## Credits & Resources
- **openFDA Drug Adverse Event API**, from the U.S. Food and Drug Administration: https://open.fda.gov/apis/drug/event/. You can sign up for a free API key at https://api.data.gov/signup/.
- **MDN Web Docs**, for reference on HTML5, CSS3, JavaScript, and the Fetch API: https://developer.mozilla.org/

## Keeping the API Key Safe
- `config.js` holds the real openFDA key and is listed in `.gitignore`, so it never gets committed to the public repo.
- `config.example.js` is committed with a placeholder (`YOUR_OPENFDA_API_KEY_HERE`). If you clone the project, copy it to `config.js` and swap in your own key.
- The key I actually used is in the comment box of my assignment submission, not in any tracked file.

## Running It Locally
1. Clone the repo and move into the project folder:
   ```bash
   git clone https://github.com/iangw00/medcheck.git
   cd medcheck
   ```
