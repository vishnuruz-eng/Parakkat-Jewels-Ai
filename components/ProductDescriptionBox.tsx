/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface ProductDescriptionBoxProps {
  isLoading: boolean;
  title?: string;
  description?: string;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);


const ProductDescriptionBox: React.FC<ProductDescriptionBoxProps> = ({ isLoading, title, description }) => {
    const [copied, setCopied] = useState<'title' | 'description' | null>(null);

    const handleCopy = (text: string | undefined, type: 'title' | 'description') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="w-full bg-gray-800/50 border border-gray-700/80 rounded-lg p-6 animate-fade-in backdrop-blur-sm flex flex-col items-center justify-center text-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                <h3 className="text-lg font-semibold text-gray-300">Generating Product Details...</h3>
                <p className="text-gray-400 text-sm">The AI is analyzing your image to write the perfect copy.</p>
            </div>
        );
    }
    
    if (!title && !description) {
        return null;
    }

    return (
        <div className="w-full bg-gray-800/50 border border-gray-700/80 rounded-lg p-6 animate-fade-in backdrop-blur-sm flex flex-col gap-4">
            <h3 className="text-lg font-bold text-gray-200">AI-Generated Product Details</h3>
            
            {title && (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-400">Title</label>
                        <button onClick={() => handleCopy(title, 'title')} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md">
                            {copied === 'title' ? <CheckIcon className="w-5 h-5 text-red-400" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="bg-gray-900/50 border border-gray-700 rounded-md p-3 text-gray-200 text-base">{title}</p>
                </div>
            )}

            {description && (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-400">Description</label>
                        <button onClick={() => handleCopy(description, 'description')} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md">
                            {copied === 'description' ? <CheckIcon className="w-5 h-5 text-red-400" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="bg-gray-900/50 border border-gray-700 rounded-md p-3 text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
            )}

        </div>
    );
};

export default ProductDescriptionBox;