document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Basic validation
        const formData = {
            action: 'registerStudent',
            fullName: document.getElementById('fullName').value.trim(),
            guardianName: document.getElementById('guardianName').value.trim(),
            mobile: document.getElementById('mobile').value.trim(),
            email: document.getElementById('email').value.trim(),
            class: document.getElementById('class').value,
            schoolName: document.getElementById('schoolName').value.trim(),
        };

        let isValid = true;
        // Validation logic
        if (formData.fullName.length < 3) {
            showError('fullName', 'Full Name must be at least 3 characters.');
            isValid = false;
        } else {
            hideError('fullName');
        }

        if (formData.guardianName.length < 3) {
            showError('guardianName', 'Guardian Name must be at least 3 characters.');
            isValid = false;
        } else {
            hideError('guardianName');
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.mobile)) {
            showError('mobile', 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
            isValid = false;
        } else {
            hideError('mobile');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError('email', 'Enter a valid email address.');
            isValid = false;
        } else {
            hideError('email');
        }

        if (formData.schoolName.length < 3) {
            showError('schoolName', 'School Name must be at least 3 characters.');
            isValid = false;
        } else {
            hideError('schoolName');
        }

        if (!isValid) return;

        // Form is valid, proceed with API call
        const submitBtn = document.getElementById('submitBtn');
        const loader = document.getElementById('loader');
        
        submitBtn.disabled = true;
        loader.style.display = 'flex';

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                }
            });

            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem('studentId', result.studentId);
                sessionStorage.setItem('attemptToken', result.attemptToken);
                sessionStorage.setItem('startedAt', result.startedAt);
                
                // For resume capability
                localStorage.setItem(`testState_${result.studentId}`, JSON.stringify({
                    answers: {},
                    markedForReview: [],
                    startedAt: result.startedAt
                }));

                window.location.href = 'test.html';
            } else {
                alert('Error registering student: ' + result.error);
                submitBtn.disabled = false;
                loader.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please try again.');
            submitBtn.disabled = false;
            loader.style.display = 'none';
        }
    });

    function showError(fieldId, msg) {
        const errorEl = document.getElementById(`${fieldId}Error`);
        if (errorEl) {
            errorEl.innerText = msg;
            errorEl.style.display = 'block';
        }
    }

    function hideError(fieldId) {
        const errorEl = document.getElementById(`${fieldId}Error`);
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }
});
