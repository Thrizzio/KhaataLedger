"use client";

import type { ReactNode } from 'react';
import { AppProviders } from '../providers/AppProviders';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>KhaataLedger — Business Ledger</title>
        <meta name="description" content="Digital ledger for small business owners — track inventory, customers, suppliers, sales and purchases." />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

