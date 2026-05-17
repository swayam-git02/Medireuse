import Auth from "./Auth";

export default function Signup() {
  // Signup page ka function simple wrapper hai: Auth page ko "signup mode" me open karta hai.
  // Is file me direct transition/animation nahi; wo Auth component ke andar define hai.
  return <Auth initialMode="signup" />;
}
