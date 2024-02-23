# oledb-runner README

## Features
This VSCode extension is used to execute OLEDB queries to CSV files. 

To use the extension you need run this commands.<br> Open the command palette press the key combination `Ctrl+Shift+P`
- `Configure Path - OLEDB` configure files path.
- `Configure Provider - OLEDB` configure provider.
- `Configure Delimiter - OLEDB` configure delimiter.
- `Execute - OLEDB` execute OLEDB query.

## Settings
You can change default values in extension settings or can add this property in settings.json. 

Example to default provider
```json 
"OLEDB-Runner.Default-Provider": "Microsoft.ACE.OLEDB.12.0" 
```
Example to default delimiter
```json
"OLEDB-Runner.Default-Delimiter": "," 
```
You can change the engine in extension settings or can add this property with `x86` or `x64` value.
```json
"OLEDB-Runner.Engine": "x86" 
```
You can change image to wait for the query to be performed. If you do not want to show any image, leave this option empty. 
```json
"OLEDB-Runner.Consulting-IMG": "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
```
You can change image on error. If you do not want to show any image, leave this option empty. 
```json
"OLEDB-Runner.Error-IMG": "https://i.kym-cdn.com/photos/images/newsfeed/001/384/531/8ed.jpg",
```

## Installation
> [!IMPORTANT]
> You need .NET of your system engine (x86 or x64).<br>
> If you don't have .NET 6.0 or later, you can download in this [page](https://dotnet.microsoft.com/es-es/download/dotnet/6.0).
1. Download .vsix
2. Open view extensions (`Ctrl+Shift+X`), More actions and click in *'Install from VSIX'*<br>
![Install VSIX](<./resources/Install.png>)
3. Enjoy 😀

## Release Notes
### Version 1.1.0
- Add a loading screen and error screen.
- Changed table CSS to be dynamic.
- Add 3 new setting.

### Version 1.0.0
- Changed the way the query table is created .
- Add control to update or create webViewPanel.

### Version 0.0.4
- Changed the path for the OLEDB executable file.
- Add icon to extensions view.

### Version 0.0.3
- Add new command to configure the provider and delimiter.
- Add extension settings for default values.


### Version 0.0.2
- Changed the path for the OLEDB executable file.

### Version 0.0.1
- Initial version.
