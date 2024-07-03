import requests
from bs4 import BeautifulSoup
import time

def get_page_data(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        return soup
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def scrape_uses_page(url):
    soup = get_page_data(url)
    if soup:
        uses_container = soup.find('div', {'id': 'uses-container'})
        uses_content = uses_container.get_text(strip=True) if uses_container else 'No uses information available.'
        return uses_content, soup
    return 'No uses information available.', None

def scrape_other_pages(soup):
    details = []
    current_soup = soup

    while True:
        # Scrape current page
        other_details = {}
        
        side_effects = current_soup.find('div', {'id': 'side-effects-container'})
        side_effects_content = side_effects.get_text(strip=True) if side_effects else 'No side effects information available.'
        other_details['Side Effects'] = side_effects_content
        
        precautions = current_soup.find('div', {'id': 'precautions-container'})
        precautions_content = precautions.get_text(strip=True) if precautions else 'No precautions information available.'
        other_details['Precautions'] = precautions_content
        
        interactions = current_soup.find('div', {'id': 'interactions-container'})
        interactions_content = interactions.get_text(strip=True) if interactions else 'No interactions information available.'
        other_details['Interactions'] = interactions_content
        
        overdose = current_soup.find('div', {'id': 'overdose-container'})
        overdose_content = overdose.get_text(strip=True) if overdose else 'No overdose information available.'
        other_details['Overdose'] = overdose_content
        
        details.append(other_details)

        # Find the "Next" button and navigate to the next page
        next_button = current_soup.find('a', {'class': 'next'})
        if next_button and 'href' in next_button.attrs:
            next_url = next_button['href']
            current_soup = get_page_data(next_url)
            time.sleep(2)  # Respectful scraping: wait for 2 seconds before the next request
        else:
            break

    return details

def print_medicine_details(uses_content, details_list):
    print("\nMedicine Details:")
    print("-" * 40)
    print("Uses:")
    print("-" * 40)
    print(uses_content)
    
    for idx, details in enumerate(details_list, 1):
        print(f"\nAdditional Details - Page {idx}:")
        print("-" * 40)
        for key, value in details.items():
            print(f"{key}:")
            print("-" * 40)
            print(value)
            print("-" * 40)

start_url = 'https://www.webmd.com/drugs/2/drug-11157/c-complex-oral/details'
uses_content, soup = scrape_uses_page(start_url)

if soup:
    other_pages_details = scrape_other_pages(soup)
    print_medicine_details(uses_content, other_pages_details)
else:
    print("Failed to retrieve medicine details.")
