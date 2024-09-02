import requests
import time
import math

# Initialize parameters
initial_value = 50
scaling_factor = 40  # Increased scaling factor for a broader range
num_points = 15

def generate_smooth_data(t):
    # Generate smooth, linearly varying data with a wider range
    return {
        f's{i+1}': round(initial_value + scaling_factor * math.sin(t + i), 2) for i in range(num_points)
    }

def send_data():
    url = "http://localhost:4000/backend/insertHindalcoData"
    t = 0
    while True:
        data = generate_smooth_data(t)
        response = requests.get(url, params=data)
        if response.status_code == 200:
            print("Data sent successfully:", data)
        else:
            print("Failed to send data:", response.status_code, response.text)
        
        t += 0.5  # Increment the time variable to create a smooth change in data
        time.sleep(0.01)  # Wait for 1 second before sending data again

if __name__ == "__main__":
    send_data()
