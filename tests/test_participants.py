def test_delete_participant_success(client):
    email = "michael@mergington.edu"
    r = client.delete("/activities/Chess Club/participants", params={"email": email})
    assert r.status_code == 200
    data = client.get("/activities").json()
    assert email not in data["Chess Club"]["participants"]


def test_delete_nonexistent_participant(client):
    r = client.delete("/activities/Chess Club/participants", params={"email": "noone@example.com"})
    assert r.status_code == 404


def test_delete_from_nonexistent_activity(client):
    r = client.delete("/activities/Nonexistent/participants", params={"email": "a@b.com"})
    assert r.status_code == 404
