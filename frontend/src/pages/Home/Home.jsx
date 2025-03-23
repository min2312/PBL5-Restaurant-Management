import React from "react";
import "../Home/banner.css";
import { Carousel } from "react-bootstrap";
import sliderImg from "../../assets/images/3.avif";
import sliderImg1 from "../../assets/images/4.avif";
const Home = () => {
	return (
		<section className="slider">
			<Carousel variant="dark">
				<Carousel.Item>
					<img
						src={sliderImg}
						className="d-block w-100 slider_img"
						alt="First slide"
					/>
					<Carousel.Caption>
						<div className="slider_des">
							<h5 className="heading">
								SMART MANAGEMENT SYSTEM <span>FOR RESTAURANT</span>
							</h5>
							<p className="sub_text">
								Easily streamline your restaurant operations with automated
								order management and real-time table reservations.
							</p>
						</div>
					</Carousel.Caption>
				</Carousel.Item>
				<Carousel.Item>
					<img
						src={sliderImg1}
						className="d-block w-100 slider_img"
						alt="Second slide"
					/>
					<Carousel.Caption>
						<div className="slider_des">
							<h5 className="heading">
								OPTIMIZE YOUR <span>DINING EXPERIENCE</span>
							</h5>
							<p className="sub_text">
								Enhance customer satisfaction with fast, secure, and hassle-free
								restaurant management solutions.
							</p>
						</div>
					</Carousel.Caption>
				</Carousel.Item>
			</Carousel>
		</section>
	);
};

export default Home;
