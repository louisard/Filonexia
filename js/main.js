// --- ANTI-DARKENING SHIELD ---
(function initAntiDarkShield() {
    const forceDarkTheme = () => {
        document.documentElement.setAttribute('data-theme', 'dark');
    };

    // 1. Sniper (MutationObserver)
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'STYLE' || node.tagName === 'LINK') {
                    const text = (node.textContent || node.href || node.className || node.id || '').toLowerCase();
                    if (text.includes('darkreader') || text.includes('night-eye') || text.includes('dark-mode') || text.includes('dark-theme') || text.includes('darkmode')) {
                        node.remove();
                        forceDarkTheme();
                    }
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 2. Honeypot
    document.addEventListener('DOMContentLoaded', () => {
        const honeypot = document.createElement('div');
        honeypot.style.cssText = 'width: 1px; height: 1px; position: absolute; opacity: 0; background-color: rgb(255, 255, 255); pointer-events: none; z-index: -1; left: -9999px;';
        document.body.appendChild(honeypot);

        setTimeout(() => {
            const bg = window.getComputedStyle(honeypot).backgroundColor;
            if (bg !== 'rgb(255, 255, 255)' && bg !== 'rgba(0, 0, 0, 0)') {
                forceDarkTheme();
            }
        }, 500);
    });
})();
// ------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.getElementById('menu-overlay');

    if(menuToggle) {
        const toggleMenu = (shouldOpen) => {
            const isActive = shouldOpen !== undefined ? shouldOpen : !navLinks.classList.contains('active');
            menuToggle.classList.toggle('active', isActive);
            navLinks.classList.toggle('active', isActive);
            if (menuOverlay) menuOverlay.classList.toggle('active', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        };

        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => toggleMenu(false));
        }

        document.addEventListener('click', (event) => {
            const isClickInside = menuToggle.contains(event.target) || navLinks.contains(event.target);
            if (!isClickInside && navLinks.classList.contains('active')) {
                toggleMenu(false);
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

// --- Hero Carousel Logic ---
let slideIndex = 0;
let slideInterval;

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    
    if (!slides.length) return;
    
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[slideIndex].classList.add('active');
    if (dots[slideIndex]) dots[slideIndex].classList.add('active');
}

window.moveSlide = function(n) {
    slideIndex += n;
    showSlide(slideIndex);
    resetInterval();
};

window.currentSlide = function(n) {
    slideIndex = n;
    showSlide(slideIndex);
    resetInterval();
};

function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 7000);
}

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        showSlide(slideIndex);
        resetInterval();
    }

    // Gallery Carousel Logic
    const galleryTrack = document.getElementById('galleryTrack');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');
    const galleryDotsContainer = document.getElementById('galleryDots');

    if (galleryTrack) {
        // Hide dots as they are not needed for continuous scroll
        if (galleryDotsContainer) galleryDotsContainer.style.display = 'none';
        
        // Duplicate content for infinite seamless scroll
        const originalHtml = galleryTrack.innerHTML;
        galleryTrack.innerHTML += originalHtml;

        let isHovering = false;
        let animationId;

        const scrollGallery = () => {
            if (!isHovering) {
                galleryTrack.scrollLeft += 1.5; // Vitesse du défilement
                
                // Si on a défilé la première moitié (l'original), on revient au début instantanément
                if (galleryTrack.scrollLeft >= galleryTrack.scrollWidth / 2) {
                    galleryTrack.scrollLeft = 0;
                }
            }
            animationId = requestAnimationFrame(scrollGallery);
        };

        // Start animation
        animationId = requestAnimationFrame(scrollGallery);

        // Pause on hover or touch
        galleryTrack.addEventListener('mouseenter', () => isHovering = true);
        galleryTrack.addEventListener('mouseleave', () => isHovering = false);
        galleryTrack.addEventListener('touchstart', () => isHovering = true);
        galleryTrack.addEventListener('touchend', () => isHovering = false);

        // Keep manual buttons working for quick jumps
        if (galleryPrev) {
            galleryPrev.addEventListener('click', () => {
                galleryTrack.scrollLeft -= 300;
            });
        }
        if (galleryNext) {
            galleryNext.addEventListener('click', () => {
                galleryTrack.scrollLeft += 300;
            });
        }
    }

    // Partners Carousel Logic
    const partnerTrack = document.getElementById('partnerTrack');
    const partnerPrev = document.getElementById('partnerPrev');
    const partnerNext = document.getElementById('partnerNext');

    if (partnerTrack) {
        // Duplicate content for infinite seamless scroll
        const originalHtml = partnerTrack.innerHTML;
        partnerTrack.innerHTML += originalHtml;

        let partnerIsHovering = false;
        let partnerAnimationId;

        const scrollPartners = () => {
            if (!partnerIsHovering) {
                partnerTrack.scrollLeft += 1;
                
                if (partnerTrack.scrollLeft >= partnerTrack.scrollWidth / 2) {
                    partnerTrack.scrollLeft = 0;
                }
            }
            partnerAnimationId = requestAnimationFrame(scrollPartners);
        };

        partnerAnimationId = requestAnimationFrame(scrollPartners);

        partnerTrack.addEventListener('mouseenter', () => partnerIsHovering = true);
        partnerTrack.addEventListener('mouseleave', () => partnerIsHovering = false);
        partnerTrack.addEventListener('touchstart', () => partnerIsHovering = true, { passive: true });
        partnerTrack.addEventListener('touchend', () => partnerIsHovering = false, { passive: true });
        partnerTrack.addEventListener('touchcancel', () => partnerIsHovering = false, { passive: true });

        if (partnerPrev) {
            partnerPrev.addEventListener('click', () => {
                partnerTrack.scrollLeft -= 200;
            });
        }
        if (partnerNext) {
            partnerNext.addEventListener('click', () => {
                partnerTrack.scrollLeft += 200;
            });
        }
    }
});
