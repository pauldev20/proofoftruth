/* -------------------------------------------------------------------------- */
/*                              AddressComponent                              */
/* -------------------------------------------------------------------------- */
interface AddressComponentProps {
    address: string;
}
export default function AddressComponent({ address }: AddressComponentProps) {
    const addr = address.length > 15 ? address.slice(0, 10) + "..." + address.slice(-8) : address;

    return <p className="font-bold">{addr}</p>;
}
