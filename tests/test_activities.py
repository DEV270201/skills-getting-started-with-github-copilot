def test_get_activities(client):
    r = client.get("/activities")
    assert r.status_code == 200
    data = r.json()
    assert "Chess Club" in data


def test_signup_success(client):
    email = "testuser@example.com"
    r = client.post("/activities/Chess Club/signup", params={"email": email})
    assert r.status_code == 200
    data = client.get("/activities").json()
    assert email in data["Chess Club"]["participants"]


def test_signup_duplicate_returns_400(client):
    # michael@mergington.edu is pre-registered in Chess Club fixture
    email = "michael@mergington.edu"
    r = client.post("/activities/Chess Club/signup", params={"email": email})
    assert r.status_code == 400


def test_signup_nonexistent_activity(client):
    r = client.post("/activities/Nonexistent/signup", params={"email": "a@b.com"})
    assert r.status_code == 404
