@echo off

set csr=\java\8\jre\bin\java.exe -jar \closure-compiler\closure-compiler-v20220104.jar --charset UTF-8 --compilation_level SIMPLE_OPTIMIZATIONS --warning_level VERBOSE
doskey csr=%csr% $*
set externs=--externs closure\google-ext.js --externs closure\forge-ext.js --externs closure\pdflib-ext.js --externs closure\zb-externs.js

rem main
set src=.
set jss=--js %src%\zgapdfcryptor.js --js %src%\zgapdfsigner.js
echo $
set chkj=%%externs%% --checks_only %%jss%%
echo chkj=csr %chkj%
doskey chkj=%csr% %chkj%
set csrj=%%externs%% %%jss%% --js_output_file %src%\dist\zgapdfsigner.min.js
echo csrj=csr %csrj%
doskey csrj=%csr% %csrj%
