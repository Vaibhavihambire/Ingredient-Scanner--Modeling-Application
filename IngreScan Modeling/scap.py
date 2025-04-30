import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
import os

# Initialize Microsoft Edge WebDriver
driver_path = 'C:/Users/hp/Desktop/edgedriver_win64/msedgedriver.exe'  # Replace with the actual path to your Edge WebDriver
driver = webdriver.Edge(service=Service(driver_path))

# Function to scrape details from a product page
def scrape_product_details(driver):
    try:
        product_name = driver.find_element(By.CSS_SELECTOR, 'h2.title-1').text
    except:
        product_name = None

    try:
        barcode = driver.find_element(By.ID, 'barcode').text
    except:
        barcode = None

    try:
        common_name = driver.find_element(By.ID, 'field_generic_name_value').text
    except:
        common_name = None

    try:
        packaging = driver.find_element(By.ID, 'field_packaging_value').text
    except:
        packaging = None

    try:
        brands = driver.find_element(By.ID, 'field_brands_value').text
    except:
        brands = None

    try:
        categories = driver.find_element(By.ID, 'field_categories_value').text
    except:
        categories = None

    try:
        countries_sold = driver.find_element(By.ID, 'field_countries_value').text
    except:
        countries_sold = None

    # Scrape Nutri-Score and its quality description
    try:
        nutriscore_elements = driver.find_elements(By.CSS_SELECTOR, "a[href='#panel_nutriscore_2023'] .attr_card_header")
        nutriscore = [el.find_element(By.CSS_SELECTOR, ".attr_title").text for el in nutriscore_elements]
        nutriscore_quality = [el.find_element(By.CSS_SELECTOR, "span").text for el in nutriscore_elements]
    except:
        nutriscore = None
        nutriscore_quality = None

    # Scrape NOVA group and its processing description
    try:
        nova_elements = driver.find_elements(By.CSS_SELECTOR, "a[href='#panel_nova'] .attr_card_header")
        nova_group = [el.find_element(By.CSS_SELECTOR, ".attr_title").text for el in nova_elements]
        nova_processing = [el.find_element(By.CSS_SELECTOR, "span").text for el in nova_elements]
    except:
        nova_group = None
        nova_processing = None

    # Scrape Eco-Score
    try:
        ecoscore_elements = driver.find_elements(By.CSS_SELECTOR, "a[href='#panel_ecoscore'] .attr_card_header")
        eco_score = [el.find_element(By.CSS_SELECTOR, ".attr_title").text for el in ecoscore_elements]
    except:
        eco_score = None

    # Scrape Packaging Impact
    try:
        packaging_impact_element = driver.find_element(By.CSS_SELECTOR, "div#panel_group_packaging_recycling h4.evaluation_average_title")
        packaging_impact = packaging_impact_element.text.strip()
    except:
        packaging_impact = None

    # Scrape Nutrient Levels
    nutrient_levels = []
    try:
        nutrient_elements = driver.find_elements(By.CSS_SELECTOR, "ul.panel_accordion.accordion h4.evaluation__title")
        for element in nutrient_elements:
            nutrient_levels.append(element.text.strip())
        nutrient_levels = "; ".join(nutrient_levels)  # Combine all nutrient levels into a single string
    except:
        nutrient_levels = None

    # Scrape Ingredients
    try:
        ingredients = driver.find_element(By.CSS_SELECTOR, "div#panel_ingredients_content .panel_text").text
    except:
        ingredients = None

    # Scrape Additives
    additives = []
    try:
        additive_elements = driver.find_elements(By.CSS_SELECTOR, "div#panel_additives_content h4")
        for element in additive_elements:
            additives.append(element.text.strip())
        additives = "; ".join(additives)  # Combine all additives into a single string
    except:
        additives = None

    # Scrape Ingredient Analysis
    ingredient_analysis = []
    try:
        analysis_elements = driver.find_elements(By.CSS_SELECTOR, "div#panel_ingredients_analysis_content h4")
        for element in analysis_elements:
            ingredient_analysis.append(element.text.strip())
        ingredient_analysis = "; ".join(ingredient_analysis)  # Combine all ingredient analysis into a single string
    except:
        ingredient_analysis = None

    return {
        "Product Name": product_name,
        "Barcode": barcode,
        "Common Name": common_name,
        "Packaging": packaging,
        "Brands": brands,
        "Categories": categories,
        "Countries where sold": countries_sold,
        "Nutri-Score": "; ".join(nutriscore) if nutriscore else None,
        "Nutri-Score Quality": "; ".join(nutriscore_quality) if nutriscore_quality else None,
        "NOVA Group": "; ".join(nova_group) if nova_group else None,
        "Food Processing": "; ".join(nova_processing) if nova_processing else None,
        "Eco-Score": "; ".join(eco_score) if eco_score else None,
        "Packaging Impact": packaging_impact,
        "Nutrient Levels": nutrient_levels,
        "Ingredients": ingredients,
        "Additives": additives,
        "Ingredient Analysis": ingredient_analysis
    }

# Function to scrape products from the current page
def scrape_first_page(driver):
    product_data_list = []

    # Get all product links on the current page
    products = driver.find_elements(By.CSS_SELECTOR, "a.list_product_a")
    product_links = [product.get_attribute('href') for product in products]

    for link in product_links:
        driver.get(link)
        time.sleep(2)  # Adjust sleep time if necessary
        
        # Scrape product details
        product_data = scrape_product_details(driver)
        product_data_list.append(product_data)

        # Go back to the product listing page
        driver.back()
        time.sleep(2)

    return product_data_list

# Function to scrape products in batches of 5 pages
def scrape_in_batches(driver, start_page=1, num_pages=5):
    product_data_list = []
    # current_page = start_page
    # Open the initial start page
    driver.get(f"https://in.openfoodfacts.org/{start_page}")
    time.sleep(2)

    while num_pages > 0:
        # Scrape products on the current page
        product_data_list.extend(scrape_first_page(driver))
        
        # Check for the "Next" button and go to the next page
        try:
            next_button = driver.find_element(By.CSS_SELECTOR, "li a[rel='next$nofollow']")
            next_button.click()
            time.sleep(2)  # Adjust sleep time if necessary
            current_page += 1
            num_pages -= 1
        except:
            # If the "Next" button is not found, exit the loop
            break
    
    return product_data_list

# Open the main page (First page of products)
driver.get("https://in.openfoodfacts.org/")

# Set the starting page and the number of pages to scrape
start_page = 126 # Adjust this value to continue from a specific page
pages_to_scrape = 5

# Scrape the specified number of 
scraped_data = scrape_in_batches(driver, start_page, pages_to_scrape)
# Convert data to DataFrame
df = pd.DataFrame(scraped_data)

# Check if the file already exists
csv_file_path = 'products_scraped.csv'

if os.path.exists(csv_file_path):
    # Append new data to the existing file
    existing_df = pd.read_csv(csv_file_path)
    combined_df = pd.concat([existing_df, df], ignore_index=True)
    combined_df.to_csv(csv_file_path, index=False)
else:
    # Create a new CSV file
    df.to_csv(csv_file_path, index=False)

# Close the browser
driver.quit()

print(f"Scraping of pages {start_page} to {start_page + pages_to_scrape - 1} completed and saved to '{csv_file_path}'")
