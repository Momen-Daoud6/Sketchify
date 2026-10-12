import { Box } from "lucide-react";
import Button from "./ui/Button";
import { useOutletContext } from "react-router";

export default function Navbar() {
  const { isSignIn, userName, signIn, signOut } =
    useOutletContext<AuthContext>();
  const handleAuth = async () => {
    console.log("hhh")
    if (isSignIn) {
    console.log("true")
      try {
        await signOut();
      } catch (e) {
        console.log(`Puter signOut failed: ${e}`);
      }
      return;
    }
    console.log("false")
    try {
      await signIn();
    } catch (e) {
      console.log(`Puter signIn failed: ${e}`);
    }
  };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <Box className="logo" />
          <span className="name">Roomify</span>

          <ul className="links">
            <a href="">Product</a>
            <a href="">Pricing</a>
            <a href="">Community</a>
            <a href="">Enterprice</a>
          </ul>
        </div>
        <div className="actions">
          {isSignIn ? (
            <>
              <span className="greeting">
                {userName ? `Hi ${userName}` : "Sign In"}
              </span>
              <Button size="sm" className="btn" onClick={handleAuth}>
                log Out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={handleAuth}>
                log in
              </Button>
              <a href="#upload" className="cta">
                get started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
