const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');

async function scrapeVitaminsByAlphabet(alphabet) {
    const browser = await puppeteer.launch({ headless: true, timeout: 60000 }); // Increased timeout
    const page = await browser.newPage();

    try {
        const url = `https://www.webmd.com/vitamins/alpha/${alphabet.toLowerCase()}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const vitaminLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('.alpha-vitamins ul li a'));
            return links.map(link => {
                return {
                    href: link.href,
                    name: link.textContent.trim()
                };
            });
        });

        const csvFilename = 'vit_details.csv';
        const stream = fs.createWriteStream(csvFilename, { flags: 'a' });
        stream.write('Vitamin,Details\n');

        for (const linkObj of vitaminLinks) {
            try {
                await page.goto(linkObj.href, { waitUntil: 'domcontentloaded' });
                const html = await page.content();
                const $ = cheerio.load(html);

                const vitaminName = linkObj.name;
                const overview = $('.overview-content').text().trim();
                const usesEffectiveness = $('.uses-container').text().trim();
                const sideEffects = $('.side-effects-content').text().trim();
                const precautionsWarnings = $('.precautions-content').text().trim();
                const interactions = $('.interactions-content').text().trim();
                const dosing = $('.dosage-content').text().trim();

                const details = `
                                Vitamin Name: ${vitaminName}
                                Overview: ${overview}
                                Uses & Effectiveness: ${usesEffectiveness}
                                Side Effects: ${sideEffects}
                                Precautions & Warnings: ${precautionsWarnings}
                                Interactions: ${interactions}
                                Dosing: ${dosing}
                                `;

                console.log(details);
                stream.write(`${vitaminName},${details.replace(/\n/g, ' ')}\n`);
            } catch (error) {
                console.error(`Error scraping vitamin details: ${error}`);
                continue; // Skip to next vitamin on error
            }
        }

        console.log(`Scraping for alphabet '${alphabet}' successful. Data appended to ${csvFilename}`);
    } catch (error) {
        console.error(`Error navigating to ${url}: ${error}`);
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
