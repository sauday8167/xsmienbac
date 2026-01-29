'use client';

import ResultForm from '@/components/admin/ResultFormNew';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function EditResultPage() {
    const params = useParams();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/results/${params.id}`);
                const data = await res.json();
                if (data.success) {
                    setInitialData(data.data);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    if (!initialData) {
        return <div className="p-8 text-center text-red-500">Không tìm thấy kết quả.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa Kết quả</h1>
            <ResultForm initialData={initialData} isEditing={true} />
        </div>
    );
}
