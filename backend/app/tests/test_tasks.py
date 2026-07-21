from app.models import Task

VALID_EMAIL = "test@example.com"
VALID_PASSWORD = "secret123"


def register(client, email=VALID_EMAIL, password=VALID_PASSWORD):
    return client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
        },
    )


def login(client, email=VALID_EMAIL, password=VALID_PASSWORD):
    return client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )


def auth_headers(client):
    token = login(client).json()["access_token"]
    return {
        "Authorization": f"Bearer {token}"
    }


def create_task(client, headers, **kwargs):
    body = {
        "title": "Task",
        "priority": 1,
    }

    body.update(kwargs)

    return client.post(
        "/tasks/",
        json=body,
        headers=headers,
    )


# Post Tasks

class TestCreateTask:
    def test_create_task_returns_201(self, client):
        register(client)

        headers = auth_headers(client)

        res = create_task(client, headers)

        assert res.status_code == 201

        body = res.json()

        assert body["title"] == "Task"
        assert body["priority"] == 1
        assert body["done"] is False
        assert isinstance(body["id"], int)

    def test_requires_authentication(self, client):
        res = client.post(
            "/tasks/",
            json={
                "title": "Task",
                "priority": 1,
            },
        )

        assert res.status_code == 401

    def test_invalid_priority_returns_422(self, client):
        register(client)

        headers = auth_headers(client)

        res = create_task(
            client,
            headers,
            priority=100,
        )

        assert res.status_code == 422

    def test_missing_title_returns_422(self, client):
        register(client)

        headers = auth_headers(client)

        res = client.post(
            "/tasks/",
            json={
                "priority": 1,
            },
            headers=headers,
        )

        assert res.status_code == 422


# Get Tasks
class TestListTasks:
    def test_returns_empty_list(self, client):
        register(client)

        headers = auth_headers(client)

        res = client.get(
            "/tasks/",
            headers=headers,
        )

        assert res.status_code == 200
        assert res.json()["data"] == []

    def test_returns_created_tasks(self, client):
        register(client)

        headers = auth_headers(client)

        create_task(client, headers, title="A")
        create_task(client, headers, title="B")

        res = client.get(
            "/tasks/",
            headers=headers,
        )

        body = res.json()

        assert len(body["data"]) == 2

    def test_filters_done_tasks(self, client):
        register(client)

        headers = auth_headers(client)

        create_task(client, headers, title="Done", done=True)
        create_task(client, headers, title="Active", done=False)

        res = client.get(
            "/tasks/?status=true",
            headers=headers,
        )

        data = res.json()["data"]

        assert len(data) == 1
        assert data[0]["done"] is True

    def test_invalid_sort_returns_422(self, client):
        register(client)

        headers = auth_headers(client)

        res = client.get(
            "/tasks/?sort=banana",
            headers=headers,
        )

        assert res.status_code == 422


# Get Tasks{id}

class TestGetTask:
    def test_existing_task_returns_200(self, client):
        register(client)

        headers = auth_headers(client)

        created = create_task(client, headers).json()

        res = client.get(
            f"/tasks/{created['id']}",
            headers=headers,
        )

        assert res.status_code == 200
        assert res.json()["id"] == created["id"]

    def test_unknown_task_returns_404(self, client):
        register(client)

        headers = auth_headers(client)

        res = client.get(
            "/tasks/9999",
            headers=headers,
        )

        assert res.status_code == 404


# Delete Task
class TestDeleteTask:
    def test_delete_returns_204(self, client):
        register(client)

        headers = auth_headers(client)

        task = create_task(client, headers).json()

        res = client.delete(
            f"/tasks/{task['id']}",
            headers=headers,
        )

        assert res.status_code == 204

    def test_deleted_task_cannot_be_requested(self, client):
        register(client)

        headers = auth_headers(client)

        task = create_task(client, headers).json()

        client.delete(
            f"/tasks/{task['id']}",
            headers=headers,
        )

        res = client.get(
            f"/tasks/{task['id']}",
            headers=headers,
        )

        assert res.status_code == 404