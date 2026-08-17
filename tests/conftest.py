from copy import deepcopy
import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

# Keep an original snapshot of the in-memory activities to restore between tests
_ORIGINAL = deepcopy(activities)

@pytest.fixture(autouse=True)
def reset_activities():
    # Reset the global activities dict before each test for isolation
    activities.clear()
    activities.update(deepcopy(_ORIGINAL))
    yield
    activities.clear()
    activities.update(deepcopy(_ORIGINAL))

@pytest.fixture
def client():
    return TestClient(app)
