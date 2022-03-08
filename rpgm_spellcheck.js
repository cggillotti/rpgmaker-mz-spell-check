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
var ignores =  {"ignoreList": []};
var flaggedTerms = {};
var pageResults = false;
var errorCount = 0;
var filterWord = ".json";
var customMatch = false;

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
            console.log("node rpg_spellcheck.js -i"+ colors.gray("// Runs spellcheck, allows user to go through most flagged terms and add to ignore file "));
            console.log("node rpg_spellcheck.js -f [word to match in file names]"+ colors.gray("// Runs spellcheck, only including files whose titles contain string. It comes before directory path"));
            return;
        }

        if(commandArgs[0].includes("a") ){
            showAll = true;
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

          if(commandArgs[0].includes("f")) {
            customMatch = true;
            filterWord = commandArgs[1];
          }

          if(commandArgs[0].includes("d")) {
              if(customMatch) {
                fileDir = commandArgs[2];
              } else {
                fileDir = commandArgs[1];
              }
  
        }

    }
}

console.log(colors.green("Looking in "), fileDir);
ignores = getIgnores();
checkFiles(ignores);
console.log("Total of "+errorCount+" words flagged");
var flaggedTermsSorted = getFlaggedTermsArray(flaggedTerms);
createReport(reportData, flaggedTermsSorted);
if(interactive) {
    addToIgnore(flaggedTermsSorted ,ignores);   
}



function getIgnores() {
    console.log("Getting Ignores...");
    if(fs.existsSync('configs/ignore.json')) {
        var ignoresRaw =  fs.readFileSync('configs/ignore.json');
        ignoresJSON = JSON.parse(ignoresRaw);
        console.log("Ignore file found");
        return ignoresJSON;

    } else {
        fs.writeFileSync('configs/ignore.json',`{"ignoreList": []}`);
        console.log("No ignore file found, creating one");
        return {"ignoreList": []};
    }
    
}

function addToIgnore(flaggedTermsSorted, ignoreTerms) {
    var modifyIgnore = false;   
    var doIgnore = prompt('Would you like to see the repeated flagged words? We can add them to your ignore list. y/n? ');

    if(doIgnore.match(/[Yy]/)) {
        console.log("Here are the top most flagged terms.");
        for(var i = 0; i < flaggedTermsSorted.length; i++)
        {
            if(flaggedTermsSorted[i][1] > 1)
            {
               console.log("The word "+  colors.red(flaggedTermsSorted[i][0])+" was flagged "+  colors.red(flaggedTermsSorted[i][1]+" times"));
               var update = prompt("Would you like to add this to the ignorefile? y/n? ");
               if(update && update.match(/[Yy]/)) {
                modifyIgnore = true;
                ignoreTerms.ignoreList.push(flaggedTermsSorted[i][0]);
                console.log(colors.blue("Added to ignore list, will be saved after exit")
                );
               }

            }
        }
    }

    if(modifyIgnore) {
        fs.writeFileSync('configs/ignore.json',JSON.stringify(ignoreTerms),{'encoding':'utf-8'});
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

function checkFiles(ignoreTerms) {

var files = fs.readdirSync(fileDir);
files.forEach(function (file) {
    var documentReport = {"file": file.toString(),"dialogue":[]};
    filepath = `${fileDir}/${file}`;
    let hasError = false;
    if(file.includes(filterWord)) {
        var documentRaw =  fs.readFileSync(filepath,{encoding:'utf8', flag:'r'});
        var documentData = JSON.parse(documentRaw);
            if(documentData.events != null)
            {
                documentData.events.forEach(event => {
                    if(event != null && event.pages && event.pages.length > 0) {
                        event.pages.forEach(page => {
                            if(page != null & page.list != null && page.list.length > 0) {
                                page.list.forEach(pageItem => {
                                    if(pageItem.code == 401){
                                        pageItem.parameters.forEach(parameterValue => {
                                           
                                            if(isNaN(parameterValue))
                                            {
                                                
                                                processLine(parameterValue,file, documentReport, ignoreTerms);
                                            }
                                        });
                                  
                                    }
                                });
                            }
                        });
                    }
                });
            } else if (documentData.length >0) {
                documentData.forEach(obj => {

                    if(obj && (obj.list || obj.pages)) {
  
                          
                            if(obj && obj.list && obj.list.length > 0)
                            {
                                obj.list.forEach(listItem => {
                                    if(listItem && listItem.code == 401)
                                    {
                                        listItem.parameters.forEach(parameterValue => {
                                            if(isNaN(parameterValue))
                                            {
                                                processLine(parameterValue,file, documentReport,ignoreTerms);
                                            }
                                        });
                                      
                                    }
                                    
                                });

                            } else if (obj && obj.pages && obj.pages.length > 0) {
                                obj.pages.forEach(page => {
                                        if(page && page.list && page.list.length > 0) {
                                            page.list.forEach(listItem => {
                                                if(listItem && listItem.code == 401) {
                                                    listItem.parameters.forEach(parameterValue => {
                                                       
                                                        if(isNaN(parameterValue))
                                                        {
                                                            
                                                            processLine(parameterValue, file, documentReport,ignoreTerms);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                });
                            } 


                     
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

function processLine(line,file,documentReport, ignoreTerms) {
    var hasError = false;
    var lineReportData = {"line":"","flagged":[]};
    var cleanedLine = line.replace(/(<([^>]+)>)/ig,' ');
    lineReportData.line = cleanedLine;
    var msg = "";
    cleanedLine.split(' ').forEach( wrd => {
        wrd =  wrd.replace(/(<([^>]+)>)/ig,' '); //Bracket Tags
        wrd =  wrd.replace(/\\F[\w]\[\d+\]/,''); //RMMZ Tags, FS, 
        wrd =  wrd.replace(/\\C\[\d+\]/,''); //RMMZ Tags, FS, 
        wrd =  wrd.replace(/\\\^/,''); //RMMZ Tags, FS, 
        wrd =  wrd.replace(/[^\w\s\d']/,''); //Non
        wrd =  wrd.replace(/\r/,'');
        if(!checker.spellCheck(wrd.toLowerCase()) && wrd != "" && !ignoreTerms.ignoreList.includes(wrd)){  
            hasError = true;
            errorCount++;
            msg += colors.red(wrd) + " ";
            lineReportData.flagged.push(wrd.toLowerCase());  
            addToFlags(flaggedTerms, wrd);
        } else if (wrd && wrd != " " && wrd != "Empty") {
            msg += wrd + " ";
        } 
    });
    if(hasError || showAll) {
        if(fileColorToggle) {
            console.log(colors.white(file.toString()) +" "+ msg);
        } else {
            console.log(colors.gray(file.toString()) +" "+ msg);
        }
    }
    documentReport.dialogue.push(lineReportData);
}