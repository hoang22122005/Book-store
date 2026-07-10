import requests

isbns = ["0345803507", "055358202X", "0066238501", "0446677388"]
for isbn in isbns:
    url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=details"
    r = requests.get(url, timeout=10)
    print(f"ISBN {isbn}: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"  Keys: {list(data.keys())}")
        if data:
            key = list(data.keys())[0]
            details = data[key].get('details', {})
            print(f"  number_of_pages: {details.get('number_of_pages')}")
            print(f"  pagination: {details.get('pagination')}")
            print(f"  description: {details.get('description') is not None}")
