import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

/**
 * Real-time hook that returns live review count and average rating
 * for a given productId from Firestore.
 */
export function useReviewCount(productId) {
    const [count, setCount] = useState(null);       // null = loading
    const [avgRating, setAvgRating] = useState(null);

    useEffect(() => {
        if (!productId) return;

        const q = query(
            collection(db, 'reviews'),
            where('productId', '==', String(productId))
        );

        const unsub = onSnapshot(q, (snap) => {
            const docs = snap.docs.map(d => d.data());
            setCount(docs.length);
            if (docs.length > 0) {
                const avg = docs.reduce((s, r) => s + (r.rating || 0), 0) / docs.length;
                setAvgRating(parseFloat(avg.toFixed(1)));
            } else {
                setAvgRating(null);
            }
        }, () => {
            // On error fall back to null (will show product.reviews)
            setCount(null);
            setAvgRating(null);
        });

        return () => unsub();
    }, [productId]);

    return { count, avgRating };
}
