import React from 'react';

const ShoppingList = ({list}) => (
    <div className="ingredients-list">
        <h3 className="subheader">
            Your shopping List
        </h3>
        <ul>
            {list.map(item => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

export default ShoppingList;