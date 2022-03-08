# RPGMaker MZ Spellcheck

## Purpose
This is a node js command line tool to quick pull out all of the Talk strings from a RPGMaker MZ data files (JSON format)
It will write out the lines and run a spellchecker against the words found, and will highlight things that might be wrong.
There is a file called ignore.json under /config so you can put in words to ignore for spellcheck (like names).

## Requirements
Built and tested with npm 8.3.1 and node 16.14, YMMV with other builds.

## Usage
To get started
- npm install
- Copy files to scan into datafiles directory
- node rpgm_spellcheck.js 
- Flags:
- - -d, Provide path to directory to scan. 
- - -a, Display all lines, not just ones with flagged words
- - -i, Interactive add to ignore step
- - -p, Page results by file
- - -f, Filter files in directory by match (eg. Map will limit the scan to json files with "Map" in the name)

Results are written to datafiles/lastreport.json
Ignore is stored in /configs

You can add words to ignore when flagged as misspelled to the ignore.json file. Add it as an entry in the ignorelist array.

## Examples

You can put your data files in the /datafiles directory and the script will check there by default

### Scan folder in project or any other directory you have access to
- node rpgm_spellcheck.js -d /mnt/c/User/name/Documents/RMMZ/project/data

### Scan default /datasources, display all lines, and prompt to add common flagged words to ignored file
- node rpgm_spellcheck.js -a

### Scan default /datasources, but wait for input after each file's results (Paging mode)
- node rpgm_spellcheck.js -p

<img width="346" alt="pager" src="https://user-images.githubusercontent.com/7127233/156056695-65c20e65-478b-42dd-a980-4449ecb6bf5d.png">


### Scan default /datasources and prompt to add common flagged words to ignored file
- node rpgm_spellcheck.js -i

This will prompt you after the scan is done to review any words that came up > 3 times. You can add them to the ignore list under config from here.

<img width="505" alt="Ignore process" src="https://user-images.githubusercontent.com/7127233/156056366-a55ecb4d-f193-4af8-9d27-b9951235fc31.png">

### Scan default /datasources but only the Actors.json
- node rpgm_spellcheck.js -f Actor

### Scan custom directory but only the Actors.json
- node rpgm_spellcheck.js -fd Actor /path/to/datafiles

## Notes
If you're on windows with an ubuntu subsystem you may need to navigate to your files with /mnt/[DISK LETTER]
node rpgm_spellcheck.js -a '/mnt/c/Users/USERNAME/Documents/Output/GAME NAME/data'

## Output
After running the script the output is [File Name] [Talk String] in the console.
It will be red if it's not in the spellchecker dictionary, but as you can see below that can make for a lot of false positives.
A JSON file with the full report is written to datafiles/lastreport.json.

![image](https://user-images.githubusercontent.com/7127233/153902540-e894cb40-6b8d-48f5-95d5-2e30b0ce4190.png)
