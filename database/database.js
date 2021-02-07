'use strict';

const mysql = require('mysql');

class Database {
  constructor (config) {
    //connect to database
    this.con = mysql.createConnection(config);
    this.con.connect( err => {
      if (err) throw err;
      console.log("Connected!");
    });
  }

}

//con.query('SELECT * FROM langcode', (err, rows) => {
//    console.log(rows);
//  });

module.exports = { Database };