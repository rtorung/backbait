document.addEventListener('DOMContentLoaded', function() {
    // Ladda header
    fetch('/Back-Fishing/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            initializeDropdown();
            markActivePage(); // Markera aktiv sida efter header-laddning
        })
        .catch(error => console.error('Error loading header:', error));

    // Ladda footer
    fetch('/Back-Fishing/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));

    // Dropdown-menyhantering
    function initializeDropdown() {
        const dropdownParents = document.querySelectorAll('.dropdown-parent');
        let timeout;

        dropdownParents.forEach(parent => {
            const link = parent.querySelector('a');
            const dropdown = parent.querySelector('.dropdown');

            // Hantera klick och touch med debounce
            ['click', 'touchstart'].forEach(eventType => {
                link.addEventListener(eventType, function(event) {
                    event.preventDefault();
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        const isActive = parent.classList.contains('active');
                        const mainMenu = document.querySelector('.main-menu');
                        const menuRect = mainMenu.getBoundingClientRect();
                        const topPosition = (menuRect.bottom + window.scrollY) + 'px'; // Ingen extra offset

                        // Stäng andra dropdowns
                        dropdownParents.forEach(p => {
                            p.classList.remove('active');
                            p.querySelector('a').setAttribute('aria-expanded', 'false');
                            p.querySelector('.dropdown').style.display = 'none';
                        });

                        if (!isActive) {
                            parent.classList.add('active');
                            link.setAttribute('aria-expanded', 'true');
                            dropdown.style.top = topPosition;
                            dropdown.style.display = window.innerWidth > 768 ? 'flex' : 'block';
                        } else {
                            parent.classList.remove('active');
                            link.setAttribute('aria-expanded', 'false');
                            dropdown.style.display = 'none';
                        }
                    }, 100); // Debounce 100ms
                });
            });

            // Tangentbordsstöd för tillgänglighet
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
                    parent.querySelector('.dropdown').style.display = 'none';
                });
            }
        });
    }

    // Markera aktiv sida i både huvudmeny och dropdown
    function markActivePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const menuLinks = document.querySelectorAll('.menu-items li a, .dropdown li a');
        menuLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.parentElement.classList.add('active-page');
            }
        });
    }

    // Sidoruta
    const sidebar = document.querySelector('.sidebar');
    const tab = document.querySelector('.tab');

    tab.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
});