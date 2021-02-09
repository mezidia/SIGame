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

  //create promise from sql query
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

  //get all bundles from database
  async getAllBundles() {
    let returnBundles = [];
    const getDeckSqlStr = `SELECT b.*, l.*, d.*, q.*
      FROM question q
      INNER JOIN deck d
      ON d.deck_id = q.deck_id
      INNER JOIN bundle b
      ON d.bundle_id = b.bundle_id 
      INNER JOIN langcode l
      ON l.langcode_id = b.bundle_langcode`;
    await this.promisifyConQuery(getDeckSqlStr, rows => rows)
    .then(rows => {
      const allBundles = [];
      let bundle = {
        author: null,
        langcode: null,
        title: null,
        decks: []
      };
      let deck = {
        subject: null,
        questions: []
      };
      let question = {
        type: null,
        string: null,
        trueAns: null,
        falseAns: null
      }
      let bundleId = 1;
      let deckId = 1;
      for (let i = 0; i < rows.length; i++) {

        question.type = rows[i].question_type;
        question.string = rows[i].question_string;
        question.trueAns = rows[i].question_trueans;
        question.falseAns = rows[i].question_falseans;
        const queToDeck = {};
        deck.questions.push(Object.assign(queToDeck, question));
        question = {
          type: null,
          string: null,
          trueAns: null,
          falseAns: null
        }

        bundle.author = rows[i].bundle_author;
        bundle.langcode = rows[i].langcode_name;
        bundle.title = rows[i].bundle_title;
        deck.subject = rows[i].deck_subject;
        
        if (i === rows.length - 1 || deckId !== rows[i + 1].deck_id) {
          const deckToBundle = {};
          bundle.decks.push(Object.assign(deckToBundle, deck));
          deck = {
            subject: null,
            questions: []
          };
          if (i !== rows.length - 1) deckId = rows[i + 1].deck_id;
        }
        if (i === rows.length - 1 || bundleId !== rows[i + 1].bundle_id) {
          const bundleToAllBundles = {};
          allBundles.push(Object.assign(bundleToAllBundles, bundle));
          bundle = {
            author: null,
            langcode: null,
            title: null,
            decks: []
          };
          if (i !== rows.length - 1) bundleId = rows[i + 1].bundle_id;
        }
      }
      returnBundles = allBundles;
    });
    return returnBundles;
  }

  //insert new bundle to database
  insertBundle(bundle) {
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
        const insertDeckSqlStr = `INSERT INTO deck (deck_subject, bundle_id) VALUES('${deck.subject}', '${bundleId}')`;
        this.promisifyConQuery(insertDeckSqlStr, rows => {
          for (const q of deck.questions) {
            console.log(rows.insertId, q.string);
            const insertQuestionSqlStr = `INSERT INTO question (question_type, question_string, question_trueans, question_falseans, deck_id) VALUES('${q.type}', '${q.string}', '${q.trueAns}', '${q.falseAns}', '${rows.insertId}')`;
            this.promisifyConQuery(insertQuestionSqlStr, rows => rows);
          }
        });
      }
    }).then(() => {
      const selectBundleSqlStr = `SELECT * FROM question`;
      this.promisifyConQuery(selectBundleSqlStr, rows => console.log('success'));
    });
  }
}

module.exports = { Database };
