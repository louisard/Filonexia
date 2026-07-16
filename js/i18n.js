const locales = {
    fr: null,
    en: null
};

let currentLang = localStorage.getItem('filonexia_lang') || 'fr';

async function loadTranslations(lang) {
    if (!locales[lang]) {
        try {
            const response = await fetch(`locales/${lang}.json?v=10`);
            locales[lang] = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            return;
        }
    }
    applyTranslations(lang);
}

function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (locales[lang][key]) {
            if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = locales[lang][key];
            } else {
                el.textContent = locales[lang][key];
            }
        }
    });
    document.documentElement.lang = lang;
    
    // Update active state on language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('filonexia_lang', lang);
    loadTranslations(lang);
}

document.addEventListener('DOMContentLoaded', () => {
    loadTranslations(currentLang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setLanguage(btn.dataset.lang);
        });
    });
});
