// Ladda header.html
fetch('/Back-Fishing/header.html')
    .then(response => {
        if (!response.ok) {
            console.error('Fetch-fel: Status', response.status, response.statusText, 'URL:', response.url);
            throw new Error('Kunde inte ladda header.html');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('header').innerHTML = data;
        initializeDropdowns();
        initializeSidebar();
        // Kontrollera att logotypen laddas
        const logo = document.querySelector('.header-logo');
        if (logo) {
            logo.addEventListener('error', () => {
                console.error('Fel vid laddning av logotyp:', logo.src);
                logo.src = '/Back-Fishing/images/fallback-logo.jpg'; // Fallback-bild
            });
        }
    })
    .catch(error => {
        console.error('Fel vid laddning av header.html:', error.message);
        document.getElementById('header').innerHTML = `
            <header class="site-header">
                <a href="/Back-Fishing/index.html">
                    <picture>
                        <source media="(max-width: 768px)" srcset="/Back-Fishing/images/logo400.jpg">
                        <source media="(min-width: 769px)" srcset="/Back-Fishing/images/logo596.jpg">
                        <img src="/Back-Fishing/images/logo400.jpg" alt="Fiskeguiden Logo" class="header-logo" loading="lazy">
                    </picture>
                </a>
                <nav class="main-menu" role="navigation">
                    <div class="menu-container">
                        <ul class="menu-items">
                            <li><a href="/Back-Fishing/index.html">Hem</a></li>
                            <li><a href="/Back-Fishing/om.html">Om</a></li>
                        </ul>
                    </div>
                </nav>
            </header>
        `;
        initializeDropdowns();
        initializeSidebar();
    });

// Debounce-funktion för att begränsa resize-event
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Funktion för att stänga alla dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-parent').forEach(parent => {
        parent.classList.remove('active');
        parent.querySelector('a').setAttribute('aria-expanded', 'false');
    });
}

// Funktion för att initiera dropdown-menyer
function initializeDropdowns() {
    const dropdownParents = document.querySelectorAll('.dropdown-parent');

    dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        const dropdown = parent.querySelector('.dropdown');

        // Klick/touch för mobilläge
        link.addEventListener('click', function(event) {
            if (window.innerWidth <= 768) {
                event.preventDefault();
                const isActive = parent.classList.contains('active');
                closeAllDropdowns();
                if (!isActive) {
                    parent.classList.add('active');
                    link.setAttribute('aria-expanded', 'true');
                    dropdown.querySelector('a').focus();
                }
            }
        });

        // Tangentbordsstöd
        link.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (window.innerWidth <= 768) {
                    const isActive = parent.classList.contains('active');
                    closeAllDropdowns();
                    if (!isActive) {
                        parent.classList.add('active');
                        link.setAttribute('aria-expanded', 'true');
                        dropdown.querySelector('a').focus();
                    }
                }
            } else if (event.key === 'Escape') {
                closeAllDropdowns();
                link.focus();
            }
        });

        // Stäng dropdown vid klick utanför
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 768 && !event.target.closest('.dropdown-parent')) {
                closeAllDropdowns();
            }
        });

        // Hantera fokus för dropdown-länkar
        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    closeAllDropdowns();
                    parent.querySelector('a').focus();
                }
            });
        });
    });

    // Stäng dropdown vid fönsterstorleksändring med debounce
    window.addEventListener('resize', debounce(closeAllDropdowns, 100));
}

// Funktion för att initiera sidoruta
function initializeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const tab = document.querySelector('.tab');

    if (tab && sidebar) {
        tab.addEventListener('click', function(event) {
            event.stopPropagation();
            sidebar.classList.toggle('open');
            closeAllDropdowns();
            if (sidebar.classList.contains('open')) {
                const focusable = sidebar.querySelector('a, button, [tabindex="0"]');
                if (focusable) focusable.focus();
            }
        });

        document.addEventListener('click', function(event) {
            if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !tab.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        });

        tab.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                sidebar.classList.toggle('open');
                closeAllDropdowns();
                if (sidebar.classList.contains('open')) {
                    const focusable = sidebar.querySelector('a, button, [tabindex="0"]');
                    if (focusable) focusable.focus();
                }
            }
        });
    }
}