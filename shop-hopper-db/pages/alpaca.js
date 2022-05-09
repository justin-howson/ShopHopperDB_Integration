import React, { useState } from 'react';
import styled from 'styled-components';

const Alpaca = () => {
    const [isFetching, setIsFetching] = useState(false);
    const [numberReceived, setNumberReceived] = useState(0);
    const [itemsRemoved, setItemsRemoved] = useState(false);

    const uploadProducts = async () => {
        setItemsRemoved(false);
        setIsFetching(true);
        const response = await fetch('/api/alpaca-scraper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        setIsFetching(false);

        const result = await response.json();
        console.log('/alpaca.js - result: ', result);
        // const num = res.result.length;
        setNumberReceived(result.count);
    };

    const removeProducts = async (business_name) => {
        setNumberReceived(0);
        const response = await fetch('/api/alpaca-scraper/removeProducts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
        if (result.status === 'success') {
            setItemsRemoved(true);
        }
    };

    return (
        <Wrapper>
            <Left>
                <h1>Fossellos Scraper</h1>
                <p>Get Products will scrape all Tops from Fossellos and place their data in the Shophopper Database</p>
                {isFetching && <div>Getting products...</div>}
                <Div>
                    <button onClick={() => uploadProducts()}>Get Products</button>

                    <Right>
                        <p fontSize={16}>{isFetching && 'Scraping Tops from Fossellos'}</p>

                        {numberReceived > 0 && <p fontSize={16}>{`${numberReceived} items added to database`}</p>}
                    </Right>
                </Div>
                <p>Clear Products will remove all Fossellos products from the database</p>
                <Div>
                    <button onClick={() => removeProducts()}>Clear Products</button>
                    <Right>
                        <p fontSize={16}>{itemsRemoved && 'All Fossellors Products removed from Database'}</p>
                    </Right>
                </Div>
            </Left>
        </Wrapper>
    );
};

export default Alpaca;
// ---------------------------STYLES-------------------------------------------//

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    position: relative;
    gap: 25px;
    padding: 6%;
    color: grey;
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;
    width: 40%;
    p-align: left;
    margin-left: -10px;
    z-index: 5;
    position: relative;
    padding: 20px;
    gap: 15px;
`;

const Right = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    height: 100px;
    width: 250px;
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
    padding-top: 33px;
    color: #65a4b8;
`;
const Div = styled.div`
    height: 100px;
    position: relative;
`;
