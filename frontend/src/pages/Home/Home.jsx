import React from "react";
import "../Home/banner.css";
import { Carousel } from "react-bootstrap";
import sliderImg from "../../assets/images/3.avif";
import sliderImg1 from "../../assets/images/4.avif";

const Home = () => {
	return (
		<>
			<section className="slider">
				<Carousel fade variant="dark">
					<Carousel.Item>
						<img
							src={sliderImg}
							className="d-block w-100 slider_img"
							alt="Smart restaurant management"
							style={{
								height: "80vh",
								objectFit: "cover",
								filter: "brightness(0.7)",
							}}
						/>
						<Carousel.Caption
							style={{
								bottom: "50%",
								transform: "translateY(50%)",
								textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
							}}
						>
							<div className="slider_des text-center">
								<h1 className="display-3 fw-bold text-white mb-4">
									SMART MANAGEMENT SYSTEM <br />
									<span className="text-primary">FOR RESTAURANT</span>
								</h1>
								<p className="lead text-white mb-4 fs-4">
									Easily streamline your restaurant operations with automated
									order management and real-time table reservations.
								</p>
								<button
									className="btn btn-primary btn-lg px-5 py-3 mt-3"
									style={{
										borderRadius: "30px",
										boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
									}}
								>
									<i className="bi bi-check-circle-fill me-2"></i>
									Get Started
								</button>
							</div>
						</Carousel.Caption>
					</Carousel.Item>
					<Carousel.Item>
						<img
							src={sliderImg1}
							className="d-block w-100 slider_img"
							alt="Optimize dining experience"
							style={{
								height: "80vh",
								objectFit: "cover",
								filter: "brightness(0.7)",
							}}
						/>
						<Carousel.Caption
							style={{
								bottom: "50%",
								transform: "translateY(50%)",
								textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
							}}
						>
							<div className="slider_des text-center">
								<h1 className="display-3 fw-bold text-white mb-4">
									OPTIMIZE YOUR <br />
									<span className="text-primary">DINING EXPERIENCE</span>
								</h1>
								<p className="lead text-white mb-4 fs-4">
									Enhance customer satisfaction with fast, secure, and
									hassle-free restaurant management solutions.
								</p>
								<button
									className="btn btn-primary btn-lg px-5 py-3 mt-3"
									style={{
										borderRadius: "30px",
										boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
									}}
								>
									<i className="bi bi-app me-2"></i>
									Explore Features
								</button>
							</div>
						</Carousel.Caption>
					</Carousel.Item>
				</Carousel>
			</section>

			{/* Add Feature Section */}
			<section className="bg-white py-5">
				<div className="container">
					<div className="text-center mb-5">
						<h2 className="fw-bold mb-3">Our Smart Solutions</h2>
						<p className="text-muted">
							Experience seamless restaurant management with our cutting-edge
							features
						</p>
					</div>

					<div className="row g-4">
						<div className="col-md-4">
							<div
								className="card border-0 h-100 shadow-sm"
								style={{ borderRadius: "16px" }}
							>
								<div className="card-body text-center p-4">
									<div className="bg-primary bg-opacity-10 text-primary p-3 mb-4 rounded-circle d-inline-block">
										<i className="bi bi-table fs-1"></i>
									</div>
									<h4 className="fw-bold mb-3">Table Management</h4>
									<p className="text-muted">
										Efficiently manage table reservations and optimize seating
										arrangements
									</p>
								</div>
							</div>
						</div>

						<div className="col-md-4">
							<div
								className="card border-0 h-100 shadow-sm"
								style={{ borderRadius: "16px" }}
							>
								<div className="card-body text-center p-4">
									<div className="bg-success bg-opacity-10 text-success p-3 mb-4 rounded-circle d-inline-block">
										<i className="bi bi-receipt fs-1"></i>
									</div>
									<h4 className="fw-bold mb-3">Order Processing</h4>
									<p className="text-muted">
										Streamline order processing with our intuitive interface
									</p>
								</div>
							</div>
						</div>

						<div className="col-md-4">
							<div
								className="card border-0 h-100 shadow-sm"
								style={{ borderRadius: "16px" }}
							>
								<div className="card-body text-center p-4">
									<div className="bg-info bg-opacity-10 text-info p-3 mb-4 rounded-circle d-inline-block">
										<i className="bi bi-people fs-1"></i>
									</div>
									<h4 className="fw-bold mb-3">Customer Loyalty</h4>
									<p className="text-muted">
										Build customer relationships with our integrated loyalty
										program
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default Home;
