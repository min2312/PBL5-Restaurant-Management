import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const Dashboard = () => {
	return (
		<>
			<Row className="my-4">
				<Col>
					<h1>Dashboard</h1>
				</Col>
			</Row>
			<Row>
				<Col md={3}>
					<Card className="mb-4 card-primary">
						<Card.Body>
							<Card.Title>Primary Card</Card.Title>
							<Card.Text>View Details</Card.Text>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="mb-4 card-warning">
						<Card.Body>
							<Card.Title>Warning Card</Card.Title>
							<Card.Text>View Details</Card.Text>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="mb-4 card-success">
						<Card.Body>
							<Card.Title>Success Card</Card.Title>
							<Card.Text>View Details</Card.Text>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className="mb-4 card-danger">
						<Card.Body>
							<Card.Title>Danger Card</Card.Title>
							<Card.Text>View Details</Card.Text>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row>
				<Col md={6}>
					<Card className="mb-4">
						<Card.Body>
							<Card.Title>Area Chart Example</Card.Title>
							{/* Add your chart component here */}
						</Card.Body>
					</Card>
				</Col>
				<Col md={6}>
					<Card className="mb-4">
						<Card.Body>
							<Card.Title>Bar Chart Example</Card.Title>
							{/* Add your chart component here */}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</>
	);
};

export default Dashboard;
