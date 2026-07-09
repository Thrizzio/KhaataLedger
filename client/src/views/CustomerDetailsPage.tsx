import { PageShell } from './PageShell';

interface CustomerDetailsPageProps {
  id: string;
}

export const CustomerDetailsPage = ({ id }: CustomerDetailsPageProps) => (
  <PageShell
    description={`Customer profile and ledger history placeholder for customer ${id ?? 'unknown'}.`}
    title="Customer Details"
  />
);
