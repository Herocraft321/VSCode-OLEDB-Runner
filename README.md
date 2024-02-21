# oledb-runner README

## Features
This VSCode extension is used to execute OLEDB queries to CSV files. 

You can use commands to configure and run OLEDB query.
- Run `Configure Path - OLEDB` to configure files path.
- Run `Configure Provider - OLEDB` to configure provider.
- Run `Configure Delimiter - OLEDB` to configure delimiter.
- Run `Execute - OLEDB` to execute OLEDB query.

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


## Installation
> [!IMPORTANT] You need .NET of your system engine (x86 or x64).<br>
> If you don't have .NET 6.0 or later, you can download in this [page](https://dotnet.microsoft.com/es-es/download/dotnet/6.0).
1. Download .vsix
2. Open view extensions (`Crtl+Shift+X`), More actions and click in *'Install from VSIX'*<br>
![Install VSIX](<./resources/Install.png>)
3. Enjoy 😀
## Release Notes
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