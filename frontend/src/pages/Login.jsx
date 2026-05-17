import Auth from "./Auth";

export default function Login() {
  // Login page ka function simple wrapper hai: Auth page ko "login mode" me open karta hai.
  // Is file me khud koi transition/animation nahi likha; wo sab Auth page me handle hota hai.
  return <Auth initialMode="login" />;
}
