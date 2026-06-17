import { BrowserWindow as e, app as t } from "electron";
import * as n from "path";
//#region electron/main.ts
var r;
function i() {
	r = new e({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: !0,
			contextIsolation: !1
		},
		titleBarStyle: "hiddenInset"
	}), t.isPackaged ? r.loadFile(n.join(__dirname, "../dist/index.html")) : (r.loadURL("http://localhost:5173"), r.webContents.openDevTools()), r.on("closed", () => {
		r = null;
	});
}
t.on("ready", i), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), t.on("activate", () => {
	r === null && i();
});
//#endregion
export {};
