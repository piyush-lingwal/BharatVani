document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '0.5rem 0';
            navbar.style.background = 'rgba(10, 12, 16, 0.95)';
        } else {
            navbar.style.padding = '1rem 0';
            navbar.style.background = 'rgba(10, 12, 16, 0.8)';
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.problem-card, .service-card, .glass-container').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Simple language rotation for accessibility message
    const languages = ["Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada", "Malayalam"];
    let langIndex = 0;
    const statusText = document.querySelector('.status');
    
    if (statusText) {
        setInterval(() => {
            langIndex = (langIndex + 1) % languages.length;
            const pulse = '<span class="pulse"></span>';
            statusText.innerHTML = `${pulse} Live in ${languages[langIndex]} & 22+ more`;
        }, 3000);
    }
});
