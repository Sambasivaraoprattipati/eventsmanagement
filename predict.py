import pickle
import sys
import json
import numpy as np

def predict(input_data):
    # Load the model
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    # Perform prediction
    prediction = model.predict([input_data])[0]  # Assuming input_data is a string or a list of features
    
    # Convert prediction to a standard Python type if necessary
    if isinstance(prediction, np.int64):
        prediction = int(prediction)
    
    # Return prediction result as JSON
    return {"prediction": prediction}

if __name__ == "__main__":
    # Read input from stdin
    input_data = sys.stdin.read()
    input_json = json.loads(input_data)

    description = input_json.get("description")
    if description is None:
        print(json.dumps({"error": "No description provided"}))
        sys.exit(1)
    
    result = predict(description)
    
    # Output result as JSON string
    print(json.dumps(result))
