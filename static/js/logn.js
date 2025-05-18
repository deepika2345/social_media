// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const signInTab = document.getElementById('signInTab');
    const signUpTab = document.getElementById('signUpTab');
    const signInForm = document.getElementById('signIn');
    const signUpForm = document.querySelector('.signUp');
    
    signInTab.addEventListener('click', function() {
        signInTab.classList.add('active');
        signUpTab.classList.remove('active');
        
        signInForm.classList.remove('hidden');
        signUpForm.classList.add('hidden');
    });
    
    signUpTab.addEventListener('click', function() {
        signUpTab.classList.add('active');
        signInTab.classList.remove('active');
        
        signUpForm.classList.remove('hidden');
        signInForm.classList.add('hidden');
    });
});
