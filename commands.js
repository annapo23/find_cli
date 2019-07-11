#!/usr/bin/env node

const program = require('commander');
const { prompt } = require('inquirer');
const fs = require('fs');
const path = require('path');

const questions = [
    {
        type: 'input',
        name: 'path',
        message: 'Path to start searching.'
    }, {
        type: 'input',
        name: 'name',
        message: 'Name of file or extension.'
    }
]

// Command to start search at provided path
program
    .command('start')
    .alias('s')
    .description('Starts searching at the provided path')
    .action(() => {
        prompt(questions[0]).then(res => {
            if(res.path === '') {
                res.path = path.join(__dirname)
            }
            const findDir = (dir) => {
                files = fs.readdirSync(dir, (err) => {
                    if(err) {
                        console.error('Error');
                    }
                });
                console.log(dir);
                files.forEach((file) => {  
                    if(fs.statSync(dir + '/' + file).isDirectory()) {
                        findDir(dir + '/' + file);
                    } else {
                        console.log(dir + '/' + file);
                    }
                })
            }
            findDir(res.path);
        })
    })

// Find all files in a path by filename or extension
program
    .command('name')
    .alias('n')
    .description('Only prints files whose name matches the given pattern')
    .action(() => {
        prompt(questions).then(res => {
            if(res.path === '') {
                res.path = path.join(__dirname)
            }
            const findFileName = function(dir, name, files) {
                files = files || fs.readdirSync(dir);
                files.forEach((file) => {
                    let newDir = path.join(dir, file);
                    if (fs.statSync(newDir).isDirectory()) {
                        findFileName(newDir, name, fs.readdirSync(newDir))
                    } else {
                        if (file.substring(-1*(name.length+1)) === name || file === name) {
                            console.log('file', file)
                            console.log(newDir)
                        }
                    }
            
                }) 
            }
            findFileName(res.path, res.name);
        })
    })

program
    .command('link')
    .alias('l')
    .description('Finds and follows symbolic links')
    .action(() => {
        prompt(questions[0]).then(res => {
            
        })
    })

// Helper func to determine in directory is empty
const emptyDir = (path, callback) => {
    fs.stat(path, (err, stat) => {
        if (err) {
            return callback(true);
        }
        if(stat.isDirectory()) {
            fs.readdir(path, (err) => {
                if(err) {
                    return callback(true);
                } 
                callback(false)
            });
        } else {
            fs.readFile(path, (err) => {
                if(err) {
                    return callback(true);
                } else {
                    return callback(false);
                }
            })
        }
    })
}

// Find all empty files in a path
program
    .command('empty')
    .alias('e')
    .description('Only prints files that are empty')
    .action(() => {
        prompt(questions[0]).then(res => {
            if(res.path === '') {
                res.path = path.join(__dirname)
            }
            const findEmptyDir = (dir) => {
                files = fs.readdirSync(dir, (err) => {
                    if(err) {
                        console.error('Error');
                    }
                });
                files.forEach((file) => {  
                    emptyDir((dir + '/' + file), (empty) => {
                        if (empty) {
                            console.log(dir + '/' + file);
                        } else {
                            findEmptyDir(dir + '/' + file);
                        }
                    })
                })
            }
        findEmptyDir(res.path);
        })
    })

program.parse(process.argv);