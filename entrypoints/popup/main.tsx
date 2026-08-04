import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../src/ui/globals.css';
import { PopupApp } from '../../src/ui/popup/popup-app';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <PopupApp />
    </React.StrictMode>
);
