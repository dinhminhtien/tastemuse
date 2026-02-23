'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Heart, Loader2, UtensilsCrossed, Store, MapPin, ChefHat, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface FavoriteItem {
    id: string;
    target_type: 'dish' | 'restaurant';
    target_id: string;
    created_at: string;
    name?: string;
    slug?: string;
    image_url?: string;
    address?: string;
    ward?: string;
    city?: string;
    tags?: string[];
    restaurant_name?: string;
    min_price?: number;
    max_price?: number;
}

export default function FavoritesPage() {
    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'dish' | 'restaurant'>('all');
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    async function loadFavorites() {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/favorites?user_id=${currentUser.id}`);
            const json = await res.json();

            if (!json.success || !json.data) {
                setLoading(false);
                return;
            }

            const enriched = await Promise.all(
                json.data.map(async (fav: FavoriteItem) => {
                    if (fav.target_type === 'dish') {
                        const { data } = await supabase
                            .from('dishes')
                            .select(`
                                name, 
                                restaurants(name, slug, ward, city, min_price, max_price),
                                dish_media(media_url, is_primary, sort_order)
                            `)
                            .eq('id', fav.target_id)
                            .single();

                        const media = data?.dish_media?.sort((a: any, b: any) => a.sort_order - b.sort_order);

                        return {
                            ...fav,
                            name: data?.name || 'Món ăn',
                            restaurant_name: data?.restaurants?.name,
                            slug: data?.restaurants?.slug,
                            ward: data?.restaurants?.ward,
                            city: data?.restaurants?.city,
                            min_price: data?.restaurants?.min_price,
                            max_price: data?.restaurants?.max_price,
                            image_url: media?.find((m: any) => m.is_primary)?.media_url
                                || media?.[0]?.media_url || null,
                        };
                    } else {
                        const { data } = await supabase
                            .from('restaurants')
                            .select(`
                                name, slug, address, ward, city, tags, min_price, max_price,
                                restaurant_media(media_url, is_cover, display_order)
                            `)
                            .eq('id', fav.target_id)
                            .single();

                        const media = data?.restaurant_media?.sort((a: any, b: any) => a.display_order - b.display_order);

                        return {
                            ...fav,
                            name: data?.name || 'Nhà hàng',
                            slug: data?.slug,
                            address: data?.address,
                            ward: data?.ward,
                            city: data?.city,
                            tags: data?.tags || [],
                            min_price: data?.min_price,
                            max_price: data?.max_price,
                            image_url: media?.find((m: any) => m.is_cover)?.media_url
                                || media?.[0]?.media_url || null,
                        };
                    }
                })
            );

            setFavorites(enriched);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    }

    async function removeFavorite(fav: FavoriteItem) {
        if (!user) return;
        setRemovingId(fav.id);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    target_type: fav.target_type,
                    target_id: fav.target_id,
                }),
            });

            setFavorites(prev => prev.filter(f => f.id !== fav.id));
        } catch (error) {
            console.error('Error removing favorite:', error);
        } finally {
            setRemovingId(null);
        }
    }

    const filtered = activeTab === 'all'
        ? favorites
        : favorites.filter(f => f.target_type === activeTab);

    const dishCount = favorites.filter(f => f.target_type === 'dish').length;
    const restCount = favorites.filter(f => f.target_type === 'restaurant').length;

    // Not logged in
    if (!user && !loading) {
        return (
            <main className="min-h-screen bg-background">
                <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                                <Heart className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold">
                                Danh sách <span className="text-primary">yêu thích</span>
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Đăng nhập để lưu và quản lý các món ăn, nhà hàng yêu thích của bạn
                            </p>
                            <Link href="/login">
                                <Button size="lg" className="mt-4">
                                    Đăng nhập ngay
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                            Danh sách <span className="text-primary">yêu thích</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {loading
                                ? 'Đang tải...'
                                : `${favorites.length} mục đã lưu`
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <section className="py-6 bg-background border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 justify-center flex-wrap">
                        {[
                            { key: 'all' as const, label: 'Tất cả', count: favorites.length, icon: Heart },
                            { key: 'dish' as const, label: 'Món ăn', count: dishCount, icon: UtensilsCrossed },
                            { key: 'restaurant' as const, label: 'Nhà hàng', count: restCount, icon: Store },
                        ].map(tab => (
                            <Button
                                key={tab.key}
                                variant={activeTab === tab.key ? 'default' : 'outline'}
                                onClick={() => setActiveTab(tab.key)}
                                className="gap-2"
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.key
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {tab.count}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 bg-background">
                <div className="container mx-auto px-4">
                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Đang tải danh sách yêu thích...</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-20 max-w-md mx-auto">
                            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                                <Heart className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <p className="text-xl font-semibold text-foreground mb-2">
                                {activeTab === 'all'
                                    ? 'Chưa có mục yêu thích'
                                    : activeTab === 'dish'
                                        ? 'Chưa có món ăn yêu thích'
                                        : 'Chưa có nhà hàng yêu thích'}
                            </p>
                            <p className="text-muted-foreground mb-6">
                                Nhấn vào biểu tượng ❤️ trên trang chi tiết để lưu vào đây
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Link href="/dishes">
                                    <Button variant="outline" className="gap-2">
                                        <UtensilsCrossed className="w-4 h-4" />
                                        Khám phá món ăn
                                    </Button>
                                </Link>
                                <Link href="/restaurants">
                                    <Button variant="outline" className="gap-2">
                                        <Store className="w-4 h-4" />
                                        Khám phá nhà hàng
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Grid */}
                    {!loading && filtered.length > 0 && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((fav) => (
                                <Card
                                    key={fav.id}
                                    className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group h-full flex flex-col"
                                >
                                    {/* Image */}
                                    <Link
                                        href={fav.target_type === 'dish' ? `/dish/${fav.target_id}` : `/restaurant/${fav.slug || fav.target_id}`}
                                    >
                                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                            {fav.image_url ? (
                                                <img
                                                    src={fav.image_url}
                                                    alt={fav.name || ''}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                    <span className="text-5xl font-bold text-primary/30">
                                                        {fav.name?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Type badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${fav.target_type === 'dish'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-blue-600 text-white'
                                                    }`}>
                                                    {fav.target_type === 'dish' ? '🍜 Món ăn' : '🏪 Nhà hàng'}
                                                </span>
                                            </div>

                                            {/* Price badge */}
                                            {fav.min_price && fav.max_price && (
                                                <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm text-foreground px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
                                                    {fav.min_price.toLocaleString('vi-VN')}đ - {fav.max_price.toLocaleString('vi-VN')}đ
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                                        <div>
                                            <Link
                                                href={fav.target_type === 'dish' ? `/dish/${fav.target_id}` : `/restaurant/${fav.slug || fav.target_id}`}
                                            >
                                                <h3 className="text-xl font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                                    {fav.name}
                                                </h3>
                                            </Link>

                                            {/* Dish → show restaurant name */}
                                            {fav.target_type === 'dish' && fav.restaurant_name && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                                                    <ChefHat className="w-4 h-4 shrink-0" />
                                                    <span className="line-clamp-1">{fav.restaurant_name}</span>
                                                </p>
                                            )}

                                            {/* Location */}
                                            {(fav.address || fav.ward) && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="w-4 h-4 shrink-0" />
                                                    <span className="line-clamp-1">
                                                        {fav.address
                                                            ? `${fav.address}, ${fav.ward}, ${fav.city}`
                                                            : `${fav.ward}, ${fav.city}`
                                                        }
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {fav.tags && fav.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {fav.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                                            <span className="text-xs text-muted-foreground">
                                                Đã lưu {new Date(fav.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8"
                                                onClick={() => removeFavorite(fav)}
                                                disabled={removingId === fav.id}
                                            >
                                                {removingId === fav.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                                Bỏ thích
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
