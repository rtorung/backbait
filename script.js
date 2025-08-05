// Ladda header.html
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
        // Efter att header är laddad, initiera händelsehanterare
        initializeEventListeners();
    })
    .catch(error => console.error('Fel vid laddning av header.html:', error));

// Funktion för att initiera händelsehanterare
function initializeEventListeners() {
    // Sidoruta
    const sidebar = document.querySelector('.sidebar');
    const tab = document.querySelector('.tab');

    if (tab) {
        tab.addEventListener('click', function(event) {
            console.log('Sidoruta klickad');
            event.stopPropagation();
            sidebar.classList.toggle('open');
            // Stäng dropdown-menyer
            document.querySelectorAll('.dropdown-parent').forEach(parent => {
                parent.classList.remove('active');
            });
        });
    }

    // Klick utanför sidorutan
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(event.target) && !tab.contains(event.target)) {
            console.log('Klick utanför sidorutan');
            sidebar.classList.remove('open');
        }
    });

    // Dropdown-meny
    const dropdownParents = document.querySelectorAll('.dropdown-parent');

    dropdownParents.forEach(parent => {
        // Hantera klick/touch för mobilläge
        ['click', 'touchstart'].forEach(eventType => {
            parent.querySelector('a').addEventListener(eventType, function(event) {
                console.log(`Dropdown-parent ${eventType}:`, parent.querySelector('a').textContent);
                event.preventDefault();
                event.stopPropagation();
                // Applicera .active endast i mobilläge (< 768px)
                if (window.innerWidth <= 768) {
                    dropdownParents.forEach(otherParent => {
                        if (otherParent !== parent) {
                            otherParent.classList.remove('active');
                        }
                    });
                    parent.classList.toggle('active');
                }
            });
        });

        // Hantera hover för skrivbordsvy
        parent.querySelector('a').addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                console.log(`Dropdown-parent mouseenter:`, parent.querySelector('a').textContent);
                dropdownParents.forEach(otherParent => {
                    if (otherParent !== parent) {
                        otherParent.classList.remove('active');
                    }
                });
                parent.classList.add('active');
            }
        });

        parent.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                console.log(`Dropdown-parent mouseleave:`, parent.querySelector('a').textContent);
                parent.classList.remove('active');
            }
        });
    });

    // Stäng dropdown vid klick/touch utanför i mobilläge
    ['click', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, function(event) {
            if (window.innerWidth <= 768 && !event.target.closest('.dropdown-parent')) {
                console.log(`${eventType} utanför dropdown`);
                dropdownParents.forEach(parent => {
                    parent.classList.remove('active');
                });
            }
        });
    });

    // Stäng dropdown vid fönsterstorleksändring
    window.addEventListener('resize', function() {
        console.log('Fönsterstorlek ändrad');
        dropdownParents.forEach(parent => {
            parent.classList.remove('active');
        });
    });
}