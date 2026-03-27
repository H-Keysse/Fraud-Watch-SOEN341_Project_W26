/**
 * login.js
 * -----------------------------------------------------------------------------
 * Responsibility: Handle user login (email + password) using Supabase Auth.
 *
 * Main flow:
 * 1) Read email/password from the form
 * 2) Validate inputs (client-side)
 * 3) Call supabase.auth.signInWithPassword(...)
 * 4) Redirect to home.html on success
 * 5) Show an error + restore button state on failure
 */


document.querySelector('.button.login button').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = document.getElementById('uname').value;
    const password = document.getElementById('pwd').value;
    const btn = e.target.closest('button');
    const originalText = btn.innerHTML;

    console.log("Attempting login with:", email);

    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    btn.innerHTML = '<span>Loading...</span>';
    btn.disabled = true;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Redirect on success
        window.location.href = 'home.html';
    } catch (error) {
        console.error('Error logging in:', error.message);
        alert('Error logging in: ' + error.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

