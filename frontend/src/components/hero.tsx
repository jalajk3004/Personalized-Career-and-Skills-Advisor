import { Link } from "react-router-dom";
import { Button } from "./ui/button";


const Hero = () => {
  return (
    <div className="text-center mx-20 my-20 flex gap-6 justify-center shadow-lg rounded-lg bg-amber-300/30 backdrop-blur-sm">
      <Link to="/career">
        <Button className="w-1/2">Click Me</Button>
      </Link>
    </div>
  );
};

export default Hero;
