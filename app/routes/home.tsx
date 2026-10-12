import Navbar from "../../components/Navbar";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [];
}

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="text-3xl font-bold">Home</div>
    </>
  );
}
