# import requests
# import time
# from datetime import datetime
# import random

# def generate_data():
#     return [random.randint(40, 80) for _ in range(15)]

# def format_time():
#     now = datetime.now()
#     return now.strftime('%y/%m/%d,%H:%M:%S')

# def send_data():
#     base_url = "http://localhost:4000/backend/insertHindalcoData"
#     while True:
#         s_data = generate_data()
#         device_temperature = round(random.uniform(0.0, 100.0), 1)  
#         device_signal = round(random.uniform(0.0, 100.0), 1)       
#         device_battery = round(random.uniform(0.0, 100.0), 1) 
#         time_now = format_time()

#         url = f"{base_url}?deviceName=XY001&s1={s_data[0]}&s2={s_data[1]}&s3={s_data[2]}&s4={s_data[3]}&s5={s_data[4]}&s6={s_data[5]}&s7={s_data[6]}&s8={s_data[7]}&s9={s_data[8]}&s10={s_data[9]}&s11={s_data[10]}&s12={s_data[11]}&s13={s_data[12]}&s14={s_data[13]}&s15={s_data[14]}&deviceTemperature={device_temperature}&deviceSignal={device_signal}&deviceBattery={device_battery}&time={time_now}"
        
#         response = requests.get(url)
        
#         print(response.status_code, response.text)
        
#         time.sleep(10)

# if __name__ == "__main__":
#     send_data()


# FOR INSERTING N/A

# import requests
# import time
# from datetime import datetime
# import random

# def generate_data():
#     # Generate data for s1 to s10
#     s_data = [random.randint(10, 90) for _ in range(10)]
#     # Add 'N/A' for s11 to s15
#     s_data.extend(['N/A'] * 5)
#     return s_data

# def format_time():
#     now = datetime.now()
#     return now.strftime('%y/%m/%d,%H:%M:%S')

# def send_data():
#     base_url = "http://13.202.211.76:4000/backend/insertHindalcoData"
#     while True:
#         s_data = generate_data()
#         device_temperature = round(random.uniform(0.0, 100.0), 1)
#         device_signal = round(random.uniform(0.0, 100.0), 1)
#         device_battery = round(random.uniform(0.0, 100.0), 1)
#         time_now = format_time()

#         # Construct URL with s11 to s15 being 'N/A'
#         url = f"{base_url}?deviceName=XY001&s1={s_data[0]}&s2={s_data[1]}&s3={s_data[2]}&s4={s_data[3]}&s5={s_data[4]}&s6={s_data[5]}&s7={s_data[6]}&s8={s_data[7]}&s9={s_data[8]}&s10={s_data[9]}&s11={s_data[10]}&s12={s_data[11]}&s13={s_data[12]}&s14={s_data[13]}&s15={s_data[14]}&deviceTemperature={device_temperature}&deviceSignal={device_signal}&deviceBattery={device_battery}&time={time_now}"
        
#         response = requests.get(url)
        
#         print(response.status_code, response.text)
        
#         time.sleep(1)

# if __name__ == "__main__":
#     send_data()


# import requests
# import random
# import time

# # Set the base URL for your API
# BASE_URL = "http://localhost:4000/backend/insertHindalcoData"

# def generate_random_data():
#     """Generate random sensor data."""
#     device_name = "XY001"
#     data = {
#         "deviceName": device_name,
#         "s1": random.randint(20, 100),
#         "s2": random.randint(20, 100),
#         "s3": random.randint(20, 100),
#         "s4": random.randint(20, 100),
#         "s5": random.randint(20, 100),
#         "s6": random.randint(20, 100),
#         "s7": random.randint(20, 100),
#         "s8": random.randint(20, 100),
#         "s9": random.randint(20, 100),
#         "s10": random.randint(20, 100),
#         "s11": random.randint(20, 100),
#         "s12": random.randint(20, 100),
#         "s13": random.randint(20, 100),
#         "s14": random.randint(20, 100),
#         "s15": random.randint(20, 100),
#         "deviceTemperature": random.randint(20, 80),
#         "deviceSignal": random.randint(0, 30),
#         "deviceBattery": random.randint(20, 100),
#     }
#     return data

# def push_data():
#     """Send random data to the API."""
#     while True:
#         random_data = generate_random_data()
#         response = requests.get(BASE_URL, params=random_data)
        
#         if response.status_code == 200:
#             print(f"Data sent successfully: {random_data}")
#         else:
#             print(f"Failed to send data: {response.status_code} - {response.text}")
        
