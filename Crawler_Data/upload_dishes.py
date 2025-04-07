import csv
import requests
import os

def upload_dishes_from_csv(csv_file_path, api_url):
    with open(csv_file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            category = row["Category"]
            name = row["Name"]
            price = row["Price"].replace(" VND", "").replace(".", "")
            image_url = row["Image"]

            # Prepare the payload for the API
            payload = {
                "category": category,
                "name": name,
                "price": price,
                "url_image": image_url,
                "image": "",
            }

            try:
                # Call the API
                response = requests.post(api_url, json=payload)
                if response.status_code == 200:
                    result = response.json()
                    if result.get("errCode") == 0:
                        print(f"Successfully created dish: {name}")
                    else:
                        print(f"Failed to create dish: {name}. Error: {result.get('errMessage')}")
                else:
                    print(f"HTTP Error for dish: {name}. Status Code: {response.status_code}")
            except Exception as e:
                print(f"Exception occurred while creating dish: {name}. Error: {str(e)}")

if __name__ == "__main__":
    csv_file_path = "d:/PBL5/Crawler_Data/menu.csv"
    api_url = "http://localhost:8081/api/create-new-dish" 

    if os.path.exists(csv_file_path):
        upload_dishes_from_csv(csv_file_path, api_url)
    else:
        print(f"CSV file not found at path: {csv_file_path}")