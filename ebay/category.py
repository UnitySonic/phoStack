import csv

# Open the CSV file
with open('ebay_category.csv', newline='', encoding='utf-8') as csvfile:
    # Create a CSV reader object
    reader = csv.reader(csvfile)
    
    # Skip the first three rows since they contain headers
    for _ in range(3):
        next(reader)
    
    # Create a dictionary to store L2 categories and their IDs
    l2_categories = {}
    
    # Iterate over the rows
    for row in reader:
        # Check if the row is not empty
        if row:
            # Extract L2 category and ID
            l2_category = row[1].strip()
            category_id = row[-1].strip()
            
            # If L2 category is not empty, add it to the dictionary
            if l2_category:
                l2_categories[l2_category] = category_id

# Print the L2 categories and their IDs
for category, category_id in l2_categories.items():
  print(f'{category_id}: "{category}",')
