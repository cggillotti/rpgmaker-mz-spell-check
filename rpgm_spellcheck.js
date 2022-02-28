const colors = require('colors');
var SpellChecker = require('simple-spellchecker');
const fs = require('fs');
const path = require('path');
var checker = SpellChecker.getDictionarySync("en-US");   
var fileDir = __dirname + "/datafiles" 
var fileColorToggle = false;
var showAll = false;
var replace = false;
var interactive = false;
var reportData = {"files":[]};
var ignores;
var ignoreTerms = [];
var flaggedTerms = {};
var pageResults = false;
var errorCount = 0;

const commandArgs = process.argv.slice(2);

var prompt = require('prompt-sync')({
    sigint: true
  });


if(commandArgs.length && commandArgs[0] != "") {
    if(commandArgs[0].includes("-"))
    {
        if(commandArgs[0].includes("h")) {
            console.log("RpgMaker MZ Talk Tool Usage");
            console.log("node rpg_spellcheck.js "+ colors.gray("// Runs spellcheck, looks in /datafiles"));
            console.log("node rpg_spellcheck.js -d [PATH TO DATA DIRECTORY] "+ colors.gray("// Runs spellcheck, looks in path passed as first argument"));
            console.log("node rpg_spellcheck.js -a"+ colors.gray("// Runs spellcheck, shows all lines not just flagged ones "));
            console.log("node rpg_spellcheck.js -p"+ colors.gray("// Runs spellcheck, waits for user input after each file "));
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
        
          if(commandArgs[0].includes("p")) {
            pageResults = true;
          }
    }
}

console.log(colors.green("Looking in "), fileDir)
getIgnores();
checkFiles();
console.log("Total of "+errorCount+" words flagged");
var flaggedTermsSorted = getFlaggedTermsArray(flaggedTerms);
createReport(reportData, flaggedTermsSorted);
addToIgnore(flaggedTermsSorted, ignoreTerms,ignores);


function getIgnores() {
    if (fs.existsSync(path)) 
    {
        if(fs.existsSync('configs/ignore.json')) {
            var ignoresRaw =  fs.readFileSync('configs/ignore.json');
            ignores = JSON.parse(ignoresRaw);
            ignoreTerms = ignores.ignoreList;

        } else {
            var defaultIgnore = {
                "ignoreList": [
                ]
            };
            fs.writeFileSync('configs/ignore.json',JSON.stringify(defaultIgnore));
            ignoreTerms = defaultIgnore;
            ignores = {"ignoreList": ignoreTerms};
        }
    }
}

function addToIgnore(flaggedTermsSorted, ignoreTerms, ignores) {
    var modifyIgnore = false;   
    var doIgnore = prompt('Would you like to see the most flagged words? We can add them to your ignore list. y/n? ');

    if(doIgnore.match(/[Yy]/)) {
        console.log("Here are the top most flagged terms.");
        for(var i = 0; i < flaggedTermsSorted.length; i++)
        {
            if(flaggedTermsSorted[i][1] > 3)
            {
               console.log("The word "+  colors.red(flaggedTermsSorted[i][0])+" was flagged "+  colors.red(flaggedTermsSorted[i][1]+" times"));
               var update = prompt("Would you like to add this to the ignorefile? y/n? ");
               if(update && update.match(/[Yy]/)) {
                modifyIgnore = true;
                ignoreTerms.push(flaggedTermsSorted[i][0]);
                console.log(colors.blue("Added to ignore list, will be saved after exit")
                );
               }

            }
        }
    }

    if(modifyIgnore) {
        fs.writeFileSync('configs/ignore.json',JSON.stringify({"ignoreList":ignoreTerms}),{'encoding':'utf-8'});
        console.log(colors.green("Updated Ignore list."));
    }

}

function addToFlags(flaggedTerms, term) {
    if(flaggedTerms[term] === undefined) {
        flaggedTerms[term] = 1;
    } else {
        flaggedTerms[term] += 1;
    }
}

function getFlaggedTermsArray(flaggedTerms) {
    var flaggedTermsSorted = [];
    for(item in flaggedTerms) {
        flaggedTermsSorted.push([item,flaggedTerms[item]]);
    }

    flaggedTermsSorted.sort((a,b)=>{ return b[1] - a[1];});

    return flaggedTermsSorted;
}

function createReport(reportData, flaggedTermsSorted){
    
    reportData.flagged = flaggedTermsSorted;
    fs.writeFileSync("configs/lastreport.json",JSON.stringify(reportData));
}

function checkFiles() {

var files = fs.readdirSync(fileDir);
files.forEach(function (file) {
    var documentReport = {"file": file.toString(),"dialogue":[]};
    filepath = `${fileDir}/${file}`;
    let hasError = false;
    if(file.includes(".json")) {
        var documentRaw =  fs.readFileSync(filepath,{encoding:'utf8', flag:'r'});
        var documentData = JSON.parse(documentRaw);

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
                                                addToFlags(flaggedTerms, wrd);
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
                                        documentReport.dialogue.push(lineReportData);
                                    }
                                });
                            }
                        });
                    }
                });
            }
            fileColorToggle = !fileColorToggle;
            if(documentReport.dialogue.length > 0) {
                reportData.files.push(documentReport);
                if(pageResults) {
                    prompt('Press any key to continue');
                }
            }
        }
    });
};
