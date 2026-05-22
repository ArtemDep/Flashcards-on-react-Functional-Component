import React, { useState, useEffect } from 'react';

const FlashcardForm = ({ onAdd, editData }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  useEffect(() => {
    if (editData) {
      setFront(editData.front);
      setBack(editData.back);
    }
  }, [editData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!front.trim() || !back.trim()) return;

    onAdd(front.trim(), back.trim());
    setFront('');
    setBack('');
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input
        type="text"
        placeholder="Лицевая сторона"
        value={front}
        onChange={(event) => setFront(event.target.value)}
      />
      <input
        type="text"
        placeholder="Обратная сторона"
        value={back}
        onChange={(event) => setBack(event.target.value)}
      />
      <button type="submit" className="btn-create">
        {editData ? 'Сохранить карту' : 'Создать карточку'}
      </button>
    </form>
  );
};

export default FlashcardForm;