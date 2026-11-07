/**
 * Backend Google Sheet per l'app Allenamento.
 * 1. Incolla questo file in Estensioni → Apps Script del tuo Google Sheet.
 * 2. Esegui una volta la funzione setup(): crea i fogli e genera la chiave (la trovi nel registro).
 * 3. Esegui il deployment come App web: Esegui come "Me", accesso "Chiunque".
 */

var DATA_SHEET = "_dati";
var CHUNK = 40000;

function setup() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty("KEY");
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, "").slice(0, 20);
    props.setProperty("KEY", key);
  }
  var ss = SpreadsheetApp.getActive();
  ["Palestra", "Corsa"].forEach(function (n) { if (!ss.getSheetByName(n)) ss.insertSheet(n); });
  var d = ss.getSheetByName(DATA_SHEET) || ss.insertSheet(DATA_SHEET);
  d.hideSheet();
  Logger.log("La tua chiave è: " + key);
  return key;
}

function doGet(e) { return handle_(e, null); }
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: "richiesta non valida" }); }
  return handle_(e, body);
}

function handle_(e, body) {
  var expected = PropertiesService.getScriptProperties().getProperty("KEY");
  var key = (body && body.key) || (e && e.parameter && e.parameter.key);
  if (!expected) return out_({ ok: false, error: "esegui prima la funzione setup()" });
  if (key !== expected) return out_({ ok: false, error: "chiave non valida" });
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (body && body.state) {
      saveState_(body.state);
      if (body.tables) writeTables_(body.tables);
      return out_({ ok: true });
    }
    return out_({ ok: true, state: loadState_() });
  } finally {
    lock.releaseLock();
  }
}

function saveState_(state) {
  var ss = SpreadsheetApp.getActive();
  var d = ss.getSheetByName(DATA_SHEET) || ss.insertSheet(DATA_SHEET);
  var json = JSON.stringify(state), rows = [];
  for (var i = 0; i < json.length; i += CHUNK) rows.push([json.slice(i, i + CHUNK)]);
  d.clearContents();
  if (rows.length) d.getRange(1, 1, rows.length, 1).setValues(rows);
}

function loadState_() {
  var d = SpreadsheetApp.getActive().getSheetByName(DATA_SHEET);
  if (!d || d.getLastRow() < 1) return null;
  var v = d.getRange(1, 1, d.getLastRow(), 1).getValues().map(function (r) { return r[0]; }).join("");
  if (!v) return null;
  try { return JSON.parse(v); } catch (err) { return null; }
}

function writeTables_(tables) {
  var ss = SpreadsheetApp.getActive();
  Object.keys(tables).forEach(function (name) {
    var rows = tables[name];
    if (!rows || !rows.length) return;
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clearContents();
    var w = rows[0].length;
    rows = rows.map(function (r) { r = r.slice(0, w); while (r.length < w) r.push(""); return r; });
    sh.getRange(1, 1, rows.length, w).setValues(rows);
    sh.getRange(1, 1, 1, w).setFontWeight("bold");
    sh.setFrozenRows(1);
  });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
