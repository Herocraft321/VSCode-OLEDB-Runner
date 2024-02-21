import * as vscode from 'vscode';
const fs = require('node:fs');
const { spawn } = require('child_process'); 


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "oledb-runner" is now active!');

	const connectionString = 'Provider={Provider};Data Source="{Path}"; Extended Properties="text;HDR=Yes;CharacterSet=65001;FMT=Delimited({Delimiter})";';

	function getConfig (){
		const allConfig = vscode.workspace.getConfiguration();
		defProvider = allConfig.get<string>("OLEDB-Runner.Defaul-Provider") || '';
		defDelimiter = allConfig.get<string>("OLEDB-Runner.Defaul-Delimiter",) || '';
		engine = allConfig.get<string>("OLEDB-Runner.Engine") || '';
	};

	let defProvider = '';
	let defDelimiter = '';

	let path = '';
	let provider = '';
	let delimiter = '';
	let engine = '';
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
		if (inputPath === undefined){
			return;	
		}
		
		/**
		 * It is checked that the route entered is valid; if not, an error message is sent and the command is called again.
		 */
		if (inputPath === '' || !fs.existsSync(inputPath?.replace(/"/gi,''))) {
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

		if (inDelimiter === undefined){
			if(defDelimiter === undefined || defDelimiter.toString() === ''){
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

		if (inProvider === undefined){
			if(defProvider === undefined || defProvider.toString() === ''){
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
		const runner = __dirname.substring(0,__dirname.length -3) + `resources\\Runner-${engine}\\OLEDB-Runner.exe`;

		// The text of the active editor and the selected text are collected. If nothing is selected, the full text will be used.
		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);
		const allText = editor?.document.getText();
		let query = selectedText || allText;
		
		/**
		 * It is checked that the 'ConnectionString' is filled, otherwise the command will end with an error message
		 */
		if (path === ''){
			vscode.window.showErrorMessage('Porfavor introduce una ruta para poder ejecutar la consulta. Ejcuta el comando "Configurar Ruta - OLEDB"');
			return;
		}

		console.log(connectionString);
		console.log(query);

		/**
		 * OLEDB executable is released
		 */
		const process = spawn(runner, [connectionString.replace("{Provider}",provider).replace("{Path}",path).replace("{Delimiter}",delimiter),query]); 

		/**
		 * If the process was executed correctly, a view is created with the returned HTML table
		 */
		process.stdout.on('data', (data: any) => { 
			const panel = vscode.window.createWebviewPanel(
				'viewTable',
				'OLEBD',
				vscode.ViewColumn.Two,
				{
					retainContextWhenHidden:true,
					enableScripts:true
				}
			);
			panel.webview.html = `${data}`; 
		}); 
		
		/**
		 * If the process gives an error, a message is sent with the error that occurred.
		 */
		process.stderr.on('data', (data: any) => { 
			vscode.window.showErrorMessage(`Error: ${data}`);
			console.error(`Error: ${data}`); 
		}); 
		
		/**
		 * When the process closes, the console writes that the process ended
		 */
		process.on('close', (code: any) => { 
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

// This method is called when your extension is deactivated
export function deactivate() { }