#         time.sleep(1)

# if __name__ == "__main__":
#     push_data()


# random data from 0 to 900
# import requests
# import random
# import time

# # Set the base URL for your API
# BASE_URL = "http://localhost:4000/backend/insertHindalcoData"

# def generate_random_increasing_data(previous_values, max_value=900, total_steps=51, current_step=1):
#     """Generate random sensor data with minimal deviation, gradually increasing to a maximum over specified steps."""
#     device_name = "XY001"
    
#     # Initialize the data dictionary
#     data = {
#         "deviceName": device_name,
#     }
    
#     # Calculate a dynamic step size to reach max_value over total_steps
#     for i in range(1, 16):  # s1 to s15
#         previous_value = previous_values.get(f"s{i}", 0)
        
#         # Step size increases as we approach the max_value
#         max_possible_increase = (max_value - previous_value) // (total_steps - current_step + 1)
#         step_size = random.randint(0, max(1, max_possible_increase))  # Minimum step size is 1
        
#         # Increment the sensor value, capped at max_value
#         new_value = min(max_value, previous_value + step_size)
        
#         data[f"s{i}"] = new_value
    
#     # Additional fields with fixed ranges
#     data["deviceTemperature"] = random.randint(20, 80)
#     data["deviceSignal"] = random.randint(0, 30)
#     data["deviceBattery"] = random.randint(20, 100)
    
#     return data

# def push_data():
#     """Send random increasing data to the API over 51 iterations."""
#     previous_values = {f"s{i}": 0 for i in range(1, 16)}  # Start with all sensor values at 0
    
#     for step in range(1, 52):  # 51 data points
#         random_increasing_data = generate_random_increasing_data(previous_values, current_step=step)
        
#         # Update previous values for the next iteration
#         previous_values = {key: value for key, value in random_increasing_data.items() if key.startswith('s')}
        
#         # Send data to the API
#         response = requests.get(BASE_URL, params=random_increasing_data)
        
#         if response.status_code == 200:
#             print(f"Data sent successfully: {random_increasing_data}")
#         else:
#             print(f"Failed to send data: {response.status_code} - {response.text}")
        
#         time.sleep(1)  # Wait 1 second before sending the next set of data

# if __name__ == "__main__":
#     push_data()

import requests
import random
import time

# Set the base URL for your API
BASE_URL = "http://localhost:4000/backend/insertHindalcoData"
# BASE_URL = "https://hindalco.xyma.live/backend/insertHindalcoData"

def generate_random_increasing_data(previous_values, max_value=900, total_steps=732, current_step=1):
    """Generate random sensor data with minimal deviation, gradually increasing to a maximum over specified steps."""
    device_name = "XY001"
    
    # Initialize the data dictionary
    data = {
        "deviceName": device_name,
    }
    
    # Calculate a dynamic step size to reach max_value over total_steps
    for i in range(1, 16):  # s1 to s15
        previous_value = previous_values.get(f"s{i}", 0)
        
        # Step size increases as we approach the max_value
        max_possible_increase = (max_value - previous_value) // (total_steps - current_step + 1)
        step_size = random.randint(0, max(1, max_possible_increase))  # Minimum step size is 1
        
        # Increment the sensor value, capped at max_value
        new_value = min(max_value, previous_value + step_size)
        
        data[f"s{i}"] = new_value
    
    # Additional fields with fixed ranges
    data["deviceTemperature"] = random.randint(20, 80)
    data["deviceSignal"] = random.randint(0, 30)
    data["deviceBattery"] = random.randint(20, 100)
    
    return data

def push_data():
    """Send random increasing data to the API over 732 iterations."""
    previous_values = {f"s{i}": 0 for i in range(1, 16)}  # Start with all sensor values at 0
    
    for step in range(1, 733):  # 732 data points
        random_increasing_data = generate_random_increasing_data(previous_values, total_steps=732, current_step=step)
        
        # Update previous values for the next iteration
        previous_values = {key: value for key, value in random_increasing_data.items() if key.startswith('s')}
        
        # Send data to the API
        response = requests.get(BASE_URL, params=random_increasing_data)
        
        if response.status_code == 200:
            print(f"Data sent successfully: {random_increasing_data}")
        else:
            print(f"Failed to send data: {response.status_code} - {response.text}")
        
        time.sleep(1)  # Wait 1 second before sending the next set of data

if __name__ == "__main__":
    push_data()
