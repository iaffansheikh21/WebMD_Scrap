const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const baseURL = 'https://www.webmd.com/drugs/2/search?type=drugs&query=';

// Function to scrape data from the URL based on alphabet
async function scrapeMedicinesStartingWith(alphabet) {
    try {
        const response = await fetch(`${baseURL}${encodeURIComponent(alphabet)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const text = await response.text();
        const dom = new JSDOM(text);
        const document = dom.window.document;
        
        const drugList = [];
        const drugItems = document.querySelectorAll('.drugs-partial-search-list ul li a');
        
        drugItems.forEach(item => {
            const drugName = item.textContent.trim();
            const drugLink = `https://www.webmd.com${item.href}`;
            
            // Check if the drug name starts with the specified alphabet
            if (drugName.toLowerCase().startsWith(alphabet.toLowerCase())) {
                drugList.push({ name: drugName, link: drugLink });
            }
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

// Function to handle user input and process scraping dynamically
async function handleUserInputAndScrape() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (true) {
        let alphabet = await askQuestion(readline, 'Enter the alphabet to search for medicines starting with (or type "exit" to quit): ');

        if (alphabet.toLowerCase() === 'exit') {
            console.log('Exiting...');
            break;
        }

        console.log(`Searching for medicines starting with: ${alphabet}`);
        const medicines = await scrapeMedicinesStartingWith(alphabet);
        const filename = `medicines_starting_with_${alphabet.toLowerCase()}.csv`;
        appendToCSV(medicines, filename);
    }

    readline.close();
}

// Helper function to ask a question via readline
function askQuestion(readline, question) {
    return new Promise(resolve => {
        readline.question(question, resolve);
    });
}

// Main function to initiate the process
async function main() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('Welcome to the Medicine Scraper!');
    await handleUserInputAndScrape(readline);
}

main();
