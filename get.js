const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const fs = require('fs');
var config = require('./config.json');
var html2json = require('html2json').html2json;


(async () => {
  const browser = await puppeteer.launch({
    //headless: false
  });

  const page = await browser.newPage();

  await page.goto('https://gaps.heig-vd.ch/consultation/controlescontinus/consultation.php?idst=15635');
  console.log("Load page...")
  await page.waitForSelector('table[style="background-image: url(/consultation/images/banner_heig-vd.png);"]', {
    visible: true,
  });
  console.log("Loaded !")

  console.log("Check if login is needed")
  if (await page.$('#wayf_submit_button') !== null) {
    await page.select('#user_idp', 'https://aai-logon.hes-so.ch/idp/shibboleth')
    console.log("Click on connect gaps button")
    await page.click('#wayf_submit_button');
    console.log("Load page...")
    await page.waitForSelector('button', {
      visible: true,
    });
    console.log("Loaded !")

    if(page.url().includes("aai-logon")){
      console.log("AAI login needed")
      console.log("Filled the fields")
      await page.type('#username', config.username);
      await page.type('#password', config.password);
      await page.click('#btn-submit');
      console.log("Click on connect HES-SO button")
      console.log("Load page...")
      await page.waitForSelector('table[style="background-image: url(/consultation/images/banner_heig-vd.png);"]', {
        visible: true,
      });
      console.log("Loaded !")
    }

  }

  console.log("load grades...")
  await page.waitForSelector('table[class="displayArray"]', {
    visible: true,
  });
  console.log("Grades loaded !")

  console.log("Save HTML")

  html = await page.$eval('table[class="displayArray"]', (element) => {
    return element.innerHTML
  })

  fs.writeFileSync('./current.html', html);

  console.log("Saved !")


  if(fs.existsSync('./old.html')){
    console.log("Compare with last time...")
    var old = fs.readFileSync('./old.html', 'utf-8');
    var current = fs.readFileSync('./current.html', 'utf-8');
  
    if(old === current){
      console.log("Same from last time!")
    } else {
      console.log("Different from last time!")
      let diff= "";
      current.split('').forEach(function(val, i){
        if (val != old.charAt(i))
          diff += val ;         
      });

      let json = html2json(diff);
      console.log("Send notification...")

      const bot = new TelegramBot(config.telegram.token, {polling: true});
    
      bot.sendMessage(config.telegram.chatId, 
        "Libellé : " + json.child[2].child[0].child[0].text + ", " +
        "Note : " + json.child[5].child[0].text)
      console.log("Sended!")
    }
  } else {
    console.log('First time use script!')
  }

  fs.rename('./current.html', './old.html', () => {
    console.log("Save current for next time!");
  });
  
  await browser.close();

})();