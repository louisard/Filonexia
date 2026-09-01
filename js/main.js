document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if(menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        document.addEventListener('click', (event) => {
            const isClickInside = menuToggle.contains(event.target) || navLinks.contains(event.target);
            if (!isClickInside && navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // Theme switcher logic
    const themeSelect = document.querySelectorAll('.theme-switcher');

    // Highlight active nav link
    const currentUrl = new URL(window.location.href);
    const navLinksList = document.querySelectorAll('.nav-links a:not(.btn)');
    navLinksList.forEach(link => {
        const linkUrl = new URL(link.href, window.location.origin);
        // Handle both exact matches and the root to index.html case
        if (linkUrl.pathname === currentUrl.pathname || (currentUrl.pathname === '/' && linkUrl.pathname === '/index.html')) {
            link.classList.add('active-nav');
        }
    });
    
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

    // RIB reveal logic (Anti-bot)
    const btnReveal = document.getElementById('btn-reveal-rib');
    const ribContainer = document.getElementById('rib-container');
    const spanIban = document.getElementById('rib-iban');
    const spanBic = document.getElementById('rib-bic');

    if (btnReveal && ribContainer) {
        btnReveal.addEventListener('click', (e) => {
            e.preventDefault();
            const iData = atob(btnReveal.getAttribute('data-i'));
            const bData = atob(btnReveal.getAttribute('data-b'));
            spanIban.textContent = iData;
            spanBic.textContent = bData;
            ribContainer.style.display = 'block';
            btnReveal.style.display = 'none';
        });
    }

    // Check address reveal logic (Anti-bot)
    const btnRevealCheck = document.getElementById('btn-reveal-check');
    const checkContainer = document.getElementById('check-container');
    const spanAddress = document.getElementById('check-address');

    if (btnRevealCheck && checkContainer) {
        btnRevealCheck.addEventListener('click', (e) => {
            e.preventDefault();
            const aData = atob(btnRevealCheck.getAttribute('data-a'));
            spanAddress.textContent = aData;
            checkContainer.style.display = 'block';
            btnRevealCheck.style.display = 'none';
        });
    }

    // Web3Forms AJAX Submission & Modal
    const forms = document.querySelectorAll('form[action="https://api.web3forms.com/submit"]');
    if (forms.length > 0) {
        // Create modal
        const modalHtml = `
            <div id="success-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; backdrop-filter: blur(3px);">
                <div style="background:var(--bg-light, #fff); color:var(--text-color, #333); padding:2.5rem; border-radius:15px; max-width:450px; text-align:center; box-shadow:0 15px 30px rgba(0,0,0,0.3); margin:1rem;">
                    <div style="font-size:3.5rem; margin-bottom:1rem;">🎉</div>
                    <h3 style="margin-bottom:1rem; color:#e53e3e; font-size:1.8rem;">Message envoyé !</h3>
                    <p style="margin-bottom:2rem; font-size:1.1rem; line-height:1.5;">Merci de nous avoir contactés. L'équipe Filonexia a bien reçu votre message et reviendra vers vous très prochainement.</p>
                    <button id="close-modal" class="btn btn-primary" style="width:100%;">Fermer</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('success-modal');
        document.getElementById('close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = "Envoi en cours...";
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.7";

                const formData = new FormData(form);

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    if (response.ok) {
                        form.reset();
                        modal.style.display = 'flex';
                    } else {
                        alert("Erreur de connexion au service d'envoi. Veuillez réessayer.");
                    }
                } catch (error) {
                    alert("Erreur de connexion au service d'envoi. Veuillez vérifier votre connexion.");
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                }
            });
        });
    }
});
