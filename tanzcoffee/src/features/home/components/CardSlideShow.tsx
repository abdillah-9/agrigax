import { useEffect, useState, type ReactElement } from 'react';

interface CardSlideShowProps {
  index: number;
  slides: ReactElement<{ img: string }>[];
  animeClass: string;
}

// Waits until every card image is preloaded, then renders the active card.
function CardSlideShow({ index, slides, animeClass }: CardSlideShowProps) {
  const [cards, setCards] = useState<ReactElement<{ img: string }>[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = new Array<ReactElement<{ img: string }>>(slides.length);
    let count = 0;
    slides.forEach((card, position) => {
      const img = new Image();
      img.src = card.props.img;
      img.onload = () => {
        loaded[position] = card;
        count++;
        if (count === slides.length) {
          setCards(loaded);
          setReady(true);
        }
      };
    });
  }, [slides]);

  if (!ready) {
    return <div style={{ height: '200px', width: '100%', backgroundColor: '#eee' }} />;
  }

  return (
    <div
      key={index}
      className={animeClass}
      style={{
        width: '100%',
        minHeight: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {cards[index]}
    </div>
  );
}

export default CardSlideShow;
