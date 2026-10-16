document.querySelectorAll('form[data-basic]').forEach(form => {
    const status = form.querySelector('[role="status"]');

    form.addEventListener('submit', event => {
        event.preventDefault();
        status.hidden = false;
    });

    form.addEventListener('input', () => {
        status.hidden = true;
    });
});

function attachValidation(formId, successId) {
    const form = document.getElementById(formId);

    if (!form) {
        return;
    }

    const success = document.getElementById(successId);
    const fields = [...form.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea, select')];
    const genderFeedback = document.getElementById('genderFeedback');
    const touched = new Set();
    let submitted = false;

    function validateInput(field) {
        field.setCustomValidity('');

        if (field.required && !field.value.trim()) {
            field.setCustomValidity('This field is required.');
        } else if (field.minLength > 0 && field.value.length < field.minLength) {
            field.setCustomValidity(`Enter at least ${field.minLength} characters.`);
        }

        if (field.id === 'confirmPassword') {
            const password = document.getElementById('password');

            if (field.value !== password.value) {
                field.setCustomValidity('Passwords must match.');
            }
        }

        const valid = field.checkValidity();
        field.classList.toggle('is-valid', valid);
        field.classList.toggle('is-invalid', !valid);
        field.setAttribute('aria-invalid', String(!valid));

        if (field.id === 'email3') {
            document.getElementById('email3-error').textContent = field.value.trim()
                ? 'Enter a valid email address.'
                : 'Email is required';
        }

        return valid;
    }

    function validateGender() {
        if (!genderFeedback) {
            return true;
        }

        const valid = Boolean(form.querySelector('input[name="gender"]:checked'));
        genderFeedback.classList.toggle('d-none', valid);

        form.querySelectorAll('input[name="gender"]').forEach(field => {
            field.setAttribute('aria-invalid', String(!valid));
            field.setAttribute('aria-describedby', 'genderFeedback');
        });

        return valid;
    }

    fields.forEach(field => {
        field.addEventListener('blur', () => {
            touched.add(field);
            validateInput(field);
        });

        ['input', 'change'].forEach(eventName => {
            field.addEventListener(eventName, () => {
                success.classList.add('d-none');

                if (submitted || touched.has(field) || eventName === 'change') {
                    touched.add(field);
                    validateInput(field);
                }

                if (field.id === 'password') {
                    const confirm = document.getElementById('confirmPassword');

                    if (submitted || touched.has(confirm)) {
                        validateInput(confirm);
                    }
                }
            });
        });
    });

    form.addEventListener('input', () => {
        success.classList.add('d-none');
    });

    form.querySelectorAll('input[name="gender"]').forEach(field => {
        field.addEventListener('change', validateGender);
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        submitted = true;
        fields.forEach(validateInput);
        const genderValid = validateGender();
        const valid = form.checkValidity() && genderValid;
        success.classList.toggle('d-none', !valid);

        if (!valid) {
            form.querySelector(':invalid')?.focus();
        }
    });

    form.addEventListener('reset', () => {
        submitted = false;
        touched.clear();
        fields.forEach(field => {
            field.setCustomValidity('');
            field.classList.remove('is-valid', 'is-invalid');
            field.removeAttribute('aria-invalid');
        });
        form.querySelectorAll('input[name="gender"]').forEach(field => {
            field.removeAttribute('aria-invalid');
        });
        success.classList.add('d-none');

        if (genderFeedback) {
            genderFeedback.classList.add('d-none');
        }
    });
}

attachValidation('contactForm', 'contactSuccess');
attachValidation('registrationForm', 'registrationSuccess');
