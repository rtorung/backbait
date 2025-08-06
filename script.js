document.addEventListener('DOMContentLoaded', function() {
    // Debounce-funktion
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Ladda header
    fetch('./header.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load header');
            return response.text();
        })
        .then(html => {
            document.getElementById('header').innerHTML = html;
            initializeDropdown();
        })
        .catch(error => {
            console.error('Error loading header:', error);
            document.getElementById('header').innerHTML = '<p>Ett fel uppstod vid laddning av menyn. Kontrollera sökvägarna.</p>';
        });

    // Ladda footer
    fetch('./footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load footer');
            return response.text();
        })
        .then(html => {
            document.getElementById('footer').innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
            document.getElementById('footer').innerHTML = '<p>Ett fel uppstod vid laddning av sidfoten. Kontrollera sökvägarna.</p>';
        });

    // Dropdown-menyhantering
    function initializeDropdown() {
        const dropdownParents = document.querySelectorAll('.dropdown-parent');

        dropdownParents.forEach(parent => {
            const link = parent.querySelector('a');
            const dropdown = parent.querySelector('.dropdown');

            if (!link || !dropdown) return; // Säkerställ att element finns

            // Hantera klick och touch
            ['click', 'touchstart'].forEach(eventType => {
                link.addEventListener(eventType, debounce(function(event) {
                    event.preventDefault();
                    const isActive = parent.classList.contains('active');
                    const mainMenu = document.querySelector('.main-menu');
                    const menuRect = mainMenu.getBoundingClientRect();
                    const topPosition = (menuRect.bottom + window.scrollY) + 'px';

                    // Stäng andra dropdowns
                    dropdownParents.forEach(p => {
                        p.classList.remove('active');
                        p.querySelector('a').setAttribute('aria-expanded', 'false');
                        p.querySelector('.dropdown').classList.remove('visible');
                    });

                    if (!isActive) {
                        parent.classList.add('active');
                        link.setAttribute('aria-expanded', 'true');
                        dropdown.style.top = topPosition;
                        dropdown.classList.add('visible');
                    } else {
                        parent.classList.remove('active');
                        link.setAttribute('aria-expanded', 'false');
                        dropdown.classList.remove('visible');
                    }
                }, 100));
            });

            // Tangentbordsstöd
            link.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    link.dispatchEvent(new Event('click'));
                }
            });
        });

        // Stäng dropdown vid klick utanför
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown-parent')) {
                dropdownParents.forEach(parent => {
                    parent.classList.remove('active');
                    parent.querySelector('a').setAttribute('aria-expanded', 'false');
                    parent.querySelector('.dropdown').classList.remove('visible');
                });
            }
        });

        // Stäng dropdown vid ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                dropdownParents.forEach(parent => {
                    parent.classList.remove('active');
                    parent.querySelector('a').setAttribute('aria-expanded', 'false');
                    parent.querySelector('.dropdown').classList.remove('visible');
                });
            }
        });
    }

    // Sidoruta
    const sidebar = document.querySelector('.sidebar');
    const tab = document.querySelector('.tab');

    if (tab && sidebar) {
        tab.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });

        // Stäng sidoruta vid klick utanför
        document.addEventListener('click', function(event) {
            if (sidebar.classList.contains('open') && !event.target.closest('.sidebar') && !event.target.closest('.tab')) {
                sidebar.classList.remove('open');
            }
        });

        // Stäng sidoruta vid ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
});