// Modules
const mailwork = require("./mail");
const puppeteer = require('puppeteer-extra'); // сам пупитир
const UsernameGenerator = require('username-generator'); // генератор имен
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha'); // решалка капчи
const StealthPlugin = require('puppeteer-extra-plugin-stealth') //мега стелс by мегамозг slappy
let userAgent = require('random-useragent'); //тест фикс by мегамозг кабан

// captha plugin
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: `2caphtakey`
        },
        visualFeedback: true
    });
);

puppeteer.use(StealthPlugin()) // стелс хуй пизда картон

// Function
const delay = (time) => { return new Promise(function(resolve){setTimeout(resolve, time)}) };
const randomint = (min, max) => { return Math.floor(Math.random()*(max-min+1))+min };

// User info
const birthday = randomint(1, 28).toString(); 
const month_of_birth = randomint(1, 12).toString(); 
const year_of_birth = randomint(1990, 2001).toString();

const username = UsernameGenerator.generateUsername(); 
const pwd = function(v) {
    let r = '', c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i <= v; i++) {
        r += c.charAt(Math.floor(Math.random()*c.length));
    }; return r;
}(10)

const proxy = require(`fs`).readFileSync(`./proxies.txt`, 'utf-8').replace(/\r/g, '').split('\n')[Math.floor(Math.random() * require(`fs`).readFileSync(`./proxies.txt`, 'utf-8').replace(/\r/g, '').split('\n').length)]

console.log(`\n Proxy -> ${proxy}`);

// Init browser
function init_driver() {
    return new Promise((resolve, reject) => {
        console.log('Initilizing web driver...\n');
        puppeteer.launch({
            ignoreHTTPSErrors: true,
            headless: false,
            executablePath: "./WebDriver/chrome.exe",
            args: [
                `--proxy-server=socks5://${proxy}`,
            ]
        }).then(async browser => {
            const page = await browser.newPage();
            //await page.setViewport({width: 411, height: 731});
            console.log('Webdriver initilized\n');
            resolve(page)
        });
    })
}

// Main
(async () => {
    const usemail = await mailwork.pickmail();
    const email = `${dotit(name)}@gmail.com`;
    const UA = userAgent.getRandom()
    
    const name = usemail.name;
    const password = usemail.pass;

    function choose(choices) { return choices[Math.floor(Math.random()*choices.length)] }
    function dotit(email) {
      let username = email.split("@")[0], dotemail = "";
      dotemail +=username[username.length-1]
      
      for (let i = 0; i < username.length-1; i++) { dotemail += username[i] + choose(["", "."]) }
      return dotemail
    }


    console.log(`\n Mail -> ${email}\n`);
    
    // const tor = require('child_process').spawn("./Tor/tor.exe", ["--defaults-torrc", "./Tor/torrc", "-f", "./Tor/bridge.1"]);
    let page;
    // tor.stdout.on('data', async function(data) {
    //     data = data.toString();
    //     if (data.match(/Bootstrapped 100%/g)) {
    //         console.log('Tor started...\n');
    //         page = await init_driver();
    //         discord_gen_part();
    //     }
    // })

    let page = await init_driver();
    discord_gen_part();

    async function discord_gen_part() {
        await page.goto('https://discord.com/register');
        await page.setDefaultNavigationTimeout(0);

        console.log("\nПерехожу к регистрации...");

        async function data_entry(){
            return new Promise(async(resolve, reject) => {
                await page.type("input[type='email']", email);
                await page.waitForSelector("input[type='text']");
                await page.type("input[type='text']", username);
                await page.waitForSelector("input[type='password']");
                await page.type("input[type='password']", pwd);
                
                resolve("ok")
            })
        }

        async function click_date(page, name, min, max) {
            let i = await page.$('[class*=input' + name + "]");
            let r = Math.floor(Math.random() * (max - min + 1)) + min;
            
            await i.click();
            await page.waitForSelector('[class*=option]');
            await page.$eval("[class$=option]", (e, r) => {
                e.parentNode.childNodes[r].click()
            }, r); return r
        }
        
        async function date_of_birth_or_submit() {
            return new Promise(async(resolve, reject) => {

                await page.waitForSelector("#app-mount > div.app-1q1i1E > div > div > div > form > div > div > div.container-3bTSed.marginTop20-3TxNs6 > div.inputs-14Hc7m > div:nth-child(1) > div > div > div > div > div.css-1fhf191 > div"); 
                await page.click('#app-mount > div.app-1q1i1E > div > div > div > form > div > div > div.container-3bTSed.marginTop20-3TxNs6 > div.inputs-14Hc7m > div:nth-child(1) > div > div > div > div > div.css-1fhf191 > div');

                await click_date(page, "Year", 17, 24);
                await click_date(page, "Day", 0, 28);
                await click_date(page, "Month", 0, 11);

                await delay(200);
                await data_entry();

                await page.waitForSelector('.authBox-hW6HRx > .centeringWrapper-2Rs1dR > .block-egJnc0 > .marginTop20-3TxNs6 > .button-3k0cO7');
                await page.click('.authBox-hW6HRx > .centeringWrapper-2Rs1dR > .block-egJnc0 > .marginTop20-3TxNs6 > .button-3k0cO7');
                resolve("ok")
            })
        }

        await date_of_birth_or_submit();
        async function captha_solver() {
            console.log("\n[Captha]", "Решаю капчу");

            await delay(2000);
            await page.solveRecaptchas().then(async (govno) => {
                console.log("\n[Captha]", "Капча решана!");
                await delay(2000);
                await mailwork.getmessage(name,password).then(x=>{
                    solve_mail_captha(x);
                })
            });
        }

        await captha_solver();
    }

    async function get_token() {
        await page.goto('https://discord.com/channels/@me');
        await delay(1500);
        const token_ret = await page.evaluate("(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()"); //получение токена
        console.log("\nВыдаю токен: \n", token_ret);
    }

    async function solve_mail_captha(url) {
        await page.goto(url);
        await page.setDefaultNavigationTimeout(60000);
        await delay(1000);
        
        console.log("\n[Captha]", "Решаю капчу на почте");
        
        let { captchas, filtered, error } = await page.findRecaptchas();
        let { solutions, error2 } = await page.getRecaptchaSolutions(captchas);
        let { solved, error3 } = await page.enterRecaptchaSolutions(solutions);

        await delay(1000);

        try {
            if (solved[0].isSolved) {
                console.log("\n[Captha]", "Решил капчу на почте");
                return true;
            }
        } catch (e) { get_token() }
    }
})();
