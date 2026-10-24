# M Class Cars

Lightweight responsive showroom website with demo inventory, a direct-to-showroom seller form, and a Google Apps Script receiver for spreadsheet enquiries.

## Run locally

Requires Node.js 18 or newer. No package installation is needed.

```sh
npm start
```

Open http://127.0.0.1:4173. All pages and demo inventory work locally. The enquiry form will not claim success until a Google Apps Script endpoint is configured and confirms the write.

## Connect Google Sheets

### 1. Create or select the spreadsheet

Use a spreadsheet in your Drive that should receive customer enquiries. Its ID is the part between `/d/` and `/edit` in the spreadsheet URL. Keep the spreadsheet private; do not share it publicly.

### 2. Create the Apps Script receiver

1. Create a new Apps Script project at [script.google.com](https://script.google.com/) (or attach one to the target spreadsheet).
2. Copy `apps-script/Code.gs` into the project.
3. In **Project Settings → Script Properties**, add `SPREADSHEET_ID` with the target spreadsheet ID as its value.
4. In the editor, select and run `setupSpreadsheet`. Approve the requested Google authorization. This creates a `Car Enquiries` tab and its header row. Existing sheet data is not cleared.
5. Deploy → **New deployment** → type **Web app**. Select **Execute as: Me**. For a public customer form, the deployment must accept requests from people who are not signed in; Apps Script may label this access “Anyone” or “Anyone, even anonymous.” Anyone with the deployment URL can attempt to submit data, so the script validates all fields, uses a honeypot and short per-phone throttle, and only appends rows. Never share the spreadsheet itself publicly.
6. Deploy, authorize, and copy the Web App URL ending in `/exec`. Do not use the editor-only `/dev` URL for the website.

### 3. Configure the site

Create a local `.env` file beside `server.js`:

```text
APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Restart `npm start`. The browser posts to the local same-origin `/api/enquiries` route; the Node server forwards the request to Apps Script and only shows success after it receives a valid JSON confirmation with a lead ID. This avoids relying on a browser `no-cors` request that cannot confirm a saved row.

Submit one clearly labeled test enquiry and confirm the row appears in the private `Car Enquiries` sheet. Delete the test row manually if it is no longer needed. The sheet has columns for timestamp, reference ID, enquiry type, contact details, vehicle details, source, status, and staff notes. Team members can update `Status` and `Staff Notes` directly in Sheets.

## Production hosting notes

The included Node server is for local use. To run the form online, deploy the frontend and this Node server together on a Node-capable host (or adapt `/api/enquiries` to a same-origin serverless function), then set `APPS_SCRIPT_URL` in the host’s environment settings. Do not expose the spreadsheet ID or Google credentials in client-side JavaScript. Do not use Apps Script JSONP for phone numbers or enquiry data.

Apps Script Content Service redirects responses to a Google-hosted URL. The Node proxy follows that redirect server-side and parses the returned JSON. A static-only host cannot run this proxy; keep the form in a not-connected/error state until a server-side route is deployed.

## Demo inventory

All six cars in `app.js` are fictional placeholders. Replace those entries, prices, features, and demo photos with current verified showroom listings before launch. The About, Privacy, and Terms pages also contain editable copy/placeholders; review them and replace draft policies before publishing.

## Contact configuration

The site currently displays call and WhatsApp actions for **9363700704** and **9698861988**. Confirm which numbers should receive customer calls and WhatsApp enquiries before launch.
