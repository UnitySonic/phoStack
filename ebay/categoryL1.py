import csv

# Open the CSV file
with open('ebay_category.csv', newline='', encoding='utf-8') as csvfile:
    # Create a CSV reader object
    reader = csv.reader(csvfile)
    
    # Skip the first three rows since they contain headers
    for _ in range(3):
        next(reader)
    
    # Create a dictionary to store L1 categories and their IDs
    l1_categories = {}
    
    # Iterate over the rows
    for row in reader:
        # Check if the row is not empty
        if row:
            # Extract L1 category and ID
            l1_category = row[0].strip()
            category_id = row[-1].strip()
            
            # If L1 category is not empty, add it to the dictionary
            if l1_category:
                l1_categories[l1_category] = category_id

# Print the L1 categories and their IDs
for category, category_id in l1_categories.items():
    print(f'"{category}": {category_id},')