document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Theme switcher logic
    const themeSelect = document.querySelectorAll('.theme-switcher');
    
    // Check initial system pref to avoid flash
    const savedTheme = localStorage.getItem('filonexia_theme') || 'system';
    
    const applyTheme = (theme) => {
        if (theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    };

    applyTheme(savedTheme);

    themeSelect.forEach(select => {
        select.value = savedTheme;
        select.addEventListener('change', (e) => {
            const newTheme = e.target.value;
            localStorage.setItem('filonexia_theme', newTheme);
            applyTheme(newTheme);
            
            // Sync all selects if there are multiple
            themeSelect.forEach(s => s.value = newTheme);
        });
    });

    // Listen to system changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('filonexia_theme') === 'system') {
            applyTheme('system');
        }
    });
});
