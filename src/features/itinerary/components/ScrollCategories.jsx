import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const CategoryItem = ({ cat, index, total, scrollYProgress, onSelectCategory }) => {
  const step = 1 / Math.max(total - 1, 1);
  const center = index * step;
  const range = [center - step / 2, center, center + step / 2];

  const opacity = useTransform(scrollYProgress, range, [0, 1, 0]);
  const y = useTransform(scrollYProgress, range, [40, 0, -40]);
  const scale = useTransform(scrollYProgress, range, [0.8, 1, 0.8]);
  const pointerEvents = useTransform(scrollYProgress, v => Math.abs(v - center) < (step / 4) ? 'auto' : 'none');

  return (
    <motion.div
      style={{
        position: 'absolute',
        opacity,
        y,
        scale,
        pointerEvents,
        width: '100%'
      }}
    >
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        color: 'var(--primary)',
        margin: '0 0 1.5rem 0',
        lineHeight: 1.1,
        textTransform: 'capitalize'
      }}>
        {cat}
      </h2>

      <button
        onClick={() => onSelectCategory(cat)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'var(--gold)',
          color: 'var(--bg-linen)',
          border: 'none',
          borderRadius: '50px',
          padding: '0.8rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 4px 15px rgba(179,138,58,0.3)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(179,138,58,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(179,138,58,0.3)';
        }}
      >
        Ver Experiencias <ArrowRight size={18} />
      </button>
    </motion.div>
  );
};

export const ScrollCategories = ({ categorias, onSelectCategory }) => {
  const containerRef = useRef(null);

  // Hook into the scroll progress of our container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Calculate the rotation of the "process circle" based on scroll progress
  // E.g., from 0 to -360 degrees
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -180]);

  return (
    <div
      ref={containerRef}
      // The container is tall enough to allow scrolling through all categories
      style={{ height: `${Math.max(categorias.length * 80, 150)}vh`, position: 'relative' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'var(--bg-linen)',
        }}
      >
        {/* Background decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(179,138,58,0.15) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(160,68,42,0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)' }} />

        {/* Big Rotating Circle */}
        <motion.div
          style={{
            position: 'absolute',
            width: '120vw',
            height: '120vw',
            border: '2px dashed rgba(179,138,58, 0.3)',
            borderRadius: '50%',
            rotate,
            left: '-60vw', // Center the edge of the circle on the left half of the screen
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* We can place icons or dots around the circle here if desired */}
        </motion.div>

        {/* Content Area that changes based on Phase */}
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', textAlign: 'center', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Sparkles size={24} style={{ color: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 600 }}>
              Explora por Categoría
            </span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categorias.map((cat, index) => (
              <CategoryItem
                key={cat}
                cat={cat}
                index={index}
                total={categorias.length}
                scrollYProgress={scrollYProgress}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)' }}>
              Haz scroll para descubrir
            </p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{ marginTop: '0.5rem', width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
