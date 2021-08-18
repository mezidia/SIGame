'use strict';

const mysql = require('mysql');
const fs = require('fs');

class Database {
  constructor (config) {
    //connect to database
    this.con = mysql.createConnection(config);
  }

  //check if needed tables exist and create if not
  async checkExistance() {
    const dblangcode = `
    CREATE TABLE IF NOT EXISTS langcode (
      langcode_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      langcode_name varchar(10)
    );`;
    const dbbundle = `
    CREATE TABLE IF NOT EXISTS bundle (
      bundle_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      bundle_author varchar(34),
      bundle_langcode int,
      bundle_roundsNum int unsigned,
      bundle_themsInRoundNum int unsigned,
      bundle_qInThemeNum int unsigned,
      bundle_qInFinal int unsigned,
      FOREIGN KEY (bundle_langcode) REFERENCES langcode(langcode_id),
      bundle_title varchar(200)
    );
    `;
    const dbdeck = `
    CREATE TABLE IF NOT EXISTS deck (
      bundle_id int,
      deck_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      deck_subject varchar(200),
      CONSTRAINT fk_deck_on_bundle
      FOREIGN KEY (bundle_id)
      REFERENCES bundle(bundle_id)
    );`; 
    const dbquestion = `
    CREATE TABLE IF NOT EXISTS question (
      question_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
      deck_id int,
      question_type varchar(50),
      question_string varchar(200),
      question_date datetime,
      question_trueans varchar(300),
      question_falseans varchar(300),
      CONSTRAINT fk_question_on_deck
      FOREIGN KEY (deck_id)
      REFERENCES deck(deck_id)
    );`;
    const dbschema = [dblangcode, dbbundle, dbdeck, dbquestion];
    for (let schema of dbschema) {
      this.con.query(schema, err => {
        if (err) console.error(err);
      });
    }
  }

  //return connection
  returnConnection() {
    return this.con;
  }

  //create promise from sql query
  promisifyConQuery(sqlCommStr) {
    return new Promise((res, rej) => {
      this.con.query(sqlCommStr, (err, rows) => {
        try {
          res(rows);
        } catch (err) {
          console.log(err);
          rej(err);
        }
      });
    });
  }

  //get all bundles from database
  async getAllBundles() {
    await this.checkExistance();
    let bundle = {
      author: null,
      langcode: null,
      title: null,
      roundsNum: null,
      themsInRoundNum: null,
      qInThemeNum: null,
      qInFinal: null,
      decks: []
    };
    let deck = {
      subject: null,
      questions: []
    };
    let question = {
      type: null,
      string: null,
      img: null,
      audio: null,
      trueAns: null,
      falseAns: null
    };
    let returnBundles = [];
    const getDeckSqlStr = `SELECT b.*, l.*, d.*, q.*
      FROM question q
      INNER JOIN deck d
      ON d.deck_id = q.deck_id
      INNER JOIN bundle b
      ON d.bundle_id = b.bundle_id 
      INNER JOIN langcode l
      ON l.langcode_id = b.bundle_langcode`;
    await this.promisifyConQuery(getDeckSqlStr)
    .catch(err => console.log(err))
    .then(rows => {
      const allBundles = [];
      let bundleId = 1;
      let deckId = 1;
      for (let i = 0; i < rows.length; i++) {
        const id = rows[i].question_id;
        const date = new Date(Date.parse(rows[i].question_date.toString().replace(/-/g, '/')));
        const year = date.getFullYear();
        const month = date.getMonth();
        const imagePath = `./fileServer/${year}/${month}/${id}_image.txt`;
        if (fs.existsSync(imagePath)) {
          question.img = fs.readFileSync(imagePath, 'utf8');
        }
        const audioPath = `./fileServer/${year}/${month}/${id}_audio.txt`;
        if (fs.existsSync(audioPath)) {
          question.audio = fs.readFileSync(audioPath, 'utf8');
        }
        question.type = rows[i].question_type;
        question.string = rows[i].question_string;
        question.trueAns = rows[i].question_trueans;
        question.falseAns = rows[i].question_falseans;
        const queToDeck = {};
        deck.questions.push(Object.assign(queToDeck, question));
        question = {
          type: null,
          string: null,
          img: null,
          audio: null,
          trueAns: null,
          falseAns: null
        }

        bundle.author = rows[i].bundle_author;
        bundle.langcode = rows[i].langcode_name;
        bundle.title = rows[i].bundle_title;
        bundle.roundsNum = rows[i].bundle_roundsNum;
        bundle.themsInRoundNum = rows[i].bundle_themsInRoundNum;
        bundle.qInThemeNum = rows[i].bundle_qInThemeNum;
        bundle.qInFinal = rows[i].bundle_qInFinal;
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
    })
    .catch(err => console.log(err))
    .finally(() => console.log('done'));
    return returnBundles;
  }

  saveAudioAndImageFiles(image, audio, question_id) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    if (!fs.existsSync(`./fileServer/${year}/${month}`)) {
      fs.mkdirSync(`./fileServer/${year}/${month}`, { recursive: true }, err => {
        if (err) console.error('error when creating date dir ' + err);
      });
    }
    if (image) {
      fs.writeFile(`./fileServer/${year}/${month}/${question_id}_image.txt`, image, 'utf8', err => {
        if (err) console.error('Error when saving image to file server '+ err);
      });
    }
    if (audio) {
      fs.writeFile(`./fileServer/${year}/${month}/${question_id}_audio.txt`, audio, 'utf8', err => {
        if (err) console.error('Error when saving audio to file server '+ err);
      });
    }
  }

