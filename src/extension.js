"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = require('node:fs');
const { spawn } = require('child_process');
function activate(context) {
    console.log('Congratulations, your extension "oledb-runner" is now active!');
    const connectionString = 'Provider={Provider};Data Source="{Path}"; Extended Properties="text;HDR=Yes;CharacterSet=65001;FMT=Delimited({Delimiter})";';
    function getConfig() {
        const allConfig = vscode.workspace.getConfiguration("OLEDB-Runner");
        defProvider = allConfig["Default-Provider"];
        defDelimiter = allConfig["Default-Delimiter"];
        engine = allConfig["Engine"];
        defTableCss = allConfig["Table-CSS"];
        imgConsulting = allConfig["Consulting-IMG"];
        imgError = allConfig["Error-IMG"];
    }
    ;
    /**
     * Config variables
     */
    let defProvider = '';
    let defDelimiter = '';
    let defTableCss = '';
    let imgConsulting = '';
    let imgError = '';
    /**
     * Input Variables
     */
    let path = '';
    let provider = '';
    let delimiter = '';
    let engine = '';
    /**
     * Control Panel Variables
     */
    let panel;
    let visible = false;
    /**
     * Creating the first command to configure OLEDB.
     */
    let disposable = vscode.commands.registerCommand('oledb-runner.configPath', async () => {
        // The configuration is collected to update it
        getConfig();
        /**
         * The user is asked to enter the route via keyboard.
         */
        const inputPath = await vscode.window.showInputBox({
            placeHolder: "Write the directory path",
            prompt: "Save the directory where OLEDB will be used."
        });
        /**
         * It is verified that the user has canceled the command by pressing the 'ESC' key
         */
        if (inputPath === undefined) {
            return;
        }
        /**
         * It is checked that the route entered is valid; if not, an error message is sent and the command is called again.
         */
        if (inputPath === '' || !fs.existsSync(inputPath?.replace(/"/gi, ''))) {
            console.log(inputPath);
            vscode.window.showErrorMessage('The specified path does not exist. Please enter a valid route.');
            vscode.commands.executeCommand('oledb-runner.configurarRuta');
            return;
        }
        path = inputPath;
    });
    /**
     * Created the command to set delimiter CSV
     */
    let disposable2 = vscode.commands.registerCommand('oledb-runner.configDelimiter', async () => {
        // The configuration is collected to update it
        getConfig();
        /**
         * The user is asked to enter the file delimiter. If it is empty, the default delimiter will be set.
         */
        const inDelimiter = await vscode.window.showInputBox({
            placeHolder: "Write the delimiter of the CSV.",
            prompt: `Determines the delimiter of CSV files. Default '${defDelimiter}'`
        });
        if (inDelimiter === undefined) {
            if (defDelimiter === undefined || defDelimiter.toString() === '') {
                vscode.window.showErrorMessage('A default delimiter has not been set. Please enter a default delimiter.');
                return;
            }
        }
        delimiter = (inDelimiter || defDelimiter?.toString() || '');
    });
    /**
     * Created the command to set OLEDB provider
     */
    let disposable3 = vscode.commands.registerCommand('oledb-runner.configProvider', async () => {
        // The configuration is collected to update it
        getConfig();
        /**
         * The user is asked to enter the OLEDB provider via keyboard.
         */
        const inProvider = await vscode.window.showInputBox({
            placeHolder: "Escriba el proveedor de OLEDB",
            prompt: `Determina el proveedor de OLEDB. Por defecto '${defProvider}'`
        });
        /**
         * Check that the default provider is not empty
         */
        if (inProvider === undefined) {
            if (defProvider === undefined || defProvider.toString() === '') {
                vscode.window.showErrorMessage('A default provider has not been set. Please enter a default provider.');
                return;
            }
        }
        provider = (inProvider || defProvider || '');
    });
    /**
     * Created the command to run OLEDB
     */
    let disposable4 = vscode.commands.registerCommand('oledb-runner.execute', async () => {
        // The configuration is collected to update it
        getConfig();
        // The path where the executable is is mounted
        const runner = __dirname.substring(0, __dirname.length - 3) + `resources\\Runner-${engine}\\OLEDB-Runner.exe`;
        const tempFile = __dirname.substring(0, __dirname.length - 3) + `resources\\Runner-${engine}\\Temp.html`;
        // The text of the active editor and the selected text are collected. If nothing is selected, the full text will be used.
        const editor = vscode.window.activeTextEditor;
        const selectedText = editor?.document.getText(editor.selection);
        const allText = editor?.document.getText();
        let query = selectedText || allText;
        /**
         * It is checked that the 'path' is filled, otherwise the command will end with an error message
         */
        if (path === '') {
            vscode.window.showErrorMessage('Please enter a path to be able to execute the query. Run the command "Configure Route - OLEDB"');
            return;
        }
        const cs = connectionString.replace("{Provider}", (provider || defProvider)).replace("{Path}", path).replace("{Delimiter}", (delimiter || defDelimiter));
        /**
         * OLEDB executable is released
         */
        const process = spawn(runner, [cs, query, tempFile]);
        /**
         * If webViewPanel is visible don't create more
         */
        if (!visible) {
            panel = vscode.window.createWebviewPanel('viewTable', 'OLEDB', vscode.ViewColumn.Two, {
                retainContextWhenHidden: true,
                enableScripts: true
            });
            visible = true;
        }
        /**
         * Shows a gif while waiting for the query to be performed
         */
        panel.webview.html = `<h1>Consulting...</h1><br><img src="${imgConsulting}" />`;
        /**
         * If the process was executed correctly, a view is created with the returned HTML table
         */
        process.stdout.on('data', (data) => {
            data = fs.readFileSync(tempFile, { encoding: 'utf8' });
            /**
             * Update content of panel
            */
            panel.webview.html = `${defTableCss}${data}`;
            fs.rm(tempFile);
        });
        /**
         * When panel is closed visible is false
         */
        panel.onDidDispose(() => {
            visible = false;
        });
        /**
         * If the process gives an error, a message is sent with the error that occurred.
         */
        process.stderr.on('data', (data) => {
            panel.webview.html = `<h1>ERROR</h1><p>${data}</p><img src="${imgError}" />`;
            vscode.window.showErrorMessage(`Error: ${data}`);
            console.error(`Error: ${data}`);
        });
        /**
         * When the process closes, the console writes that the process ended
         */
        process.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
        });
    });
    /**
     * Variables are called with commands
     */
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
    context.subscriptions.push(disposable4);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map