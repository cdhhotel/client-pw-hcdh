import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Utilities for throttling and debouncing
const throttle = (callback, limit) => {
  let waiting = false;
  return function () {
    if (!waiting) {
      callback.apply(this, arguments);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
};

const debounce = (func, wait, immediate) => {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const SLIDES = [
  {
    key: 'COMIDA',
    name: 'Gastronomía',
    color: '#8A5A47',
    image: '/images/comida.jpg',
    description: 'SABORES TRADICIONALES Y CAFÉS, BARES/CANTINAS Y MERCADOS',
    // location: 'CUNA DE LA INDEPENDENCIA'
  },
  {
    key: 'ATRACCIONES',
    name: 'Atracciones',
    color: '#6E7356', // Sage green accent
    image: '/images/atracciones.png',
    description: 'MUSEOS HISTÓRICOS, VIÑEDOS Y BALNEARIOS',
    // location: 'DOLORES HIDALGO, GTO.'
  },
  {
    key: 'EVENTOS',
    name: 'Eventos',
    color: '#9A7836',
    image: '/images/eventos.png',
    description: 'FESTIVALES DE ARTE Y ACTIVIDADES CULTURALES',
    // location: 'TRADICIÓN EN MOVIMIENTO'
  },
  {
    key: 'SALUD',
    name: 'Salud',
    color: '#7E4848',
    image: '/images/salud.jpg',
    description: 'FARMACIAS 24 HORAS, CLÍNICAS/HOSPITALES Y SERVICIOS MÉDICOS',
    // location: 'ATENCIÓN Y BIENESTAR'
  },
  {
    key: 'TOURS',
    name: 'Tours',
    color: '#a5644aff',
    image: '/images/turismo.png',
    description: 'RECORRIDOS GUIADOS Y EXPERIENCIAS TURÍSTICAS',
    // location: 'DESCUBRE LA HISTORIA'
  },
  {
    key: 'OTRAS',
    name: 'Otros Servicios',
    color: '#e6d68eff',
    image: '/images/otras.png',
    description: 'PENSIONES, TRANSPORTE Y OTROS SERVICIOS',
    // location: 'OTROS SERVICIOS'
  }
];

const AUTOPLAY_DELAY = 5000;

export const CategorySelector = ({ onOpenCategory, onSlideChange }) => {
  const sliderRef = useRef(null);
  const titleRef = useRef(null);
  const imagesRef = useRef(null);
  const descRef = useRef(null);
  const locRef = useRef(null);
  const cursorRef = useRef(null);

  const onOpenCategoryRef = useRef(onOpenCategory);
  useEffect(() => {
    onOpenCategoryRef.current = onOpenCategory;
  }, [onOpenCategory]);

  const onSlideChangeRef = useRef(onSlideChange);
  useEffect(() => {
    onSlideChangeRef.current = onSlideChange;
  }, [onSlideChange]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let current = 0;
    let animating = false;
    const total = SLIDES.length;
    let slideEls = [];
    let currentLine = null;
    let cursorVisible = false;
    let autoPlayId = null;
    let masterTimeline = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Helper functions
    const mod = (n) => ((n % total) + total) % total;

    // Preload slide images
    SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });

    // Custom Cursor tracking
    let cursorMoveX = gsap.quickTo(cursorRef.current, 'x', {
      duration: 0.4,
      ease: 'power3'
    });
    let cursorMoveY = gsap.quickTo(cursorRef.current, 'y', {
      duration: 0.4,
      ease: 'power3'
    });

    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayId = setInterval(() => {
        if (!animating) go('next');
      }, AUTOPLAY_DELAY);
    };

    const stopAutoPlay = () => {
      if (autoPlayId) {
        clearInterval(autoPlayId);
        autoPlayId = null;
      }
    };

    const setTitle = (text) => {
      if (!titleRef.current) return;
      titleRef.current.innerHTML = '';
      const line = document.createElement('div');
      [...text].forEach((ch) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        line.appendChild(span);
      });
      titleRef.current.appendChild(line);
      currentLine = line;
    };

    const animateTitle = (newText, direction, parentTimeline) => {
      if (!titleRef.current) return { newLine: null, newChars: [], oldLine: null };
      const h = titleRef.current.offsetHeight;
      const dir = direction === 'next' ? 1 : -1;
      const oldLine = currentLine;
      const oldChars = oldLine ? [...oldLine.querySelectorAll('span')] : [];

      titleRef.current.style.height = h + 'px';
      if (oldLine) {
        oldLine.style.cssText = 'position:absolute;top:0;left:0;width:100%';
      }

      const newLine = document.createElement('div');
      newLine.style.cssText = 'position:absolute;top:0;left:0;width:100%';
      [...newText].forEach((ch) => {
        const span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        newLine.appendChild(span);
      });
      titleRef.current.appendChild(newLine);

      const newChars = [...newLine.querySelectorAll('span')];
      gsap.set(newChars, { y: h * dir });

      const duration = reducedMotion ? 0.01 : 1;
      const stagger = reducedMotion ? 0 : 0.03;

      if (oldChars.length > 0) {
        parentTimeline.to(
          oldChars,
          {
            y: -h * dir,
            stagger: stagger,
            duration: duration,
            ease: 'expo.inOut'
          },
          0
        );
      }

      parentTimeline.to(
        newChars,
        {
          y: 0,
          stagger: stagger,
          duration: duration,
          ease: 'expo.inOut'
        },
        0
      );

      return { newLine, newChars, oldLine };
    };

    const setFooterInfo = (slideIndex) => {
      if (descRef.current && SLIDES[slideIndex]) {
        descRef.current.innerHTML = (SLIDES[slideIndex].description || '').replace(/\n/g, '<br>');
      }
      if (locRef.current && SLIDES[slideIndex]) {
        locRef.current.innerHTML = (SLIDES[slideIndex].location || '').replace(/\n/g, '<br>');
      }
    };

    const makeSlide = (idx) => {
      const div = document.createElement('div');
      div.className = 'slider__slide';

      const img = document.createElement('img');
      img.src = SLIDES[idx].image;
      img.alt = SLIDES[idx].name;
      img.width = 1000;
      img.height = 700;
      div.appendChild(img);

      // Slide click opens the CategoryModal or transitions to it
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        const slideEntry = slideEls.find(s => s.el === div);
        if (slideEntry) {
          if (slideEntry.step === 0) {
            onOpenCategoryRef.current?.(SLIDES[idx].key);
          } else {
            go(slideEntry.step > 0 ? 'next' : 'prev');
          }
        } else {
          onOpenCategoryRef.current?.(SLIDES[idx].key);
        }
      });

      return div;
    };

    const getSlideProps = (step) => {
      if (!imagesRef.current) return {};
      const h = imagesRef.current.offsetHeight;
      const absStep = Math.abs(step);
      const positions = [
        { x: -0.32, y: -0.9, rot: -25, s: 1.3, b: 12, o: 0 },
        { x: -0.16, y: -0.45, rot: -12, s: 1.1, b: 6, o: 0.55 },
        { x: 0, y: 0, rot: 0, s: 1, b: 0, o: 1 },
        { x: -0.05, y: 0.45, rot: 12, s: 0.75, b: 4, o: 0.55 },
        { x: -0.1, y: 0.9, rot: 25, s: 0.55, b: 10, o: 0 }
      ];
      const idx = Math.max(0, Math.min(4, step + 2));
      const p = positions[idx];

      return {
        x: p.x * h,
        y: p.y * h,
        rotation: p.rot,
        scale: p.s,
        blur: p.b,
        opacity: p.o,
        zIndex: absStep === 0 ? 3 : absStep === 1 ? 2 : 1
      };
    };

    const positionSlide = (slide, step) => {
      const props = getSlideProps(step);
      gsap.set(slide, {
        xPercent: -50,
        yPercent: -50,
        x: props.x,
        y: props.y,
        rotation: props.rotation,
        scale: props.scale,
        opacity: props.opacity,
        filter: `blur(${props.blur}px)`,
        zIndex: props.zIndex
      });
    };

    const buildCarousel = () => {
      if (!imagesRef.current || imagesRef.current.offsetHeight === 0) return;
      imagesRef.current.innerHTML = '';
      slideEls = [];

      for (let step = -1; step <= 1; step++) {
        const idx = mod(current + step);
        const slide = makeSlide(idx);
        imagesRef.current.appendChild(slide);
        positionSlide(slide, step);
        slideEls.push({ el: slide, step: step });
      }
    };

    const animateCarousel = (direction) => {
      if (!imagesRef.current || imagesRef.current.offsetHeight === 0)
        return gsap.timeline();

      const shift = direction === 'next' ? -1 : 1;
      const enterStep = direction === 'next' ? 2 : -2;
      const newIdx = direction === 'next' ? mod(current + 2) : mod(current - 2);

      const newSlide = makeSlide(newIdx);
      imagesRef.current.appendChild(newSlide);
      positionSlide(newSlide, enterStep);
      slideEls.push({ el: newSlide, step: enterStep });

      slideEls.forEach((s) => {
        s.step += shift;
      });

      const duration = reducedMotion ? 0.01 : 1;

      const tl = gsap.timeline({
        onComplete: () => {
          slideEls = slideEls.filter((s) => {
            if (Math.abs(s.step) >= 2) {
              s.el.remove();
              return false;
            }
            return true;
          });
        }
      });

      slideEls.forEach((s) => {
        const props = getSlideProps(s.step);
        s.el.style.zIndex = props.zIndex;

        tl.to(
          s.el,
          {
            x: props.x,
            y: props.y,
            rotation: props.rotation,
            scale: props.scale,
            opacity: props.opacity,
            filter: `blur(${props.blur}px)`,
            duration: duration,
            ease: 'power3.inOut'
          },
          0
        );
      });

      return tl;
    };

    const go = (direction) => {
      if (animating) return;
      animating = true;
      startAutoPlay();

      const nextIdx = direction === 'next' ? mod(current + 1) : mod(current - 1);

      if (masterTimeline) {
        masterTimeline.kill();
      }

      masterTimeline = gsap.timeline({
        onComplete: () => {
          if (titleRef.current) {
            const children = Array.from(titleRef.current.children);
            children.forEach((child) => {
              if (child !== newLine) {
                child.remove();
              }
            });
            titleRef.current.style.height = '';
          }
          if (newLine) {
            newLine.style.cssText = '';
            gsap.set(newChars, { clearProps: 'all' });
            currentLine = newLine;
          }
          current = nextIdx;
          animating = false;
        }
      });

      const { newLine, newChars } = animateTitle(SLIDES[nextIdx].name, direction, masterTimeline);
      masterTimeline.add(animateCarousel(direction), 0);

      onSlideChangeRef.current?.(SLIDES[nextIdx].key);

      // Update descriptions
      setTimeout(() => {
        setFooterInfo(nextIdx);
      }, 300);
    };

    // Initial setup
    setTitle(SLIDES[0].name);
    setFooterInfo(0);
    buildCarousel();

    // Event Bindings
    const onWheel = throttle((e) => {
      e.preventDefault();
      e.stopPropagation();
      if (animating) return;
      go(e.deltaY > 0 ? 'next' : 'prev');
    }, 1500);

    slider.addEventListener('wheel', onWheel, { passive: false });

    let touchStartY = 0;
    slider.addEventListener(
      'touchstart',
      (e) => {
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    const onTouchEnd = throttle((e) => {
      if (animating) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 40) return;
      go(diff > 0 ? 'next' : 'prev');
    }, 1500);

    slider.addEventListener('touchend', onTouchEnd, { passive: true });

    const onKeyDown = (e) => {
      if (animating) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go('next');
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go('prev');
    };
    window.addEventListener('keydown', onKeyDown);

    const onMouseMove = (e) => {
      if (!cursorVisible) {
        gsap.to(cursorRef.current, { opacity: 1, duration: 0.3 });
        cursorVisible = true;
      }
      cursorMoveX(e.clientX);
      cursorMoveY(e.clientY);
    };

    slider.addEventListener('mousemove', onMouseMove, { passive: true });

    const onMouseLeave = () => {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.3 });
      cursorVisible = false;
    };
    slider.addEventListener('mouseleave', onMouseLeave);

    const onResize = debounce(() => {
      if (!animating && imagesRef.current && imagesRef.current.offsetHeight > 0) {
        slideEls.forEach((s) => {
          positionSlide(s.el, s.step);
        });
      }
    }, 300);
    window.addEventListener('resize', onResize, { passive: true });

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        animating = false;
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    startAutoPlay();

    // Clean up
    return () => {
      stopAutoPlay();
      if (masterTimeline) masterTimeline.kill();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (slider) {
        slider.removeEventListener('wheel', onWheel);
        slider.removeEventListener('touchend', onTouchEnd);
        slider.removeEventListener('mousemove', onMouseMove);
        slider.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, []);

  return (
    <div className="category-container">
      <section className="slider" ref={sliderRef} style={{ paddingTop: 'var(--navbar-height)', borderRadius: '0 0 8px 8px' }}>
        <div className="slider__header">
          {/* <button
            className="slider__menu"
            aria-label="Volver"
             onClick={() => onOpenCategoryRef.current?.(SLIDES[currentIdx].key)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button> */}
          {/* <span className="slider__label">EXPLORAR ITINERARIO — CASA DOLORES</span> */}
        </div>

        <div className="slider__body">
          <div className="slider__left">
            <h2 className="slider__title" ref={titleRef} aria-live="polite"></h2>

            <div className="slider__footer">
              <div className="slider__info">
                <h3 className="slider__description" ref={descRef}></h3>
              </div>
            </div>
          </div>

          <div className="slider__right">
            <div className="slider__images" ref={imagesRef}></div>
          </div>
        </div>

        {/* Custom cursor element */}
        {/* <div className="slider__cursor" ref={cursorRef} aria-hidden="true">
          <span>Explorar</span>
          <span className="slider__cursor-arrow">→</span>
        </div> */}
      </section>
    </div>
  );
};

export default CategorySelector;
