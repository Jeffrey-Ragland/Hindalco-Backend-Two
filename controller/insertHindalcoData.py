import requests
import random
import time

# URL endpoint
url = "http://localhost:4000/backend/insertHindalcoData"

# Static device name
device_name = "XY001"

# Function to generate random data and make a request
def push_data():
    # Random data for s1 to s10 (0 to 100)
    sensor_data = {f"s{i}": random.randint(0, 100) for i in range(1, 11)}

    # s11 to s15 should be "N/A"
    for i in range(11, 16):
        sensor_data[f"s{i}"] = "N/A"

    # Random values for deviceTemperature (0 to 120)
    device_temperature = random.randint(0, 120)

    # Random values for deviceSignal and deviceBattery (0 to 100)
    device_signal = random.randint(0, 100)
    device_battery = random.randint(0, 100)

    # Query parameters
    params = {
        "deviceName": device_name,
        **sensor_data,
        "deviceTemperature": device_temperature,
        "deviceSignal": device_signal,
        "deviceBattery": device_battery
    }

    try:
        # Send the GET request
        response = requests.get(url, params=params)
        if response.status_code == 200:
            print(f"Data sent successfully: {response.text}")
        else:
            print(f"Failed to send data. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error occurred: {e}")

# Continuously push data every 1 second
while True:
    push_data()
    time.sleep(10)
