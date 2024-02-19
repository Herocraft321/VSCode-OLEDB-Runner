import * as vscode from 'vscode';
const fs = require('node:fs');
const { spawn } = require('child_process'); 


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "oledb-runner" is now active!');
	let connectionString = '';
	

	let disposable = vscode.commands.registerCommand('oledb-runner.configurarRuta', async () => {	
		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);
		const defDelimitar = ',';

		const inputPath = await vscode.window.showInputBox({
			placeHolder: "Escribe la ruta del directorio",
			prompt: "Guarda el directorio donde se usara OLEDB.",
			value: selectedText
		});

		if (inputPath === undefined){
			console.log('Salir');
			return;	
		}

		if (inputPath === '' || !fs.existsSync(inputPath?.replace(/"/gi,''))) {
			console.log(inputPath);
			vscode.window.showErrorMessage('La ruta expecificada no existe. Porfavor introduce una ruta valida.');
			vscode.commands.executeCommand('oledb-runner.configurarRuta');
			return;			
		}
		
		const delimiter = await vscode.window.showInputBox({
			placeHolder: "Escribe el delimitador de los CSV.",
			prompt: "Determina el delimitador de los ficheros CSV. Por defecto ','",
			value: selectedText
		});

		if (delimiter === undefined){
			console.log('Delimitador por defecto');	
		}

		/**
		 * ! Provider=Microsoft.ACE.OLEDB.12.0;Data Source="{Ruta}"; Extended Properties="text;HDR=Yes;CharacterSet=65001;FMT=Delimited(,)"; 
		*/
		connectionString = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source="' + inputPath + '"; Extended Properties="text;HDR=Yes;CharacterSet=65001;FMT=Delimited('+ (delimiter || defDelimitar) + ')";';
		console.log(connectionString);
	});

	let disposable2 = vscode.commands.registerCommand('oledb-runner.Ejecutar', async () => {
		const runner = __dirname.substring(0,__dirname.length -3) + 'resources\\Runner\\OLEDB-Runner.exe';
		vscode.window.showInformationMessage(runner);
		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);
		const allText = editor?.document.getText();
		let query = selectedText || allText;
		
		if (connectionString === ''){
			vscode.window.showErrorMessage('Porfavor introduce una ruta para poder ejecutar la consulta. Ejcuta el comando "Configurar Ruta - OLEDB"');
			return;
		}
		console.log(connectionString);
		console.log(query);
		
		const process = spawn(runner, [connectionString,query]); 
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
			console.log(`Output: ${data}`); 
		}); 
		
		process.stderr.on('data', (data: any) => { 
			vscode.window.showErrorMessage(`Error: ${data}`);
			console.error(`Error: ${data}`); 
		}); 
		
		process.on('close', (code: any) => { 
			console.log(`Child process exited with code ${code}`); 
		});
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() { }
