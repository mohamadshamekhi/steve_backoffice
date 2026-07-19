import Link from 'next/link';

function Unauthorized() {
    return (
        <div>
            <span>Unauthorized</span>
            <Link href={'/'}>back to login</Link>
        </div>
    );
}

export default Unauthorized;
