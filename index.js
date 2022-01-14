const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");

const parse = async () => {
  const httpsAgent = new https.Agent({
    /*someone adviced to use next line, but it seems like a huuuge hole(maybe glory hole) */
    rejectUnauthorized: false, //damn boy
    // cert: fs.readFileSync(/*path to user certificate with .pem extension*/),
    // keys: fs.readFileSync(/*key.pem */),
    // passphrase: 'pass'
    /*or*/
    // ca:
  });
  /*axios function to get html from target url*/
  const getHTML = async (url) => {
    const { data } = await axios.get(url, { httpsAgent });
    /*return cheerio obj*/
    return cheerio.load(data);
  };

  const $ = await getHTML(
    // 'https://www.zoe.com.ua/%d0%b0%d0%b2%d0%b0%d1%80%d1%96%d0%b9%d0%bd%d1%96-%d0%b2%d1%96%d0%b4%d0%ba%d0%bb%d1%8e%d1%87%d0%b5%d0%bd%d0%bd%d1%8f/'
    "https://www.zoe.com.ua/%d0%ba%d0%be%d1%80%d0%b8%d1%81%d0%bd%d1%96-%d0%bf%d0%be%d1%80%d0%b0%d0%b4%d0%b8/"
  );
  /*select quest_block where header contains our target city*/
  const targetCity = $(
    '.quest_block:has(.questing:contains("м. Запоріжжя (Запорізькі міські електричні мережі)"))'
  );

  /*search all dates, when works are planned */
  const getDates = (targetCity) => {
    let dates = [];

    targetCity.find("td[colspan=5] > span > strong").each((index, el) => {
      dates.push($(el).text());
    });

    /*formating date for comfortable compare */
    const formatDate = (date) => date.split(".").reverse().join(".");
    const today = formatDate(new Date().toLocaleDateString());
    /*filter to save only futures dates */
    dates = dates.filter((date) => {
      if (formatDate(date) < today) return false;
      return true;
    });
    return dates;
  };

  /*get info for each blackout of the date */
  const getDataByDate = (date) => {
    /*Start value is next to date row */
    let currentRow = targetCity.find(`td:Contains(${date}) < tr`).next();
    /*array to store the results of parse */
    const result = [];
    /*while row`s text hasn`t structure as dd.mm.yyyy */
    while (!currentRow.text().match(/\d{2}\.\d{2}\.\d{4}/)) {
      /*array of formated data*/
      /*delete sapces before and after string */
      /*splitting string by special symbols of new line */
      /*The same actions for each element in array */
      const recievedData = currentRow.text()
        .trim()
        .split('\n\n')
        .map(item => item.replace('\n', '').trim())
      const blackoutData = {
        time: recievedData[0],
        city: recievedData[1],
        addresses: recievedData[2].split('\n'),
        reason: recievedData[3],
      };
      result.push(blackoutData)
      currentRow = currentRow.next();
    }
    return result
  };

  const parsedInfo = getDates(targetCity).reduce((obj, key) => ({...obj, [key]: getDataByDate(key)}), {})
  console.log(parsedInfo);


  return parsedInfo
};

parse();
