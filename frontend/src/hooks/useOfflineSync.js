import { useEffect, useState, useCallback, useRef } from 'react';
import API_BASE_URL from "../apiConfig";

export const useOfflineSync = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const syncLock = useRef(false); // 🔒 Mas matapang na lock kaysa sa state

    const refreshCount = useCallback(() => {
        const f = JSON.parse(localStorage.getItem("pending_finalize_sessions") || "[]");
        const c = JSON.parse(localStorage.getItem("pending_cancel_sessions") || "[]");
        setPendingCount(f.length + c.length);
        return f.length + c.length;
    }, []);

    const syncData = useCallback(async () => {
        const token = localStorage.getItem("token");
        
        // 🛡️ Guards
        if (!navigator.onLine || !token || syncLock.current) return;

        let fQueue = JSON.parse(localStorage.getItem("pending_finalize_sessions") || "[]");
        let cQueue = JSON.parse(localStorage.getItem("pending_cancel_sessions") || "[]");

        if (fQueue.length === 0 && cQueue.length === 0) {
            refreshCount();
            return;
        }

        // 🔒 Start Sync
        syncLock.current = true;
        setIsSyncing(true);
        console.log("🔄 [Sync Worker] Force Sync Started...");

        // 🗑️ 1. SYNC DELETES
        for (const sessionId of cQueue) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/sessions/cancel/${sessionId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.ok || res.status === 404) {
                    const current = JSON.parse(localStorage.getItem("pending_cancel_sessions") || "[]");
                    const updated = current.filter(id => id !== sessionId);
                    localStorage.setItem("pending_cancel_sessions", JSON.stringify(updated));
                    
                    // 🎯 INSTANT UI UPDATE
                    setPendingCount(prev => prev - 1); 
                }
            } catch (err) { console.error(err); break; }
        }

        // 💾 2. SYNC FINALIZE
        // Re-read finalize in case of collision
        let latestF = JSON.parse(localStorage.getItem("pending_finalize_sessions") || "[]")
                         .filter(id => !JSON.parse(localStorage.getItem("pending_cancel_sessions") || "[]").includes(id));

        for (const sessionId of latestF) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/sessions/finalize/${sessionId}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (res.ok || res.status === 400 || res.status === 404) {
                    const current = JSON.parse(localStorage.getItem("pending_finalize_sessions") || "[]");
                    const updated = current.filter(id => id !== sessionId);
                    localStorage.setItem("pending_finalize_sessions", JSON.stringify(updated));
                    
                    // 🎯 INSTANT UI UPDATE
                    setPendingCount(prev => prev - 1);
                }
            } catch (err) { console.error(err); break; }
        }

        // 🏁 FINAL FLUSH
        const finalCount = refreshCount();
        if (finalCount === 0) {
        console.log("📢 [Sync Worker] Broadcasting sync-complete event...");
        window.dispatchEvent(new CustomEvent('sync-complete'));
}
        setIsSyncing(false);
        syncLock.current = false;
        console.log("🏁 [Sync Worker] Sync Finished. Final Count:", finalCount);
    }, [refreshCount, isSyncing]);

    useEffect(() => {
        refreshCount();

        const handleOnline = () => {
            console.log("📡 Online detected!");
            syncData();
        };

        window.addEventListener('online', handleOnline);
        
        // Short delay to let the app settle
        const timer = setTimeout(syncData, 1500);

        return () => {
            window.removeEventListener('online', handleOnline);
            clearTimeout(timer);
        };
    }, [syncData, refreshCount]);

    return { isSyncing, pendingCount };
};