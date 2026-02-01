Set objShell = CreateObject("WScript.Shell")
' Get the directory where this VBS script is located
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
' Run PowerShell script hidden in background
objShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File """ & scriptDir & "\keep-speaker-alive.ps1""", 0, False
