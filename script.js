// Ladda header.html
fetch('header.html')
    .then(response => {
        if (!response.ok) throw new Error('Kunde inte ladda header.html');
        return response.text();
    })
    .then(data => {
        document.getElementById('header').innerHTML = data;
        initializeEventListeners();
    })
    .catch(error => {
        console.error('Fel vid laddning av header.html:', error);
        document.getElementById('header').innerHTML = `
            <nav class="main-menu" role="navigation">
                <div class="menu-container">
                    <ul class="menu-items">
                        <li><a href="index.html">Hem</a></li>
                        <li><a href="om.html">Om</a></li>
                    </ul>
                </div>
            </nav>
        `;
        initializeEventListeners();
    });

// Funktion för att initiera händelsehanterare
function initializeEventListeners() {
    const dropdownParents = document.querySelectorAll('.dropdown-parent');
    const sidebar = document.querySelector('.sidebar');
    const tab = document.querySelector('.tab');

    // Sidoruta
    if (tab && sidebar) {
        tab.addEventListener('click', function(event) {
            event.stopPropagation();
            sidebar.classList.toggle('open');
            dropdownParents.forEach(parent => parent.classList.remove('active'));
        });

        document.addEventListener('click', function(event) {
            if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !tab.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Dropdown-meny
    dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        link.setAttribute('tabindex', '0');

        // Klick/touch för mobilläge
        ['click', 'touchstart'].forEach(eventType => {
            link.addEventListener(eventType, function(event) {
                if (window.innerWidth <= 768) {
                    event.preventDefault();
                    event.stopPropagation();
                    dropdownParents.forEach(otherParent => {
                        if (otherParent !== parent) otherParent.classList.remove('active');
                    });
                    parent.classList.toggle('active');
                    link.setAttribute('aria-expanded', parent.classList.contains('active'));
                }
            });
        });

        // Tangentbordsstöd
        link.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (window.innerWidth <= 768) {
                    dropdownParents.forEach(otherParent => {
                        if (otherParent !== parent) otherParent.classList.remove('active');
                    });
                    parent.classList.toggle('active');
                    link.setAttribute('aria-expanded', parent.classList.contains('active'));
                }
            }
        });

        // Hover för skrivbordsvy
        if (window.innerWidth > 768) {
            parent.addEventListener('mouseenter', function() {
                dropdownParents.forEach(otherParent => {
                    if (otherParent !== parent) otherParent.classList.remove('active');
                });
                parent.classList.add('active');
                link.setAttribute('aria-expanded', 'true');
            });

            parent.querySelector('.dropdown').addEventListener('mouseleave', function() {
                parent.classList.remove('active');
                link.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // Stäng dropdown vid klick/touch utanför i mobilläge
    ['click', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, function(event) {
            if (window.innerWidth <= 768 && !event.target.closest('.dropdown-parent')) {
                dropdownParents.forEach(parent => {
                    parent.classList.remove('active');
                    parent.querySelector('a').setAttribute('aria-expanded', 'false');
                });
            }
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