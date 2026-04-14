const supabase = window.supabase;




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

        window.location.href = 'home.html';
    } catch (error) {
        console.error('Error logging in:', error.message);
        alert('Error logging in: ' + error.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

