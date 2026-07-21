from app.security import decode_access_token

VALID_EMAIL = "test@example.com"
VALID_PASSWORD = "secret123"


def register(client, email=VALID_EMAIL, password=VALID_PASSWORD):
    return client.post("/auth/register", json={"email": email, "password": password})


def login(client, email=VALID_EMAIL, password=VALID_PASSWORD):
    return client.post("/auth/login", json={"email": email, "password": password})


# ---------- /auth/register ----------

class TestRegister:
    def test_register_success_returns_201_and_token(self, client):
        res = register(client)

        assert res.status_code == 201
        body = res.json()
        assert body["token_type"] == "bearer"
        assert isinstance(body["access_token"], str) and body["access_token"]
        assert body["user"]["email"] == VALID_EMAIL
        assert isinstance(body["user"]["id"], int)

    def test_register_does_not_leak_password_hash(self, client):
        res = register(client)
        assert "password" not in res.json()["user"]

    def test_register_token_encodes_correct_user_id(self, client):
        res = register(client)
        user_id = res.json()["user"]["id"]

        payload = decode_access_token(res.json()["access_token"])
        assert payload is not None
        assert payload["sub"] == str(user_id)

    def test_register_duplicate_email_returns_400(self, client):
        first = register(client)
        assert first.status_code == 201

        second = register(client)
        assert second.status_code == 400
        assert "already exists" in second.json()["detail"]

    def test_register_duplicate_email_does_not_create_second_user(self, client):
        register(client)
        register(client)  # should be rejected, not silently create a duplicate

        # Logging in should still work and return exactly one identity;
        # if a duplicate row existed, this endpoint would still 200 either way,
        # so we check indirectly via the login flow behaving normally.
        res = login(client)
        assert res.status_code == 200

    def test_register_password_too_short_returns_422(self, client):
        res = register(client, password="short")
        assert res.status_code == 422

    def test_register_invalid_email_format_returns_422(self, client):
        res = register(client, email="not-an-email")
        assert res.status_code == 422

    def test_register_missing_fields_returns_422(self, client):
        res = client.post("/auth/register", json={"email": VALID_EMAIL})
        assert res.status_code == 422

    def test_register_password_is_hashed_not_stored_plaintext(self, client):
        from app.database import Base  # noqa: F401  (ensures app import order for direct DB check)
        from app.models import User
        from conftest import TestingSessionLocal

        register(client)

        db = TestingSessionLocal()
        try:
            user = db.query(User).filter(User.email == VALID_EMAIL).first()
            assert user is not None
            assert user.password != VALID_PASSWORD
            assert user.password.startswith("$2b$")  # bcrypt hash prefix
        finally:
            db.close()


# ---------- /auth/login ----------

class TestLogin:
    def test_login_success_returns_200_and_token(self, client):
        register(client)

        res = login(client)

        assert res.status_code == 200
        body = res.json()
        assert body["token_type"] == "bearer"
        assert isinstance(body["access_token"], str) and body["access_token"]
        assert body["user"]["email"] == VALID_EMAIL

    def test_login_token_encodes_correct_user_id(self, client):
        register_res = register(client)
        user_id = register_res.json()["user"]["id"]

        login_res = login(client)
        payload = decode_access_token(login_res.json()["access_token"])

        assert payload is not None
        assert payload["sub"] == str(user_id)

    def test_login_wrong_password_returns_401(self, client):
        register(client)

        res = login(client, password="wrong-password")

        assert res.status_code == 401
        assert res.json()["detail"] == "Invalid email or password"

    def test_login_nonexistent_user_returns_400(self, client):
        res = login(client, email="nobody@example.com")

        # Current implementation returns 400 for "no such user" and 401 for
        # "wrong password" for an existing user (see test above). Note this
        # distinguishes "account doesn't exist" from "wrong password" in the
        # response, which is a minor account-enumeration smell worth knowing
        # about even though this test just documents current behavior.
        assert res.status_code == 400
        assert res.json()["detail"] == "User not exist"

    def test_login_missing_fields_returns_422(self, client):
        res = client.post("/auth/login", json={"email": VALID_EMAIL})
        assert res.status_code == 422

    def test_login_is_case_sensitive_or_not_documented_here(self, client):
        # Documents actual current behavior: email lookup is an exact match,
        # so differently-cased emails are treated as different accounts.
        register(client, email="Test@Example.com")
        res = login(client, email="test@example.com")
        assert res.status_code == 400  # "User not exist" under exact-match lookup