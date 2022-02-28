const colors = require('colors');
var SpellChecker = require('simple-spellchecker');
const fs = require('fs');
const path = require('path');
const { SIGFPE } = require('constants');
const talkRegex = new RegExp(`"code":401,.*"parameters":\\[(".*")\\]}`,"gm");
const wordsRegext = new RegExp(`code":401,.*?"parameters":\\["(.*?)"\\]\\}`,"gm");
var checker = SpellChecker.getDictionarySync("en-US");   
var fileDir = __dirname + "/datafiles" 
var fileColorToggle = false;
var showAll = false;
var replace = false;
var interactive = false;
var reportData = {"files":[]};
var errorCount = 0;
var ignores;
var ignore = [];
const commandArgs = process.argv.slice(2);
console.log('commandArgs: ', commandArgs);
if(commandArgs.length && commandArgs[0] != "") {

    if(commandArgs[0].includes("-"))
    {
        if(commandArgs[0].includes("h")) {
            console.log("RpgMaker MZ Talk Tool Usage");
            console.log("Default location for game data files to parse is /datafiles");
            console.log("You can specify another path as the first argument");
            console.log(colors.yellow("node rpgm_talk_dump.js [PATH GOES HERE]"));
            console.log("You write out all lines, not just spellcheck issues with the -a flag");
            console.log(colors.yellow("node rpgm_talk_dump.js -a [OPTIONAL PATH GOES HERE]"));
            return;
        }

        if(commandArgs[0].includes("a") ){
            showAll = true;
        }

        if(commandArgs[0].includes("d")) {
            fileDir = commandArgs[1];
        }

        if(commandArgs[0].includes("r")) {
          replace = true;
        }

        if(commandArgs[0].includes("i")) {
            interactive = true;
          }

    }

}

console.log(colors.green("Looking in "), fileDir);

fs.readFile('configs/ignore.json', 'utf8', function(err, data){
     ignores = JSON.parse(data);
     ignoreTerms = ignores.ignoreList;
     checkFiles();

});

function createReport(){

}

function checkFiles() {
    
    fs.readdir(fileDir , function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
        var documentReport = {"file": file.toString(),"dialogue":[]};
       // console.log(file);
        filepath = `${fileDir}/${file}`;
        let hasError = false;
        if(file.includes(".json")) {
            fs.readFile(filepath, 'utf8', function(err, data){
                var documentData = JSON.parse(data);

                if(documentData.events != null)
                {
                    documentData.events.forEach(event => {
                        if(event != null && event.pages && event.pages.length > 0) {
                            event.pages.forEach(page => {
                                if(page != null & page.list != null && page.list.length > 0) {
                                    page.list.forEach(pageItem => {
                                        hasError = false;
                                        if(pageItem.code == 401){
                                            var lineReportData = {"line":"","flagged":[]};
                                            var cleanedLine = pageItem.parameters[0].replace(/(<([^>]+)>)/ig,' ');
                                            lineReportData.line = cleanedLine;
                                            var msg = "";
                                            cleanedLine.split(' ').forEach( wrd => {
                                                wrd =  wrd.replace(/(<([^>]+)>)/ig,' '); //Bracket Tags
                                                wrd =  wrd.replace(/\\F[\w]\[\d+\]/,''); //RMMZ Tags, FS, 
                                                wrd =  wrd.replace(/\\C\[\d+\]/,''); //RMMZ Tags, FS, 
                                                wrd =  wrd.replace(/\\\^/,''); //RMMZ Tags, FS, 
                                                wrd =  wrd.replace(/[^\w\s\d']/,''); //Non
                                                wrd =  wrd.replace(/\r/,'');
                                                if(!checker.spellCheck(wrd) && wrd != "" && !ignoreTerms.includes(wrd)){
                                                    
                                                    hasError = true;
                                                    errorCount++;
                                                    msg += colors.red(wrd) + " ";
                                                    lineReportData.flagged.push(wrd);
                                                } else if (wrd && wrd != " " && wrd != "Empty") {
                                                    msg += wrd + " ";
                                                } 
                                            });
                                            if(hasError) {
                                                if(fileColorToggle) {
                                                    console.log(colors.white(file.toString()) +" "+ msg);
                                                } else {
                                                    console.log(colors.gray(file.toString()) +" "+ msg);
                                                }
                                            }
                                        }
                                        documentReport.dialogue.push(lineReportData);
                                    });
                                }
                            });
                        }
                    });
                }
                fileColorToggle = !fileColorToggle;
            });
            reportData.files.push(documentReport);
        }
    });

});
};

function allLetters(word) {
    return (/[a-zA-Z]*/).test(word);
}