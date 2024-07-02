import requests
from bs4 import BeautifulSoup
import csv

def scrape_vitamins_by_alphabet(alphabet):
    base_url = "https://www.webmd.com/vitamins/alpha/"
    url = base_url + alphabet.lower()

    try:
        # Send a GET request with a User-Agent header to avoid 403 Forbidden error
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes

        soup = BeautifulSoup(response.content, 'html.parser')

        # Find the list of vitamins
        vitamin_list = soup.find('div', class_='alpha-vitamins').find('ul').find_all('li')

        # Prepare CSV file for writing in append mode
        csv_filename = 'vitamins_list.csv'
        with open(csv_filename, 'a', newline='', encoding='utf-8') as csvfile:
            csv_writer = csv.writer(csvfile)

            # Write each vitamin and its link to CSV
            for vitamin in vitamin_list:
                vitamin_name = vitamin.text.strip()
                vitamin_link = vitamin.a['href']
                csv_writer.writerow([vitamin_name, vitamin_link])

        print(f"Scraping for alphabet '{alphabet}' successful. Data appended to {csv_filename}")

    except requests.exceptions.RequestException as e:
        print(f"Error during requests to {url}: {e}")
    except Exception as ex:
        print(f"An error occurred: {ex}")

# Get user input for alphabet
alphabet = input("Enter an alphabet (a-z): ").strip()

# Validate input (a single alphabet)
if alphabet.isalpha() and len(alphabet) == 1:
    scrape_vitamins_by_alphabet(alphabet)
else:
    print("Please enter a single alphabet (a-z).")

