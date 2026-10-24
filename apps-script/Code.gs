/**
 * M24 enquiry receiver.
 * Create a Google Apps Script project, paste this file, set SPREADSHEET_ID in
 * Project Settings > Script Properties, run setupSpreadsheet(), then deploy
 * as a Web App. This endpoint only appends enquiries; it never returns leads.
 */
const SHEET_NAME = 'Car Enquiries';
const HEADERS = [
  'Submitted At (UTC)', 'Lead ID', 'Type', 'Customer Name', 'Mobile',
  'Car Make / Model', 'Variant', 'Year', 'Kilometres', 'Fuel Type',
  'Transmission', 'Condition / Notes', 'Vehicle Slug', 'Vehicle Name',
  'Source Page', 'Status', 'Staff Notes'
];

function doGet() {
  return json_({ ok: true, service: 'M24 enquiry receiver', ready: Boolean(getSpreadsheetId_()) });
}

function setupSpreadsheet() {
  const id = getSpreadsheetId_();
  if (!id) throw new Error('Add SPREADSHEET_ID in Apps Script Project Settings > Script Properties first.');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#eaf0ff');
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return `Ready: ${SHEET_NAME}`;
}

function doPost(e) {
  try {
    const bodyText = e && e.postData && e.postData.contents;
    if (!bodyText || bodyText.length > 16000) return json_({ ok: false, error: 'Invalid or oversized request.' });
    const lead = JSON.parse(bodyText);
    const error = validate_(lead);
    if (error) return json_({ ok: false, error });
    if (!getSpreadsheetId_()) return json_({ ok: false, error: 'Spreadsheet is not configured.' });

    const cache = CacheService.getScriptCache();
    const throttleKey = `lead_${lead.mobile}`;
    if (cache.get(throttleKey)) return json_({ ok: false, error: 'Please wait before submitting another enquiry.' });
    cache.put(throttleKey, '1', 12);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.openById(getSpreadsheetId_());
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        sheet.setFrozenRows(1);
      }
      const leadId = Utilities.getUuid();
      const row = [
        new Date(), leadId, lead.inquiryType, safeCell_(lead.customerName), safeCell_(lead.mobile),
        safeCell_(lead.carMakeModel), safeCell_(lead.variant), safeCell_(lead.year),
        safeCell_(lead.kilometres), safeCell_(lead.fuelType), safeCell_(lead.transmission),
        safeCell_(lead.conditionNotes), safeCell_(lead.vehicleSlug), safeCell_(lead.vehicleName),
        safeCell_(lead.sourcePage), 'NEW', ''
      ];
      const target = sheet.getLastRow() + 1;
      sheet.getRange(target, 1, 1, row.length).setValues([row]);
      sheet.getRange(target, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
      sheet.getRange(target, 2, 1, 1).setNumberFormat('@');
      sheet.getRange(target, 5, 1, 1).setNumberFormat('@');
      return json_({ ok: true, leadId });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error('Enquiry write failed:', String(err && err.message || err));
    return json_({ ok: false, error: 'The enquiry could not be saved. Please try again or call the showroom.' });
  }
}

function validate_(lead) {
  if (!lead || typeof lead !== 'object' || Array.isArray(lead)) return 'Invalid enquiry.';
  if (String(lead.website || '').trim()) return 'Invalid enquiry.'; // honeypot
  if (lead.consent !== true) return 'Contact consent is required.';
  const types = ['SELL', 'BUY', 'TEST_DRIVE', 'CONTACT'];
  if (!types.includes(String(lead.inquiryType || ''))) return 'Invalid enquiry type.';
  const mobile = String(lead.mobile || '').replace(/\D/g, '');
  if (!/^\d{10}$/.test(mobile)) return 'Enter a valid 10-digit mobile number.';
  if (lead.inquiryType === 'SELL') {
    if (!text_(lead.carMakeModel, 100)) return 'Car make and model are required.';
    if (!text_(lead.year, 12)) return 'Manufacturing year is required.';
    if (!/^\d{1,7}$/.test(String(lead.kilometres || ''))) return 'Enter valid kilometres driven.';
  }
  const limits = { customerName:100, carMakeModel:100, variant:80, year:12, kilometres:8,
    fuelType:30, transmission:30, conditionNotes:1000, vehicleSlug:120, vehicleName:160, sourcePage:200 };
  for (const key in limits) if (String(lead[key] || '').length > limits[key]) return 'One or more fields are too long.';
  return '';
}

function text_(value, max) {
  const text = String(value || '').trim();
  return Boolean(text) && text.length <= max;
}

function safeCell_(value) {
  const text = String(value == null ? '' : value).trim();
  // Prevent user-entered values from being interpreted as spreadsheet formulas.
  return /^[=+@\-]/.test(text) ? `'${text}` : text;
}

function getSpreadsheetId_() {
  return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
