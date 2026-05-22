import React, { useState, useEffect, useCallback } from 'react';
import FlashcardForm from './components/FlashcardForm';
import TableRow from './components/TableRow';
import Flashcard from './components/Flashcard';
import './App.css';


const App = () => {
  const [allDecks, setAllDecks] = useState(() => {
    const saved = localStorage.getItem('flashcards-all-decks');
    return saved ? JSON.parse(saved) : [{ name: 'Колода 1', cards: [] }];
  });

  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editData, setEditData] = useState(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [loading, setLoading] = useState(false);

  const activeDeck = allDecks[currentDeckIndex] || allDecks[0];
  const cards = activeDeck.cards;

  useEffect(() => {
    localStorage.setItem('flashcards-all-decks', JSON.stringify(allDecks));
  }, [allDecks]);

  useEffect(() => {
    if (cards.length === 0) {
      setLoading(true);
      fetch('https://opentdb.com/api.php?amount=50&type=boolean')
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            const loadedCards = data.results.map((item, index) => ({
              id: Date.now() + index + Math.random(),
              front: item.question,
              back: item.correct_answer,
              learned: false
            }));

            setAllDecks((prev) => {
              const copy = [...prev];
              if (copy[currentDeckIndex]) {
                copy[currentDeckIndex].cards = loadedCards;
              }
              return copy;
            });
          }
        })
        .catch((err) => console.log('Ошибка API: ', err))
        .finally(() => setLoading(false));
    }
  }, [cards.length, currentDeckIndex]);

  const filteredCards = cards.filter((card) => {
    if (filter === 'unlearned') return !card.learned;
    return true;
  });

  const handleAddCard = useCallback((front, back) => {
    setAllDecks((prev) => {
      const copy = [...prev];
      const targetCards = copy[currentDeckIndex].cards;
      if (editData) {
        const updatedCard = { id: Date.now(), front, back, learned: editData.learned };
        copy[currentDeckIndex].cards = [...targetCards, updatedCard];
        setEditData(null);
      } else {
        const newCard = { id: Date.now(), front, back, learned: false };
        copy[currentDeckIndex].cards = [...targetCards, newCard];
      }
      return copy;
    });
    setCurrentIndex(0);
  }, [currentDeckIndex, editData]);

  const handleToggleLearned = useCallback((id) => {
    setAllDecks((prev) => {
      const copy = [...prev];
      copy[currentDeckIndex].cards = copy[currentDeckIndex].cards.map((card) =>
        card.id === id ? { ...card, learned: !card.learned } : card
      );
      return copy;
    });
  }, [currentDeckIndex]);

  const handleDeleteCard = useCallback((id) => {
    setAllDecks((prev) => {
      const copy = [...prev];
      copy[currentDeckIndex].cards = copy[currentDeckIndex].cards.filter((card) => card.id !== id);
      return copy;
    });
    setCurrentIndex(0);
  }, [currentDeckIndex]);

  const handleEditCard = useCallback((card) => {
    setEditData(card);
    handleDeleteCard(card.id);
  }, [handleDeleteCard]);

  const handleShuffle = () => {
    if (cards.length < 2) return;
    setAllDecks((prev) => {
      const copy = [...prev];
      const items = [...copy[currentDeckIndex].cards];

      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = items[i];
        items[i] = items[j];
        items[j] = temp;
      }

      copy[currentDeckIndex].cards = items;
      return copy;
    });
    setCurrentIndex(0);
  };

  const handleCreateDeck = (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    setAllDecks((prev) => [...prev, { name: newDeckName.trim(), cards: [] }]);
    setCurrentDeckIndex(allDecks.length);
    setNewDeckName('');
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentCard = filteredCards[currentIndex];

  return (
    <div className="app-container">
      <h1>Cards for learning</h1>

      <div className="deck-zone">
        <div>
          <label>Колода: </label>
          <select
            value={currentDeckIndex}
            onChange={(e) => {
              setCurrentDeckIndex(Number(e.target.value));
              setCurrentIndex(0);
            }}
          >
            {allDecks.map((deck, index) => (
              <option key={index} value={index}>

                {deck.name}

              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleCreateDeck}>
          <input
            type="text"
            placeholder="Имя новой колоды"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
          />
          <button type="submit">Создать</button>
        </form>
      </div>

      <FlashcardForm onAdd={handleAddCard} editData={editData} />

      <div className="trainer-section">
        <h2>Область изучения</h2>
        <div className="filter-group">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => { setFilter('all'); setCurrentIndex(0); }}>Учить все</button>
          <button className={filter === 'unlearned' ? 'active' : ''} onClick={() => { setFilter('unlearned'); setCurrentIndex(0); }}>Только невыученные</button>
          <button onClick={handleShuffle}>Перемешать колоду</button>
        </div>

        {loading ? (
          <p>Загрузка базовых 50 карточек...</p>
        ) : filteredCards.length > 0 ? (
          <>
            <div className="flashcard-container">
              <button onClick={handlePrev} disabled={currentIndex === 0}>←</button>
              <Flashcard card={currentCard} />
              <button onClick={handleNext} disabled={currentIndex === filteredCards.length - 1}>→</button>
            </div>
            <p>Карточка {currentIndex + 1} из {filteredCards.length}</p>
          </>
        ) : (
          <p>Нет карточек для отображения.</p>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Лицевая</th>
            <th>Обратная</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <TableRow
              key={card.id}
              card={card}
              onToggle={handleToggleLearned}
              onDelete={handleDeleteCard}
              onEdit={handleEditCard}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;