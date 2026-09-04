import json
import time
import urllib.request
import urllib.error
from pymongo import MongoClient

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"detail": err_body}
        return e.code, parsed

def run_tests():
    ts = int(time.time())
    cust_email = f"test.cust.{ts}@example.com"
    farmer_email = f"test.farmer.{ts}@example.com"

    print("1. Health Check...")
    status, res = make_req("/health")
    print(f"Status: {status}, Response: {res}")
    assert status == 200
    assert res.get("status") == "ok"
    assert res.get("message") == "AgriLink backend is running"

    print("\n2. Customer Registration (Expecting HTTP 201)...")
    cust_data = {
        "name": "Fresh Test Customer",
        "email": cust_email,
        "phone": "9876543210",
        "password": "TestPassword@123",
        "role": "customer",
        "address": {
            "street": "123 Farm Way",
            "city": "Raipur",
            "state": "Chhattisgarh",
            "pincode": "492001"
        }
    }
    status, res = make_req("/auth/register", method="POST", data=cust_data)
    print(f"Status: {status}, Response User ID: {res.get('id')}, Role: {res.get('role')}")
    assert status == 201, f"Expected 201, got {status}: {res}"
    assert res.get("role") == "customer"
    assert "password" not in res
    assert "password_hash" not in res

    print("\n3. Verify Customer Saved in MongoDB...")
    client = MongoClient("mongodb://localhost:27017")
    db = client["agrilink_db"]
    cust_db = db["users"].find_one({"email": cust_email})
    assert cust_db is not None, "User not found in MongoDB users collection!"
    assert "password_hash" in cust_db, "Password was not hashed!"
    assert "password" not in cust_db, "Plaintext password stored!"
    assert cust_db["role"] == "customer"
    print(f"Verified user in MongoDB: email={cust_db['email']}, role={cust_db['role']}, has_hash={bool(cust_db.get('password_hash'))}")

    print("\n4. Duplicate Email Registration Check (Expecting HTTP 409)...")
    status, res = make_req("/auth/register", method="POST", data=cust_data)
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 409, f"Expected 409, got {status}"
    assert res.get("detail") == "An account with this email already exists. Please login."

    print("\n5. Farmer Registration (Expecting HTTP 201)...")
    farmer_data = {
        "name": "Fresh Test Farmer",
        "email": farmer_email,
        "phone": "9876543211",
        "password": "TestPassword@123",
        "role": "farmer",
        "farm_name": "Sunrise Organic Farm",
        "farm_location": "Nagpur, Maharashtra",
        "crops": ["Wheat", "Tomatoes"],
        "farming_type": "Organic",
        "description": "Premium organic farming"
    }
    status, res = make_req("/auth/register", method="POST", data=farmer_data)
    print(f"Status: {status}, Response User ID: {res.get('id')}, Role: {res.get('role')}")
    assert status == 201, f"Expected 201, got {status}: {res}"
    assert res.get("role") == "farmer"

    farmer_db = db["users"].find_one({"email": farmer_email})
    assert farmer_db is not None, "Farmer not found in MongoDB users collection!"
    assert farmer_db["role"] == "farmer"
    print(f"Verified farmer in MongoDB: email={farmer_db['email']}, farm_details={farmer_db.get('farm_details')}")

    print("\n6. Customer Login (Expecting HTTP 200)...")
    status, res = make_req("/auth/login", method="POST", data={
        "email": cust_email,
        "password": "TestPassword@123",
        "role": "customer"
    })
    print(f"Status: {status}, User role: {res.get('user', {}).get('role')}")
    assert status == 200
    assert res.get("user", {}).get("role") == "customer"
    assert "access_token" in res

    print("\n7. Farmer Login (Expecting HTTP 200)...")
    status, res = make_req("/auth/login", method="POST", data={
        "email": farmer_email,
        "password": "TestPassword@123",
        "role": "farmer"
    })
    print(f"Status: {status}, User role: {res.get('user', {}).get('role')}")
    assert status == 200
    assert res.get("user", {}).get("role") == "farmer"
    assert "access_token" in res

    print("\n8. Mismatched Role Login Check (Customer trying to login as Farmer)...")
    status, res = make_req("/auth/login", method="POST", data={
        "email": cust_email,
        "password": "TestPassword@123",
        "role": "farmer"
    })
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 403

    print("\n========================================================")
    print("ALL VERIFICATIONS PASSED 100% PERFECTLY!")
    print("========================================================")

if __name__ == "__main__":
    run_tests()
