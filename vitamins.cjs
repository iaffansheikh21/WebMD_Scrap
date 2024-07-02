const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeVitaminsByAlphabet(alphabet) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        const url = `https://www.webmd.com/vitamins/alpha/${alphabet.toLowerCase()}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Adjust timeout as needed

        // Wait for the element you want to scrape
        await page.waitForSelector('.alpha-vitamins ul li');

        // Extract vitamin data
        const vitaminList = await page.evaluate(() => {
            const vitamins = [];
            document.querySelectorAll('.alpha-vitamins ul li').forEach(vitamin => {
                const name = vitamin.textContent.trim();
                const link = vitamin.querySelector('a').href;
                vitamins.push({ name, link });
            });
            return vitamins;
        });

        // Prepare CSV file for writing in append mode
        const csvFilename = 'vitamins_list_JS.csv';
        const csvData = vitaminList.map(vitamin => `${vitamin.name},${vitamin.link}\n`);

        // Append data to CSV file
        fs.appendFileSync(csvFilename, csvData.join(''));

        console.log(`Scraping for alphabet '${alphabet}' successful. Data appended to ${csvFilename}`);

    } catch (error) {
        console.error(`Error scraping data: ${error}`);
    } finally {
        await browser.close();
    }
}

// Example usage: prompt user for an alphabet and scrape vitamins
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('Enter an alphabet (a-z): ', async (alphabet) => {
    if (alphabet.match(/^[a-zA-Z]$/)) {
        await scrapeVitaminsByAlphabet(alphabet);
    } else {
        console.log('Please enter a single alphabet (a-z).');
    }
    readline.close();
});
