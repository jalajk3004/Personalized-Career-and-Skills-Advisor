import { Element } from "react-scroll";
import AboutUs from "@/components/aboutUs";
import Home from "@/components/home";
import Howitworks from "@/components/howitworks";
import MapYourPath from "@/components/mapYourPath";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <Element name="home">
        <Home />
      </Element>
      <Element name="aboutUs">
        <AboutUs />
      </Element>
      <Element name="howitworks">
        <Howitworks />
      </Element>
      <Element name="mapYourPath">
        <MapYourPath />
      </Element>
      <Footer />
    </div>
  );
};

export default HomePage;
