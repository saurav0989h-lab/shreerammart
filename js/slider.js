(function () {
  const sliderRoot = document.querySelector('[data-slider]');
  if (!sliderRoot) {
    return;
  }

  const slides = Array.from(sliderRoot.querySelectorAll('.mySlides'));
  const dots = Array.from(document.querySelectorAll('.slider-dots .dot'));
  const prevBtn = sliderRoot.querySelector('[data-prev]');
  const nextBtn = sliderRoot.querySelector('[data-next]');
  const config = window.SLIDER_CONFIG || {};
  const defaultInterval = Number.isFinite(config.defaultInterval) ? config.defaultInterval : 5000;

  let slideIndex = 0;
  let timerId = null;

  function hideAll() {
    slides.forEach((slide) => {
      slide.style.display = 'none';
      slide.classList.remove('active');
    });
    dots.forEach((dot) => dot.classList.remove('active'));
  }

  function getIntervalForSlide(index) {
    const slide = slides[index];
    if (!slide) {
      return defaultInterval;
    }
    const attr = parseInt(slide.getAttribute('data-timer'), 10);
    if (Number.isFinite(attr) && attr > 0) {
      return attr;
    }
    if (Number.isFinite(config.globalInterval) && config.globalInterval > 0) {
      return config.globalInterval;
    }
    return defaultInterval;
  }

  function showSlide(index) {
    if (slides.length === 0) {
      return;
    }

    let newIndex = index;
    if (newIndex >= slides.length) {
      newIndex = 0;
    }
    if (newIndex < 0) {
      newIndex = slides.length - 1;
    }

    hideAll();

    slides[newIndex].style.display = 'block';
    slides[newIndex].classList.add('active');
    if (dots[newIndex]) {
      dots[newIndex].classList.add('active');
    }

    slideIndex = newIndex;
    startTimer();
  }

  function nextSlide(delta = 1) {
    showSlide(slideIndex + delta);
  }

  function startTimer() {
    clearInterval(timerId);
    const interval = getIntervalForSlide(slideIndex);
    timerId = setInterval(() => {
      nextSlide(1);
    }, interval);
  }

  function stopTimer() {
    clearInterval(timerId);
  }

  // Event listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => nextSlide(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => nextSlide(1));
  }
  if (dots.length) {
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        showSlide(idx);
      });
    });
  }

  sliderRoot.addEventListener('mouseenter', stopTimer);
  sliderRoot.addEventListener('mouseleave', startTimer);

  showSlide(0);
})();
