const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const baseURL = 'https://www.webmd.com/drugs/2/search?type=drugs&query=';

// Function to scrape data from the URL
async function scrapeData(query) {
    try {
        const response = await fetch(`${baseURL}${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const text = await response.text();
        const dom = new JSDOM(text);
        const document = dom.window.document;
        
        const drugList = [];
        const drugItems = document.querySelectorAll('.drugs-partial-search-list ul li a');
        
        drugItems.forEach(item => {
            const drugName = item.textContent.trim();
            const drugLink = `https://www.webmd.com${item.href}`;
            drugList.push({ name: drugName, link: drugLink });
        });
        
        return drugList;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return [];
    }
}

// Function to append data to CSV
function appendToCSV(data, filename) {
    if (data.length === 0) return;

    const csvLines = data.map(item => `${item.name},${item.link}`).join('\n');
    const csvContent = data.length > 0 && !fs.existsSync(filename)
        ? 'Name,Link\n' + csvLines + '\n'
        : csvLines + '\n';

    fs.appendFile(filename, csvContent, (err) => {
        if (err) {
            console.error('Error writing to CSV:', err);
        } else {
            console.log('Data successfully appended to CSV');
        }
    });
}

// Main function to handle user input and process scraping
async function main() {
    const queries = ['panadol', 'panadol extra strength']; // Example queries
    const filename = 'drugs.csv';
    
    for (const query of queries) {
        console.log(`Scraping data for: ${query}`);
        const data = await scrapeData(query);
        appendToCSV(data, filename);
    }
}

main();
