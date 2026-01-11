# %%
import requests
import json
# %%

# Define the API endpoint URL
url = "https://api.semanticscholar.org/graph/v1/author/batch"

# Define the query parameters
query_params = {
    "fields": "name,url,paperCount,hIndex,papers"
}

# Define the request data
data = {
    "ids": ["2277507"]
}

# Directly define the API key (Reminder: Securely handle API keys in production environments)
# api_key = "your api key goes here"  # Replace with the actual API key

# Define headers with API key
# headers = {"x-api-key": api_key}
headers = {}
# %%
# Send the API request
response = requests.post(url, params=query_params,
                         json=data, headers=headers).json()

print(response)
# %%
# Save the results to json file
with open('author_information.json', 'w') as output:
    json.dump(response, output)

# %%
