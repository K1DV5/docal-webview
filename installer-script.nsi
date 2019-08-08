; -{makensis %f}

;NSIS Modern User Interface
;Start Menu Folder Selection Example Script
;Written by Joost Verburg

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"

;--------------------------------
;General

  !define DOCAL_VERSION "2.0.0"
  ;Name and file
  Name "docal"
  OutFile "dist\docal-${DOCAL_VERSION}-setup.exe"

  ;Default installation folder and prompt
  InstallDir "$PROGRAMFILES\docal"
  DirText "Please choose a directory to which you'd like to install this application."
  
  ;Get installation folder from registry if available
  InstallDirRegKey HKCU "Software\docal" ""

  ;Request application privileges for Windows Vista
  ; RequestExecutionLevel user

;--------------------------------
;Variables

  Var StartMenuFolder
  
  VIAddVersionKey "ProductName" "docal"
  VIAddVersionKey "Comments" "Create calculations on documents easily!"
  VIAddVersionKey "CompanyName" "K1DV5"
  VIAddVersionKey "LegalTrademarks" "docal is a trademark of K1DV5"
  VIAddVersionKey "LegalCopyright" "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© K1DV5"
  VIAddVersionKey "FileDescription" "Reads calculation instructions in files and converts them to fully formatted document parts"
  VIAddVersionKey "FileVersion" ${DOCAL_VERSION}
  VIAddVersionKey "ProductVersion" ${DOCAL_VERSION}
  VIProductVersion "${DOCAL_VERSION}.1"

;--------------------------------
;Interface Settings

  !define MUI_ABORTWARNING

;--------------------------------
;Pages

  ;License page
  !define MUI_LICENSEPAGE_TEXT_TOP "Please review the license for the software."
  !define MUI_LICENSEPAGE_CHECKBOX
    !define MUI_LICENSEPAGE_CHECKBOX_TEXT "I agree with the terms and conditions of stated."
  !insertmacro MUI_PAGE_LICENSE "LICENSE"

  ;Directory page
  !define MUI_DIRECTORYPAGE_TEXT_TOP "Installation folder"
  !define MUI_DIRECTORYPAGE_TEXT_DESTINATION "Select the folder where the software will be installed."
  !insertmacro MUI_PAGE_DIRECTORY
  
  ;Start Menu Folder Page Configuration
  !define MUI_STARTMENUPAGE_TEXT_TOP "Start menu folder"
  !define MUI_STARTMENUPAGE_REGISTRY_ROOT "HKCU" 
  !define MUI_STARTMENUPAGE_REGISTRY_KEY "Software\docal" 
  !define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "docal"
  !insertmacro MUI_PAGE_STARTMENU Application $StartMenuFolder
  
  ;Installation page
  !define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "Installation Completed"
  !define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "The installation was completed."
  !define MUI_INSTFILESPAGE_ABORTHEADER_TEXT "Installation aborted"
  !define MUI_INSTFILESPAGE_ABORTHEADER_SUBTEXT "The installation was aborted."
  !insertmacro MUI_PAGE_INSTFILES
  
  ;Finish page
  !define MUI_FINISHPAGE_TITLE "Finish installation"
  !define MUI_FINISHPAGE_TEXT "docal was installed successfully."
  !define MUI_FINISHPAGE_RUN "$INSTDIR\docal.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "Run docal now."
  !define MUI_FINISHPAGE_LINK "Go to the source code repository"
    !define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/K1DV5/docal"
  !insertmacro MUI_PAGE_FINISH

  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES

;--------------------------------
;Installer Sections

Section "" ; Installer section

  ; Set output path to the installation directory. Also sets the working
  ; directory for shortcuts
  SetOutPath "$INSTDIR"
  
  ;ADD YOUR OWN FILES HERE...
  File /r dist\docal\*.*
  
  ;Store installation folder
  WriteRegStr HKCU "Software\docal" "" $INSTDIR
  
  ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
    
    ;Create shortcuts
    CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
    CreateShortcut "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
    CreateShortCut "$SMPROGRAMS\$StartMenuFolder\docal.lnk" "$INSTDIR\docal.exe"
  
  !insertmacro MUI_STARTMENU_WRITE_END

  ;Write registry keys for uninstalling from the control panel
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\docal" "DisplayName" "docal"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\docal" "UninstallString" "$INSTDIR\Uninstall.exe"

