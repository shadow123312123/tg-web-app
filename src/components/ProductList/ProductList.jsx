import React, {useState} from 'react';
import './ProductList.css';
import ProductItem from "../ProductItem/ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";

const {getData} = require('../db/db');
const products = getData();


const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price * item.quantity
    }, 0)
}

const ProductList = () => {
    const [addedItems, setAddedItems] = useState([]);
    const {tg, queryId} = useTelegram();

    const onSendData = useCallback(() => {
        const data = {
            products: addedItems,
            totalPrice: getTotalPrice(addedItems),
            queryId,
        }

        fetch('http://localhost:8000/web-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
    }, [addedItems])

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData])

    const onAdd = (food) => {
        const exist = addedItems.find((x)=> x.id === food.id);

        if (exist){

            setAddedItems(
                addedItems.map((x)=>
                    x.id === food.id ? {...exist, quantity: exist.quantity + 1} : x
                )
            );

        } else {

            setAddedItems([...addedItems, {...food, quantity: 1}]);
        }

        if(addedItems.length === 0) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
            tg.MainButton.setParams({
                text: `Купить ${getTotalPrice(addedItems)}`
            })
        }
    }

    const onRemove = (food) => {
        const exist = addedItems.find((x) => x.id === food.id);

        if (exist.quantity === 1) {

            setAddedItems(addedItems.filter((x) => x.id !== food.id));

        } else {

            setAddedItems(
                addedItems.map((x) =>
                    x.id === food.id ? {...exist, quantity: exist.quantity - 1} : x
                )
            );
        }
    };

    return (

            <div className='cards__container'>
                {products.map((food) => {
                    return (
                        <ProductItem food={food} key={food.id} onAdd={onAdd} onRemove={onRemove} />
                    );
                })}
            </div>

    );
};

export default ProductList;
