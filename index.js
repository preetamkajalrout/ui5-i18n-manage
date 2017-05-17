#!/usr/bin/env node

//Get all the dependency
var fs = require("fs");
var program = require("commander");

//Program to get all the options
program
    .version("0.0.1")
    .option("-m|--mode [string]", "Mode on which to operate on {values: [merge, diff]} {Default: merge}")
    .option("-l|--language [string]", "Language code for i18n files to be used for processing {Default: en}")
    .option("-e|--encoding [string]", "Encoding for the files that is being processed {Default: utf8}")
    .option("-i|--inputdir <path>", "Directory to find the two input files based on mode of the program")
    .option("-o|--output [string]", "Filename for the output file, if none provided following will be used: Merge(Mode) => i18n_<languagecode>_final.properties | Diff(Mode) => i18n_<languagecode>_diff.properties")
    .parse(process.argv);

if (!program.inputdir) {
    console.log("ERR: Input dir is mandatory ");
    process.exit(1);
}

var oInputArgs = {
    "l": program.language ? program.language : "en",
    "m": program.mode === "diff" ? "diff" : "merge",
    "e": program.encoding ? program.encoding : "utf8",
    "i": program.inputdir.lastIndexOf("\\") === program.inputdir.length - 1 ? program.inputdir : program.inputdir + "\\",
    "o": program.output
},
    sInitialI18nFilePath = oInputArgs.i + "i18n_" + oInputArgs.l + ".properties",
    sModifiedI18nFilePath = oInputArgs.i + "i18n_" + oInputArgs.l + "_mod.properties",
    sFinalI18nFilePath;

if (!program.output) {
    if (oInputArgs.m === "diff") {
        oInputArgs.o = "i18n_" + oInputArgs.l + "_diff.properties";
    } else {
        oInputArgs.o = "i18n_" + oInputArgs.l + "_final.properties";
    }
}
console.log(oInputArgs);

sFinalI18nFilePath = oInputArgs.i + oInputArgs.o;
// console.log("Mode: %s\nLanguage: %s\nEncoding: %s\nInput Directory: %s\nOutput File Name: %s\n", program.mode, program.language, program.encoding, program.inputdir, program.output);

/**
 * Returns a key value structure for all elements in provided formatted string
 * @param {string} formattedString file data after removing all characters
 */
function fnCreateKeyArray(formattedString) {
    let aFormattedString = formattedString.split("\n");
    let aKeyStruct = [];
    for (let i = aFormattedString.length - 1; i >= 0; i--) {
        if (aFormattedString[i].search("=") !== -1) {
            aKeyStruct.push({
                textKey: aFormattedString[i].split("=")[0],
                textValue: aFormattedString[i].split("=")[1]
            });
        }
    }
    return aKeyStruct;
}

/**
 * Intiates the processing based on provided app mode
 */
function _init(sAppMode) {
    switch (sAppMode) {
        case "diff": //diff mode
            _initDiff();
            break;
        default: //merge mode
            _initMerge();
            break;
    }
}

/**
 * Peforms the merge of the two i18n files
 */