  //insert new bundle to database
  async insertBundle(bundle) {
    await this.checkExistance();
    let insertLangcodeSqlStr = `INSERT IGNORE INTO langcode 
    SET langcode_name = '${bundle.langcode}'`;
    await this.promisifyConQuery(insertLangcodeSqlStr)
    .catch(err => console.log(err))
    .then(async () => {
      const getlangIDSqlStr = `SELECT langcode_id FROM langcode WHERE langcode_name = '${bundle.langcode}'`;
      return await this.promisifyConQuery(getlangIDSqlStr);
    })
    .catch(err => console.log(err))
    .then(async rows => {
      const langcodeId = rows[0].langcode_id;
      const insertBundleSqlStr = `INSERT INTO bundle (bundle_author, bundle_title, bundle_langcode, bundle_roundsNum, bundle_themsInRoundNum, bundle_qInThemeNum, bundle_qInFinal) 
                                  VALUES('${bundle.author.replace(/[']{1}/g, "''")}', '${bundle.title.replace(/[']{1}/g, "''")}', '${langcodeId}', '${bundle.roundsNum}', '${bundle.themsInRoundNum}', '${bundle.qInThemeNum}', '${bundle.qInFinal}')`;
      return await this.promisifyConQuery(insertBundleSqlStr);
    })
    .catch(err => console.log(err))
    .then(async rows => {
      const bundleId = rows.insertId;
      for (const deck of bundle.decks) {
        const insertDeckSqlStr = `INSERT INTO deck (deck_subject, bundle_id) 
                                  VALUES('${deck.subject.replace(/[']{1}/g, "''")}', '${bundleId}')`;
        await this.promisifyConQuery(insertDeckSqlStr)
        .then(async rowsD => {
          for (const q of deck.questions) {
            const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const insertQuestionSqlStr = `INSERT INTO question (question_type, question_string, question_date, question_trueans, question_falseans, deck_id) 
                                          VALUES('${q.type.replace(/[']{1}/g, "''")}', '${q.string.replace(/[']{1}/g, "''")}', '${date}', '${q.trueAns.toString().replace(/[']{1}/g, "''")}', '${q.falseAns.toString().replace(/[']{1}/g, "''")}', '${rowsD.insertId}')`;
            this.con.query(insertQuestionSqlStr, (err, res) => {
              if (err) console.error(err);
              this.saveAudioAndImageFiles(q.img, q.audio, res.insertId);
            })
          }
        })
        .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err))
    .finally(() => console.log('done'));
  }

  async getBundleNames() {
    await this.checkExistance();
    const query =  `SELECT b.bundle_title, l.langcode_name
                    FROM bundle b
                    INNER JOIN langcode l
                    ON b.bundle_langcode = l.langcode_id`;
    let result = null;
    await this.promisifyConQuery(query)
    .catch(err => console.log(err))
    .then(rows => {
      result = rows;
    })
    .finally(() => console.log('done'));
    return result;
  }

  async getBundleByName(name) {
    await this.checkExistance();
    let bundle = {
      author: null,
      langcode: null,
      title: null,
      roundsNum: null,
      themsInRoundNum: null,
      qInThemeNum: null,
      qInFinal: null,
      decks: []
    };
    let deck = {
      subject: null,
      questions: []
    };
    let question = {
      type: null,
      string: null,
      img: null,
      audio: null,
      trueAns: null,
      falseAns: null
    };
    const getDeckSqlStr = `SELECT b.*, l.*, d.*, q.*
      FROM question q
      INNER JOIN deck d
      ON d.deck_id = q.deck_id
      INNER JOIN bundle b
      ON d.bundle_id = b.bundle_id 
      INNER JOIN langcode l
      ON l.langcode_id = b.bundle_langcode
      WHERE b.bundle_title='${name.replace(/[']{1}/g, "''")}'`;
    await this.promisifyConQuery(getDeckSqlStr)
    .catch(err => console.log(err))
    .then(rows => {
      let deckId = rows[0].deck_id;
      for (let i = 0; i < rows.length; i++) {
        const id = rows[i].question_id;
        const date = new Date(Date.parse(rows[i].question_date.toString().replace(/-/g, '/')));
        const year = date.getFullYear();
        const month = date.getMonth();
        const imagePath = `./fileServer/${year}/${month}/${id}_image.txt`;
        if (fs.existsSync(imagePath)) {
          question.img = fs.readFileSync(imagePath, 'utf8');
        }
        const audioPath = `./fileServer/${year}/${month}/${id}_audio.txt`;
        if (fs.existsSync(audioPath)) {
          question.audio = fs.readFileSync(audioPath, 'utf8');
        }
        question.type = rows[i].question_type;
        question.string = rows[i].question_string;
        question.trueAns = rows[i].question_trueans;
        question.falseAns = rows[i].question_falseans;
        const queToDeck = {};
        deck.questions.push(Object.assign(queToDeck, question));
        question = {
          type: null,
          string: null,
          img: null,
          audio: null,
          trueAns: null,
          falseAns: null
        }

        bundle.author = rows[i].bundle_author;
        bundle.langcode = rows[i].langcode_name;
        bundle.title = rows[i].bundle_title;
        bundle.roundsNum = rows[i].bundle_roundsNum;
        bundle.themsInRoundNum = rows[i].bundle_themsInRoundNum;
        bundle.qInThemeNum = rows[i].bundle_qInThemeNum;
        bundle.qInFinal = rows[i].bundle_qInFinal;
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
      }
    })
    .catch(err => console.log(err))
    .finally(() => console.log('done'));
    //console.log(bundle);
    return bundle;
  }
} 

module.exports = { Database };
