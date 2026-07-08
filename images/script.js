/* ═══════════════════════════════════════════════════════════ */
/*  Miljonprogrammets Jurister — Main JavaScript              */
/* ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ─── ELEMENTS ────────────────────────────────────────────
    const header   = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const mainNav   = document.getElementById('mainNav');
    const langToggles = document.querySelectorAll('.js-lang-toggle');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    let currentLang = 'sv'; // default Swedish

    // ─── HEADER SCROLL SHADOW ────────────────────────────────
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ─── MOBILE MENU ─────────────────────────────────────────
    hamburger.addEventListener('click', () => {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !expanded);
        hamburger.classList.toggle('active');
        mainNav.classList.toggle('open');
        document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on nav link click
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ─── LANGUAGE TOGGLE ─────────────────────────────────────
    langToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            currentLang = currentLang === 'sv' ? 'en' : 'sv';
            applyLanguage(currentLang);
        });
    });

    function applyLanguage(lang) {
        // Update HTML lang attribute
        document.documentElement.lang = lang === 'sv' ? 'sv' : 'en';

        // Update flags & labels across all toggle buttons
        document.querySelectorAll('.js-lang-flag').forEach(flag => {
            flag.textContent = lang === 'sv' ? '🇬🇧' : '🇸🇪';
        });
        document.querySelectorAll('.js-lang-label').forEach(label => {
            label.textContent = lang === 'sv' ? 'English (UK)' : 'Svenska';
        });

        // Update all translatable elements
        document.querySelectorAll('[data-sv][data-en]').forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (!text) return;

            if (el.tagName === 'H1') {
                // Hero title: always use line breaks to keep the stacked layout identical in both languages
                if (lang === 'en') {
                    el.innerHTML = 'LEGAL SUPPORT<br>FOR YOU IN<br>THE SUBURBS';
                } else {
                    el.innerHTML = 'JURIDISK HJÄLP<br>FÖR DIG I<br>FÖRORTEN';
                }
            } else if (el.querySelector('svg')) {
                // Preserve inner SVG for elements like nav CTA
                const svg = el.querySelector('svg').cloneNode(true);
                el.textContent = '';
                el.appendChild(svg);
                el.appendChild(document.createTextNode(' ' + text));
            } else {
                // All other translatable elements (p, h2, h3, a, span, button, label)
                el.textContent = text;
            }
        });

        // Update page title
        document.title = lang === 'sv'
            ? 'Miljonprogrammets Jurister — Kostnadsfri Juridisk Rådgivning'
            : 'Miljonprogrammets Jurister — Free Legal Advice';
    }

    // ─── ACCORDION (Practice Areas) ─────────────────────────
    document.querySelectorAll('.accordion-header').forEach(accHeader => {
        accHeader.addEventListener('click', () => {
            const item = accHeader.closest('.accordion-item');
            const isOpen = item.classList.contains('open');

            // Close all other accordion items
            document.querySelectorAll('.accordion-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('open', !isOpen);
            accHeader.setAttribute('aria-expanded', !isOpen);
        });
    });

    // ─── SCROLL ANIMATIONS ──────────────────────────────────
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('[data-aos]');
        const windowHeight = window.innerHeight;

        elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < windowHeight - 80) {
                // Staggered delay
                setTimeout(() => {
                    el.classList.add('visible');
                }, index * 80);
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll, { passive: true });
    // Trigger once on load
    setTimeout(animateOnScroll, 200);

    // ─── CONTACT FORM ────────────────────────────────────────
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Spam protection: Rate limiting real users (1 message per minute)
            const lastSub = localStorage.getItem('last_submission_time');
            const now = Date.now();
            if (lastSub && (now - parseInt(lastSub)) < 60000) {
                formSuccess.style.color = '#d64545'; // Error color
                formSuccess.textContent = currentLang === 'sv' 
                    ? 'Vänligen vänta en minut innan du skickar igen.' 
                    : 'Please wait a minute before sending again.';
                formSuccess.classList.add('show');
                setTimeout(() => {
                    formSuccess.classList.remove('show');
                    formSuccess.style.color = ''; // reset color
                }, 4000);
                return;
            }

            // Simple validation
            let valid = true;
            const name = document.getElementById('formName');
            const email = document.getElementById('formEmail');
            const message = document.getElementById('formMessage');
            const honeypot = document.getElementById('formHoneypot');
            const submitBtn = contactForm.querySelector('.btn-submit');

            // If honeypot is filled, it's a bot. Silently return success to fool them.
            if (honeypot && honeypot.value.trim() !== '') {
                formSuccess.style.color = ''; 
                formSuccess.textContent = formSuccess.getAttribute(`data-${currentLang}`);
                formSuccess.classList.add('show');
                contactForm.reset();
                setTimeout(() => formSuccess.classList.remove('show'), 5000);
                return;
            }

            [name, email, message].forEach(field => {
                field.classList.remove('error');
                if (!field.value.trim()) {
                    field.classList.add('error');
                    valid = false;
                }
            });

            // Email format check
            if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                email.classList.add('error');
                valid = false;
            }

            if (valid) {
                // Save submission time to prevent spam
                localStorage.setItem('last_submission_time', now.toString());
                
                // Disable button temporarily to prevent double clicks
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.style.cursor = 'not-allowed';

                // Send email using Web3Forms
                const formData = new FormData();
                formData.append('access_key', '1dd34942-7851-4073-bdde-3922b34ce657');
                formData.append('name', name.value);
                formData.append('email', email.value);
                formData.append('message', message.value);
                formData.append('subject', currentLang === 'sv' ? `Nytt meddelande från ${name.value}` : `New message from ${name.value}`);

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                })
                .then(async (response) => {
                    if (response.status === 200) {
                        // Show success message
                        formSuccess.style.color = ''; // ensure it's not error color
                        formSuccess.textContent = formSuccess.getAttribute(`data-${currentLang}`);
                        formSuccess.classList.add('show');
                        contactForm.reset();
                    } else {
                        formSuccess.style.color = '#d64545';
                        formSuccess.textContent = currentLang === 'sv' ? 'Något gick fel. Vänligen försök igen.' : 'Something went wrong. Please try again.';
                        formSuccess.classList.add('show');
                    }
                })
                .catch(error => {
                    formSuccess.style.color = '#d64545';
                    formSuccess.textContent = currentLang === 'sv' ? 'Något gick fel. Vänligen försök igen.' : 'Something went wrong. Please try again.';
                    formSuccess.classList.add('show');
                })
                .finally(() => {
                    setTimeout(() => {
                        formSuccess.classList.remove('show');
                        // Re-enable button after 5 seconds
                        submitBtn.disabled = false;
                        submitBtn.style.opacity = '1';
                        submitBtn.style.cursor = 'pointer';
                    }, 5000);
                });
            }
        });
    }

    // Remove error styling on input
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
        field.addEventListener('input', () => {
            field.classList.remove('error');
        });
    });

    // ─── SMOOTH SCROLL FOR OLDER BROWSERS ───────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
                const y = target.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });
});