function _initMerge() {
    var aInitialProps = [],
        aNewProps = [],
        oInitialFilePromise = new Promise((resolve, reject) => {
            //read and resolve/reject the initial file read
            fs.readFile(sInitialI18nFilePath, oInputArgs.e, (err, data) => {
                if (err) {
                    reject(err);
                    return console.error(err);
                }
                resolve(data);
            });
        }),
        oNewFilePromise = new Promise((resolve, reject) => {
            //read and resolve/reject the new file read
            fs.readFile(sModifiedI18nFilePath, oInputArgs.e, (err, data) => {
                if (err) {
                    reject(err);
                    return console.error(err);
                }
                resolve(data);
            });
        });

    //On promise success of each file read.. create the respective arrays 
    oInitialFilePromise.then((data) => {
        let sFinalString = data.replace(/[\r,\n]/g, "\n").replace(/\n+/g, "\n");
        aInitialProps = fnCreateKeyArray(sFinalString);
    });
    oNewFilePromise.then((data) => {
        let sFinalString = data.replace(/[\r,\n]/g, "\n").replace(/\n+/g, "\n");
        aNewProps = fnCreateKeyArray(sFinalString);
    });
    //On all promises resolve and both the arrays are prepared make the final file and write to disk
    Promise.all([oInitialFilePromise, oNewFilePromise]).then(() => {
        let bAlreadyExist = false,
            sFinalContent,
            aAddedProps = [],
            aFinalProps = [];
        //create the data for file
        for (let i = aNewProps.length - 1; i >= 0; i--) {
            bAlreadyExist = false;
            for (let j = aInitialProps.length - 1; j >= 0; j--) {
                if (aNewProps[i].textKey === aInitialProps[j].textKey) {
                    aInitialProps[j].textValue = aNewProps[i].textValue;
                    bAlreadyExist = true;
                    break;
                }
            }
            if (!bAlreadyExist) {
                aAddedProps.push({
                    textKey: aNewProps[i].textKey,
                    textValue: aNewProps[i].textValue
                });
            }
        }
        //Merge the initial and added props and create final prop
        aFinalProps = aInitialProps.concat(aAddedProps.reverse());
        //write the final string to .properties file
        sFinalContent = aFinalProps.reverse().reduce(function (acc, curr) {
            acc += "\n" + curr.textKey + "=" + curr.textValue;
            return acc;
        }, "");
        fs.writeFile(sFinalI18nFilePath, sFinalContent, ["utf8"], (err) => {
            if (err) {
                throw err;
            }
            console.log("Merge complete. File has been created at " + sFinalI18nFilePath);
        });
    }).catch((err) => {
        throw err;
    });
}

/**
 * Generates the diff between two i18n files
 */
function _initDiff() {
    var aInitialProps = [],
        aNewProps = [],
        oInitialFilePromise = new Promise((resolve, reject) => {
            //read and resolve/reject the initial file read
            fs.readFile(sInitialI18nFilePath, oInputArgs.e, (err, data) => {
                if (err) {
                    reject(err);
                    return console.error(err);
                }
                resolve(data);
            });
        }),
        oNewFilePromise = new Promise((resolve, reject) => {
            //read and resolve/reject the new file read
            fs.readFile(sModifiedI18nFilePath, oInputArgs.e, (err, data) => {
                if (err) {
                    reject(err);
                    return console.error(err);
                }
                resolve(data);
            });
        });

    //On promise success of each file read.. create the respective arrays 
    oInitialFilePromise.then((data) => {
        let sFinalString = data.replace(/[\r,\n]/g, "\n").replace(/\n+/g, "\n");
        aInitialProps = fnCreateKeyArray(sFinalString);
    });
    oNewFilePromise.then((data) => {
        let sFinalString = data.replace(/[\r,\n]/g, "\n").replace(/\n+/g, "\n");
        aNewProps = fnCreateKeyArray(sFinalString);
    });
    //On all promises resolve and both the arrays are prepared make the final file and write to disk
    Promise.all([oInitialFilePromise, oNewFilePromise]).then(() => {
        let bFound = false,
            sFinalContent,
            aAddedProps = [],
            aFinalProps = [];
        //create the data for file
        for (let i = aNewProps.length - 1; i >= 0; i--) {
            bFound = false;
            for (let j = aInitialProps.length - 1; j >= 0; j--) {
                if (aNewProps[i].textKey === aInitialProps[j].textKey) {
                    if (aNewProps[i].textValue !== aInitialProps[j].textValue) {
                        aFinalProps.push({
                            textKey: aNewProps[i].textKey,
                            textValue: aNewProps[i].textValue
                        });
                    }
                    bFound = true;
                    break;
                }
            }
            if (!bFound) {
                aFinalProps.push({
                    textKey: aNewProps[i].textKey,
                    textValue: aNewProps[i].textValue
                });
            }
        }
        //write the final string to .properties file
        sFinalContent = aFinalProps.reduce(function (acc, curr) {
            acc += "\n" + curr.textKey + "=" + curr.textValue;
            return acc;
        }, "");
        fs.writeFile(sFinalI18nFilePath, sFinalContent, ["utf8"], (err) => {
            if (err) {
                throw err;
            }
            console.log("Diff processing complete. File has been created at " + sFinalI18nFilePath);
        });
    }).catch((err) => {
        throw err;
    });
}

//Run main program
try {
    _init(oInputArgs.m);
} catch (err) {
    throw err;
}

