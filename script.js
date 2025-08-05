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

        // Hover för desktop
        if (window.innerWidth > 768) {
            dropdownParents.forEach(parent => {
                parent.addEventListener('mouseenter', function() {
                    parent.classList.add('active');
                    parent.querySelector('a').setAttribute('aria-expanded', 'true');
                });
                parent.addEventListener('mouseleave', function() {
                    parent.classList.remove('active');
                    parent.querySelector('a').setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    // Sidoruta
    const sidebar = document.querySelector('.sidebar');
    const tab = document.querySelector('.tab');

    tab.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
});