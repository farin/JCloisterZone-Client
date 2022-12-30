@Echo off

IF "%1" == "" goto help

call :updatefarinmaster master

set BRANCHES=gamemechanicssvgfix obelisk testbuild
rem fishermen bards testbuild

for %%f in (%BRANCHES%) do (
  CALL :updatefarinmaster %%f
)

git checkout master
echo Creating branch %1
git branch %1
git checkout %1

rem exit /b 2

for %%f in (%BRANCHES%) do (
   CALL :mergebranch %%f
)

goto end

:help
echo Missing parameter for new branch
exit /b 1

:end
exit /b 0

:: a function to write to a log file and write to stdout
:updatefarinmaster
rem ECHO %* >> "%log%"
echo Preparing %*
git checkout %*
if %errorlevel%==0 goto checkoutdone
echo Errorlevel %errorlevel%
goto end
:checkoutdone
git fetch upstream
if %errorlevel%==0 goto fetchdone
echo Errorlevel (fetch) %errorlevel%
goto end
:fetchdone
git merge upstream/master
if %errorlevel%==0 goto mergedone
if %errorlevel%==1 goto solveconflicts
echo Errorlevel (marge) %errorlevel%
goto end
:solveconflicts
echo Solve conflicts and commit changes manualy
goto end
:mergedone
git push
if %errorlevel%==0 goto pushdone
echo Errorlevel (push) %errorlevel%
goto end
:pushdone
EXIT /B 0

:: function to merge other branch to current branch
:mergebranch
echo Merging %*
git merge %*
if %errorlevel%==0 goto mergedone
echo Errorlevel %errorlevel%
pause
:mergedone

echo
echo 
echo Update package.json if needed
echo
echo Compile build: yarn build
echo
echo 

EXIT /B 0