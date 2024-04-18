import React, { useState } from 'react';

const ImageToggle = ({ src, initialState }) => {
    const [isBig, setIsBig] = useState(initialState);

    const toggleSize = () => {
        setIsBig(!isBig);
    };

    return (
        <div>
            <img
                src={src}
                alt="Catalog"
                style={{ width: isBig ? '60%' : '30%', height: 'auto' }}
                onClick={toggleSize}
            />
        </div>
    );
};

export default ImageToggle