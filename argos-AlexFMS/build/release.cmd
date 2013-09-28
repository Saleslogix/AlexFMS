@echo off

if exist deploy (
	rmdir deploy /S /Q
)

mkdir deploy\localization
mkdir deploy\help
mkdir deploy\content\javascript
mkdir deploy\content\images
mkdir deploy\content\css

REM .NET Build Tool
..\..\..\argos-sdk\tools\JsBit\jsbit.exe -p "release.jsb2" -d "."

REM Java Build Tool
REM %JAVA_HOME%\bin\java -Dfile.encoding=UTF-8 -jar "../../argos-sdk/tools/JSBuilder/JSBuilder2.jar" -v -p "build/release.jsb2" -d "."

if %errorlevel% neq 0 exit /b %errorlevel%