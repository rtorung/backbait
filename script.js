document.addEventListener('DOMContentLoaded', function() {
    // Ladda header
    fetch('/Back-Fishing/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            initializeDropdown();
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

        dropdownParents.forEach(parent => {
            const link = parent.querySelector('a');
            const dropdown = parent.querySelector('.dropdown');

            // Hantera klick för mobil och tillgänglighet
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const isActive = parent.classList.contains('active');

                // Stäng andra dropdowns
                dropdownParents.forEach(p => {
                    p.classList.remove('active');
                    p.querySelector('a').setAttribute('aria-expanded', 'false');
                });

                if (!isActive) {
                    parent.classList.add('active');
                    link.setAttribute('aria-expanded', 'true');

                    // Positionera dropdown på desktop
                    if (window.innerWidth > 768) {
                        const headerLogo = document.querySelector('.header-logo');
                        const headerRect = document.querySelector('.site-header').getBoundingClientRect();
                        const logoRect = headerLogo.getBoundingClientRect();
                        const dropdownWidth = dropdown.offsetWidth;
                        const logoCenter = logoRect.left + (logoRect.width / 2) - headerRect.left;
                        dropdown.style.left = `${logoCenter - (dropdownWidth / 2)}px`;
                    }
                } else {
                    parent.classList.remove('active');
                    link.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Stäng dropdown vid klick utanför
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown-parent')) {
                dropdownParents.forEach(parent => {
                    parent.classList.remove('active');
                    parent.querySelector('a').setAttribute('aria-expanded', 'false');
                });
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