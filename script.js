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
                    event.stopPropagation(); // Förhindra att klick bubblar upp
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        const isActive = parent.classList.contains('active');
                        const mainMenu = document.querySelector('.main-menu');
                        const menuRect = mainMenu.getBoundingClientRect();
                        const topPosition = (menuRect.bottom + window.scrollY) + 'px';

                        // Stäng andra dropdowns
                        dropdownParents.forEach(p => {
                            if (p !== parent) {
                                p.classList.remove('active');
                                const pLink = p.querySelector('a');
                                const pDropdown = p.querySelector('.dropdown');
                                if (pLink && pDropdown) {
                                    pLink.setAttribute('aria-expanded', 'false');
                                    pDropdown.style.display = 'none';
                                }
                            }
                        });

                        if (!isActive) {
                            parent.classList.add('active');
                            link.setAttribute('aria-expanded', 'true');
                            dropdown.style.top = topPosition;
                            dropdown.style.display = window.innerWidth > 768 ? 'flex' : 'block';
                            console.log(`Opened dropdown: ${link.textContent}`); // Felsökningslogg
                        } else {
                            parent.classList.remove('active');
                            link.setAttribute('aria-expanded', 'false');
                            dropdown.style.display = 'none';
                            console.log(`Closed dropdown: ${link.textContent}`); // Felsökningslogg
                        }
                    }, 100); // Debounce 100ms
                });
            });

            // Tangentbordsstöd för tillgänglighet
            link.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation(); // Förhindra att tangentbordsstöd bubblar
                    link.dispatchEvent(new Event('click'));
                }
            });
        });

        // Stäng dropdown vid klick utanför
        document.addEventListener('click', function(event) {
            const target = event.target;
            if (!target.closest('.dropdown-parent')) {
                console.log('Click outside dropdown detected'); // Felsökningslogg
                dropdownParents.forEach(parent => {
                    const link = parent.querySelector('a');
                    const dropdown = parent.querySelector('.dropdown');
                    if (link && dropdown) {
                        parent.classList.remove('active');
                        link.setAttribute('aria-expanded', 'false');
                        dropdown.style.display = 'none';
                    }
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
});