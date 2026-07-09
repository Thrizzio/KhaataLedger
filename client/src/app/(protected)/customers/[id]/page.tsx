import { CustomerDetailsPage } from '../../../../views/CustomerDetailsPage';

export default function CustomerDetailsRoute(props: any) {
  return <CustomerDetailsPage id={props.params.id} />;
}
