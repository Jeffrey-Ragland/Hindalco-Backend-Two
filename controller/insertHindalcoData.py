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

import requests
import time
from datetime import datetime
import random

def generate_data():
    # Generate data for s1 to s10
    s_data = [random.randint(40, 80) for _ in range(10)]
    # Add 'N/A' for s11 to s15
    s_data.extend(['N/A'] * 5)
    return s_data

def format_time():
    now = datetime.now()
    return now.strftime('%y/%m/%d,%H:%M:%S')

def send_data():
    base_url = "http://localhost:4000/backend/insertHindalcoData"
    while True:
        s_data = generate_data()
        device_temperature = round(random.uniform(0.0, 100.0), 1)
        device_signal = round(random.uniform(0.0, 100.0), 1)
        device_battery = round(random.uniform(0.0, 100.0), 1)
        time_now = format_time()

        # Construct URL with s11 to s15 being 'N/A'
        url = f"{base_url}?deviceName=XY001&s1={s_data[0]}&s2={s_data[1]}&s3={s_data[2]}&s4={s_data[3]}&s5={s_data[4]}&s6={s_data[5]}&s7={s_data[6]}&s8={s_data[7]}&s9={s_data[8]}&s10={s_data[9]}&s11={s_data[10]}&s12={s_data[11]}&s13={s_data[12]}&s14={s_data[13]}&s15={s_data[14]}&deviceTemperature={device_temperature}&deviceSignal={device_signal}&deviceBattery={device_battery}&time={time_now}"
        
        response = requests.get(url)
        
        print(response.status_code, response.text)
        
        time.sleep(10)

if __name__ == "__main__":
    send_data()
