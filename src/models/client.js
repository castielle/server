const { pool, getConnection } = require('../../database');


const createClient = function(name){
    return new Promise(function(resolve, reject){
        pool.query(
            'INSERT INTO `client` (`name`) VALUES (?)', [name],
            function(err, rows){
                if(rows === undefined){
                    reject(new Error("Error rows is undefined"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}

const getClientId = function(name){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT * FROM `client` WHERE `name` = ?', [name],
            function(err, rows){
                if(rows === undefined){
                    console.log(err);
                    reject(new Error("Error rows is undefined"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}

const insertClient = function(name){
    return new Promise(function(resolve, reject){
        pool.query(
            'INSERT INTO `client` (`name`) VALUES (?)', [name],
            function(err, rows){
                // console.log(err);
                if(rows === undefined){
                    console.log(err);
                    reject(new Error("Error rows is undefined"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}


const getClientById = function(clientId){
    return new Promise(function(resolve, reject){
        pool.query(
            'SELECT * FROM `client` WHERE `id` = ?', [clientId],
            function(err, rows){
                // console.log(err);
                if(rows === undefined){
                    console.log(err);
                    reject(new Error("Error rows is undefined"));
                }else{
                    resolve(rows);
                }
            }
        )}
    )}

module.exports = { createClient, getClientId, insertClient, getClientById };