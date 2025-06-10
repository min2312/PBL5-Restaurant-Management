import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib  # Để lưu và tải mô hình
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans


def load_and_process_data(csv_path: str):
    """
    Load dữ liệu từ file CSV và xử lý các trường cần thiết.
    """
    # Đọc file CSV
    data = pd.read_csv(csv_path)

    # Skip string replacement since CookingTime is already numeric
    # Ensure CookingTime is treated as integer
    data['CookingTime'] = data['CookingTime'].astype(int)

    # Thêm các đặc trưng mới
    data['CookingTime_Squared'] = data['CookingTime'] ** 2
    data['Priority_Time_Interaction'] = data['CookingTime'] * data['CATEGORY_PRIORITY']

    # Chuẩn hóa các đặc trưng
    scaler = StandardScaler()
    features = data[['CookingTime', 'CATEGORY_PRIORITY', 'CookingTime_Squared', 'Priority_Time_Interaction']]
    X = scaler.fit_transform(features)

    # Sử dụng KMeans để tạo nhãn giả lập thay vì chia modulo
    kmeans = KMeans(n_clusters=3, random_state=42)
    y = kmeans.fit_predict(X)

    print("Dữ liệu đầu vào (X):")
    print(X[:5])  # Hiển thị 5 dòng đầu tiên của dữ liệu đầu vào
    print("Nhãn đầu ra (y):")
    print(y[:5])  # Hiển thị 5 nhãn đầu tiên

    return X, y


def train_and_save_model(X, y, model_path: str):
    """
    Huấn luyện mô hình Random Forest và lưu vào file.
    """
    # Chia dữ liệu thành tập huấn luyện và kiểm tra
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Sử dụng GridSearchCV để tìm kiếm siêu tham số tốt nhất
    from sklearn.model_selection import GridSearchCV

    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }

    grid_search = GridSearchCV(RandomForestClassifier(random_state=42), param_grid, cv=3, scoring='accuracy', n_jobs=-1)
    grid_search.fit(X_train, y_train)

    # Lấy mô hình tốt nhất
    model = grid_search.best_estimator_

    # Đánh giá mô hình
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Độ chính xác của mô hình: {accuracy * 100:.2f}%")
    print(f"Siêu tham số tốt nhất: {grid_search.best_params_}")

    # Lưu mô hình
    joblib.dump(model, model_path)
    print(f"Mô hình đã được lưu vào file: {model_path}")

    return model


def load_model(model_path: str):
    """
    Tải mô hình đã lưu từ file.
    """
    model = joblib.load(model_path)
    print(f"Mô hình đã được tải từ file: {model_path}")
    return model


def predict_and_assign_balanced(test_data, model, num_chefs):
    """
    Sử dụng mô hình để dự đoán Chef ID và phân bổ món ăn sao cho tổng thời gian nấu được chia đều.
    Trả về kết quả có cấu trúc để xử lý thêm.
    """
    # Tạo các đặc trưng bổ sung cho model (chỉ dùng 2 cột đầu: cooking_time và category_priority)
    model_features = test_data[:, :2]  # Chỉ lấy cooking_time và category_priority
    cooking_time_squared = model_features[:, 0] ** 2
    priority_time_interaction = model_features[:, 0] * model_features[:, 1]
    
    # Model input chỉ có 4 features: cooking_time, category_priority, cooking_time_squared, priority_time_interaction
    model_input = np.hstack((model_features, cooking_time_squared.reshape(-1, 1), priority_time_interaction.reshape(-1, 1)))

    # Dự đoán Chef ID cho từng món
    predictions = model.predict(model_input)

    # Khởi tạo danh sách lưu tổng thời gian nấu của mỗi đầu bếp
    chef_times = [0] * num_chefs
    chef_tasks = [[] for _ in range(num_chefs)]

    # Phân bổ món ăn dựa trên dự đoán và tối ưu hóa thời gian
    for i, chef_id in enumerate(predictions):
        # Lấy dữ liệu gốc từ test_data
        cooking_time = test_data[i, 0]
        category_priority = test_data[i, 1]
        dish_id = int(test_data[i, 2])  # Lấy dish_id từ cột thứ 3

        # Nếu đầu bếp dự đoán có tổng thời gian nấu lớn nhất, tìm đầu bếp khác có thời gian ít hơn
        if chef_times[chef_id] == max(chef_times):
            chef_id = np.argmin(chef_times)

        # Gán món ăn cho đầu bếp
        chef_tasks[chef_id].append({
            "CookingTime": int(cooking_time),
            "CATEGORY_PRIORITY": int(category_priority),
            "dishId": dish_id
        })
        chef_times[chef_id] += cooking_time

    # Cấu trúc kết quả
    results = []
    for chef_id in range(num_chefs):
        chef_result = {
            "chef_id": chef_id + 1,
            "tasks": chef_tasks[chef_id],
            "total_time": int(chef_times[chef_id])
        }
        results.append(chef_result)

    return results


if __name__ == "__main__":
    # Đường dẫn tới file CSV và file lưu mô hình
    csv_path = "Flask_AI\\ai.csv"
    model_path = "Flask_AI\\chef_model.pkl"

    # 1. Load và xử lý dữ liệu
    X, y = load_and_process_data(csv_path)

    # # 2. Huấn luyện và lưu mô hình
    model = train_and_save_model(X, y, model_path)

    # # 3. Tải mô hình đã lưu
    model = load_model(model_path)

    # 4. Dữ liệu test giả lập
    # test_data = np.array([
    #     [40, 2],  # Món khai vị, thời gian nấu 20 phút
    #     [23, 3],  # Món rau củ, thời gian nấu 15 phút
    #     [35, 4],  # Món chính, thời gian nấu 30 phút
    #     [14, 1],  # Đồ uống, thời gian nấu 10 phút
    #     [20, 6],  # Lẩu, thời gian nấu 25 phút
    # ])

    # # 5. Dự đoán và phân công đầu bếp
    # num_chefs = 3  # Số lượng đầu bếp
    # results = predict_and_assign_balanced(test_data, model, num_chefs)

    # # Lưu kết quả vào ai_results
    # ai_results = pd.DataFrame([{
    #     "chef_id": result["chef_id"],
    #     "task_details": str(result["tasks"]),
    #     "total_time": result["total_time"]
    # } for result in results])

    # # Xuất kết quả ra file CSV
    # ai_results.to_csv("Flask_AI\\ai_results.csv", index=False)
    print("Kết quả đã được lưu vào ai_results.csv")