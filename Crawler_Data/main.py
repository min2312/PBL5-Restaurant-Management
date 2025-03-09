from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import csv

# Cấu hình Selenium với Chrome
options = webdriver.ChromeOptions()
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

# Mở Chrome
driver = webdriver.Chrome(options=options)

def get_menu_items():
    url = "https://phungthanh.vn/vi/menu"
    driver.get(url)
    
    # Chờ trang tải hoàn tất
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    
    # Cuộn trang xuống để tải toàn bộ nội dung nếu cần
    driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.END)
    time.sleep(3)
    
    # Lấy HTML của trang
    page_source = driver.page_source
    
    # Phân tích HTML bằng BeautifulSoup
    soup = BeautifulSoup(page_source, "html.parser")
    menu_items = []
    
    categories = soup.select("h4.mb-6.font-bold")  # Loại bỏ phần không cần thiết trong class

    for category in categories:
        category_name = category.text.strip()
        category_div = category.find_next("div", class_="flex flex-col gap-x-4 gap-y-4 md:flex-row")
        
        if category_div:
            item_containers = category_div.select("div.flex.w-full.justify-between")

            for item in item_containers:
                name_tag = item.select_one("p.text-xs")  # Chỉ giữ lại class chính
                price_tag = item.select_one("p.mr-2")    # Chỉ giữ lại class chính
                
                if name_tag and price_tag:
                    name = name_tag.text.strip()
                    price = price_tag.text.strip()
                    menu_items.append({"category": category_name, "name": name, "price": price})

    return menu_items

def save_to_csv(menu_data, filename="menu.csv"):
    with open(filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        
        writer.writerow(["Category", "Name", "Price"])
        
        for item in menu_data:
            writer.writerow([item["category"], item["name"], item["price"]])

if __name__ == "__main__":
    menu_data = get_menu_items()
    print(f"Số lượng món ăn lấy được: {len(menu_data)}")
    # for item in menu_data:
    #     print(item)
    save_to_csv(menu_data)
    driver.quit()
