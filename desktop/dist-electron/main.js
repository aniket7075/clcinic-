import { BrowserWindow as e, app as t } from "electron";
import * as n from "path";
import { fileURLToPath as r } from "url";
//#region electron/main.ts
var i = r(import.meta.url), a = n.dirname(i), o;
function s() {
	o = new e({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: !0,
			contextIsolation: !1
		},
		titleBarStyle: "hiddenInset"
	}), t.isPackaged ? o.loadFile(n.join(a, "../dist/index.html")) : (o.loadURL("http://localhost:5173"), o.webContents.openDevTools()), o.on("closed", () => {
		o = null;
	});
}
t.on("ready", s), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), t.on("activate", () => {
	o === null && s();
});
//#endregion
export {};
