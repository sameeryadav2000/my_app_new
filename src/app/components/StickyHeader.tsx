'use client';

import { useState, useEffect } from 'react';

interface StickyHeaderProps {
    title: string;
    condition: string;
    storage: string;
    color: string;
    price: number;
    originalPrice: number;
    savings: number;
    imageSrc: string;
}

const StickyHeader = ({ title, condition, storage, color, price, originalPrice, savings, imageSrc }: StickyHeaderProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsVisible(scrollPosition > 200);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`fixed top-0 left-0 right-0 bg-white border-b z-50 py-3 transform transition-transform duration-300 ease-in-out ${
            isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}>
            <div className="md:px-20">
                <div className="flex items-center md:justify-between gap-5">
                    {/* Left side with image and specs */}
                    <div className="flex items-center space-x-4">
                        <img
                            src={imageSrc}
                            alt={title}
                            className="w-12 h-12 object-contain hidden md:block"
                        />
                        <span className='capitalize'>{condition} - {storage} - {color}</span>
                    </div>

                    {/* Right side with price and button */}
                    <div className="flex items-center space-x-8">
                        <div>
                            <div className="flex items-baseline space-x-2">
                                <span className="font-medium">${price}</span>
                                {/* <span className="text-sm text-gray-600">before trade-in</span> */}
                            </div>
                            {/* <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-500 line-through">${originalPrice.toFixed(2)} new</span>
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    Save ${savings.toFixed(2)}
                                </span>
                            </div> */}
                        </div>

                        <button
                            className="bg-black text-white px-10 py-2 rounded-lg hover:bg-gray-800 transition-colors hidden md:block"
                        >
                            Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StickyHeader;