SectionEnd

;--------------------------------
;Uninstaller Section

Section "Uninstall"

  ;ADD YOUR OWN FILES HERE...

  ;Delete files and folders
  Delete "$INSTDIR\Uninstall.exe"
  ; Delete commands are inserted for each file between the INSTALLEDFILES tags.
  ; <INSTALLEDFILES>
  Delete "$INSTDIR\base_library.zip"
  Delete "$INSTDIR\clr.pyd"
  Delete "$INSTDIR\docal.exe"
  Delete "$INSTDIR\docal.exe.manifest"
  Delete "$INSTDIR\libcrypto-1_1-x64.dll"
  Delete "$INSTDIR\libssl-1_1-x64.dll"
  Delete "$INSTDIR\pyexpat.pyd"
  Delete "$INSTDIR\Python.Runtime.dll"
  Delete "$INSTDIR\python37.dll"
  Delete "$INSTDIR\select.pyd"
  Delete "$INSTDIR\unicodedata.pyd"
  Delete "$INSTDIR\VCRUNTIME140.dll"
  Delete "$INSTDIR\WebBrowserInterop.x64.dll"
  Delete "$INSTDIR\_bz2.pyd"
  Delete "$INSTDIR\_ctypes.pyd"
  Delete "$INSTDIR\_elementtree.pyd"
  Delete "$INSTDIR\_hashlib.pyd"
  Delete "$INSTDIR\_lzma.pyd"
  Delete "$INSTDIR\_socket.pyd"
  Delete "$INSTDIR\_ssl.pyd"
  Delete "$INSTDIR\assets\help.pdf"
  Delete "$INSTDIR\assets\index.html"
  Delete "$INSTDIR\assets\index.js"
  Delete "$INSTDIR\assets\watermark.svg"
  Delete "$INSTDIR\assets\worksheet.js"
  Delete "$INSTDIR\assets\ws.js"
  Delete "$INSTDIR\assets\css\bootstrap.min.css"
  Delete "$INSTDIR\assets\js\bootstrap.bundle.min.js"
  Delete "$INSTDIR\assets\js\jquery-3.3.1.min.js"
  Delete "$INSTDIR\assets\katex\katex.min.css"
  Delete "$INSTDIR\assets\katex\katex.min.js"
  Delete "$INSTDIR\assets\katex\contrib\auto-render.min.js"
  Delete "$INSTDIR\assets\katex\contrib\copy-tex.min.js"
  Delete "$INSTDIR\assets\katex\contrib\mathtex-script-type.min.js"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_AMS-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Caligraphic-Bold.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Caligraphic-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Fraktur-Bold.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Fraktur-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Main-Bold.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Main-BoldItalic.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Main-Italic.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Main-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Math-BoldItalic.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Math-Italic.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_SansSerif-Bold.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_SansSerif-Italic.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_SansSerif-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Script-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Size1-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Size2-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Size3-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Size4-Regular.woff"
  Delete "$INSTDIR\assets\katex\fonts\KaTeX_Typewriter-Regular.woff"
  Delete "$INSTDIR\docal\template.docx"
  Delete "$INSTDIR\Include\pyconfig.h"
  RMDir "$INSTDIR\assets\katex\contrib"
  RMDir "$INSTDIR\assets\katex\fonts"
  RMDir "$INSTDIR\assets\css"
  RMDir "$INSTDIR\assets\js"
  RMDir "$INSTDIR\assets\katex"
  RMDir "$INSTDIR\assets"
  RMDir "$INSTDIR\docal"
  RMDir "$INSTDIR\Include" ; </INSTALLEDFILES>
  RMDir "$INSTDIR"
  
  !insertmacro MUI_STARTMENU_GETFOLDER Application $StartMenuFolder
    
  Delete "$SMPROGRAMS\$StartMenuFolder\docal.lnk"
  Delete "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk"
  RMDir "$SMPROGRAMS\$StartMenuFolder"
  
  ; Now delete registry keys
  DeleteRegKey /ifempty HKCU "Software\docal"
  DeleteRegKey HKEY_LOCAL_MACHINE "SOFTWARE\docal"
  DeleteRegKey HKEY_LOCAL_MACHINE "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\docal"

SectionEnd
