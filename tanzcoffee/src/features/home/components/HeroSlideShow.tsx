import { useEffect, useState, type CSSProperties } from 'react';
import { CgChevronLeft, CgChevronRight } from 'react-icons/cg';
import professionalismPic from '../../../assets/profesionalism_IntergrityCroped.webp';
import qualityStoragePic from '../../../assets/quality_storageCroped.webp';
import naturalTanzanianPic from '../../../assets/natural_tanzanian_coffee.webp';
import naturalGreenPic from '../../../assets/natural_green_coffeeCroped.webp';
import productHandlingPic from '../../../assets/product_handlingCroped.webp';

const captionStyle: CSSProperties = {
  position: 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: 'clamp(30px, 5vw, 56px)',
  fontWeight: '800',
  textAlign: 'center',
  width: '90%',
};

function HeroSlideShow() {
  const [animate, setAnimate] = useState(true);
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);

  const slides = [
    professionalismPic,
    qualityStoragePic,
    naturalTanzanianPic,
    naturalGreenPic,
    productHandlingPic,
  ];
  const titles = [
    'Professionalism & Integrity',
    'Quality Storage',
    'Natural Green Coffee',
    'Natural Tanzanian Coffee',
    'Product Handling Excellence',
  ];

  useEffect(() => {
    const loaded = new Array<HTMLImageElement>(slides.length);
    let count = 0;
    slides.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loaded[index] = img;
        count++;
        if (count === slides.length) {
          setImages(loaded);
          setReady(true);
        }
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      setAnimate(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setAnimate(true);
      }, 20);
    }, 7000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const next = () => {
    if (!ready) return;
    setAnimate(false);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % images.length);
      setAnimate(true);
    }, 20);
  };

  const previous = () => {
    if (!ready) return;
    setAnimate(false);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + images.length) % images.length);
      setAnimate(true);
    }, 20);
  };

  if (!ready) {
    return <div style={{ height: '400px', width: '100%', backgroundColor: '#eee' }} />;
  }

  return (
    <div
      className={`slideShowHeight ${animate ? 'slideScale' : ''}`}
      style={{ width: '100vw', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', minHeight: '400px' }}>
        <img
          src={images[current].src}
          alt="slide"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: `
      radial-gradient(
        circle at center,
        rgba(0, 0, 0, 0.05) 0%,
        rgba(0, 0, 0, 0.20) 35%,
        rgba(0, 0, 0, 0.40) 60%,
        rgba(0, 0, 0, 0.60) 80%,
        rgba(0, 0, 0, 0.75) 100%
      )
    `,
        }}
      />

      <div
        className={`heroCaption ${animate ? 'slideTop' : ''}`}
        style={{ ...captionStyle, color: 'white' }}
      >
        {titles[current]}
      </div>

      <div
        className="heroArrow"
        style={{
          position: 'absolute',
          top: '50%',
          left: '2%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          borderRadius: '50%',
          padding: '10px 13px',
          background: 'linear-gradient(135deg, #dd9d6dff, #c9834f)',
          cursor: 'pointer',
        }}
        onClick={previous}
      >
        <CgChevronLeft style={{ fontSize: '35px', color: 'white' }} />
      </div>
      <div
        className="heroArrow"
        style={{
          position: 'absolute',
          top: '50%',
          right: '2%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          borderRadius: '50%',
          padding: '10px 13px',
          background: 'linear-gradient(135deg, #dd9d6dff, #c9834f)',
          cursor: 'pointer',
        }}
        onClick={next}
      >
        <CgChevronRight style={{ fontSize: '35px', color: 'white' }} />
      </div>
    </div>
  );
}

export default HeroSlideShow;
