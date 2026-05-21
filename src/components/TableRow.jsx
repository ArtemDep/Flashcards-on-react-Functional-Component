import React from 'react';

const TableRow = ({ card, onToggle, onDelete, onEdit }) => {
  return (
    <tr>
      <td>{card.front}</td>
      <td>{card.back}</td>
      <td>
        <label>
          <input
            type="checkbox"
            checked={card.learned}
            onChange={() => onToggle(card.id)}
          />
          {card.learned ? ' Выучена' : ' Не выучена'}
        </label>
      </td>
      <td>
        <button className="action-btn" onClick={() => onEdit(card)}>Редактировать</button>
        <button className="action-btn" onClick={() => onDelete(card.id)}>Удалить</button>
      </td>
    </tr>
  );
};

export default TableRow;