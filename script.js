document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const liquifyForm = document.getElementById('liquify-form');
    const categorySelect = document.getElementById('category-select');
    const methodSelection = document.getElementById('method-selection');
    const formContainer = document.getElementById('form-container');
    const manualEntryBtn = document.getElementById('manual-entry-btn');
    const uploadDocBtn = document.getElementById('upload-doc-btn');
    const submitBtn = document.querySelector('button[type="submit"]');
    const responseMessage = document.getElementById('response-message');
    const webhookUrl = 'https://n8n-Chanyowl.onrender.com/webhook-test/liquifyautomationpath';

    // --- State Management ---
    let activeCategory = null;
    let activeMethod = null; // 'manual' or 'upload'

    // --- Helper Functions ---
    function resetAll() {
        activeCategory = null;
        activeMethod = null;
        methodSelection.classList.add('hidden');
        document.querySelectorAll('.form-category, .form-method').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.method-btn').forEach(btn => btn.classList.remove('active'));
        submitBtn.classList.add('hidden');
        responseMessage.textContent = '';
        responseMessage.className = '';
    }

    // --- Event Listeners ---
    // 1. Category Selection
    categorySelect.addEventListener('change', () => {
        resetAll(); // Reset everything when category changes
        activeCategory = categorySelect.value;

        if (activeCategory) {
            methodSelection.classList.remove('hidden');
            const categoryContainer = document.getElementById(`${activeCategory}-category`);
            if (categoryContainer) {
                categoryContainer.classList.remove('hidden');
            }
        }
    });

    // 2. Method Selection
    manualEntryBtn.addEventListener('click', () => {
        activeMethod = 'manual';
        uploadDocBtn.classList.remove('active');
        manualEntryBtn.classList.add('active');

        // Disable upload inputs, enable manual inputs
        document.querySelectorAll('#salary-upload-form input').forEach(input => input.disabled = true);
        document.querySelectorAll('#salary-manual-form input').forEach(input => input.disabled = false);

        document.getElementById(`${activeCategory}-upload-form`).classList.add('hidden');
        document.getElementById(`${activeCategory}-manual-form`).classList.remove('hidden');
        submitBtn.classList.remove('hidden');
    });

    uploadDocBtn.addEventListener('click', () => {
        activeMethod = 'upload';
        manualEntryBtn.classList.remove('active');
        uploadDocBtn.classList.add('active');

        // Disable manual inputs, enable upload inputs
        document.querySelectorAll('#salary-manual-form input').forEach(input => input.disabled = true);
        document.querySelectorAll('#salary-upload-form input').forEach(input => input.disabled = false);

        document.getElementById(`${activeCategory}-manual-form`).classList.add('hidden');
        document.getElementById(`${activeCategory}-upload-form`).classList.remove('hidden');
        submitBtn.classList.remove('hidden');
    });

    // 3. Form Submission
    liquifyForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!activeCategory || !activeMethod) {
            return;
        }

        let requestBody;
        let headers = {};

        // A. Construct Payload based on Method
        if (activeMethod === 'manual') {
            const form = document.getElementById(`${activeCategory}-manual-form`);
            const inputs = form.querySelectorAll('input');
            const formData = {};
            inputs.forEach(input => {
                formData[input.name] = input.value;
            });
            requestBody = JSON.stringify({ category: activeCategory, data: formData });
            headers['Content-Type'] = 'application/json';

        } else if (activeMethod === 'upload') {
            const fileInput = document.getElementById(`${activeCategory}-file`);

            if (fileInput && fileInput.files.length > 0) {
                requestBody = new FormData();
                requestBody.append('category', activeCategory);
                requestBody.append('document', fileInput.files[0], fileInput.files[0].name);
            } else {
                alert('Please select a file to upload.');
                return;
            }
        }

        // B. Send Data to N8N
        responseMessage.textContent = 'Sending data...';
        responseMessage.style.display = 'block';

        try {
            const response = await fetch(webhookUrl, { method: 'POST', headers, body: requestBody });
            if (response.ok) {
                responseMessage.textContent = 'Data sent successfully!';
                responseMessage.className = 'success';
                liquifyForm.reset();
                resetAll(); // Full reset after success
            } else {
                const errorText = await response.text();
                responseMessage.textContent = `Error: ${response.status}. See console.`;
                responseMessage.className = 'error';
            }
        } catch (error) {
            responseMessage.textContent = 'A network error occurred.';
            responseMessage.className = 'error';
        }
    });
});