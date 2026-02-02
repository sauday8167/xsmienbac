'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import JsonLd from './seo/JsonLd';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    items: FAQItem[];
    title?: string;
}

export default function FAQSection({ items, title = 'Câu Hỏi Thường Gặp (FAQ)' }: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Generate FAQ Schema
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': items.map(item => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': item.answer
            }
        }))
    };

    return (
        <section className="card my-8">
            <JsonLd data={faqSchema} />

            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <HelpCircle className="w-6 h-6 text-lottery-red-600" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    {title}
                </h2>
            </div>

            <div className="space-y-4">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`border rounded-lg overflow-hidden transition-all duration-200 ${openIndex === index ? 'border-lottery-red-200 shadow-md' : 'border-gray-200'
                            }`}
                    >
                        <button
                            onClick={() => toggleAccordion(index)}
                            className={`w-full flex items-center justify-between p-4 text-left font-semibold transition-colors ${openIndex === index
                                    ? 'bg-lottery-red-50 text-lottery-red-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="pr-4">{item.question}</span>
                            {openIndex === index ? (
                                <ChevronUp className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400" />
                            )}
                        </button>

                        <div
                            className={`
                                overflow-hidden transition-all duration-300 ease-in-out
                                ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                            `}
                        >
                            <div className="p-4 bg-white text-gray-600 leading-relaxed border-t border-gray-100">
                                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
