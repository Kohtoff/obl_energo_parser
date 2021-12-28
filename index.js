const axios = require("axios");
const cheerio = require("cheerio");
const https = require('https');
const fs = require('fs')

const parse = async () => {
  const httpsAgent = new https.Agent({
    /*someone adviced to use next line, but it seems like a huuuge hole(maybe glory hole) */
    rejectUnauthorized: false, //damn boy
    // cert: fs.readFileSync(/*path to user certificate with .pem extension*/),
    // keys: fs.readFileSync(/*key.pem */),
    // passphrase: 'pass'
    /*or*/
    // ca:
  })
  /*axios function to get html from target url*/
  const getHTML = async (url) => {
    const { data } = await axios.get(url, {httpsAgent});
    /*return cheerio obj*/
    return cheerio.load(data)
  };

const $ = await getHTML('https://www.zoe.com.ua/%d0%ba%d0%be%d1%80%d0%b8%d1%81%d0%bd%d1%96-%d0%bf%d0%be%d1%80%d0%b0%d0%b4%d0%b8/');
/*select quest_block where header contains our target city*/
const targetCity = $('.quest_block:has(.questing:contains("м. Запоріжжя (Запорізькі міські електричні мережі)"))').html()
console.log(targetCity);
};

parse();