import { useParams } from 'react-router-dom';
import { PageShell } from './PageShell';

export const CustomerDetailsPage = () => {
  const { id } = useParams();

  return (
    <PageShell
      description={`Customer profile and ledger history placeholder for customer ${id ?? 'unknown'}.`}
      title="Customer Details"
    />
  );
};
