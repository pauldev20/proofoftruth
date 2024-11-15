"use client";

import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";

export default function LoginPage() {
    const router = useRouter();
    const onLoginSignup = () => {
        console.log("Login / Sign Up");
        router.replace("/");
    };

    return (
        <section className="h-screen flex flex-col items-center justify-center">
            {/* <h1>Logo</h1> */}
            <Button color="primary" radius="sm" onClick={onLoginSignup}>
                Sign In / Sign Up
            </Button>
        </section>
    );
}
