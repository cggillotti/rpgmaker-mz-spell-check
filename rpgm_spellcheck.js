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
var errorCount = 0;
const commandArgs = process.argv.slice(2);
console.log('commandArgs: ', commandArgs);
if(commandArgs.length && commandArgs[0] != "") {

    if(commandArgs[0].includes("-h"))
    {
        console.log("RpgMaker MZ Talk Tool Usage");
        console.log("Default location for game data files to parse is /datafiles");
        console.log("You can specify another path as the first argument");
        console.log(colors.yellow("node rpgm_talk_dump.js [PATH GOES HERE]"));
        console.log("You write out all lines, not just spellcheck issues with the -a flag");
        console.log(colors.yellow("node rpgm_talk_dump.js -a [OPTIONAL PATH GOES HERE]"));
        return;

    }else if (commandArgs[0].includes("-a")) {
        showAll = true;
        if(commandArgs.length > 1) {
            console.log(colors.green("Looking in "), commandArgs[1]);
            fileDir = commandArgs[1];
        }

    }else{
        console.log(colors.green("Looking in "), commandArgs[0]);
        fileDir = commandArgs[1];
    }

}

fs.readdir(fileDir , function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
       // console.log(file);
        filepath = `${fileDir}/${file}`;
        let hasError = false;
        if(file.includes(".json")) {
            fs.readFile(filepath, 'utf8', function(err, data){
                let matches = data.match(talkRegex);
                if(matches) {
                    matches.forEach(m => {
                        while ((matchResults = wordsRegext.exec(m)) !== null) {
                            let msg = ' ';
                            if(matchResults[1].length > 2 && matchResults[1] != "Empty.") {
                                matchResults[1].split(' ').forEach( wrd => {
                                    if(allLetters(wrd) && !checker.spellCheck(wrd.replace(/[^\w\s]/,'')) ){
                                        hasError = true;
                                        errorCount++;
                                        msg += colors.red(wrd) + " ";
                                    } else {
                                        msg += wrd + " ";
                                    } 
                                });
                                if(showAll || hasError) {
                                 if(fileColorToggle){
                                    console.log(colors.grey(file.toString()) + msg);
                                 }else {
                                    console.log(colors.white(file.toString()) + msg);
                                 }
                                }
                               hasError = false;
                            }
                          }
                    });
                }
                fileColorToggle = !fileColorToggle;
            });

        }
    });

});

function allLetters(word) {
    return (/[a-zA-Z]*/).test(word);
}