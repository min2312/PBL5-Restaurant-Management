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

    # Đặt User-Agent để giả lập trình duyệt thật
    driver.execute_cdp_cmd('Network.setUserAgentOverride', {"userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})

    # Cuộn trang từ từ để tải toàn bộ nội dung
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollBy(0, 500);")  # Cuộn xuống từng đoạn nhỏ
        time.sleep(1)  # Chờ một chút để nội dung tải
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

    # Chờ các thẻ img có class cụ thể xuất hiện
    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "img.h-full.w-full.object-cover"))
    )

    # Lấy tất cả các thẻ img bằng Selenium để đảm bảo hình ảnh đã tải
    image_elements = driver.find_elements(By.CSS_SELECTOR, "img.h-full.w-full.object-cover")
    image_urls = [img.get_attribute("src") for img in image_elements]

    # Lấy HTML của trang sau khi đảm bảo hình ảnh đã tải
    page_source = driver.page_source

    # Phân tích HTML bằng BeautifulSoup
    soup = BeautifulSoup(page_source, "html.parser")
    menu_items = []

    categories = soup.select("h4.mb-6.font-bold")

    image_index = 0  # Chỉ số để theo dõi hình ảnh

    for category in categories:
        category_name = category.text.strip()
        category_div = category.find_next("div", class_="flex flex-col gap-x-4 gap-y-4 md:flex-row")

        if category_div:
            item_containers = category_div.select("div.flex.w-full.justify-between")

            for item in item_containers:
                name_tag = item.select_one("p.text-xs")
                price_tag = item.select_one("p.mr-2")

                if name_tag and price_tag:
                    name = name_tag.text.strip()
                    price = price_tag.text.strip()

                    # Kiểm tra chỉ số hình ảnh hợp lệ trước khi gán
                    image = image_urls[image_index] if image_index < len(image_urls) else ""
                    menu_items.append({"category": category_name, "name": name, "price": price, "image": image})

                    image_index += 1  # Tăng chỉ số hình ảnh sau mỗi lần sử dụng

    return menu_items

def save_to_csv(menu_data, filename="d:/PBL5/Crawler_Data/menu.csv"):
    with open(filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        
        writer.writerow(["Category", "Name", "Price", "Image"])
        
        for item in menu_data:
            writer.writerow([item["category"], item["name"], item["price"], item["image"]])

if __name__ == "__main__":
    menu_data = get_menu_items()
    print(f"Số lượng món ăn lấy được: {len(menu_data)}")
    # for item in menu_data:
    #     print(item)
    save_to_csv(menu_data)
    driver.quit()
