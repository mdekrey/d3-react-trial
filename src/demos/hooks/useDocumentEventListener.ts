import React from 'react';

export function useDocumentEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
    React.useEffect(() => {
        document.addEventListener(type, listener, options);
        return  () => {
            document.removeEventListener(type, listener, options);
        }
    }, [type, listener, options]);
}
