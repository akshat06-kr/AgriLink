from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth():
    print("1. Testing health check...")
    res = client.get("/api/health")
    print("Health response:", res.status_code, res.json())
    assert res.status_code == 200

    print("\n2. Testing Customer Registration...")
    import uuid
    unique_email = f"test.user.{uuid.uuid4().hex[:6]}@example.com"
    reg_data = {
        "name": "Test Customer",
        "email": unique_email,
        "phone": "9876543210",
        "password": "password123",
        "role": "CUSTOMER",
        "address": "123 Green Street, New Delhi"
    }
    res = client.post("/api/auth/register", json=reg_data)
    print("Register response:", res.status_code, res.json())
    assert res.status_code == 201

    print("\n3. Testing Login with registered Customer...")
    login_data = {
        "email": unique_email,
        "password": "password123",
        "role": "CUSTOMER"
    }
    res = client.post("/api/auth/login", json=login_data)
    print("Login response status:", res.status_code)
    token_json = res.json()
    print("Token received:", "access_token" in token_json, "User role:", token_json.get("user", {}).get("role"))
    assert res.status_code == 200
    assert "access_token" in token_json

    print("\n4. Testing Role Mismatch Login...")
    mismatch_data = {
        "email": unique_email,
        "password": "password123",
        "role": "FARMER"
    }
    res = client.post("/api/auth/login", json=mismatch_data)
    print("Role mismatch status:", res.status_code, res.json())
    assert res.status_code == 403

    print("\n5. Testing Demo Login (Buyer)...")
    res = client.post("/api/auth/login", json={"email": "customer@agrichain.com", "password": "password123", "role": "CUSTOMER"})
    print("Demo Customer login status:", res.status_code)
    assert res.status_code == 200

    print("\n6. Testing Demo Login (Farmer)...")
    res = client.post("/api/auth/login", json={"email": "farmer@agrichain.com", "password": "password123", "role": "FARMER"})
    print("Demo Farmer login status:", res.status_code)
    assert res.status_code == 200

    print("\nALL AUTH TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_auth()
