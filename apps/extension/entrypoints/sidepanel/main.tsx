import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../src/ui/globals.css';
import { SidePanelApp } from '../../src/ui/sidepanel/sidepanel-app';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SidePanelApp />
    </React.StrictMode>
);
