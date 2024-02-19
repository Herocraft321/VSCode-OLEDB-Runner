import * as vscode from 'vscode';
const fs = require('node:fs');
const { spawn } = require('child_process'); 


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "oledb-runner" is now active!');
	let connectionString = '';
	
	/**
	 * Creacion del primer comando para configurar OLEDB.
	 */
	let disposable = vscode.commands.registerCommand('oledb-runner.configurarRuta', async () => {	
		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);
		const defDelimitar = ',';

		/**
		 * Se pide que el usuario introduzca por teclado la ruta
		 */
		const inputPath = await vscode.window.showInputBox({
			placeHolder: "Escribe la ruta del directorio",
			prompt: "Guarda el directorio donde se usara OLEDB.",
			value: selectedText
		});

		/**
		 * Se comprueba que el usuario haya cancelado el comando pulsando la tecla 'ESC'
		 */
		if (inputPath === undefined){
			console.log('Salir');
			return;	
		}
		
		/**
		 * Se comprueba que la ruta introducida sea valida, en caso contratrio se envia un mensaje de error y se vuelve a llamar al comando.
		 */
		if (inputPath === '' || !fs.existsSync(inputPath?.replace(/"/gi,''))) {
			console.log(inputPath);
			vscode.window.showErrorMessage('La ruta expecificada no existe. Porfavor introduce una ruta valida.');
			vscode.commands.executeCommand('oledb-runner.configurarRuta');
			return;			
		}
		
		/**
		 * Se pide al usuario que introduzca el delimitador de los fichero en caso de quedar vacio se pondra el delimitador por defecto
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
		 * Se monta el 'ConnectionString'
		 */
		connectionString = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source="' + inputPath + '"; Extended Properties="text;HDR=Yes;CharacterSet=65001;FMT=Delimited('+ (delimiter || defDelimitar) + ')";';
		console.log(connectionString);
	});

	let disposable2 = vscode.commands.registerCommand('oledb-runner.Ejecutar', async () => {
		// Se monta la ruta donde esta el ejecutable
		const runner = __dirname.substring(0,__dirname.length -3) + 'resources\\Runner\\OLEDB-Runner.exe';
		// Se recoge el texto del editor activo y el texto seleccionado, en el caso de que no se seleccione nada se usara el texto completo
		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);
		const allText = editor?.document.getText();
		let query = selectedText || allText;
		
		/**
		 * Se comprueba que el 'ConnectionString' este relleno, en caso contrario se terminara el comando con un mensaje de error
		 */
		if (connectionString === ''){
			vscode.window.showErrorMessage('Porfavor introduce una ruta para poder ejecutar la consulta. Ejcuta el comando "Configurar Ruta - OLEDB"');
			return;
		}

		console.log(connectionString);
		console.log(query);

		/**
		 * Se lanza el ejecutable de OLEDB
		 */
		const process = spawn(runner, [connectionString,query]); 

		/**
		 * Si el proceso se ejecuto correctamente, se crea un vista con la tabla HTML devuelta
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
		 * Si el proceso da error se lanza un mensaje con el error que ha dado
		 */
		process.stderr.on('data', (data: any) => { 
			vscode.window.showErrorMessage(`Error: ${data}`);
			console.error(`Error: ${data}`); 
		}); 
		
		/**
		 * Cuando el proceso se cierre se excribe por consola que el proceso termino
		 */
		process.on('close', (code: any) => { 
			console.log(`Child process exited with code ${code}`); 
		});
	});

	/**
	 * Se llaman a las variables con los comandos
	 */
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() { }
