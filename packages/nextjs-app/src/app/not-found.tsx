import { redirect } from "next/navigation";

/* Redirects to the home page if the user navigates to a non-existent page */
export default function NotFoundPage() {
    redirect("/");
}
