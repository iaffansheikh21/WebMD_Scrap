import requests
from bs4 import BeautifulSoup
import csv

def fetch_drug_list(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the URL: {e}")
        return None
    
    return response.text

def parse_html(html):
    try:
        soup = BeautifulSoup(html, 'html.parser')
        drug_elements = soup.select('div.drugs-partial-search-list ul li a')
        
        drugs = []
        for drug in drug_elements:
            name = drug.text.strip()
            link = f"https://www.webmd.com{drug['href']}"
            drugs.append({'name': name, 'link': link})
    except Exception as e:
        print(f"Error parsing HTML: {e}")
        return []
    
    return drugs

def scrape_drug_list(url):
    all_drugs = []
    current_url = url
    while current_url:
        html = fetch_drug_list(current_url)
        if html:
            drugs = parse_html(html)
            if drugs:
                all_drugs.extend(drugs)
                next_button = find_next_button(html)
                if next_button:
                    current_url = next_button['href']
                else:
                    current_url = None
            else:
                break
        else:
            break
    
    return all_drugs

def find_next_button(html):
    try:
        soup = BeautifulSoup(html, 'html.parser')
        next_button = soup.select_one('a.pagination-next')
        if next_button and next_button.has_attr('href'):
            return next_button
        else:
            return None
    except Exception as e:
        print(f"Error finding next button: {e}")
        return None

def filter_and_save_drugs(drugs, alphabet, csv_file):
    filtered_drugs = [drug for drug in drugs if drug['name'].lower().startswith(alphabet.lower())]
    
    print(f"Total drugs found: {len(drugs)}")
    print(f"Drugs matching '{alphabet}': {[drug['name'] for drug in filtered_drugs]}")

    if not filtered_drugs:
        print(f"No drugs found starting with the letter: {alphabet}")
        return

    try:
        with open(csv_file, 'a', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=['name', 'link'])
            for drug in filtered_drugs:
                writer.writerow(drug)
        print(f"Drugs starting with '{alphabet}' have been saved to {csv_file}.")
    except Exception as e:
        print(f"Error writing to CSV file: {e}")

def main():
    base_url = 'https://www.webmd.com/drugs/2/search?type=drugs&query='
    alphabet = input("Enter the starting alphabet of the drug names to filter: ").strip().lower()
    if len(alphabet) != 1 or not alphabet.isalpha():
        print("Please enter a single alphabet character.")
        return
    
    url = f"{base_url}{alphabet}"
    drugs = scrape_drug_list(url)
    if drugs:
        csv_file = 'filtered_drugs.csv'
        filter_and_save_drugs(drugs, alphabet, csv_file)

if __name__ == "__main__":
    main()

