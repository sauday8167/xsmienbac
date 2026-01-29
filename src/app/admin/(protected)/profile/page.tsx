'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage() {
    const [user, setUser] = useState({
        full_name: '',
        email: '',
        username: '',
        avatar: ''
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/admin/profile');
                const data = await res.json();
                if (data.success && data.data) {
                    setUser(prev => ({ ...prev, ...data.data }));
                }
            } catch (error) {
                console.error('Error fetching profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: user.full_name,
                    email: user.email,
                    avatar: user.avatar
                })
            });
            const data = await res.json();
            if (data.success) alert('Cập nhật thông tin thành công');
            else alert(data.error);
        } catch (error) {
            alert('Lỗi kết nối');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }
        try {
            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: passwords.current,
                    new_password: passwords.new
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Đổi mật khẩu thành công');
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Lỗi kết nối');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Hồ sơ Cá nhân</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Thông tin Cơ bản</h3>
                    <form onSubmit={handleUpdateInfo} className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden relative group">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                            <input
                                type="text"
                                value={user.username}
                                disabled
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input
                                type="text"
                                value={user.full_name}
                                onChange={e => setUser({ ...user, full_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user.email}
                                onChange={e => setUser({ ...user, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                            <input
                                type="text"
                                value={user.avatar}
                                onChange={e => setUser({ ...user, avatar: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Copy link ảnh từ thư viện Media</p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Cập nhật Thông tin
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Đổi Mật khẩu</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                required
                                value={passwords.current}
                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                required
                                value={passwords.confirm}
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-2 bg-lottery-red-600 hover:bg-lottery-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Đổi Mật khẩu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
