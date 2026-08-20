// Détermination de la langue
function getInitialLanguage() {
    // 1. Chercher dans l'URL (?lang=fr)
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    if (langFromUrl && ['fr', 'en'].includes(langFromUrl)) {
        return langFromUrl;
    }
    
    // 2. Chercher dans le localStorage
    const savedLang = localStorage.getItem('filonexia_lang');
    if (savedLang && ['fr', 'en'].includes(savedLang)) {
        return savedLang;
    }
    
    // 3. Langue du navigateur par défaut
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.toLowerCase().startsWith('fr')) {
        return 'fr';
    }
    return 'en';
}

let currentLang = getInitialLanguage();

// S'assurer que l'URL reflète la langue sans recharger la page
function updateUrlParameter(lang) {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
}

// Conserver la langue et charger les textes
async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('filonexia_lang', lang);
    updateUrlParameter(lang);
    
    // Charger le JSON dynamiquement
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) throw new Error('Erreur de chargement');
        const translations = await response.json();
        
        applyTranslations(translations, lang);
    } catch (error) {
        console.error("Erreur lors du chargement de la langue :", error);
    }
}

function applyTranslations(translations, lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[key];
            } else {
                el.textContent = translations[key];
            }
        }
    });
    document.documentElement.lang = lang;
    
    // Mettre à jour l'état des drapeaux
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Mettre à jour tous les liens internes pour inclure ?lang=
    document.querySelectorAll('a').forEach(link => {
        try {
            const href = link.getAttribute('href');
            if (link.hostname === window.location.hostname && href && !href.startsWith('#') && !href.startsWith('mailto:')) {
                const linkUrl = new URL(link.href);
                linkUrl.searchParams.set('lang', lang);
                link.href = linkUrl.toString();
            }
        } catch(e) {}
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage(btn.dataset.lang);
        });
    });
});
