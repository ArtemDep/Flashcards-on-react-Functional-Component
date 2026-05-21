import React, { useState, useEffect } from 'react';

const Flashcard = ({ card }) => {
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    setShowBack(false);
  }, [card.id]);

  if (!card) {
    return <div className="flashcard-item back-side">Колода пуста!</div>;
  }

  return (
    <div 
      className={`flashcard-item ${showBack ? 'back-side' : 'front-side'}`}
      onClick={() => setShowBack(!showBack)}
    >
      {showBack ? card.back : card.front}
    </div>
  );
};

export default Flashcard;