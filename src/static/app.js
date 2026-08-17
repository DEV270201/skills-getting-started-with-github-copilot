document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select options
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const title = document.createElement('h4');
        title.textContent = name;

        const desc = document.createElement('p');
        desc.textContent = details.description;

        const sched = document.createElement('p');
        sched.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const spotsLeft = details.max_participants - details.participants.length;
        const avail = document.createElement('p');
        avail.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        // Participants block
        const participantsDiv = document.createElement('div');
        participantsDiv.className = 'participants';
        const participantsTitle = document.createElement('h5');
        participantsTitle.textContent = 'Participants';
        participantsDiv.appendChild(participantsTitle);

        if (details.participants && details.participants.length > 0) {
          const ul = document.createElement('ul');

          details.participants.forEach(p => {
            const li = document.createElement('li');

            const span = document.createElement('span');
            span.className = 'participant-badge';
            span.textContent = p;

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.type = 'button';
            delBtn.title = 'Remove participant';
            delBtn.innerHTML = '✖';

            delBtn.addEventListener('click', async () => {
              // disable while processing
              delBtn.disabled = true;
              try {
                const res = await fetch(`/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`, { method: 'DELETE' });
                const result = await res.json();
                if (res.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = 'success';
                  // refresh list
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || 'Failed to remove participant';
                  messageDiv.className = 'error';
                }
              } catch (err) {
                console.error('Error removing participant:', err);
                messageDiv.textContent = 'Failed to remove participant';
                messageDiv.className = 'error';
              } finally {
                messageDiv.classList.remove('hidden');
                setTimeout(() => messageDiv.classList.add('hidden'), 4000);
                delBtn.disabled = false;
              }
            });

            li.appendChild(span);
            li.appendChild(delBtn);
            ul.appendChild(li);
          });

          participantsDiv.appendChild(ul);
        } else {
          const noP = document.createElement('p');
          noP.className = 'no-participants';
          noP.textContent = 'No participants yet';
          participantsDiv.appendChild(noP);
        }

        // assemble card
        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(sched);
        activityCard.appendChild(avail);
        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    // disable submit while processing
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities to show the new participant immediately
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  // Initialize app
  fetchActivities();
});
