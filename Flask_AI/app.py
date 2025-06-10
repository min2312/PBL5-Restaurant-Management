from flask import Flask
import socketio
import threading
import pandas as pd
import numpy as np
from ai_chef_2 import load_model, predict_and_assign_balanced

app = Flask(__name__)

# Tạo socket.io client
sio = socketio.Client()

# Global variables to store chef count and filtered orders
chef_count = None
filtered_orders = []
ai_results = []  # Variable to store AI results

def update_filtered_orders(order_id, order_details):
    """
    Update the global filtered_orders array with the given order details.
    """
    global filtered_orders
    # Filter order details with status = false
    filtered_order_details = [
        {
            'dish_id': detail['dishId'],
            'dish_name': detail['Dish']['name'],
            'category': detail['Dish']['Category'],
            'quantity': detail['quantity'],
            'order_session': detail.get('orderSession', 1),
            'created_at': detail.get('createdAt'),
            'status': detail['status']
        }
        for detail in order_details if not detail['status']
    ]

    # Remove the order if no pending dishes remain
    filtered_orders = [
        order for order in filtered_orders if order['order_id'] != order_id
    ]

    # Add the order back if it has pending dishes
    if filtered_order_details:
        filtered_orders.append({
            'order_id': order_id,
            'order_details': filtered_order_details
        })

def listen_to_socket_server():
    global chef_count, filtered_orders

    try:
        # Kết nối với header đặc biệt cho AI service
        sio.connect('http://localhost:8081', headers={
            'x-ai-service': 'true',
            'user-agent': 'python-ai-service'
        })
        print("Connected to socket server. Listening for events...")

        @sio.on('receiveOrder')
        def on_receive_order(data):
            print(f"Received 'receiveOrder' event: {data}")
            if 'order' in data and 'orderDetail' in data:
                new_order = {**data['order'], 'OrderDetails': data['orderDetail']}
                filtered_orders.append(new_order)
            else:
                filtered_orders.append(data)
            print("Updated filtered orders:", filtered_orders)
            if chef_count is not None:
                # Trigger AI processing when a new order is received
                process_orders_with_ai()

        @sio.on("chefCountUpdated")
        def on_chef_count_updated(data):
            global chef_count, filtered_orders
            chef_count = data.get('chefCount')
            orders = data.get('orders', [])
            print(f"Received 'chefCountUpdated' event: Chef count = {chef_count}")
            filtered_orders.clear()
            filtered_orders = orders
            print("Updated filtered orders:", filtered_orders)

            if chef_count is not None:
                # Trigger AI processing when a new order is received
                process_orders_with_ai()

        @sio.on('orderStatusUpdate')
        def on_order_status_update(data):
            global filtered_orders  # Ensure filtered_orders is treated as a global variable
            print(f"Received 'orderStatusUpdate' event: {data}")
            found = False
            updated_orders = []

            for order in filtered_orders:
                if order['id'] == data.get('orderId'):
                    found = True
                    updated_order = {**order}
                    updated_order['OrderDetails'] = [
                        {
                            **detail,
                            'status': data['status']
                        } if (
                            detail['dishId'] == data.get('dishId') and
                            detail['orderSession'] == data.get('orderSession')
                        ) else detail
                        for detail in order['OrderDetails']
                    ]
                    updated_orders.append(updated_order)
                else:
                    updated_orders.append(order)

            # If order is not found and the update makes an item pending, add the order from socket data
            if not found and data.get('status') is False:
                if data.get('order') and data.get('orderDetail'):
                    updated_orders.append({
                        **data['order'],
                        'OrderDetails': data['orderDetail']
                    })

            filtered_orders = updated_orders
            print("Updated filtered orders:", filtered_orders)

            if chef_count is not None:
                # Trigger AI processing when a new order is received
                process_orders_with_ai()

        @sio.on('dishCancelled')
        def on_dish_cancelled(data):
            print(f"Received 'dishCancelled' event: {data}")
            global filtered_orders  # Ensure filtered_orders is treated as a global variable

            filtered_orders = [
                {
                    **order,
                    'OrderDetails': [
                        detail for detail in order['OrderDetails'] if detail['dishId'] != data.get('dishId')
                    ]
                } if order['id'] == data.get('orderId') else order
                for order in filtered_orders
            ]

            # Re-filter the orders to remove empty ones
            filtered_orders = [
                order for order in filtered_orders if order['OrderDetails']
            ]
            print("Updated filtered orders:", filtered_orders)

            if chef_count is not None:
                # Trigger AI processing when a new order is received
                process_orders_with_ai()

        @sio.on('connect')
        def on_connect():
            print("Successfully connected to socket server!")

        @sio.on('connect_error')
        def on_connect_error(data):
            print(f"Connection failed: {data}")

        @sio.on('disconnect')
        def on_disconnect():
            print("Disconnected from socket server")

        # Giữ kết nối
        sio.wait()
    except Exception as e:
        print(f"Error connecting to socket server: {str(e)}")

def send_event(event_name, event_data=None):
    try:
        # Gửi sự kiện tới socket server
        sio.emit(event_name, event_data or {})
        print(f"Event '{event_name}' sent successfully with data: {event_data or {}}")
    except Exception as e:
        print(f"Error sending event: {str(e)}")

def process_orders_with_ai():
    """
    Process filtered orders using AI and store the results in ai_results.
    """
    global filtered_orders, chef_count, ai_results

    if chef_count is None or not filtered_orders:
        print("Chef count or filtered orders are not available for AI processing.")
        return

    # Load ai.csv to fetch CookingTime and CATEGORY_PRIORITY
    csv_path = "Flask_AI\\ai.csv"
    ai_data = pd.read_csv(csv_path)

    # Prepare test data for AI
    test_data = []
    for order in filtered_orders:
        for detail in order['OrderDetails']:
            if not detail['status']:  # Only process orders with dish status = false
                dish_id = detail['dishId']
                dish_info = ai_data[ai_data['id'] == dish_id]
                if not dish_info.empty:
                    cooking_time = dish_info.iloc[0]['CookingTime']
                    category_priority = dish_info.iloc[0]['CATEGORY_PRIORITY']
                    test_data.append([cooking_time, category_priority, dish_id])

    if not test_data:
        print("No valid test data for AI processing.")
        return

    test_data = np.array(test_data)

    # Load the AI model
    model_path = "Flask_AI\\chef_model.pkl"
    model = load_model(model_path)

    # Run AI prediction and assign tasks
    # predict_and_assign_balanced() already returns the complete results
    ai_results = predict_and_assign_balanced(test_data, model, chef_count)

    print(f"AI processing completed. Results stored in ai_results {ai_results}.")
    send_event('aiResults', ai_results)

if __name__ == '__main__':
    threading.Thread(target=listen_to_socket_server, daemon=True).start()
    app.run(debug=True, port=5000)
