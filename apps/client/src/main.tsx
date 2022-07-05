import { NextUIProvider } from '@nextui-org/react';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import { MultiplayerProvider } from './multiplayer';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <NextUIProvider>
      <MultiplayerProvider>
        <App />
      </MultiplayerProvider>
    </NextUIProvider>
  </StrictMode>
);
