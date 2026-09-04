import json
import urllib.request
import urllib.error

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

def test_auth():
    print("--- 1. Testing Customer Login with Customer Role ---")
    status, res = make_req("/auth/login", method="POST", data={
        "email": "customer@agrichain.com",
        "password": "password123",
        "role": "customer"
    })
    print(f"Status: {status}")
    assert status == 200, f"Expected 200, got {status}: {res}"
    customer_token = res["access_token"]
    customer_user = res["user"]
    print(f"User role: {customer_user['role']}")
    assert customer_user["role"] == "customer"

    print("\n--- 2. Testing Customer Login with Mismatched Role (Farmer) ---")
    status, res = make_req("/auth/login", method="POST", data={
        "email": "customer@agrichain.com",
        "password": "password123",
        "role": "farmer"
    })
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 403, f"Expected 403, got {status}"
    assert "registered as a Customer" in res.get("detail", "")

    print("\n--- 3. Testing GET /api/auth/me for Customer ---")
    status, me_user = make_req("/auth/me", method="GET", token=customer_token)
    print(f"Status: {status}, Me Role: {me_user.get('role')}")
    assert status == 200
    assert me_user["role"] == "customer"

    print("\n--- 4. Testing Farmer Login with Farmer Role ---")
    status, res = make_req("/auth/login", method="POST", data={
        "email": "farmer@agrichain.com",
        "password": "password123",
        "role": "farmer"
    })
    print(f"Status: {status}")
    assert status == 200
    farmer_token = res["access_token"]
    farmer_user = res["user"]
    print(f"User role: {farmer_user['role']}")
    assert farmer_user["role"] == "farmer"

    print("\n--- 5. Testing Farmer Login with Mismatched Role (Customer) ---")
    status, res = make_req("/auth/login", method="POST", data={
        "email": "farmer@agrichain.com",
        "password": "password123",
        "role": "customer"
    })
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 403
    assert "registered as a Farmer" in res.get("detail", "")

    print("\n--- 6. Testing Customer Token Accessing Farmer Endpoint ---")
    status, res = make_req("/farmer/me/dashboard", method="GET", token=customer_token)
    print(f"Status: {status} (Expected 403)")
    assert status == 403

    print("\n--- 7. Testing Farmer Token Accessing Farmer Endpoint ---")
    status, res = make_req("/farmer/me/dashboard", method="GET", token=farmer_token)
    print(f"Status: {status} (Expected 200)")
    assert status == 200

    print("\n--- 8. Testing Invalid Password ---")
    status, res = make_req("/auth/login", method="POST", data={
        "email": "customer@agrichain.com",
        "password": "wrongpassword123",
        "role": "customer"
    })
    print(f"Status: {status}, Detail: {res.get('detail')}")
    assert status == 401
    assert "Invalid email or password" in res.get("detail", "")

    print("\n=== ALL BACKEND AUTH API TESTS PASSED PERFECTLY ===")

if __name__ == "__main__":
    test_auth()
