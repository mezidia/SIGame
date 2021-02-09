'use strict';

const mysql = require('mysql');
const util = require('util');

class Database {
  constructor (config) {
    //connect to database
    this.con = mysql.createConnection(config);
    this.con.connect( err => {
      if (err) throw err;
      console.log("Connected!");
    });
  }

  promisifyConQuery(sqlCommStr, cb) {
    return new Promise((res, rej) => {
      this.con.query(sqlCommStr, (err, rows) => {
        try {
          res(cb(rows));
        } catch (err) {
          console.log(err);
          rej(err);
        }
      });
    });
  }

  getAllBundles() {
    const getDeckSqlStr = `SELECT b.*, l.langcode_name, d.*, q.*
      FROM bundle b
      INNER JOIN langcode l
      ON b.bundle_langcode = l.langcode_id
      INNER JOIN deck d
      ON b.bundle_id = d.bundle_id
      INNER JOIN question q
      ON d.deck_id = q.deck_id `;
    this.promisifyConQuery(getDeckSqlStr, rows => rows)
    .then(rows => {
      console.log(rows);
      /*const bundle = {
        bundle
      }
      for (const chunk of rows) {

      }*/
    });
  }

  insertBundle(bundle) {
    console.log(bundle);
    let insertLangcodeSqlStr = `INSERT INTO langcode (langcode_name)
    SELECT * FROM (SELECT '${bundle.langcode}') AS tmp
    WHERE NOT EXISTS ( SELECT langcode_name 
    FROM langcode 
    WHERE langcode_name = '${bundle.langcode}')
    LIMIT 1`;
    this.promisifyConQuery(insertLangcodeSqlStr, rows => rows)
    .then((res, reg) => {
      const getlangIDSqlStr = `SELECT langcode_id FROM langcode WHERE langcode_name = '${bundle.langcode}'`;
      return this.promisifyConQuery(getlangIDSqlStr, rows => rows[0].langcode_id);
    }).then(langcodeId => {
      const insertBundleSqlStr = `INSERT INTO bundle (bundle_author, bundle_title, bundle_langcode) VALUES('${bundle.author}', '${bundle.title}', '${langcodeId}')`;
      return this.promisifyConQuery(insertBundleSqlStr, rows => rows.insertId);
    }).then(bundleId => {
      for (const deck of bundle.decks) {
        let deckId = null;
        const insertDeckSqlStr = `INSERT INTO deck (deck_subject, bundle_id) VALUES('${deck.subject}', '${bundleId}')`;
        this.promisifyConQuery(insertDeckSqlStr, rows => {
          deckId = rows.insertId;
          for (const q of deck.questions) {
            const insertQuestionSqlStr = `INSERT INTO question (question_type, question_string, question_trueans, question_falseans, deck_id) VALUES('${q.type}', '${q.string}', '${q.trueAns}', '${q.falseAns}', '${deckId}')`;
            this.promisifyConQuery(insertQuestionSqlStr, rows => rows);
          }
        });
      }
    }).then(() => {
      const selectBundleSqlStr = `SELECT * FROM bundle`;
      this.promisifyConQuery(selectBundleSqlStr, rows => console.log(rows));
    });
  }
}

//con.query('SELECT * FROM langcode', (err, rows) => {
//    console.log(rows);
//  });

module.exports = { Database };