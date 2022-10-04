process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const fs = require('fs');
var config = require('./config.json');
var looksSame = require('looks-same');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
    // headless: false // For debug
  });

  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 1920, deviceScaleFactor: 2});

  // Gaps login
  console.log("Load gaps login...")
  await page.goto('https://gaps.heig-vd.ch/consultation/controlescontinus/consultation.php');
  await page.waitForSelector('select[id="user_idp"]', {
    visible: true,
  });
  console.log("Loaded !")

  console.log("Select HES-SO")
  await page.select('#user_idp', 'https://aai-logon.hes-so.ch/idp/shibboleth')

  console.log("Click on connect button")
  await page.click('#wayf_submit_button')


  // AII login
  console.log("Load page AAI login...")
  await page.waitForSelector('button[id="login-button"]', {
    visible: true,
  });
  console.log("Loaded !")

  console.log("Filled the fields")
  await page.type('#username', config.username);
  await page.type('#password', config.password);

  console.log("Click on connect HES-SO button")
  await page.click('#login-button');


  // Gaps grades
  console.log("Load grades page...")
  try {
    await page.waitForSelector('td[class="titreBox"]', {
      visible: true,
    });
  } catch (error) {
    console.log("Error while loading grades page !")
    console.log("Check your credentials !")
    browser.close()
    process.exit(0)
  }
  console.log("Loaded !")

  console.log("Select semester")
  await page.select('#selta', config.semester)
  
  await new Promise(r => setTimeout(r, 200));


  console.log("load grades...")
  try {
    await page.waitForSelector('table[class="displayArray"]', {
      visible: true,
    });
  } catch (error) {
    console.log("Error while loading grades")
    browser.close()
    process.exit(0)
  }

  console.log("Grades loaded !")

  console.log("Save HTML to image")

  grades = await page.$('table[class="displayArray"]');
  try {
    await grades.screenshot({
       path: './notes.png'
      });
  } catch (e) {
    console.log("error :" + e)
  }

  console.log("Saved !")

  // Compare image
  if (fs.existsSync('./old.png')) {
    console.log("Compare with last time...")

    await new Promise((resolve) => {
      looksSame('./notes.png', './old.png', async function (error, { equal }) {
        if (!equal) {
          console.log("Different from last time!")
          console.log("Send notification...")

          const bot = new TelegramBot(config.telegram.token, { polling: true });

          const photo = fs.createReadStream('./notes.png')
          await bot.sendDocument(config.telegram.chatId, photo, { caption: "Il y a du changement" })
          
          console.log("Sended!")


        } else {
          console.log("Same from last time!")
        }

        resolve()
      })
    })


  } else {
    console.log('First time use script! Nothing to compare!')

  }

  fs.rename('./notes.png', './old.png', () => {
    console.log("Save current for next time!");
  });

  browser.close()
  process.exit(0)

})();