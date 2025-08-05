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
                <img src="/Back-Fishing/images/logo.jpg" alt="Fiskeguiden Logo" class="header-logo" loading="lazy">
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
                dropdownParents.forEach(otherParent => {
                    otherParent.classList.remove('active');
                    otherParent.querySelector('a').setAttribute('aria-expanded', 'false');
                });
                if (!isActive) {
                    parent.classList.add('active');
                    link.setAttribute('aria-expanded', 'true');
                    dropdown.querySelector('a').focus(); // Flytta fokus till första dropdown-länken
                }
            }
        });

        // Tangentbordsstöd
        link.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (window.innerWidth <= 768) {
                    const isActive = parent.classList.contains('active');
                    dropdownParents.forEach(otherParent => {
                        otherParent.classList.remove('active');
                        otherParent.querySelector('a').setAttribute('aria-expanded', 'false');
                    });
                    if (!isActive) {
                        parent.classList.add('active');
                        link.setAttribute('aria-expanded', 'true');
                        dropdown.querySelector('a').focus();
                    }
                }
            } else if (event.key === 'Escape') {
                parent.classList.remove('active');
                link.setAttribute('aria-expanded', 'false');
                link.focus();
            }
        });

        // Stäng dropdown vid klick utanför
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 768 && !event.target.closest('.dropdown-parent')) {
                dropdownParents.forEach(p => {
                    p.classList.remove('active');
                    p.querySelector('a').setAttribute('aria-expanded', 'false');
                });
            }
        });

        // Hantera fokus för dropdown-länkar
        dropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    parent.classList.remove('active');
                    parent.querySelector('a').setAttribute('aria-expanded', 'false');
                    parent.querySelector('a').focus();
                }
            });
        });
    });

    // Stäng dropdown vid fönsterstorleksändring
    window.addEventListener('resize', function() {
        dropdownParents.forEach(parent => {
            parent.classList.remove('active');
            parent.querySelector('a').setAttribute('aria-expanded', 'false');
        });
    });
}

// Funktion för att initiera sidoruta
function initializeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const tab = document.querySelector('.tab');

    if (tab && sidebar) {
        tab.addEventListener('click', function(event) {
            event.stopPropagation();
            sidebar.classList.toggle('open');
            document.querySelectorAll('.dropdown-parent').forEach(parent => {
                parent.classList.remove('active');
                parent.querySelector('a').setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function(event) {
            if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !tab.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        });

        // Tangentbordsstöd för sidoruta
        tab.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                sidebar.classList.toggle('open');
                document.querySelectorAll('.dropdown-parent').forEach(parent => {
                    parent.classList.remove('active');
                    parent.querySelector('a').setAttribute('aria-expanded', 'false');
                });
            }
        });
    }
}