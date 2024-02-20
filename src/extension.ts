import * as vscode from 'vscode';
const fs = require('node:fs');
const { spawn } = require('child_process'); 


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "oledb-runner" is now active!');
	let connectionString = '';
	
	/**
	 * Creating the first command to configure OLEDB.
	 */
	let disposable = vscode.commands.registerCommand('oledb-runner.configurarRuta', async () => {	
		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);
		const defDelimitar = ',';

		/**
		 * The user is asked to enter the route via keyboard.
		 */
		const inputPath = await vscode.window.showInputBox({
			placeHolder: "Escribe la ruta del directorio",
			prompt: "Guarda el directorio donde se usara OLEDB.",
			value: selectedText
		});

		/**
		 * It is verified that the user has canceled the command by pressing the 'ESC' key
		 */
		if (inputPath === undefined){
			console.log('Salir');
			return;	
		}
		
		/**
		 * It is checked that the route entered is valid; if not, an error message is sent and the command is called again.
		 */
		if (inputPath === '' || !fs.existsSync(inputPath?.replace(/"/gi,''))) {
			console.log(inputPath);
			vscode.window.showErrorMessage('La ruta expecificada no existe. Porfavor introduce una ruta valida.');
			vscode.commands.executeCommand('oledb-runner.configurarRuta');
			return;			
		}
		
		/**
		 * The user is asked to enter the file delimiter. If it is empty, the default delimiter will be set.
		 */
		const delimiter = await vscode.window.showInputBox({
			placeHolder: "Escribe el delimitador de los CSV.",
			prompt: "Determina el delimitador de los ficheros CSV. Por defecto ','",
			value: selectedText
		});

		if (delimiter === undefined){
			console.log('Delimitador por defecto');	
		}

		/**
		 * The 'ConnectionString' is mounted
		 */
		connectionString = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source="' + inputPath + '"; Extended Properties="text;HDR=Yes;CharacterSet=65001;FMT=Delimited('+ (delimiter || defDelimitar) + ')";';
		console.log(connectionString);
	});

	let disposable2 = vscode.commands.registerCommand('oledb-runner.Ejecutar', async () => {
		// The path where the executable is is mounted
		const runner = __dirname.substring(0,__dirname.length -3) + 'resources\\Runner\\OLEDB-Runner.exe';
		// The text of the active editor and the selected text are collected. If nothing is selected, the full text will be used.
		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);
		const allText = editor?.document.getText();
		let query = selectedText || allText;
		
		/**
		 * It is checked that the 'ConnectionString' is filled, otherwise the command will end with an error message
		 */
		if (connectionString === ''){
			vscode.window.showErrorMessage('Porfavor introduce una ruta para poder ejecutar la consulta. Ejcuta el comando "Configurar Ruta - OLEDB"');
			return;
		}

		console.log(connectionString);
		console.log(query);

		/**
		 * OLEDB executable is released
		 */
		const process = spawn(runner, [connectionString,query]); 

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
}

// This method is called when your extension is deactivated
export function deactivate() { }
